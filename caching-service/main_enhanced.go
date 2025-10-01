package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/nikhil-inja/decentralized-escrow-service/caching-service/api"
	"github.com/nikhil-inja/decentralized-escrow-service/caching-service/models"
	"github.com/nikhil-inja/decentralized-escrow-service/caching-service/services"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found: %v", err)
	}

	// Initialize services
	config, err := loadConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Connect to Ethereum client
	client, err := ethclient.Dial(config.RPCURL)
	if err != nil {
		log.Fatalf("Failed to connect to Ethereum client: %v", err)
	}
	defer client.Close()

	// Test connection
	header, err := client.HeaderByNumber(context.Background(), nil)
	if err != nil {
		log.Fatalf("Failed to get latest block header: %v", err)
	}
	log.Printf("🎉 Connected to Ethereum node! Latest block: %s", header.Number.String())

	// Connect to database
	db, err := connectDatabase()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Run database migrations
	if err := runMigrations(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize services
	arbiterService, err := services.NewArbiterService(client, config.ArbiterRegistry, db)
	if err != nil {
		log.Fatalf("Failed to create arbiter service: %v", err)
	}

	escrowService, err := services.NewEscrowService(client, config.EscrowFactory, arbiterService, db)
	if err != nil {
		log.Fatalf("Failed to create escrow service: %v", err)
	}

	walletService := services.NewWalletService(client, escrowService, arbiterService, db)

	// Initialize API
	apiHandler := api.NewAPIHandler(walletService, escrowService, arbiterService)
	router := api.NewRouter(apiHandler)
	httpRouter := router.SetupRoutes()

	// Start HTTP server
	server := &http.Server{
		Addr:    ":8080",
		Handler: httpRouter,
	}

	go func() {
		log.Println("🚀 Starting HTTP server on :8080")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start HTTP server: %v", err)
		}
	}()

	// Start event listeners
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	eventChan := make(chan models.EventUpdate, 100)

	// Start arbiter event listener
	go func() {
		if err := arbiterService.WatchArbiterEvents(ctx, eventChan); err != nil {
			log.Printf("Arbiter event listener error: %v", err)
		}
	}()

	// Start escrow event listener
	go func() {
		if err := escrowService.WatchEscrowEvents(ctx, eventChan); err != nil {
			log.Printf("Escrow event listener error: %v", err)
		}
	}()

	// Start initial data sync
	go func() {
		log.Println("🔄 Starting initial data sync...")
		
		// Sync arbiters
		if _, err := arbiterService.GetAllArbiters(ctx); err != nil {
			log.Printf("Failed to sync arbiters: %v", err)
		} else {
			log.Println("✅ Arbiters synced")
		}
		
		// Sync deals
		if _, err := escrowService.GetAllDeals(ctx); err != nil {
			log.Printf("Failed to sync deals: %v", err)
		} else {
			log.Println("✅ Deals synced")
		}
		
		log.Println("🎉 Initial data sync completed!")
	}()

	// Handle event updates
	go func() {
		for event := range eventChan {
			log.Printf("📡 Event received: %s for %s", event.Type, event.Address)
			// Here you could broadcast to WebSocket clients
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Shutting down server...")

	// Cancel context to stop event listeners
	cancel()

	// Shutdown HTTP server
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("Server shutdown error: %v", err)
	}

	log.Println("✅ Server shutdown complete")
}

func loadConfig() (*models.ContractConfig, error) {
	arbiterRegistryStr := os.Getenv("ARBITER_REGISTRY_ADDRESS")
	if arbiterRegistryStr == "" {
		return nil, fmt.Errorf("ARBITER_REGISTRY_ADDRESS is not set")
	}

	escrowFactoryStr := os.Getenv("ESCROW_FACTORY_ADDRESS")
	if escrowFactoryStr == "" {
		return nil, fmt.Errorf("ESCROW_FACTORY_ADDRESS is not set")
	}

	userProfileStr := os.Getenv("USER_PROFILE_ADDRESS")
	if userProfileStr == "" {
		userProfileStr = "0x0000000000000000000000000000000000000000" // Default to zero address
	}

	rpcURL := os.Getenv("RPC_URL")
	if rpcURL == "" {
		rpcURL = "http://127.0.0.1:8545"
	}

	wsURL := os.Getenv("WS_URL")
	if wsURL == "" {
		wsURL = "ws://127.0.0.1:8545"
	}

	return &models.ContractConfig{
		ArbiterRegistry: common.HexToAddress(arbiterRegistryStr),
		EscrowFactory:   common.HexToAddress(escrowFactoryStr),
		UserProfile:     common.HexToAddress(userProfileStr),
		RPCURL:          rpcURL,
		WSURL:           wsURL,
	}, nil
}

func connectDatabase() (*sql.DB, error) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:mysecretpassword@localhost:5432/postgres?sslmode=disable"
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database connection: %v", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %v", err)
	}

	log.Println("🎉 Connected to PostgreSQL database!")
	return db, nil
}

func runMigrations(db *sql.DB) error {
	migrations := []string{
		// Check if arbiters table exists, if not create it
		`CREATE TABLE IF NOT EXISTS arbiters (
			id SERIAL PRIMARY KEY,
			address VARCHAR(42) NOT NULL UNIQUE,
			name VARCHAR(255) NOT NULL,
			profile_hash TEXT,
			is_active BOOLEAN DEFAULT true,
			created_at TIMESTAMPTZ DEFAULT NOW(),
			updated_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		
		// Check if user_profiles table exists, if not create it
		`CREATE TABLE IF NOT EXISTS user_profiles (
			id SERIAL PRIMARY KEY,
			address VARCHAR(42) NOT NULL UNIQUE,
			name VARCHAR(255),
			bio TEXT,
			avatar_hash TEXT,
			skills TEXT,
			rating DECIMAL(3,2) DEFAULT 0.00,
			review_count INTEGER DEFAULT 0,
			created_at TIMESTAMPTZ DEFAULT NOW(),
			updated_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		
		// Enhance deals table if needed
		`ALTER TABLE deals 
		ADD COLUMN IF NOT EXISTS token_address VARCHAR(42),
		ADD COLUMN IF NOT EXISTS work_status INTEGER DEFAULT 0,
		ADD COLUMN IF NOT EXISTS project_description TEXT,
		ADD COLUMN IF NOT EXISTS work_submission TEXT,
		ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`,
		
		// Create indexes
		`CREATE INDEX IF NOT EXISTS idx_arbiters_address ON arbiters(address)`,
		`CREATE INDEX IF NOT EXISTS idx_arbiters_active ON arbiters(is_active)`,
		`CREATE INDEX IF NOT EXISTS idx_user_profiles_address ON user_profiles(address)`,
		`CREATE INDEX IF NOT EXISTS idx_user_profiles_rating ON user_profiles(rating)`,
		`CREATE INDEX IF NOT EXISTS idx_deals_client ON deals(client_address)`,
		`CREATE INDEX IF NOT EXISTS idx_deals_freelancer ON deals(freelancer_address)`,
		`CREATE INDEX IF NOT EXISTS idx_deals_arbiter ON deals(arbiter_address)`,
		`CREATE INDEX IF NOT EXISTS idx_deals_token ON deals(token_address)`,
		`CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status)`,
		`CREATE INDEX IF NOT EXISTS idx_deals_work_status ON deals(work_status)`,
		`CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at)`,
	}

	for _, migration := range migrations {
		if _, err := db.Exec(migration); err != nil {
			return fmt.Errorf("failed to run migration: %v", err)
		}
	}

	log.Println("✅ Database migrations completed")
	return nil
}
