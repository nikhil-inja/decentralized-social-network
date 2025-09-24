// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package arbiterregistry

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
	ABI: "[{\"inputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"OwnableInvalidOwner\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"OwnableUnauthorizedAccount\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"arbiterAddress\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"string\",\"name\":\"name\",\"type\":\"string\"}],\"name\":\"ArbiterAdded\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"arbiterAddress\",\"type\":\"address\"}],\"name\":\"ArbiterRemoved\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"previousOwner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"OwnershipTransferred\",\"type\":\"event\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_arbiterAddress\",\"type\":\"address\"},{\"internalType\":\"string\",\"name\":\"_name\",\"type\":\"string\"},{\"internalType\":\"string\",\"name\":\"_profileHash\",\"type\":\"string\"}],\"name\":\"addArbiter\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"arbiterList\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"arbiters\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"name\",\"type\":\"string\"},{\"internalType\":\"string\",\"name\":\"profileHash\",\"type\":\"string\"},{\"internalType\":\"bool\",\"name\":\"isActive\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_arbiterAddress\",\"type\":\"address\"}],\"name\":\"isArbiterActive\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_arbiterAddress\",\"type\":\"address\"}],\"name\":\"removeArbiter\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"renounceOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"transferOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]",
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

// ArbiterList is a free data retrieval call binding the contract method 0x74141266.
//
// Solidity: function arbiterList(uint256 ) view returns(address)
func (_Bindings *BindingsCaller) ArbiterList(opts *bind.CallOpts, arg0 *big.Int) (common.Address, error) {
	var out []interface{}
	err := _Bindings.contract.Call(opts, &out, "arbiterList", arg0)

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// ArbiterList is a free data retrieval call binding the contract method 0x74141266.
//
// Solidity: function arbiterList(uint256 ) view returns(address)
func (_Bindings *BindingsSession) ArbiterList(arg0 *big.Int) (common.Address, error) {
	return _Bindings.Contract.ArbiterList(&_Bindings.CallOpts, arg0)
}

// ArbiterList is a free data retrieval call binding the contract method 0x74141266.
//
// Solidity: function arbiterList(uint256 ) view returns(address)
func (_Bindings *BindingsCallerSession) ArbiterList(arg0 *big.Int) (common.Address, error) {
	return _Bindings.Contract.ArbiterList(&_Bindings.CallOpts, arg0)
}

// Arbiters is a free data retrieval call binding the contract method 0x7bf2bb10.
//
// Solidity: function arbiters(address ) view returns(string name, string profileHash, bool isActive)
func (_Bindings *BindingsCaller) Arbiters(opts *bind.CallOpts, arg0 common.Address) (struct {
	Name        string
	ProfileHash string
	IsActive    bool
}, error) {
	var out []interface{}
	err := _Bindings.contract.Call(opts, &out, "arbiters", arg0)

	outstruct := new(struct {
		Name        string
		ProfileHash string
		IsActive    bool
	})
	if err != nil {
		return *outstruct, err
	}

	outstruct.Name = *abi.ConvertType(out[0], new(string)).(*string)
	outstruct.ProfileHash = *abi.ConvertType(out[1], new(string)).(*string)
	outstruct.IsActive = *abi.ConvertType(out[2], new(bool)).(*bool)

	return *outstruct, err

}

// Arbiters is a free data retrieval call binding the contract method 0x7bf2bb10.
//
// Solidity: function arbiters(address ) view returns(string name, string profileHash, bool isActive)
func (_Bindings *BindingsSession) Arbiters(arg0 common.Address) (struct {
	Name        string
	ProfileHash string
	IsActive    bool
}, error) {
	return _Bindings.Contract.Arbiters(&_Bindings.CallOpts, arg0)
}

// Arbiters is a free data retrieval call binding the contract method 0x7bf2bb10.
//
// Solidity: function arbiters(address ) view returns(string name, string profileHash, bool isActive)
func (_Bindings *BindingsCallerSession) Arbiters(arg0 common.Address) (struct {
	Name        string
	ProfileHash string
	IsActive    bool
}, error) {
	return _Bindings.Contract.Arbiters(&_Bindings.CallOpts, arg0)
}

// IsArbiterActive is a free data retrieval call binding the contract method 0x43d9e184.
//
// Solidity: function isArbiterActive(address _arbiterAddress) view returns(bool)
func (_Bindings *BindingsCaller) IsArbiterActive(opts *bind.CallOpts, _arbiterAddress common.Address) (bool, error) {
	var out []interface{}
	err := _Bindings.contract.Call(opts, &out, "isArbiterActive", _arbiterAddress)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// IsArbiterActive is a free data retrieval call binding the contract method 0x43d9e184.
//
// Solidity: function isArbiterActive(address _arbiterAddress) view returns(bool)
func (_Bindings *BindingsSession) IsArbiterActive(_arbiterAddress common.Address) (bool, error) {
	return _Bindings.Contract.IsArbiterActive(&_Bindings.CallOpts, _arbiterAddress)
}

// IsArbiterActive is a free data retrieval call binding the contract method 0x43d9e184.
//
// Solidity: function isArbiterActive(address _arbiterAddress) view returns(bool)
func (_Bindings *BindingsCallerSession) IsArbiterActive(_arbiterAddress common.Address) (bool, error) {
	return _Bindings.Contract.IsArbiterActive(&_Bindings.CallOpts, _arbiterAddress)
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() view returns(address)
func (_Bindings *BindingsCaller) Owner(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _Bindings.contract.Call(opts, &out, "owner")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() view returns(address)
func (_Bindings *BindingsSession) Owner() (common.Address, error) {
	return _Bindings.Contract.Owner(&_Bindings.CallOpts)
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() view returns(address)
func (_Bindings *BindingsCallerSession) Owner() (common.Address, error) {
	return _Bindings.Contract.Owner(&_Bindings.CallOpts)
}

// AddArbiter is a paid mutator transaction binding the contract method 0x28701a5e.
//
// Solidity: function addArbiter(address _arbiterAddress, string _name, string _profileHash) returns()
func (_Bindings *BindingsTransactor) AddArbiter(opts *bind.TransactOpts, _arbiterAddress common.Address, _name string, _profileHash string) (*types.Transaction, error) {
	return _Bindings.contract.Transact(opts, "addArbiter", _arbiterAddress, _name, _profileHash)
}

// AddArbiter is a paid mutator transaction binding the contract method 0x28701a5e.
//
// Solidity: function addArbiter(address _arbiterAddress, string _name, string _profileHash) returns()
func (_Bindings *BindingsSession) AddArbiter(_arbiterAddress common.Address, _name string, _profileHash string) (*types.Transaction, error) {
	return _Bindings.Contract.AddArbiter(&_Bindings.TransactOpts, _arbiterAddress, _name, _profileHash)
}

// AddArbiter is a paid mutator transaction binding the contract method 0x28701a5e.
//
// Solidity: function addArbiter(address _arbiterAddress, string _name, string _profileHash) returns()
func (_Bindings *BindingsTransactorSession) AddArbiter(_arbiterAddress common.Address, _name string, _profileHash string) (*types.Transaction, error) {
	return _Bindings.Contract.AddArbiter(&_Bindings.TransactOpts, _arbiterAddress, _name, _profileHash)
}

// RemoveArbiter is a paid mutator transaction binding the contract method 0x3487e08c.
//
// Solidity: function removeArbiter(address _arbiterAddress) returns()
func (_Bindings *BindingsTransactor) RemoveArbiter(opts *bind.TransactOpts, _arbiterAddress common.Address) (*types.Transaction, error) {
	return _Bindings.contract.Transact(opts, "removeArbiter", _arbiterAddress)
}

// RemoveArbiter is a paid mutator transaction binding the contract method 0x3487e08c.
//
// Solidity: function removeArbiter(address _arbiterAddress) returns()
func (_Bindings *BindingsSession) RemoveArbiter(_arbiterAddress common.Address) (*types.Transaction, error) {
	return _Bindings.Contract.RemoveArbiter(&_Bindings.TransactOpts, _arbiterAddress)
}

// RemoveArbiter is a paid mutator transaction binding the contract method 0x3487e08c.
//
// Solidity: function removeArbiter(address _arbiterAddress) returns()
func (_Bindings *BindingsTransactorSession) RemoveArbiter(_arbiterAddress common.Address) (*types.Transaction, error) {
	return _Bindings.Contract.RemoveArbiter(&_Bindings.TransactOpts, _arbiterAddress)
}

// RenounceOwnership is a paid mutator transaction binding the contract method 0x715018a6.
//
// Solidity: function renounceOwnership() returns()
func (_Bindings *BindingsTransactor) RenounceOwnership(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Bindings.contract.Transact(opts, "renounceOwnership")
}

// RenounceOwnership is a paid mutator transaction binding the contract method 0x715018a6.
//
// Solidity: function renounceOwnership() returns()
func (_Bindings *BindingsSession) RenounceOwnership() (*types.Transaction, error) {
	return _Bindings.Contract.RenounceOwnership(&_Bindings.TransactOpts)
}

// RenounceOwnership is a paid mutator transaction binding the contract method 0x715018a6.
//
// Solidity: function renounceOwnership() returns()
func (_Bindings *BindingsTransactorSession) RenounceOwnership() (*types.Transaction, error) {
	return _Bindings.Contract.RenounceOwnership(&_Bindings.TransactOpts)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(address newOwner) returns()
func (_Bindings *BindingsTransactor) TransferOwnership(opts *bind.TransactOpts, newOwner common.Address) (*types.Transaction, error) {
	return _Bindings.contract.Transact(opts, "transferOwnership", newOwner)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(address newOwner) returns()
func (_Bindings *BindingsSession) TransferOwnership(newOwner common.Address) (*types.Transaction, error) {
	return _Bindings.Contract.TransferOwnership(&_Bindings.TransactOpts, newOwner)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(address newOwner) returns()
func (_Bindings *BindingsTransactorSession) TransferOwnership(newOwner common.Address) (*types.Transaction, error) {
	return _Bindings.Contract.TransferOwnership(&_Bindings.TransactOpts, newOwner)
}

// BindingsArbiterAddedIterator is returned from FilterArbiterAdded and is used to iterate over the raw logs and unpacked data for ArbiterAdded events raised by the Bindings contract.
type BindingsArbiterAddedIterator struct {
	Event *BindingsArbiterAdded // Event containing the contract specifics and raw log

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
func (it *BindingsArbiterAddedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(BindingsArbiterAdded)
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
		it.Event = new(BindingsArbiterAdded)
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
func (it *BindingsArbiterAddedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *BindingsArbiterAddedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// BindingsArbiterAdded represents a ArbiterAdded event raised by the Bindings contract.
type BindingsArbiterAdded struct {
	ArbiterAddress common.Address
	Name           string
	Raw            types.Log // Blockchain specific contextual infos
}

// FilterArbiterAdded is a free log retrieval operation binding the contract event 0xfe448d1ca19e4b49d3307b9cf069491a971d305e5da0ff6ea25f1cfdfc2264b9.
//
// Solidity: event ArbiterAdded(address indexed arbiterAddress, string name)
func (_Bindings *BindingsFilterer) FilterArbiterAdded(opts *bind.FilterOpts, arbiterAddress []common.Address) (*BindingsArbiterAddedIterator, error) {

	var arbiterAddressRule []interface{}
	for _, arbiterAddressItem := range arbiterAddress {
		arbiterAddressRule = append(arbiterAddressRule, arbiterAddressItem)
	}

	logs, sub, err := _Bindings.contract.FilterLogs(opts, "ArbiterAdded", arbiterAddressRule)
	if err != nil {
		return nil, err
	}
	return &BindingsArbiterAddedIterator{contract: _Bindings.contract, event: "ArbiterAdded", logs: logs, sub: sub}, nil
}

// WatchArbiterAdded is a free log subscription operation binding the contract event 0xfe448d1ca19e4b49d3307b9cf069491a971d305e5da0ff6ea25f1cfdfc2264b9.
//
// Solidity: event ArbiterAdded(address indexed arbiterAddress, string name)
func (_Bindings *BindingsFilterer) WatchArbiterAdded(opts *bind.WatchOpts, sink chan<- *BindingsArbiterAdded, arbiterAddress []common.Address) (event.Subscription, error) {

	var arbiterAddressRule []interface{}
	for _, arbiterAddressItem := range arbiterAddress {
		arbiterAddressRule = append(arbiterAddressRule, arbiterAddressItem)
	}

	logs, sub, err := _Bindings.contract.WatchLogs(opts, "ArbiterAdded", arbiterAddressRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(BindingsArbiterAdded)
				if err := _Bindings.contract.UnpackLog(event, "ArbiterAdded", log); err != nil {
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

// ParseArbiterAdded is a log parse operation binding the contract event 0xfe448d1ca19e4b49d3307b9cf069491a971d305e5da0ff6ea25f1cfdfc2264b9.
//
// Solidity: event ArbiterAdded(address indexed arbiterAddress, string name)
func (_Bindings *BindingsFilterer) ParseArbiterAdded(log types.Log) (*BindingsArbiterAdded, error) {
	event := new(BindingsArbiterAdded)
	if err := _Bindings.contract.UnpackLog(event, "ArbiterAdded", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// BindingsArbiterRemovedIterator is returned from FilterArbiterRemoved and is used to iterate over the raw logs and unpacked data for ArbiterRemoved events raised by the Bindings contract.
type BindingsArbiterRemovedIterator struct {
	Event *BindingsArbiterRemoved // Event containing the contract specifics and raw log

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
func (it *BindingsArbiterRemovedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(BindingsArbiterRemoved)
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
		it.Event = new(BindingsArbiterRemoved)
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
func (it *BindingsArbiterRemovedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *BindingsArbiterRemovedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// BindingsArbiterRemoved represents a ArbiterRemoved event raised by the Bindings contract.
type BindingsArbiterRemoved struct {
	ArbiterAddress common.Address
	Raw            types.Log // Blockchain specific contextual infos
}

// FilterArbiterRemoved is a free log retrieval operation binding the contract event 0xb7a0f68489d6e103758c5896f7f700d18e1e9213039ef12daf1c81a88b1ce671.
//
// Solidity: event ArbiterRemoved(address indexed arbiterAddress)
func (_Bindings *BindingsFilterer) FilterArbiterRemoved(opts *bind.FilterOpts, arbiterAddress []common.Address) (*BindingsArbiterRemovedIterator, error) {

	var arbiterAddressRule []interface{}
	for _, arbiterAddressItem := range arbiterAddress {
		arbiterAddressRule = append(arbiterAddressRule, arbiterAddressItem)
	}

	logs, sub, err := _Bindings.contract.FilterLogs(opts, "ArbiterRemoved", arbiterAddressRule)
	if err != nil {
		return nil, err
	}
	return &BindingsArbiterRemovedIterator{contract: _Bindings.contract, event: "ArbiterRemoved", logs: logs, sub: sub}, nil
}

// WatchArbiterRemoved is a free log subscription operation binding the contract event 0xb7a0f68489d6e103758c5896f7f700d18e1e9213039ef12daf1c81a88b1ce671.
//
// Solidity: event ArbiterRemoved(address indexed arbiterAddress)
func (_Bindings *BindingsFilterer) WatchArbiterRemoved(opts *bind.WatchOpts, sink chan<- *BindingsArbiterRemoved, arbiterAddress []common.Address) (event.Subscription, error) {

	var arbiterAddressRule []interface{}
	for _, arbiterAddressItem := range arbiterAddress {
		arbiterAddressRule = append(arbiterAddressRule, arbiterAddressItem)
	}

	logs, sub, err := _Bindings.contract.WatchLogs(opts, "ArbiterRemoved", arbiterAddressRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(BindingsArbiterRemoved)
				if err := _Bindings.contract.UnpackLog(event, "ArbiterRemoved", log); err != nil {
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

// ParseArbiterRemoved is a log parse operation binding the contract event 0xb7a0f68489d6e103758c5896f7f700d18e1e9213039ef12daf1c81a88b1ce671.
//
// Solidity: event ArbiterRemoved(address indexed arbiterAddress)
func (_Bindings *BindingsFilterer) ParseArbiterRemoved(log types.Log) (*BindingsArbiterRemoved, error) {
	event := new(BindingsArbiterRemoved)
	if err := _Bindings.contract.UnpackLog(event, "ArbiterRemoved", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// BindingsOwnershipTransferredIterator is returned from FilterOwnershipTransferred and is used to iterate over the raw logs and unpacked data for OwnershipTransferred events raised by the Bindings contract.
type BindingsOwnershipTransferredIterator struct {
	Event *BindingsOwnershipTransferred // Event containing the contract specifics and raw log

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
func (it *BindingsOwnershipTransferredIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(BindingsOwnershipTransferred)
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
		it.Event = new(BindingsOwnershipTransferred)
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
func (it *BindingsOwnershipTransferredIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *BindingsOwnershipTransferredIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// BindingsOwnershipTransferred represents a OwnershipTransferred event raised by the Bindings contract.
type BindingsOwnershipTransferred struct {
	PreviousOwner common.Address
	NewOwner      common.Address
	Raw           types.Log // Blockchain specific contextual infos
}

// FilterOwnershipTransferred is a free log retrieval operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
func (_Bindings *BindingsFilterer) FilterOwnershipTransferred(opts *bind.FilterOpts, previousOwner []common.Address, newOwner []common.Address) (*BindingsOwnershipTransferredIterator, error) {

	var previousOwnerRule []interface{}
	for _, previousOwnerItem := range previousOwner {
		previousOwnerRule = append(previousOwnerRule, previousOwnerItem)
	}
	var newOwnerRule []interface{}
	for _, newOwnerItem := range newOwner {
		newOwnerRule = append(newOwnerRule, newOwnerItem)
	}

	logs, sub, err := _Bindings.contract.FilterLogs(opts, "OwnershipTransferred", previousOwnerRule, newOwnerRule)
	if err != nil {
		return nil, err
	}
	return &BindingsOwnershipTransferredIterator{contract: _Bindings.contract, event: "OwnershipTransferred", logs: logs, sub: sub}, nil
}

// WatchOwnershipTransferred is a free log subscription operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
func (_Bindings *BindingsFilterer) WatchOwnershipTransferred(opts *bind.WatchOpts, sink chan<- *BindingsOwnershipTransferred, previousOwner []common.Address, newOwner []common.Address) (event.Subscription, error) {

	var previousOwnerRule []interface{}
	for _, previousOwnerItem := range previousOwner {
		previousOwnerRule = append(previousOwnerRule, previousOwnerItem)
	}
	var newOwnerRule []interface{}
	for _, newOwnerItem := range newOwner {
		newOwnerRule = append(newOwnerRule, newOwnerItem)
	}

	logs, sub, err := _Bindings.contract.WatchLogs(opts, "OwnershipTransferred", previousOwnerRule, newOwnerRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(BindingsOwnershipTransferred)
				if err := _Bindings.contract.UnpackLog(event, "OwnershipTransferred", log); err != nil {
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

// ParseOwnershipTransferred is a log parse operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
func (_Bindings *BindingsFilterer) ParseOwnershipTransferred(log types.Log) (*BindingsOwnershipTransferred, error) {
	event := new(BindingsOwnershipTransferred)
	if err := _Bindings.contract.UnpackLog(event, "OwnershipTransferred", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
