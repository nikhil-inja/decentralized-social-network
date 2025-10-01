#!/bin/bash

echo "🧪 Enhanced Caching Service - Test Suite"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test functions
test_go_version() {
    echo -e "\n${BLUE}1. Testing Go Version...${NC}"
    if go version > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Go is installed: $(go version)${NC}"
        return 0
    else
        echo -e "${RED}❌ Go is not installed or not in PATH${NC}"
        return 1
    fi
}

test_dependencies() {
    echo -e "\n${BLUE}2. Testing Dependencies...${NC}"
    if go mod tidy > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Dependencies resolved successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to resolve dependencies${NC}"
        return 1
    fi
}

test_compilation() {
    echo -e "\n${BLUE}3. Testing Code Compilation...${NC}"
    
    # Test basic compilation
    if go build -o test_binary test.go > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Basic compilation successful${NC}"
        rm -f test_binary
    else
        echo -e "${RED}❌ Basic compilation failed${NC}"
        return 1
    fi
    
    # Test enhanced main compilation
    if go build -o test_enhanced main_enhanced.go > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Enhanced main compilation successful${NC}"
        rm -f test_enhanced
    else
        echo -e "${RED}❌ Enhanced main compilation failed${NC}"
        return 1
    fi
    
    return 0
}

test_data_models() {
    echo -e "\n${BLUE}4. Testing Data Models...${NC}"
    if go run test.go > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Data models test passed${NC}"
        return 0
    else
        echo -e "${RED}❌ Data models test failed${NC}"
        return 1
    fi
}

test_file_structure() {
    echo -e "\n${BLUE}5. Testing File Structure...${NC}"
    
    required_files=(
        "main_enhanced.go"
        "models/types.go"
        "services/arbiter_service.go"
        "services/escrow_service.go"
        "services/wallet_service.go"
        "api/handlers.go"
        "api/routes.go"
        "db/migrations/000002_create_arbiters_table.up.sql"
        "db/migrations/000003_create_user_profiles_table.up.sql"
        "db/migrations/000004_enhance_deals_table.up.sql"
        "env.example"
        "README.md"
    )
    
    missing_files=()
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ All required files present${NC}"
        return 0
    else
        echo -e "${RED}❌ Missing files:${NC}"
        for file in "${missing_files[@]}"; do
            echo -e "${RED}   - $file${NC}"
        done
        return 1
    fi
}

test_environment_setup() {
    echo -e "\n${BLUE}6. Testing Environment Setup...${NC}"
    
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            echo -e "${YELLOW}⚠️  .env file not found, creating from example...${NC}"
            cp env.example .env
            echo -e "${GREEN}✅ .env file created from example${NC}"
        else
            echo -e "${RED}❌ env.example file not found${NC}"
            return 1
        fi
    else
        echo -e "${GREEN}✅ .env file exists${NC}"
    fi
    
    return 0
}

test_database_connection() {
    echo -e "\n${BLUE}7. Testing Database Connection...${NC}"
    
    # Check if PostgreSQL is running
    if command -v pg_isready > /dev/null 2>&1; then
        if pg_isready -h localhost -p 5432 -U postgres > /dev/null 2>&1; then
            echo -e "${GREEN}✅ PostgreSQL is running${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  PostgreSQL is not running (this is expected if not started yet)${NC}"
            return 0
        fi
    else
        echo -e "${YELLOW}⚠️  pg_isready not found, skipping database test${NC}"
        return 0
    fi
}

test_ethereum_connection() {
    echo -e "\n${BLUE}8. Testing Ethereum Connection...${NC}"
    
    # Check if Hardhat node is running
    if command -v curl > /dev/null 2>&1; then
        if curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Hardhat node is running${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  Hardhat node is not running (this is expected if not started yet)${NC}"
            return 0
        fi
    else
        echo -e "${YELLOW}⚠️  curl not found, skipping Ethereum test${NC}"
        return 0
    fi
}

# Run all tests
main() {
    echo -e "${BLUE}Starting comprehensive test suite...${NC}"
    
    tests_passed=0
    tests_total=8
    
    test_go_version && ((tests_passed++))
    test_dependencies && ((tests_passed++))
    test_compilation && ((tests_passed++))
    test_data_models && ((tests_passed++))
    test_file_structure && ((tests_passed++))
    test_environment_setup && ((tests_passed++))
    test_database_connection && ((tests_passed++))
    test_ethereum_connection && ((tests_passed++))
    
    echo -e "\n${BLUE}Test Results:${NC}"
    echo -e "${BLUE}=============${NC}"
    echo -e "${GREEN}Tests Passed: $tests_passed/$tests_total${NC}"
    
    if [ $tests_passed -eq $tests_total ]; then
        echo -e "\n${GREEN}🎉 All tests passed! The enhanced caching service is ready to use.${NC}"
        echo -e "\n${BLUE}Next steps:${NC}"
        echo -e "1. Start PostgreSQL: ${YELLOW}docker run -d --name postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 postgres:13${NC}"
        echo -e "2. Start Hardhat node: ${YELLOW}npx hardhat node${NC}"
        echo -e "3. Update .env with your contract addresses"
        echo -e "4. Run the service: ${YELLOW}./start.sh${NC}"
        return 0
    else
        echo -e "\n${RED}❌ Some tests failed. Please fix the issues above before running the service.${NC}"
        return 1
    fi
}

# Run the main function
main
