

pragma solidity >=0.4.22 <0.9.0;

import "./Tracking.sol";

// contract to store database of supply chain parties and their reputations
contract Reputation {
    // call the Tracking contract at its deployed address
    // need to include Tracking contract code at the end
    Tracking public track = Tracking(0x2fDaB21688169bDd6557FC75AC3561d0142E219F);
    address admin;
    mapping (address => Supplier) suppliers;
    address[] suppliersByAddress; // array of all suppliers' accounts
    struct Supplier {
        string name;
        uint phoneNo;
        string cityState;
        string country;
        string goodsType;
        uint reputation;
    }
    // constructor - runs once when contract is deployed
    constructor() public {
        admin = msg.sender;
    }
    // modifier to allow only admin to execute a function
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not the admin");
        _;
    }
    // function for supplier to add their details to database
    function addSupplier(string memory _name, uint _phoneNo, string memory _cityState, string memory _country, string memory _goodsType) public returns (bool success) {
        // don't overwrite existing entries and ensure name isn't null
        require (bytes(suppliers[msg.sender].name).length == 0 && bytes(_name).length != 0, "either entry already exists or name entered was null");
        suppliers[msg.sender].name = _name;
        suppliers[msg.sender].phoneNo = _phoneNo;
        suppliers[msg.sender].cityState = _cityState;
        suppliers[msg.sender].country = _country;
        suppliers[msg.sender].goodsType = _goodsType;
        suppliers [msg. sender] .reputation =
        track.calculateReputation(msg.sender);
        suppliersByAddress.push(msg.sender);
        return true;   
    }
    // function to remove supplier from database (can only be done by admin)
    function removeSupplier(address _supplier) onlyAdmin public returns (bool success) {
        delete suppliers[_supplier];
        // delete entry from array and shorten array
        for (uint i = 0; i < suppliersByAddress.length; i++) {
            if (suppliersByAddress[i] == _supplier) {
                for (uint index = i; index < suppliersByAddress.length - 1; index++) {
                    suppliersByAddress[index] =
                    suppliersByAddress[index + 1];
                }
                delete suppliersByAddress[suppliersByAddress.length - 1];
                
            }
        }
        return true;
    }
    // function to display details of supplier
    function findSupplier(address _supplier) public view returns (string memory, uint, string memory, string memory, string memory, uint) {
        return (suppliers[_supplier].name,
                suppliers [_supplier]. phoneNo, suppliers[_supplier].cityState,
                suppliers [_supplier]. country, suppliers[_supplier].goodsType,
                suppliers [_supplier]. reputation);
    }
    // function to display all suppliers' accounts in database
    function allSuppliers() public view returns (address[] memory) {
        return suppliersByAddress;
    }
    // function to search for suppliers by type of goods
    function filterByGoodsType(string memory _goodsType) public view returns (address[] memory) {
        address[] memory filteredGoods = new address [] (suppliersByAddress.length);
        for (uint i = 0; i < suppliersByAddress.length; i++) {
            if (keccak256(bytes(suppliers[suppliersByAddress[i]].goodsType)) ==keccak256(bytes(_goodsType))) {
                filteredGoods[i] = suppliersByAddress[i];
            }
        }
        return filteredGoods;
    }
    // function to search for suppliers by reputation (returns those with same or higher reputation)
    function filterByReputation(uint _reputation) public view returns(address[] memory) {
        address[] memory filteredRep = new address [] (suppliersByAddress. length);
        for (uint i = 0; i < suppliersByAddress.length; i++) {
            if (suppliers[suppliersByAddress[i]].reputation >= _reputation) {
                filteredRep[i] = suppliersByAddress[i];
            }
        }
        return filteredRep;
    }
    // function to display reputation of supplier (calls Tracking contract)
    function checkReputation(address _supplier) public view returns (uint) {
        return track.calculateReputation(_supplier);
    }
    // function to update reputations of all suppliers (calls Tracking contract)
    // can only be done by admin
    function updateReputations() onlyAdmin public returns (bool success) {
        for (uint i = 0; i < suppliersByAddress.length; i++) {
            suppliers[suppliersByAddress[i]].reputation = track.calculateReputation(suppliersByAddress[i]);
        }
        return true;
    }
}