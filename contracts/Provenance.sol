
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

contract Provenance {
    address admin;
    mapping (address => Producer) producers;
    mapping (string => Product) products;
    address[] producersByAddress; // Array of all producers' acconts
    string[] productsBySerialNo;

    struct Producer {
        string name;
        uint phoneNo;
        string cityState;
        string country;
        bool certified;
    }
    struct Product {
        string serial;
        string name;
        address producer;
        uint[] locationData; // array containing lat & long
        uint timeStamp;
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
    // function for producer to add their details to database
    function addProducer(string memory _name, uint _phoneNo, string memory _cityState, string memory _country) public returns (bool success)  {
        // don't overwrite existing entries and ensure name isn't null
        require (bytes(producers[msg.sender].name).length == 0 && bytes(_name).length != 0,
                 "either entry already exists or name entered was null"); 
        producers[msg.sender].name = _name;
        producers[msg.sender].phoneNo = _phoneNo;
        producers[msg.sender].cityState = _cityState;
        producers[msg.sender].country = _country;
        producers[msg.sender].certified = false; 
        producersByAddress.push(msg.sender);
        return true;
    }
    // function to remove producer from database (can only be done by dmin)
    function removeProducer(address _producer) onlyAdmin public {
        delete producers [_producer];
        // dlete entry from array and shorten array
        for (uint i = 0; i < producersByAddress.length; i++) {
            if (producersByAddress[i] == _producer) {
                for (uint index = i; index < producersByAddress.length - 1; index++) {
                    producersByAddress[index] =
                    producersByAddress[index + 1];
                }
                delete producersByAddress[producersByAddress.length - 1];

            }
        }
    }
    // function to display details of producer
    function findProducer(address _producer) public view returns (address, string memory, uint, string memory, string memory, bool) {
        require(
                bytes(producers[_producer].name).length > 0 || producers[_producer].phoneNo != 0 ||
                bytes(producers[_producer].cityState).length != 0 || bytes(producers[_producer].country).length != 0,
                "Producer doen't exist"
                );
        return (
            _producer,
            producers[_producer].name, 
            producers[_producer].phoneNo, producers[_producer].cityState,
            producers[_producer].country, producers[_producer].certified
            );
    }
    // function to display all producers' accounts in database
    function allProducers() public view returns (address[] memory) {
        return producersByAddress;
    }
    // function to certify producer as legitimate (can only be done by admin)
    function certifyProducer(address _producer) onlyAdmin public returns (bool success) {
        producers [_producer] .certified = true;
        return true;
    }
    // function for producer to add their product to database
    function addProduct(string memory serialNo, string memory name, uint[] memory _locationData) public {
        // ensure no duplicate serial numbers and serial number isn't null
        require(products[serialNo].producer == address(0) && bytes(serialNo).length != 0, 
            "either serial number already in use or serial number entered was null");
        products[serialNo].serial = serialNo;
        products[serialNo].name = name;  
        products [serialNo].producer = msg.sender;
        products[serialNo].locationData = _locationData;
        products[serialNo].timeStamp = block.timestamp;
        productsBySerialNo.push(serialNo);
    }
    // function to remove product from database (can only be done by admin)
    function removeProduct(string memory serialNo) onlyAdmin public returns (bool success) {
        delete products [serialNo];
        // delete entry from array and shorten array
        for (uint i = 0; i < productsBySerialNo.length; i++) {
            //keccak256(portcheck) == keccak256("signed")
            if (keccak256(bytes(productsBySerialNo[i])) == keccak256(bytes(serialNo))) {
                for (uint index = i; index < productsBySerialNo.length - 1; index++) {
                    productsBySerialNo[index] =
                    productsBySerialNo[index + 1];
                }
                delete productsBySerialNo[productsBySerialNo.length - 1];
                
            }
        }
        return true;
    }
    // function to display details of product
    function findProduct(string memory serialNo) public view returns (address, string memory, string memory, uint[] memory, uint) {
        return (products[serialNo].producer, products[serialNo].serial, products[serialNo].name, products[serialNo].locationData, products[serialNo].timeStamp);
    }
    // function to displays all products
    function allProducts() public view returns (string[] memory) {
        return productsBySerialNo;
    }
}








