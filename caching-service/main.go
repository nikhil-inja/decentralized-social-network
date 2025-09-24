package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/nikhil-inja/decentralized-escrow-service/caching-service/escrowfactory"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/joho/godotenv"
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

			fmt.Printf("   Escrow Contract Address: %s\n", event.EscrowAddress.Hex())
			fmt.Printf("   Client Address: %s\n", event.Client.Hex())
			fmt.Printf("   Freelancer Address: %s\n", event.Freelancer.Hex())
			fmt.Printf("   Total Amount: %v\n", event.TotalAmount)
			fmt.Println("-----------------------------------------")
		}
	}
}
