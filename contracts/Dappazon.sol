// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Dappazon {
    address public owner;

    struct Item {
        uint id;
        string name;
        string category;
        string image;
        uint cost;
        uint rating;
        uint stock;
    }
     
    struct Order {
        uint time;
        Item item;
    }

    mapping(uint => Item) public items;
    mapping(address => uint) public orderCount;
    mapping(address => mapping(uint => Order)) public orders;

    event List(string name, uint cost, uint quantity);

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // List products
    function list(
        uint _id, 
        string memory _name, 
        string memory _category,
        string memory _image,
        uint _cost,
        uint _rating,
        uint _stock
    ) public onlyOwner {
        // Create item struct in the memory
        Item memory item = Item(_id, _name, _category, _image,
                                _cost, _rating, _stock);

        // Save Item struct to blockchain -> using mapping
        items[_id] = item;

        //Emit an event
        emit List(_name, _cost, _stock);
    }

    // Buy products
    function buy(uint _id) public payable {
        // Fetch item
        Item memory item = items[_id];
        // Create an order
        Order memory order = Order(block.timestamp, item);

        // Add order for user
        orderCount[msg.sender]++; //Update the order ID
        orders[msg.sender][orderCount[msg.sender]] = order;

        // Subtract stock
        item.stock--;
        
        // Emit event

    }
    // Withdraw funds
}
