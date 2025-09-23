package main

import (
	"context"
	"fmt"
	"log"
	"github.com/ethereum/go-ethereum/ethclient"
)

func main() {
	rpcURL := "http://127.0.0.1:8545"

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
}

