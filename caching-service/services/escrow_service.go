package services

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"math/big"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/nikhil-inja/decentralized-escrow-service/caching-service/escrowfactory"
	"github.com/nikhil-inja/decentralized-escrow-service/caching-service/models"
)

type EscrowService struct {
	client         *ethclient.Client
	factory        *escrowfactory.Bindings
	arbiterService *ArbiterService
	db             *sql.DB
}

func NewEscrowService(client *ethclient.Client, factoryAddress common.Address, arbiterService *ArbiterService, db *sql.DB) (*EscrowService, error) {
	factory, err := escrowfactory.NewBindings(factoryAddress, client)
	if err != nil {
		return nil, fmt.Errorf("failed to create escrow factory binding: %v", err)
	}

	return &EscrowService{
		client:         client,
		factory:        factory,
		arbiterService: arbiterService,
		db:             db,
	}, nil
}

// GetAllDeals fetches all deals from the factory and caches them
func (s *EscrowService) GetAllDeals(ctx context.Context) ([]models.Deal, error) {
	log.Println("Fetching all deals from factory...")
	
	var deals []models.Deal
	
	// Get all escrow contract addresses
	escrowAddresses, err := s.factory.GetEscrowContracts(&bind.CallOpts{Context: ctx})
	if err != nil {
		return nil, fmt.Errorf("failed to get escrow contracts: %v", err)
	}
	
	log.Printf("Found %d escrow contracts", len(escrowAddresses))
	
	// Fetch details for each escrow contract
	for _, address := range escrowAddresses {
		deal, err := s.getDealDetails(ctx, address)
		if err != nil {
			log.Printf("Failed to get details for deal %s: %v", address.Hex(), err)
			continue
		}
		
		// Cache in database
		if err := s.cacheDeal(deal); err != nil {
			log.Printf("Failed to cache deal %s: %v", address.Hex(), err)
		}
		
		deals = append(deals, *deal)
	}
	
	return deals, nil
}

// GetDealsByWallet fetches all deals for a specific wallet address
func (s *EscrowService) GetDealsByWallet(ctx context.Context, walletAddress string) ([]models.Deal, error) {
	// First try to get from cache
	deals, err := s.getDealsFromCacheByWallet(walletAddress)
	if err == nil && len(deals) > 0 {
		return deals, nil
	}
	
	// If not in cache or empty, fetch from contract
	allDeals, err := s.GetAllDeals(ctx)
	if err != nil {
		return nil, err
	}
	
	// Filter deals for the specific wallet
	var walletDeals []models.Deal
	for _, deal := range allDeals {
		if deal.ClientAddress == walletAddress || 
		   deal.FreelancerAddress == walletAddress || 
		   deal.ArbiterAddress == walletAddress {
			walletDeals = append(walletDeals, deal)
		}
	}
	
	return walletDeals, nil
}

// GetDealByAddress fetches a specific deal by contract address
func (s *EscrowService) GetDealByAddress(ctx context.Context, address common.Address) (*models.Deal, error) {
	// First try to get from cache
	deal, err := s.getDealFromCache(address.Hex())
	if err == nil && deal != nil {
		return deal, nil
	}
	
	// If not in cache, fetch from contract
	deal, err = s.getDealDetails(ctx, address)
	if err != nil {
		return nil, err
	}
	
	// Cache the result
	if err := s.cacheDeal(deal); err != nil {
		log.Printf("Failed to cache deal: %v", err)
	}
	
	return deal, nil
}

// getDealDetails fetches detailed information for a specific escrow contract
func (s *EscrowService) getDealDetails(ctx context.Context, address common.Address) (*models.Deal, error) {
	// Create a contract instance for the specific escrow
	// We need to use the EscrowSimple ABI here
	escrowABI, err := abi.JSON(strings.NewReader(escrowSimpleABI))
	if err != nil {
		return nil, fmt.Errorf("failed to parse escrow ABI: %v", err)
	}
	
	// Create a bound contract for the escrow
	escrowContract := bind.NewBoundContract(address, escrowABI, s.client, s.client, s.client)
	
	// Get project details
	var result []interface{}
	err = escrowContract.Call(&bind.CallOpts{Context: ctx}, &result, "getProjectDetails")
	if err != nil {
		return nil, fmt.Errorf("failed to call getProjectDetails: %v", err)
	}
	
	// Parse the result
	client := result[0].(common.Address)
	freelancer := result[1].(common.Address)
	arbiter := result[2].(common.Address)
	totalAmount := result[3].(*big.Int)
	projectDescription := result[4].(string)
	currentStatus := result[5].(uint8)
	workStatus := result[6].(uint8)
	workSubmission := result[7].(string)
	
	// Get token address
	var tokenResult []interface{}
	err = escrowContract.Call(&bind.CallOpts{Context: ctx}, &tokenResult, "token")
	if err != nil {
		log.Printf("Failed to get token address: %v", err)
	}
	
	tokenAddress := ""
	if len(tokenResult) > 0 {
		tokenAddress = tokenResult[0].(common.Address).Hex()
	}
	
	deal := &models.Deal{
		ContractAddress:    address.Hex(),
		ClientAddress:      client.Hex(),
		FreelancerAddress:  freelancer.Hex(),
		ArbiterAddress:     arbiter.Hex(),
		TokenAddress:       tokenAddress,
		TotalAmount:        totalAmount.String(),
		Status:             int(currentStatus),
		WorkStatus:         int(workStatus),
		ProjectDescription: projectDescription,
		WorkSubmission:     workSubmission,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}
	
	// Fetch related data
	if s.arbiterService != nil && arbiter != (common.Address{}) {
		arbiterData, err := s.arbiterService.GetArbiterByAddress(ctx, arbiter)
		if err == nil {
			deal.Arbiter = arbiterData
		}
	}
	
	return deal, nil
}

// cacheDeal stores deal data in the database
func (s *EscrowService) cacheDeal(deal *models.Deal) error {
	query := `
		INSERT INTO deals (
			contract_address, client_address, freelancer_address, arbiter_address,
			token_address, total_amount, status, work_status, project_description,
			work_submission, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		ON CONFLICT (contract_address) 
		DO UPDATE SET 
			client_address = EXCLUDED.client_address,
			freelancer_address = EXCLUDED.freelancer_address,
			arbiter_address = EXCLUDED.arbiter_address,
			token_address = EXCLUDED.token_address,
			total_amount = EXCLUDED.total_amount,
			status = EXCLUDED.status,
			work_status = EXCLUDED.work_status,
			project_description = EXCLUDED.project_description,
			work_submission = EXCLUDED.work_submission,
			updated_at = EXCLUDED.updated_at
	`
	
	_, err := s.db.Exec(query,
		deal.ContractAddress,
		deal.ClientAddress,
		deal.FreelancerAddress,
		deal.ArbiterAddress,
		deal.TokenAddress,
		deal.TotalAmount,
		deal.Status,
		deal.WorkStatus,
		deal.ProjectDescription,
		deal.WorkSubmission,
		deal.CreatedAt,
		deal.UpdatedAt,
	)
	return err
}

// getDealFromCache retrieves deal data from the database cache
func (s *EscrowService) getDealFromCache(address string) (*models.Deal, error) {
	query := `
		SELECT contract_address, client_address, freelancer_address, arbiter_address,
			   token_address, total_amount, status, work_status, project_description,
			   work_submission, created_at, updated_at
		FROM deals WHERE contract_address = $1
	`
	
	var deal models.Deal
	err := s.db.QueryRow(query, address).Scan(
		&deal.ContractAddress,
		&deal.ClientAddress,
		&deal.FreelancerAddress,
		&deal.ArbiterAddress,
		&deal.TokenAddress,
		&deal.TotalAmount,
		&deal.Status,
		&deal.WorkStatus,
		&deal.ProjectDescription,
		&deal.WorkSubmission,
		&deal.CreatedAt,
		&deal.UpdatedAt,
	)
	
	if err != nil {
		return nil, err
	}
	
	return &deal, nil
}

// getDealsFromCacheByWallet retrieves deals for a specific wallet from cache
func (s *EscrowService) getDealsFromCacheByWallet(walletAddress string) ([]models.Deal, error) {
	query := `
		SELECT contract_address, client_address, freelancer_address, arbiter_address,
			   token_address, total_amount, status, work_status, project_description,
			   work_submission, created_at, updated_at
		FROM deals 
		WHERE client_address = $1 OR freelancer_address = $1 OR arbiter_address = $1
		ORDER BY created_at DESC
	`
	
	rows, err := s.db.Query(query, walletAddress)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var deals []models.Deal
	for rows.Next() {
		var deal models.Deal
		err := rows.Scan(
			&deal.ContractAddress,
			&deal.ClientAddress,
			&deal.FreelancerAddress,
			&deal.ArbiterAddress,
			&deal.TokenAddress,
			&deal.TotalAmount,
			&deal.Status,
			&deal.WorkStatus,
			&deal.ProjectDescription,
			&deal.WorkSubmission,
			&deal.CreatedAt,
			&deal.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		deals = append(deals, deal)
	}
	
	return deals, nil
}

// WatchEscrowEvents subscribes to escrow-related events
func (s *EscrowService) WatchEscrowEvents(ctx context.Context, eventChan chan<- models.EventUpdate) error {
	// Watch for EscrowCreated events
	escrowCreatedSink := make(chan *escrowfactory.BindingsEscrowCreated)
	escrowCreatedSub, err := s.factory.WatchEscrowCreated(&bind.WatchOpts{Context: ctx}, escrowCreatedSink, nil, nil, nil)
	if err != nil {
		return fmt.Errorf("failed to watch EscrowCreated events: %v", err)
	}
	
	go func() {
		defer escrowCreatedSub.Unsubscribe()
		
		for {
			select {
			case event := <-escrowCreatedSink:
				log.Printf("EscrowCreated event: %s", event.EscrowAddress.Hex())
				
				// Fetch and cache the new deal
				deal, err := s.getDealDetails(ctx, event.EscrowAddress)
				if err == nil {
					s.cacheDeal(deal)
					
					// Send update to channel
					eventChan <- models.EventUpdate{
						Type:      "deal_created",
						Address:   event.EscrowAddress.Hex(),
						Data:      deal,
						Timestamp: time.Now(),
					}
				}
				
			case <-ctx.Done():
				return
			}
		}
	}()
	
	return nil
}

// EscrowSimple ABI - this should match your EscrowSimple contract
const escrowSimpleABI = `[
	{
		"inputs": [],
		"name": "getProjectDetails",
		"outputs": [
			{"internalType": "address", "name": "_client", "type": "address"},
			{"internalType": "address", "name": "_freelancer", "type": "address"},
			{"internalType": "address", "name": "_arbiter", "type": "address"},
			{"internalType": "uint256", "name": "_totalAmount", "type": "uint256"},
			{"internalType": "string", "name": "_projectDescription", "type": "string"},
			{"internalType": "uint8", "name": "_currentStatus", "type": "uint8"},
			{"internalType": "uint8", "name": "_workStatus", "type": "uint8"},
			{"internalType": "string", "name": "_workSubmission", "type": "string"}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "token",
		"outputs": [
			{"internalType": "contract IERC20", "name": "", "type": "address"}
		],
		"stateMutability": "view",
		"type": "function"
	}
]`
