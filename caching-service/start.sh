#!/bin/bash

# Enhanced Caching Service Startup Script

echo "🚀 Starting Enhanced Caching Service..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp env.example .env
    echo "📝 Please update .env with your contract addresses and database settings"
fi

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL connection..."
if ! pg_isready -h localhost -p 5432 -U postgres > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "   You can start it with: docker-compose up -d postgres"
    exit 1
fi

# Check if Hardhat node is running
echo "🔍 Checking Hardhat node connection..."
if ! curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545 > /dev/null 2>&1; then
    echo "❌ Hardhat node is not running. Please start it first."
    echo "   You can start it with: npx hardhat node"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "vendor" ] || [ ! -f "go.sum" ]; then
    echo "📦 Installing Go dependencies..."
    go mod tidy
    go mod download
fi

# Build the service
echo "🔨 Building caching service..."
go build -o caching-service-enhanced main_enhanced.go

# Run the service
echo "🎉 Starting enhanced caching service..."
./caching-service-enhanced
