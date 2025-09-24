package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/nikhil-inja/decentralized-escrow-service/caching-service/escrowfactory"
)

func main() {

	err := godotenv.Load()

	factoryAddress := os.Getenv("ESCROW_FACTORY_ADDRESS")
	if factoryAddress == "" {
		log.Fatalf("ESCROW_FACTORY_ADDRESS is not set")
	}

	contractAddress := common.HexToAddress(factoryAddress)

	rpcURL := "ws://127.0.0.1:8545"
	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		log.Fatalf("Failed to connect to Ethereum client: %v", err)
	}
	header, err := client.HeaderByNumber(context.Background(), nil)
	if err != nil {
		log.Fatalf("Failed to get the latest block header: %v", err)
	}

	fmt.Println("🎉 Successfully connected to the Hardhat node!")
	fmt.Printf("Latest Block Number: %s\n", header.Number.String())

	connStr := "postgres://postgres:mysecretpassword@localhost:5432/postgres?sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to open database connection: %v", err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	fmt.Println("🎉 Successfully connected to the PostgreSQL database!")

	query := ethereum.FilterQuery{
		Addresses: []common.Address{contractAddress},
	}

	logs := make(chan types.Log)

	sub, err := client.SubscribeFilterLogs(context.Background(), query, logs)
	if err != nil {
		log.Fatalf("Failed to subscribe to event logs: %v", err)
	}
	fmt.Printf("🎧 Listening for EscrowCreated events on contract: %s\n", contractAddress.Hex())

	contractAbi, err := abi.JSON(strings.NewReader(escrowfactory.BindingsMetaData.ABI))
	if err != nil {
		log.Fatalf("Failed to parse contract ABI: %v", err)
	}

	for {
		select {
		case err := <-sub.Err():
			log.Fatal(err)
		case vLog := <-logs:
			fmt.Println("\n-----------------------------------------")
			fmt.Println("🔥 New EscrowCreated Event Received!")

			var event escrowfactory.BindingsEscrowCreated
			err := contractAbi.UnpackIntoInterface(&event, "EscrowCreated", vLog.Data)
			if err != nil {
				log.Fatalf("Failed to unpack event log: %v", err)
			}

			sqlStatement := `
			INSERT INTO deals (contract_address, client_address, freelancer_address, arbiter_address, total_amount)
			VALUES ($1, $2, $3, $4, $5)`

            placeholderArbiter := "0x0000000000000000000000000000000000000000"

			_, err = db.Exec(sqlStatement,
				event.EscrowAddress.Hex(),
				event.Client.Hex(),
				event.Freelancer.Hex(),
                placeholderArbiter,
				event.TotalAmount.String(), 
			)
			if err != nil {
				log.Printf("Failed to insert deal into database: %v", err)
                // We use log.Printf instead of Fatalf so the listener doesn't crash on one bad event.
                continue 
			}

			fmt.Println("✅ Deal successfully stored in the database.")

			fmt.Printf("   Escrow Contract Address: %s\n", event.EscrowAddress.Hex())
			fmt.Printf("   Client Address: %s\n", event.Client.Hex())
			fmt.Printf("   Freelancer Address: %s\n", event.Freelancer.Hex())
			fmt.Printf("   Total Amount: %v\n", event.TotalAmount)
			fmt.Println("-----------------------------------------")
		}
	}
}
