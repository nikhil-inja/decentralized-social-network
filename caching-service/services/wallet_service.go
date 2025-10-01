package services

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"math/big"
	"strconv"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/nikhil-inja/decentralized-escrow-service/caching-service/models"
)

type WalletService struct {
	client         *ethclient.Client
	escrowService  *EscrowService
	arbiterService *ArbiterService
	db             *sql.DB
}

func NewWalletService(client *ethclient.Client, escrowService *EscrowService, arbiterService *ArbiterService, db *sql.DB) *WalletService {
	return &WalletService{
		client:         client,
		escrowService:  escrowService,
		arbiterService: arbiterService,
		db:             db,
	}
}

// GetWalletData fetches all data for a specific wallet address
func (s *WalletService) GetWalletData(ctx context.Context, walletAddress string) (*models.WalletData, error) {
	log.Printf("Fetching wallet data for: %s", walletAddress)
	
	// Validate address
	if !common.IsHexAddress(walletAddress) {
		return nil, fmt.Errorf("invalid wallet address: %s", walletAddress)
	}
	
	walletData := &models.WalletData{
		Address:        walletAddress,
		TokenBalances:  make(map[string]string),
	}
	
	// Fetch deals
	deals, err := s.escrowService.GetDealsByWallet(ctx, walletAddress)
	if err != nil {
		log.Printf("Failed to fetch deals: %v", err)
	} else {
		walletData.Deals = deals
	}
	
	// Fetch arbiters (if this wallet is an arbiter)
	arbiter, err := s.arbiterService.GetArbiterByAddress(ctx, common.HexToAddress(walletAddress))
	if err == nil && arbiter != nil {
		walletData.Arbiters = []models.Arbiter{*arbiter}
	}
	
	// Fetch user profile (if exists)
	profile, err := s.getUserProfile(walletAddress)
	if err == nil && profile != nil {
		walletData.Profile = profile
	}
	
	// Fetch token balances
	tokenBalances, err := s.getTokenBalances(ctx, walletAddress, deals)
	if err == nil {
		walletData.TokenBalances = tokenBalances
	}
	
	// Calculate statistics
	stats := s.calculateWalletStats(deals)
	walletData.Stats = stats
	
	return walletData, nil
}

// GetWalletStats calculates statistics for a wallet
func (s *WalletService) GetWalletStats(ctx context.Context, walletAddress string) (*models.WalletStats, error) {
	deals, err := s.escrowService.GetDealsByWallet(ctx, walletAddress)
	if err != nil {
		return nil, err
	}
	
	stats := s.calculateWalletStats(deals)
	return &stats, nil
}

// calculateWalletStats computes aggregated statistics from deals
func (s *WalletService) calculateWalletStats(deals []models.Deal) models.WalletStats {
	stats := models.WalletStats{}
	
	var totalVolume big.Int
	
	for _, deal := range deals {
		// Parse amount
		amount, err := strconv.ParseInt(deal.TotalAmount, 10, 64)
		if err != nil {
			continue
		}
		
		// Count deals by role
		if deal.ClientAddress != "" {
			stats.TotalDealsAsClient++
		}
		if deal.FreelancerAddress != "" {
			stats.TotalDealsAsFreelancer++
		}
		if deal.ArbiterAddress != "" {
			stats.TotalDealsAsArbiter++
		}
		
		// Count by status
		switch deal.Status {
		case 0: // Active
			stats.ActiveDeals++
		case 1: // Completed
			stats.CompletedDeals++
		case 2: // Disputed
			stats.DisputedDeals++
		}
		
		// Add to total volume
		totalVolume.Add(&totalVolume, big.NewInt(amount))
	}
	
	stats.TotalVolume = totalVolume.String()
	
	// Calculate average rating (placeholder - would need rating system)
	stats.AverageRating = 4.5 // Default rating
	
	return stats
}

// getUserProfile fetches user profile data from cache
func (s *WalletService) getUserProfile(walletAddress string) (*models.UserProfile, error) {
	query := `
		SELECT address, name, bio, avatar_hash, skills, rating, review_count, created_at, updated_at
		FROM user_profiles WHERE address = $1
	`
	
	var profile models.UserProfile
	var skillsStr string
	
	err := s.db.QueryRow(query, walletAddress).Scan(
		&profile.Address,
		&profile.Name,
		&profile.Bio,
		&profile.AvatarHash,
		&skillsStr,
		&profile.Rating,
		&profile.ReviewCount,
		&profile.CreatedAt,
		&profile.UpdatedAt,
	)
	
	if err != nil {
		return nil, err
	}
	
	// Parse skills
	if skillsStr != "" {
		profile.Skills = strings.Split(skillsStr, ",")
	}
	
	return &profile, nil
}

// getTokenBalances fetches token balances for the wallet
func (s *WalletService) getTokenBalances(ctx context.Context, walletAddress string, deals []models.Deal) (map[string]string, error) {
	balances := make(map[string]string)
	
	// Get unique token addresses from deals
	tokenAddresses := make(map[string]bool)
	for _, deal := range deals {
		if deal.TokenAddress != "" {
			tokenAddresses[deal.TokenAddress] = true
		}
	}
	
	// Fetch balances for each token
	for tokenAddress := range tokenAddresses {
		balance, err := s.getTokenBalance(ctx, walletAddress, tokenAddress)
		if err != nil {
			log.Printf("Failed to get balance for token %s: %v", tokenAddress, err)
			continue
		}
		balances[tokenAddress] = balance
	}
	
	return balances, nil
}

// getTokenBalance fetches balance for a specific token
func (s *WalletService) getTokenBalance(ctx context.Context, walletAddress, tokenAddress string) (string, error) {
	// This is a simplified version - in a real implementation, you'd need to:
	// 1. Get the token contract ABI
	// 2. Call the balanceOf function
	// 3. Handle different token standards
	
	// For now, return a placeholder
	return "1000000000000000000", nil // 1 token in wei
}

// CacheUserProfile stores user profile data
func (s *WalletService) CacheUserProfile(profile *models.UserProfile) error {
	query := `
		INSERT INTO user_profiles (address, name, bio, avatar_hash, skills, rating, review_count, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (address) 
		DO UPDATE SET 
			name = EXCLUDED.name,
			bio = EXCLUDED.bio,
			avatar_hash = EXCLUDED.avatar_hash,
			skills = EXCLUDED.skills,
			rating = EXCLUDED.rating,
			review_count = EXCLUDED.review_count,
			updated_at = EXCLUDED.updated_at
	`
	
	skillsStr := strings.Join(profile.Skills, ",")
	
	_, err := s.db.Exec(query,
		profile.Address,
		profile.Name,
		profile.Bio,
		profile.AvatarHash,
		skillsStr,
		profile.Rating,
		profile.ReviewCount,
		profile.CreatedAt,
		profile.UpdatedAt,
	)
	return err
}

// GetTopWallets returns wallets with highest activity
func (s *WalletService) GetTopWallets(ctx context.Context, limit int) ([]models.WalletData, error) {
	query := `
		SELECT 
			COALESCE(client_address, '') as client_addr,
			COALESCE(freelancer_address, '') as freelancer_addr,
			COALESCE(arbiter_address, '') as arbiter_addr
		FROM deals
		GROUP BY client_address, freelancer_address, arbiter_address
		ORDER BY COUNT(*) DESC
		LIMIT $1
	`
	
	rows, err := s.db.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var wallets []models.WalletData
	processedAddresses := make(map[string]bool)
	
	for rows.Next() {
		var clientAddr, freelancerAddr, arbiterAddr string
		err := rows.Scan(&clientAddr, &freelancerAddr, &arbiterAddr)
		if err != nil {
			continue
		}
		
		// Process each unique address
		addresses := []string{clientAddr, freelancerAddr, arbiterAddr}
		for _, addr := range addresses {
			if addr != "" && !processedAddresses[addr] {
				processedAddresses[addr] = true
				
				walletData, err := s.GetWalletData(ctx, addr)
				if err == nil {
					wallets = append(wallets, *walletData)
				}
			}
		}
	}
	
	return wallets, nil
}
