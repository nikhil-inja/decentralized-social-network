// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package escrowfactory

import (
	"errors"
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = errors.New
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
	_ = abi.ConvertType
)

// BindingsMetaData contains all meta data concerning the Bindings contract.
var BindingsMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_arbiterRegistryAddress\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"escrowAddress\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"client\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"freelancer\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"totalAmount\",\"type\":\"uint256\"}],\"name\":\"EscrowCreated\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"arbiterRegistry\",\"outputs\":[{\"internalType\":\"contractArbiterRegistry\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_freelancer\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"_arbiter\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"_tokenAddress\",\"type\":\"address\"},{\"internalType\":\"uint256[]\",\"name\":\"_payouts\",\"type\":\"uint256[]\"},{\"internalType\":\"string[]\",\"name\":\"_detailsHashes\",\"type\":\"string[]\"}],\"name\":\"createEscrow\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"escrowContracts\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getEscrowContracts\",\"outputs\":[{\"internalType\":\"address[]\",\"name\":\"\",\"type\":\"address[]\"}],\"stateMutability\":\"view\",\"type\":\"function\"}]",
}

// BindingsABI is the input ABI used to generate the binding from.
// Deprecated: Use BindingsMetaData.ABI instead.
var BindingsABI = BindingsMetaData.ABI

// Bindings is an auto generated Go binding around an Ethereum contract.
type Bindings struct {
	BindingsCaller     // Read-only binding to the contract
	BindingsTransactor // Write-only binding to the contract
	BindingsFilterer   // Log filterer for contract events
}

// BindingsCaller is an auto generated read-only Go binding around an Ethereum contract.
type BindingsCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// BindingsTransactor is an auto generated write-only Go binding around an Ethereum contract.
type BindingsTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// BindingsFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type BindingsFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// BindingsSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type BindingsSession struct {
	Contract     *Bindings         // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// BindingsCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type BindingsCallerSession struct {
	Contract *BindingsCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts   // Call options to use throughout this session
}

// BindingsTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type BindingsTransactorSession struct {
	Contract     *BindingsTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts   // Transaction auth options to use throughout this session
}

// BindingsRaw is an auto generated low-level Go binding around an Ethereum contract.
type BindingsRaw struct {
	Contract *Bindings // Generic contract binding to access the raw methods on
}

// BindingsCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type BindingsCallerRaw struct {
	Contract *BindingsCaller // Generic read-only contract binding to access the raw methods on
}

// BindingsTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type BindingsTransactorRaw struct {
	Contract *BindingsTransactor // Generic write-only contract binding to access the raw methods on
}

// NewBindings creates a new instance of Bindings, bound to a specific deployed contract.
func NewBindings(address common.Address, backend bind.ContractBackend) (*Bindings, error) {
	contract, err := bindBindings(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Bindings{BindingsCaller: BindingsCaller{contract: contract}, BindingsTransactor: BindingsTransactor{contract: contract}, BindingsFilterer: BindingsFilterer{contract: contract}}, nil
}

// NewBindingsCaller creates a new read-only instance of Bindings, bound to a specific deployed contract.
func NewBindingsCaller(address common.Address, caller bind.ContractCaller) (*BindingsCaller, error) {
	contract, err := bindBindings(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &BindingsCaller{contract: contract}, nil
}

// NewBindingsTransactor creates a new write-only instance of Bindings, bound to a specific deployed contract.
func NewBindingsTransactor(address common.Address, transactor bind.ContractTransactor) (*BindingsTransactor, error) {
	contract, err := bindBindings(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &BindingsTransactor{contract: contract}, nil
}

// NewBindingsFilterer creates a new log filterer instance of Bindings, bound to a specific deployed contract.
func NewBindingsFilterer(address common.Address, filterer bind.ContractFilterer) (*BindingsFilterer, error) {
	contract, err := bindBindings(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &BindingsFilterer{contract: contract}, nil
}

// bindBindings binds a generic wrapper to an already deployed contract.
func bindBindings(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := BindingsMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Bindings *BindingsRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Bindings.Contract.BindingsCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Bindings *BindingsRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Bindings.Contract.BindingsTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Bindings *BindingsRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Bindings.Contract.BindingsTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Bindings *BindingsCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Bindings.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Bindings *BindingsTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Bindings.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Bindings *BindingsTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Bindings.Contract.contract.Transact(opts, method, params...)
}

// ArbiterRegistry is a free data retrieval call binding the contract method 0x2535896a.
//
// Solidity: function arbiterRegistry() view returns(address)
func (_Bindings *BindingsCaller) ArbiterRegistry(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _Bindings.contract.Call(opts, &out, "arbiterRegistry")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// ArbiterRegistry is a free data retrieval call binding the contract method 0x2535896a.
//
// Solidity: function arbiterRegistry() view returns(address)
func (_Bindings *BindingsSession) ArbiterRegistry() (common.Address, error) {
	return _Bindings.Contract.ArbiterRegistry(&_Bindings.CallOpts)
}

// ArbiterRegistry is a free data retrieval call binding the contract method 0x2535896a.
//
// Solidity: function arbiterRegistry() view returns(address)
func (_Bindings *BindingsCallerSession) ArbiterRegistry() (common.Address, error) {
	return _Bindings.Contract.ArbiterRegistry(&_Bindings.CallOpts)
}

// EscrowContracts is a free data retrieval call binding the contract method 0xd0e2dfba.
//
// Solidity: function escrowContracts(uint256 ) view returns(address)
func (_Bindings *BindingsCaller) EscrowContracts(opts *bind.CallOpts, arg0 *big.Int) (common.Address, error) {
	var out []interface{}
	err := _Bindings.contract.Call(opts, &out, "escrowContracts", arg0)

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// EscrowContracts is a free data retrieval call binding the contract method 0xd0e2dfba.
//
// Solidity: function escrowContracts(uint256 ) view returns(address)
func (_Bindings *BindingsSession) EscrowContracts(arg0 *big.Int) (common.Address, error) {
	return _Bindings.Contract.EscrowContracts(&_Bindings.CallOpts, arg0)
}

// EscrowContracts is a free data retrieval call binding the contract method 0xd0e2dfba.
//
// Solidity: function escrowContracts(uint256 ) view returns(address)
func (_Bindings *BindingsCallerSession) EscrowContracts(arg0 *big.Int) (common.Address, error) {
	return _Bindings.Contract.EscrowContracts(&_Bindings.CallOpts, arg0)
}

// GetEscrowContracts is a free data retrieval call binding the contract method 0x2f3b703f.
//
// Solidity: function getEscrowContracts() view returns(address[])
func (_Bindings *BindingsCaller) GetEscrowContracts(opts *bind.CallOpts) ([]common.Address, error) {
	var out []interface{}
	err := _Bindings.contract.Call(opts, &out, "getEscrowContracts")

	if err != nil {
		return *new([]common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new([]common.Address)).(*[]common.Address)

	return out0, err

}

// GetEscrowContracts is a free data retrieval call binding the contract method 0x2f3b703f.
//
// Solidity: function getEscrowContracts() view returns(address[])
func (_Bindings *BindingsSession) GetEscrowContracts() ([]common.Address, error) {
	return _Bindings.Contract.GetEscrowContracts(&_Bindings.CallOpts)
}

// GetEscrowContracts is a free data retrieval call binding the contract method 0x2f3b703f.
//
// Solidity: function getEscrowContracts() view returns(address[])
func (_Bindings *BindingsCallerSession) GetEscrowContracts() ([]common.Address, error) {
	return _Bindings.Contract.GetEscrowContracts(&_Bindings.CallOpts)
}

// CreateEscrow is a paid mutator transaction binding the contract method 0x0ab51761.
//
// Solidity: function createEscrow(address _freelancer, address _arbiter, address _tokenAddress, uint256[] _payouts, string[] _detailsHashes) returns()
func (_Bindings *BindingsTransactor) CreateEscrow(opts *bind.TransactOpts, _freelancer common.Address, _arbiter common.Address, _tokenAddress common.Address, _payouts []*big.Int, _detailsHashes []string) (*types.Transaction, error) {
	return _Bindings.contract.Transact(opts, "createEscrow", _freelancer, _arbiter, _tokenAddress, _payouts, _detailsHashes)
}

// CreateEscrow is a paid mutator transaction binding the contract method 0x0ab51761.
//
// Solidity: function createEscrow(address _freelancer, address _arbiter, address _tokenAddress, uint256[] _payouts, string[] _detailsHashes) returns()
func (_Bindings *BindingsSession) CreateEscrow(_freelancer common.Address, _arbiter common.Address, _tokenAddress common.Address, _payouts []*big.Int, _detailsHashes []string) (*types.Transaction, error) {
	return _Bindings.Contract.CreateEscrow(&_Bindings.TransactOpts, _freelancer, _arbiter, _tokenAddress, _payouts, _detailsHashes)
}

// CreateEscrow is a paid mutator transaction binding the contract method 0x0ab51761.
//
// Solidity: function createEscrow(address _freelancer, address _arbiter, address _tokenAddress, uint256[] _payouts, string[] _detailsHashes) returns()
func (_Bindings *BindingsTransactorSession) CreateEscrow(_freelancer common.Address, _arbiter common.Address, _tokenAddress common.Address, _payouts []*big.Int, _detailsHashes []string) (*types.Transaction, error) {
	return _Bindings.Contract.CreateEscrow(&_Bindings.TransactOpts, _freelancer, _arbiter, _tokenAddress, _payouts, _detailsHashes)
}

// BindingsEscrowCreatedIterator is returned from FilterEscrowCreated and is used to iterate over the raw logs and unpacked data for EscrowCreated events raised by the Bindings contract.
type BindingsEscrowCreatedIterator struct {
	Event *BindingsEscrowCreated // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *BindingsEscrowCreatedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(BindingsEscrowCreated)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(BindingsEscrowCreated)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *BindingsEscrowCreatedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *BindingsEscrowCreatedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// BindingsEscrowCreated represents a EscrowCreated event raised by the Bindings contract.
type BindingsEscrowCreated struct {
	EscrowAddress common.Address
	Client        common.Address
	Freelancer    common.Address
	TotalAmount   *big.Int
	Raw           types.Log // Blockchain specific contextual infos
}

// FilterEscrowCreated is a free log retrieval operation binding the contract event 0xd99c67ae0185d6b0a36717d67d259f252914f7955744e4d81a91685ff480896d.
//
// Solidity: event EscrowCreated(address indexed escrowAddress, address indexed client, address indexed freelancer, uint256 totalAmount)
func (_Bindings *BindingsFilterer) FilterEscrowCreated(opts *bind.FilterOpts, escrowAddress []common.Address, client []common.Address, freelancer []common.Address) (*BindingsEscrowCreatedIterator, error) {

	var escrowAddressRule []interface{}
	for _, escrowAddressItem := range escrowAddress {
		escrowAddressRule = append(escrowAddressRule, escrowAddressItem)
	}
	var clientRule []interface{}
	for _, clientItem := range client {
		clientRule = append(clientRule, clientItem)
	}
	var freelancerRule []interface{}
	for _, freelancerItem := range freelancer {
		freelancerRule = append(freelancerRule, freelancerItem)
	}

	logs, sub, err := _Bindings.contract.FilterLogs(opts, "EscrowCreated", escrowAddressRule, clientRule, freelancerRule)
	if err != nil {
		return nil, err
	}
	return &BindingsEscrowCreatedIterator{contract: _Bindings.contract, event: "EscrowCreated", logs: logs, sub: sub}, nil
}

// WatchEscrowCreated is a free log subscription operation binding the contract event 0xd99c67ae0185d6b0a36717d67d259f252914f7955744e4d81a91685ff480896d.
//
// Solidity: event EscrowCreated(address indexed escrowAddress, address indexed client, address indexed freelancer, uint256 totalAmount)
func (_Bindings *BindingsFilterer) WatchEscrowCreated(opts *bind.WatchOpts, sink chan<- *BindingsEscrowCreated, escrowAddress []common.Address, client []common.Address, freelancer []common.Address) (event.Subscription, error) {

	var escrowAddressRule []interface{}
	for _, escrowAddressItem := range escrowAddress {
		escrowAddressRule = append(escrowAddressRule, escrowAddressItem)
	}
	var clientRule []interface{}
	for _, clientItem := range client {
		clientRule = append(clientRule, clientItem)
	}
	var freelancerRule []interface{}
	for _, freelancerItem := range freelancer {
		freelancerRule = append(freelancerRule, freelancerItem)
	}

	logs, sub, err := _Bindings.contract.WatchLogs(opts, "EscrowCreated", escrowAddressRule, clientRule, freelancerRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(BindingsEscrowCreated)
				if err := _Bindings.contract.UnpackLog(event, "EscrowCreated", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseEscrowCreated is a log parse operation binding the contract event 0xd99c67ae0185d6b0a36717d67d259f252914f7955744e4d81a91685ff480896d.
//
// Solidity: event EscrowCreated(address indexed escrowAddress, address indexed client, address indexed freelancer, uint256 totalAmount)
func (_Bindings *BindingsFilterer) ParseEscrowCreated(log types.Log) (*BindingsEscrowCreated, error) {
	event := new(BindingsEscrowCreated)
	if err := _Bindings.contract.UnpackLog(event, "EscrowCreated", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
