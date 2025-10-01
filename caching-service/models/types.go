package models

import (
	"time"
	"github.com/ethereum/go-ethereum/common"
)

// Deal represents a complete escrow deal with all related data
type Deal struct {
	ID                int       `json:"id" db:"id"`
	ContractAddress   string    `json:"contractAddress" db:"contract_address"`
	ClientAddress     string    `json:"clientAddress" db:"client_address"`
	FreelancerAddress string    `json:"freelancerAddress" db:"freelancer_address"`
	ArbiterAddress    string    `json:"arbiterAddress" db:"arbiter_address"`
	TokenAddress      string    `json:"tokenAddress" db:"token_address"`
	TotalAmount       string    `json:"totalAmount" db:"total_amount"`
	Status            int       `json:"status" db:"status"`
	WorkStatus        int       `json:"workStatus" db:"work_status"`
	ProjectDescription string   `json:"projectDescription" db:"project_description"`
	WorkSubmission    string    `json:"workSubmission" db:"work_submission"`
	CreatedAt         time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt         time.Time `json:"updatedAt" db:"updated_at"`
	
	// Related data
	Client     *UserProfile `json:"client,omitempty"`
	Freelancer *UserProfile `json:"freelancer,omitempty"`
	Arbiter    *Arbiter     `json:"arbiter,omitempty"`
	Token      *Token       `json:"token,omitempty"`
}

// Arbiter represents an arbiter from the registry
type Arbiter struct {
	Address     string `json:"address" db:"address"`
	Name        string `json:"name" db:"name"`
	ProfileHash string `json:"profileHash" db:"profile_hash"`
	IsActive    bool   `json:"isActive" db:"is_active"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}

// UserProfile represents user profile data
type UserProfile struct {
	Address     string    `json:"address" db:"address"`
	Name        string    `json:"name" db:"name"`
	Bio         string    `json:"bio" db:"bio"`
	AvatarHash  string    `json:"avatarHash" db:"avatar_hash"`
	Skills      []string  `json:"skills" db:"skills"`
	Rating      float64   `json:"rating" db:"rating"`
	ReviewCount int       `json:"reviewCount" db:"review_count"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
}

// Token represents ERC20 token information
type Token struct {
	Address     string `json:"address" db:"address"`
	Symbol      string `json:"symbol" db:"symbol"`
	Name        string `json:"name" db:"name"`
	Decimals    int    `json:"decimals" db:"decimals"`
	TotalSupply string `json:"totalSupply" db:"total_supply"`
}

// WalletData represents all data for a specific wallet address
type WalletData struct {
	Address     string        `json:"address"`
	Deals       []Deal        `json:"deals"`
	Arbiters    []Arbiter     `json:"arbiters"`
	Profile     *UserProfile  `json:"profile,omitempty"`
	TokenBalances map[string]string `json:"tokenBalances"`
	Stats       WalletStats   `json:"stats"`
}

// WalletStats represents aggregated statistics for a wallet
type WalletStats struct {
	TotalDealsAsClient     int     `json:"totalDealsAsClient"`
	TotalDealsAsFreelancer int     `json:"totalDealsAsFreelancer"`
	TotalDealsAsArbiter    int     `json:"totalDealsAsArbiter"`
	TotalVolume            string  `json:"totalVolume"`
	ActiveDeals            int     `json:"activeDeals"`
	CompletedDeals         int     `json:"completedDeals"`
	DisputedDeals          int     `json:"disputedDeals"`
	AverageRating          float64 `json:"averageRating"`
}

// APIResponse represents a standard API response
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

// EventUpdate represents a real-time event update
type EventUpdate struct {
	Type      string      `json:"type"`
	Address   string      `json:"address"`
	Data      interface{} `json:"data"`
	Timestamp time.Time   `json:"timestamp"`
}

// Contract addresses configuration
type ContractConfig struct {
	ArbiterRegistry common.Address
	EscrowFactory   common.Address
	UserProfile     common.Address
	RPCURL          string
	WSURL           string
}
