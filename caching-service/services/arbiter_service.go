package services

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/nikhil-inja/decentralized-escrow-service/caching-service/arbiterregistry"
	"github.com/nikhil-inja/decentralized-escrow-service/caching-service/models"
)

type ArbiterService struct {
	client   *ethclient.Client
	contract *arbiterregistry.Bindings
	db       *sql.DB
}

func NewArbiterService(client *ethclient.Client, contractAddress common.Address, db *sql.DB) (*ArbiterService, error) {
	contract, err := arbiterregistry.NewBindings(contractAddress, client)
	if err != nil {
		return nil, fmt.Errorf("failed to create arbiter registry binding: %v", err)
	}

	return &ArbiterService{
		client:   client,
		contract: contract,
		db:       db,
	}, nil
}

// GetAllArbiters fetches all arbiters from the contract and caches them
func (s *ArbiterService) GetAllArbiters(ctx context.Context) ([]models.Arbiter, error) {
	log.Println("Fetching all arbiters from contract...")
	
	var arbiters []models.Arbiter
	
	// Get the list of arbiter addresses
	arbiterAddresses, err := s.getArbiterAddresses(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get arbiter addresses: %v", err)
	}
	
	log.Printf("Found %d arbiters in contract", len(arbiterAddresses))
	
	// Fetch details for each arbiter
	for _, address := range arbiterAddresses {
		arbiter, err := s.getArbiterDetails(ctx, address)
		if err != nil {
			log.Printf("Failed to get details for arbiter %s: %v", address.Hex(), err)
			continue
		}
		
		// Cache in database
		if err := s.cacheArbiter(arbiter); err != nil {
			log.Printf("Failed to cache arbiter %s: %v", address.Hex(), err)
		}
		
		arbiters = append(arbiters, *arbiter)
	}
	
	return arbiters, nil
}

// GetActiveArbiters returns only active arbiters
func (s *ArbiterService) GetActiveArbiters(ctx context.Context) ([]models.Arbiter, error) {
	allArbiters, err := s.GetAllArbiters(ctx)
	if err != nil {
		return nil, err
	}
	
	var activeArbiters []models.Arbiter
	for _, arbiter := range allArbiters {
		if arbiter.IsActive {
			activeArbiters = append(activeArbiters, arbiter)
		}
	}
	
	return activeArbiters, nil
}

// GetArbiterByAddress fetches a specific arbiter by address
func (s *ArbiterService) GetArbiterByAddress(ctx context.Context, address common.Address) (*models.Arbiter, error) {
	// First try to get from cache
	arbiter, err := s.getArbiterFromCache(address.Hex())
	if err == nil && arbiter != nil {
		return arbiter, nil
	}
	
	// If not in cache, fetch from contract
	arbiter, err = s.getArbiterDetails(ctx, address)
	if err != nil {
		return nil, err
	}
	
	// Cache the result
	if err := s.cacheArbiter(arbiter); err != nil {
		log.Printf("Failed to cache arbiter: %v", err)
	}
	
	return arbiter, nil
}

// IsArbiterActive checks if an arbiter is active
func (s *ArbiterService) IsArbiterActive(ctx context.Context, address common.Address) (bool, error) {
	return s.contract.IsArbiterActive(&bind.CallOpts{Context: ctx}, address)
}

// getArbiterAddresses fetches all arbiter addresses from the contract
func (s *ArbiterService) getArbiterAddresses(ctx context.Context) ([]common.Address, error) {
	var addresses []common.Address
	
	// Try to get the list using getArbiterList if available
	// For now, we'll iterate through the arbiterList array
	i := 0
	for {
		address, err := s.contract.ArbiterList(&bind.CallOpts{Context: ctx}, big.NewInt(int64(i)))
		if err != nil {
			// End of array reached
			break
		}
		
		// Check if it's a zero address (end of array)
		if address == (common.Address{}) {
			break
		}
		
		addresses = append(addresses, address)
		i++
		
		// Safety limit
		if i > 1000 {
			break
		}
	}
	
	return addresses, nil
}

// getArbiterDetails fetches detailed information for a specific arbiter
func (s *ArbiterService) getArbiterDetails(ctx context.Context, address common.Address) (*models.Arbiter, error) {
	arbiterData, err := s.contract.Arbiters(&bind.CallOpts{Context: ctx}, address)
	if err != nil {
		return nil, fmt.Errorf("failed to get arbiter data: %v", err)
	}
	
	return &models.Arbiter{
		Address:     address.Hex(),
		Name:        arbiterData.Name,
		ProfileHash: arbiterData.ProfileHash,
		IsActive:    arbiterData.IsActive,
		CreatedAt:   time.Now(),
	}, nil
}

// cacheArbiter stores arbiter data in the database
func (s *ArbiterService) cacheArbiter(arbiter *models.Arbiter) error {
	query := `
		INSERT INTO arbiters (address, name, profile_hash, is_active, created_at)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (address) 
		DO UPDATE SET 
			name = EXCLUDED.name,
			profile_hash = EXCLUDED.profile_hash,
			is_active = EXCLUDED.is_active,
			created_at = EXCLUDED.created_at
	`
	
	_, err := s.db.Exec(query, arbiter.Address, arbiter.Name, arbiter.ProfileHash, arbiter.IsActive, arbiter.CreatedAt)
	return err
}

// getArbiterFromCache retrieves arbiter data from the database cache
func (s *ArbiterService) getArbiterFromCache(address string) (*models.Arbiter, error) {
	query := `SELECT address, name, profile_hash, is_active, created_at FROM arbiters WHERE address = $1`
	
	var arbiter models.Arbiter
	err := s.db.QueryRow(query, address).Scan(
		&arbiter.Address,
		&arbiter.Name,
		&arbiter.ProfileHash,
		&arbiter.IsActive,
		&arbiter.CreatedAt,
	)
	
	if err != nil {
		return nil, err
	}
	
	return &arbiter, nil
}

// WatchArbiterEvents subscribes to arbiter-related events
func (s *ArbiterService) WatchArbiterEvents(ctx context.Context, eventChan chan<- models.EventUpdate) error {
	// Watch for ArbiterAdded events
	arbiterAddedSink := make(chan *arbiterregistry.BindingsArbiterAdded)
	arbiterAddedSub, err := s.contract.WatchArbiterAdded(&bind.WatchOpts{Context: ctx}, arbiterAddedSink, nil)
	if err != nil {
		return fmt.Errorf("failed to watch ArbiterAdded events: %v", err)
	}
	
	// Watch for ArbiterRemoved events
	arbiterRemovedSink := make(chan *arbiterregistry.BindingsArbiterRemoved)
	arbiterRemovedSub, err := s.contract.WatchArbiterRemoved(&bind.WatchOpts{Context: ctx}, arbiterRemovedSink, nil)
	if err != nil {
		return fmt.Errorf("failed to watch ArbiterRemoved events: %v", err)
	}
	
	go func() {
		defer arbiterAddedSub.Unsubscribe()
		defer arbiterRemovedSub.Unsubscribe()
		
		for {
			select {
			case event := <-arbiterAddedSink:
				log.Printf("ArbiterAdded event: %s", event.ArbiterAddress.Hex())
				
				// Fetch and cache the new arbiter
				arbiter, err := s.getArbiterDetails(ctx, event.ArbiterAddress)
				if err == nil {
					s.cacheArbiter(arbiter)
					
					// Send update to channel
					eventChan <- models.EventUpdate{
						Type:      "arbiter_added",
						Address:   event.ArbiterAddress.Hex(),
						Data:      arbiter,
						Timestamp: time.Now(),
					}
				}
				
			case event := <-arbiterRemovedSink:
				log.Printf("ArbiterRemoved event: %s", event.ArbiterAddress.Hex())
				
				// Update cache to mark as inactive
				_, err := s.db.Exec("UPDATE arbiters SET is_active = false WHERE address = $1", event.ArbiterAddress.Hex())
				if err != nil {
					log.Printf("Failed to update arbiter status: %v", err)
				}
				
				// Send update to channel
				eventChan <- models.EventUpdate{
					Type:      "arbiter_removed",
					Address:   event.ArbiterAddress.Hex(),
					Data:      map[string]interface{}{"isActive": false},
					Timestamp: time.Now(),
				}
				
			case <-ctx.Done():
				return
			}
		}
	}()
	
	return nil
}
