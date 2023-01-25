

pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

// contract to allow supply chain parties to track shipment of goods and automatically execute payment in tokens
contract Tracking {
    
    address admin;
    uint[] contractLocation; // array containing lat & long
    uint contractLeadTime; // in seconds
    uint contractPayment; // in tokens
    mapping (string => Shipment) shipments;
    mapping (address => uint) balances;
    mapping (address => uint) totalShipped; // total number of shipments made
    mapping (address => uint) successShipped; // number of shipments successfully completed
    string[] shipmentsByTrackingNo;

    struct Shipment {
        string trackingNo;
        string item;
        uint quantity;
        uint[] locationData;
        uint timeStamp;
        address sender;
        bool received;
    }
    // events to display messages when certain transactions are executed
    event Success(string _message, string trackingNo, uint[]
                _locationData, uint _timeStamp, address _sender);

    event Payment(string _message, address _from, address _to, uint
                _amount);

    event Failure(string _message);

    // constructor - runs once when contract is deployed
    // determine initial token supply upon contract deployment
    constructor() public {
        uint _initialTokenSupply = 1000000;
        admin = msg.sender;
        balances[admin] = _initialTokenSupply; // all tokens he ld by admin initially
    }
       
    // modifier to allow only admin to execute a function
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not the admin");
        _;
    }
    // function to send tokens from one account to another
    function sendToken(address _to, uint _amount) public returns (bool success) {
        if (balances[msg.sender] < _amount) {
            emit Failure('Insufficient funds to send payment');
            return false;
        }
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
        emit Payment('Payment sent', msg.sender, _to, _amount);
        return true;
    }
    // function to show token balance of an account
    function getBalance(address _account) public view returns (uint _balance) {
        return balances[_account];
    }
    // function to recover tokens from an account (can only be done by admin)
    // in the event that the sendToken function gets abused
    function recoverToken(address _from, uint _amount) onlyAdmin public returns (bool success) {
        if (balances[_from] < _amount) {
            emit Failure('Insufficient funds for recovery');
            return false;
        }
        balances[_from] -= _amount;
        balances[msg.sender] += _amount;
        emit Payment('Funds recovered', _from, msg.sender, _amount);
        return true;
    }
    // function to set contract parameters for next leg of shipment (can only be done by admin)
    function setContractParameters(uint[] memory _location, uint _leadTime, uint _payment) onlyAdmin public returns (bool success) {
        contractLocation = _location; // set next location that will receive shipment
        contractLeadTime = _leadTime; // set acceptable lead time for next leg of shipment
        contractPayment = _payment; // set payment amount for completing next leg of shipment
        return true;
    }
    // function for party to input details of shipment that was sent
    function sendShipment(string memory trackingNo, string memory _item, uint _quantity, uint[] memory _locationData) public returns (bool success) {
        // require (contractLocation[0] != 0 || contractLocation[1] != 0 && contractLeadTime != 0 && contractPayment != 0, "Set all the contract Parameters");
        require(bytes(shipments[trackingNo].trackingNo).length == 0, "Shipment traking num already exist");
        shipments[trackingNo].trackingNo = trackingNo;
        shipments[trackingNo].item = _item;
        shipments[trackingNo].quantity = _quantity;
        shipments[trackingNo].locationData = _locationData;
        shipments[trackingNo].timeStamp = block.timestamp;
        shipments[trackingNo].sender = msg.sender;
        shipments[trackingNo].received = false;
        shipmentsByTrackingNo.push(trackingNo);
        totalShipped[msg.sender] += 1;
        emit Success('Item shipped', trackingNo, _locationData, block.timestamp, msg.sender);
        return true;
    }
    // function for party to input details of shipment that was received
    function receiveShipment(string memory trackingNo, string memory _item, uint _quantity, uint[] memory _locationData) public returns (bool success) {
        require (balances[msg.sender] >= contractPayment, "No enaugh money to complete this operation");
        require (shipments[trackingNo].received == false);
        // check that item and quantity received match item and quantity shipped
        if (keccak256(bytes(shipments[trackingNo].item)) == keccak256(bytes(_item)) && shipments[trackingNo].quantity == _quantity) {
            successShipped[shipments[trackingNo].sender] += 1;
            shipments[trackingNo].received = true;
            emit Success('Item received', trackingNo, _locationData, block.timestamp, msg.sender);
            // execute payment if item received on time and location correct
            if (block.timestamp <= shipments[trackingNo].timeStamp + contractLeadTime && _locationData[0] == contractLocation[0] && _locationData[1] == contractLocation[1]) {
                sendToken(shipments[trackingNo].sender, contractPayment);
            }
            else {
                emit Failure('Payment not triggered as criteria not met');
            }
            return true;
        }
        else {
            emit Failure('Error in item/quantity');
                return false;
        }
    }
    // function to remove details of shipment from database (can only be done by admin)
    function deleteShipment(string memory trackingNo) onlyAdmin public returns (bool success) {
        delete shipments[trackingNo];
        // dlete entry from array and shorten array
        for (uint i = 0; i < shipmentsByTrackingNo.length; i++) {
            //keccak256(portcheck) == keccak256("signed")
            if (keccak256(bytes(shipmentsByTrackingNo[i])) == keccak256(bytes(trackingNo))) {
                for (uint index = i; index < shipmentsByTrackingNo.length - 1; index++) {
                    shipmentsByTrackingNo[index] =
                    shipmentsByTrackingNo[index + 1];
                }
                delete shipmentsByTrackingNo[shipmentsByTrackingNo.length - 1];
                
            }
        }
        return true;
    }
    function allShipment() public view returns (string[] memory) {
        return shipmentsByTrackingNo;
    }
    // function to display details of shipment
    function checkShipment(string memory trackingNo) public view returns (string memory, uint, uint[] memory, uint, address) {
        return (
                shipments[trackingNo].item, 
                shipments[trackingNo].quantity, 
                shipments[trackingNo].locationData,
                shipments[trackingNo].timeStamp, 
                shipments[trackingNo].sender
                );
    }
    // function to display number of successfully completed shipments and total shipments for a party
    function checkSuccess(address _sender) public view returns (uint, uint) {
        return (successShipped[_sender], totalShipped[_sender]);
    }
    // function to calculate reputation score of a party (percentage of successfully completed shipments)
    function calculateReputation(address _sender) public view returns (uint) {
        if (totalShipped[_sender] != 0) {
            return (100 * successShipped[_sender] / totalShipped[_sender]);
        }
        else {
            return 0;
        }
    }
}