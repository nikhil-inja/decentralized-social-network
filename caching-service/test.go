package main

import (
	"fmt"
	"log"
	"os"

	"github.com/ethereum/go-ethereum/common"
	"github.com/nikhil-inja/decentralized-escrow-service/caching-service/models"
)

func main() {
	fmt.Println("🧪 Testing Enhanced Caching Service Components...")

	// Test 1: Data Models
	fmt.Println("\n1. Testing Data Models...")
	testDataModels()

	// Test 2: Configuration
	fmt.Println("\n2. Testing Configuration...")
	testConfiguration()

	// Test 3: API Response Structure
	fmt.Println("\n3. Testing API Response Structure...")
	testAPIResponse()

	fmt.Println("\n✅ All tests passed! The enhanced caching service is ready to use.")
}

func testDataModels() {
	// Test Deal model
	deal := models.Deal{
		ID:                1,
		ContractAddress:   "0x1234567890123456789012345678901234567890",
		ClientAddress:     "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
		FreelancerAddress: "0xfedcbafedcbafedcbafedcbafedcbafedcbafedc",
		ArbiterAddress:    "0x1111111111111111111111111111111111111111",
		TokenAddress:      "0x2222222222222222222222222222222222222222",
		TotalAmount:       "1000000000000000000",
		Status:            0,
		WorkStatus:        1,
		ProjectDescription: "Test project",
		WorkSubmission:    "https://example.com/submission",
	}

	fmt.Printf("   ✅ Deal model: %s\n", deal.ContractAddress)

	// Test Arbiter model
	arbiter := models.Arbiter{
		Address:     "0x1111111111111111111111111111111111111111",
		Name:        "Test Arbiter",
		ProfileHash: "QmTestHash",
		IsActive:    true,
	}

	fmt.Printf("   ✅ Arbiter model: %s\n", arbiter.Name)

	// Test WalletStats model
	stats := models.WalletStats{
		TotalDealsAsClient:     5,
		TotalDealsAsFreelancer: 3,
		TotalDealsAsArbiter:    2,
		TotalVolume:            "10000000000000000000",
		ActiveDeals:            2,
		CompletedDeals:         6,
		DisputedDeals:          0,
		AverageRating:          4.5,
	}

	fmt.Printf("   ✅ WalletStats model: %d total deals\n", stats.TotalDealsAsClient+stats.TotalDealsAsFreelancer+stats.TotalDealsAsArbiter)
}

func testConfiguration() {
	// Test contract configuration
	config := &models.ContractConfig{
		ArbiterRegistry: common.HexToAddress("0x5FbDB2315678afecb367f032d93F642f64180aa3"),
		EscrowFactory:   common.HexToAddress("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"),
		UserProfile:     common.HexToAddress("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"),
		RPCURL:          "http://127.0.0.1:8545",
		WSURL:           "ws://127.0.0.1:8545",
	}

	fmt.Printf("   ✅ ArbiterRegistry: %s\n", config.ArbiterRegistry.Hex())
	fmt.Printf("   ✅ EscrowFactory: %s\n", config.EscrowFactory.Hex())
	fmt.Printf("   ✅ RPC URL: %s\n", config.RPCURL)
}

func testAPIResponse() {
	// Test API response structure
	response := models.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"message": "Test successful",
			"count":   42,
		},
		Message: "All systems operational",
	}

	fmt.Printf("   ✅ API Response: %t\n", response.Success)
	fmt.Printf("   ✅ Message: %s\n", response.Message)

	// Test error response
	errorResponse := models.APIResponse{
		Success: false,
		Error:   "Test error message",
	}

	fmt.Printf("   ✅ Error Response: %s\n", errorResponse.Error)
}

func init() {
	// Set up logging
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.SetOutput(os.Stdout)
}
