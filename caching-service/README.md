# Enhanced Caching Service

A comprehensive Go-based caching service that pulls all wallet-related data from your decentralized escrow platform and makes it available via REST API and WebSocket for real-time updates.

## 🚀 Features

- **Complete Data Fetching**: Pulls all deals, arbiters, and user profiles from smart contracts
- **Real-time Updates**: WebSocket support for live event streaming
- **REST API**: Comprehensive API endpoints for frontend integration
- **PostgreSQL Caching**: Efficient database storage with proper indexing
- **Wallet Analytics**: Statistics and insights for each wallet address
- **Event Monitoring**: Listens to all contract events and updates cache automatically

## 📋 Prerequisites

- Go 1.21+
- PostgreSQL 12+
- Hardhat node running on localhost:8545
- Deployed smart contracts (ArbiterRegistry, EscrowFactory, UserProfile)

## 🛠️ Installation

1. **Clone and navigate to the caching service directory:**
   ```bash
   cd caching-service
   ```

2. **Install dependencies:**
   ```bash
   go mod tidy
   go mod download
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your contract addresses and database settings
   ```

4. **Start PostgreSQL:**
   ```bash
   # Using Docker
   docker run -d --name postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 postgres:13
   
   # Or using your local PostgreSQL installation
   ```

5. **Start Hardhat node:**
   ```bash
   npx hardhat node
   ```

6. **Run the enhanced caching service:**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

## 🔧 Configuration

Update the `.env` file with your deployed contract addresses:

```env
# Contract Addresses
ARBITER_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
ESCROW_FACTORY_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
USER_PROFILE_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

# Database
DATABASE_URL=postgres://postgres:mysecretpassword@localhost:5432/postgres?sslmode=disable

# Ethereum
RPC_URL=http://127.0.0.1:8545
WS_URL=ws://127.0.0.1:8545
```

## 📡 API Endpoints

### Wallet Data
- `GET /api/v1/wallet/{address}` - Get all data for a wallet
- `GET /api/v1/wallet/{address}/stats` - Get wallet statistics
- `GET /api/v1/wallets/top?limit=10` - Get top active wallets

### Deals
- `GET /api/v1/deals` - Get all deals
- `GET /api/v1/deals?wallet={address}` - Get deals for specific wallet
- `GET /api/v1/deals?status=0&work_status=1` - Filter deals by status
- `GET /api/v1/deals/{contractAddress}` - Get specific deal

### Arbiters
- `GET /api/v1/arbiters` - Get all arbiters
- `GET /api/v1/arbiters?active=true` - Get only active arbiters
- `GET /api/v1/arbiters/{address}` - Get specific arbiter

### Real-time Updates
- `WS /api/v1/ws` - WebSocket connection for real-time events

### Health Check
- `GET /api/v1/health` - Service health status

## 📊 Data Models

### Wallet Data Response
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "deals": [...],
    "arbiters": [...],
    "profile": {...},
    "tokenBalances": {...},
    "stats": {
      "totalDealsAsClient": 5,
      "totalDealsAsFreelancer": 3,
      "totalDealsAsArbiter": 2,
      "totalVolume": "10000000000000000000",
      "activeDeals": 2,
      "completedDeals": 6,
      "disputedDeals": 0,
      "averageRating": 4.5
    }
  }
}
```

### Deal Response
```json
{
  "success": true,
  "data": {
    "contractAddress": "0x...",
    "clientAddress": "0x...",
    "freelancerAddress": "0x...",
    "arbiterAddress": "0x...",
    "tokenAddress": "0x...",
    "totalAmount": "1000000000000000000",
    "status": 0,
    "workStatus": 1,
    "projectDescription": "Build a website",
    "workSubmission": "https://...",
    "createdAt": "2024-01-01T00:00:00Z",
    "arbiter": {...},
    "client": {...},
    "freelancer": {...}
  }
}
```

## 🔄 Real-time Events

The service listens to the following contract events and broadcasts them via WebSocket:

- `arbiter_added` - New arbiter registered
- `arbiter_removed` - Arbiter deactivated
- `deal_created` - New escrow deal created
- `deal_updated` - Deal status changed
- `work_submitted` - Work submitted for review
- `dispute_raised` - Dispute raised on deal

## 🗄️ Database Schema

### Tables Created
- `deals` - Enhanced with additional fields
- `arbiters` - Arbiter registry data
- `user_profiles` - User profile information

### Indexes
- Optimized indexes on all frequently queried fields
- Composite indexes for complex queries

## 🚀 Usage Examples

### Frontend Integration

```javascript
// Fetch wallet data
const response = await fetch('http://localhost:8080/api/v1/wallet/0x...');
const walletData = await response.json();

// Get active arbiters
const arbiters = await fetch('http://localhost:8080/api/v1/arbiters?active=true');

// WebSocket for real-time updates
const ws = new WebSocket('ws://localhost:8080/api/v1/ws');
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Real-time update:', update);
};
```

### Filtering and Pagination

```javascript
// Get deals with filters
const deals = await fetch('http://localhost:8080/api/v1/deals?status=0&limit=20');

// Get top wallets
const topWallets = await fetch('http://localhost:8080/api/v1/wallets/top?limit=10');
```

## 🔧 Development

### Project Structure
```
caching-service/
├── api/                 # HTTP API handlers and routes
├── db/                  # Database migrations
├── models/              # Data models and types
├── services/            # Business logic services
├── main_enhanced.go     # Enhanced main application
├── start.sh            # Startup script
└── README.md           # This file
```

### Adding New Features

1. **New API Endpoint**: Add to `api/handlers.go` and `api/routes.go`
2. **New Service**: Create in `services/` directory
3. **New Data Model**: Add to `models/types.go`
4. **Database Changes**: Create migration in `db/migrations/`

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env file

2. **Ethereum Connection Failed**
   - Ensure Hardhat node is running on port 8545
   - Check RPC_URL in .env file

3. **Contract Address Errors**
   - Verify contract addresses in .env match deployed contracts
   - Ensure contracts are deployed and accessible

4. **Missing Dependencies**
   ```bash
   go mod tidy
   go mod download
   ```

### Logs

The service provides detailed logging for:
- Database operations
- Ethereum contract calls
- API requests
- Event processing
- Error handling

## 📈 Performance

- **Caching Strategy**: Database-first with contract fallback
- **Indexing**: Optimized database indexes for fast queries
- **Connection Pooling**: Efficient database connection management
- **Event Batching**: Batched event processing for performance

## 🔒 Security

- **Input Validation**: All inputs are validated
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Configurable CORS settings
- **Rate Limiting**: Built-in rate limiting (configurable)

## 📝 License

This project is part of the decentralized escrow platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs for error details
3. Ensure all prerequisites are met
4. Create an issue with detailed information
