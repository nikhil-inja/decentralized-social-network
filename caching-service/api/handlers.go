package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/gorilla/mux"
	"github.com/nikhil-inja/decentralized-escrow-service/caching-service/models"
	"github.com/nikhil-inja/decentralized-escrow-service/caching-service/services"
)

type APIHandler struct {
	walletService  *services.WalletService
	escrowService  *services.EscrowService
	arbiterService *services.ArbiterService
}

func NewAPIHandler(walletService *services.WalletService, escrowService *services.EscrowService, arbiterService *services.ArbiterService) *APIHandler {
	return &APIHandler{
		walletService:  walletService,
		escrowService:  escrowService,
		arbiterService: arbiterService,
	}
}

// GetWalletData returns all data for a specific wallet
func (h *APIHandler) GetWalletData(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	walletAddress := vars["address"]
	
	if !common.IsHexAddress(walletAddress) {
		h.sendErrorResponse(w, http.StatusBadRequest, "Invalid wallet address")
		return
	}
	
	walletData, err := h.walletService.GetWalletData(r.Context(), walletAddress)
	if err != nil {
		h.sendErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Failed to fetch wallet data: %v", err))
		return
	}
	
	h.sendSuccessResponse(w, walletData)
}

// GetWalletStats returns statistics for a wallet
func (h *APIHandler) GetWalletStats(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	walletAddress := vars["address"]
	
	if !common.IsHexAddress(walletAddress) {
		h.sendErrorResponse(w, http.StatusBadRequest, "Invalid wallet address")
		return
	}
	
	stats, err := h.walletService.GetWalletStats(r.Context(), walletAddress)
	if err != nil {
		h.sendErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Failed to fetch wallet stats: %v", err))
		return
	}
	
	h.sendSuccessResponse(w, stats)
}

// GetDeals returns all deals or filtered deals
func (h *APIHandler) GetDeals(w http.ResponseWriter, r *http.Request) {
	// Check if filtering by wallet
	walletAddress := r.URL.Query().Get("wallet")
	
	var deals []models.Deal
	var err error
	
	if walletAddress != "" {
		if !common.IsHexAddress(walletAddress) {
			h.sendErrorResponse(w, http.StatusBadRequest, "Invalid wallet address")
			return
		}
		deals, err = h.escrowService.GetDealsByWallet(r.Context(), walletAddress)
	} else {
		deals, err = h.escrowService.GetAllDeals(r.Context())
	}
	
	if err != nil {
		h.sendErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Failed to fetch deals: %v", err))
		return
	}
	
	// Apply additional filters
	deals = h.filterDeals(deals, r.URL.Query())
	
	h.sendSuccessResponse(w, deals)
}

// GetDeal returns a specific deal by contract address
func (h *APIHandler) GetDeal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	contractAddress := vars["address"]
	
	if !common.IsHexAddress(contractAddress) {
		h.sendErrorResponse(w, http.StatusBadRequest, "Invalid contract address")
		return
	}
	
	deal, err := h.escrowService.GetDealByAddress(r.Context(), common.HexToAddress(contractAddress))
	if err != nil {
		h.sendErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Failed to fetch deal: %v", err))
		return
	}
	
	h.sendSuccessResponse(w, deal)
}

// GetArbiters returns all arbiters or active arbiters
func (h *APIHandler) GetArbiters(w http.ResponseWriter, r *http.Request) {
	activeOnly := r.URL.Query().Get("active") == "true"
	
	var arbiters []models.Arbiter
	var err error
	
	if activeOnly {
		arbiters, err = h.arbiterService.GetActiveArbiters(r.Context())
	} else {
		arbiters, err = h.arbiterService.GetAllArbiters(r.Context())
	}
	
	if err != nil {
		h.sendErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Failed to fetch arbiters: %v", err))
		return
	}
	
	h.sendSuccessResponse(w, arbiters)
}

// GetArbiter returns a specific arbiter by address
func (h *APIHandler) GetArbiter(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	arbiterAddress := vars["address"]
	
	if !common.IsHexAddress(arbiterAddress) {
		h.sendErrorResponse(w, http.StatusBadRequest, "Invalid arbiter address")
		return
	}
	
	arbiter, err := h.arbiterService.GetArbiterByAddress(r.Context(), common.HexToAddress(arbiterAddress))
	if err != nil {
		h.sendErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Failed to fetch arbiter: %v", err))
		return
	}
	
	h.sendSuccessResponse(w, arbiter)
}

// GetTopWallets returns wallets with highest activity
func (h *APIHandler) GetTopWallets(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	limit := 10 // default
	
	if limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 && parsedLimit <= 100 {
			limit = parsedLimit
		}
	}
	
	wallets, err := h.walletService.GetTopWallets(r.Context(), limit)
	if err != nil {
		h.sendErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Failed to fetch top wallets: %v", err))
		return
	}
	
	h.sendSuccessResponse(w, wallets)
}

// HealthCheck returns service health status
func (h *APIHandler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	health := map[string]interface{}{
		"status":    "healthy",
		"service":   "caching-service",
		"version":   "1.0.0",
		"timestamp": "2024-01-01T00:00:00Z",
	}
	
	h.sendSuccessResponse(w, health)
}

// filterDeals applies query parameters to filter deals
func (h *APIHandler) filterDeals(deals []models.Deal, queryParams map[string][]string) []models.Deal {
	filtered := deals
	
	// Filter by status
	if statusStr := queryParams["status"]; len(statusStr) > 0 {
		status, err := strconv.Atoi(statusStr[0])
		if err == nil {
			var statusFiltered []models.Deal
			for _, deal := range filtered {
				if deal.Status == status {
					statusFiltered = append(statusFiltered, deal)
				}
			}
			filtered = statusFiltered
		}
	}
	
	// Filter by work status
	if workStatusStr := queryParams["work_status"]; len(workStatusStr) > 0 {
		workStatus, err := strconv.Atoi(workStatusStr[0])
		if err == nil {
			var workStatusFiltered []models.Deal
			for _, deal := range filtered {
				if deal.WorkStatus == workStatus {
					workStatusFiltered = append(workStatusFiltered, deal)
				}
			}
			filtered = workStatusFiltered
		}
	}
	
	// Filter by token address
	if tokenAddress := queryParams["token"]; len(tokenAddress) > 0 {
		var tokenFiltered []models.Deal
		for _, deal := range filtered {
			if strings.EqualFold(deal.TokenAddress, tokenAddress[0]) {
				tokenFiltered = append(tokenFiltered, deal)
			}
		}
		filtered = tokenFiltered
	}
	
	// Limit results
	if limitStr := queryParams["limit"]; len(limitStr) > 0 {
		limit, err := strconv.Atoi(limitStr[0])
		if err == nil && limit > 0 && limit < len(filtered) {
			filtered = filtered[:limit]
		}
	}
	
	return filtered
}

// sendSuccessResponse sends a successful JSON response
func (h *APIHandler) sendSuccessResponse(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	
	response := models.APIResponse{
		Success: true,
		Data:    data,
	}
	
	json.NewEncoder(w).Encode(response)
}

// sendErrorResponse sends an error JSON response
func (h *APIHandler) sendErrorResponse(w http.ResponseWriter, statusCode int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	
	response := models.APIResponse{
		Success: false,
		Error:   message,
	}
	
	json.NewEncoder(w).Encode(response)
}
