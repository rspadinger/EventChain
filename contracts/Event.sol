// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Evt {

    // ************************** structs & maps **************************
    struct Participant {
      address addr;
      string name;
      string email;
      string telephone;
      bool registered;
      uint paidAmount;
    }

    mapping (address => Participant) public participants;
    mapping (address => bool) public badRating;

    // ************************** Variables - public **************************
    address public contractAddress;
    address public manager;

    // event properties
    string public title;
    string public description;
    string public location;
    uint public fee;
    uint16 public maxParticipants;
    uint public dateTimeOfEvent;

    bool public eventCanceled = false;
    bool public eventEnded = false;
    uint16 public registeredParticipantCount;
    uint16 public badRatingCount;

    // ************************** Variables - private **************************
    address[] allParticipants;
    uint constant dayInSeconds = 86400;
    uint constant hourInSeconds = 3600;

    // ************************** Modifiers **************************
    modifier onlyOwner() {
      require(msg.sender == manager);
      _;
    }

    modifier isNotOwner() {
      require(msg.sender != manager);
      _;
    }

    // ************************** Constructor **************************
    // For Remix Testing: "My Event","Event Description","Event location","500000000000000000",50,1577901600,"0x0"

    //again, if we want to transfer ether along with the contract creation, we need to specify
    //the constructor as payable
    //function Event(string _title, string _description, string _location, uint _fee,
    //  uint16 _maxParticipants, uint _dateTimeOfEvent, address _creator) public payable {
    constructor (string memory _title, string memory _description, string memory _location, uint _fee,
        uint16 _maxParticipants, uint _dateTimeOfEvent, address _creator) {

        //at event creation, we could specify a minimum amount for the initial contract funding
        //require(msg.value >= 500000);
        require(_maxParticipants > 0);

        //the event must be created at least 1 day before the actual event
        //require(_dateTimeOfEvent > now + dayInSeconds);
        contractAddress = address(this);
        manager = _creator;
        //manager = msg.sender;

        title = _title;
        description = _description;
        location = _location;
        fee = _fee;
        maxParticipants = _maxParticipants;
        dateTimeOfEvent = _dateTimeOfEvent;
    }

    function modifyEvent(string memory _title, string memory _description, string memory _location, uint _fee,
        uint16 _maxParticipants, uint _dateTimeOfEvent) public onlyOwner {

        require(_maxParticipants > 0);
        //the event must be created at least 1 day before the actual event
        require(_dateTimeOfEvent > (block.timestamp + dayInSeconds));

        title = _title;
        description = _description;
        location = _location;
        fee = _fee;
        maxParticipants = _maxParticipants;
        dateTimeOfEvent = _dateTimeOfEvent;
    }

    // deactivate the contract
    function kill() public onlyOwner {
      selfdestruct(payable(manager));
    }

    // ************************** Functions - public **************************
    function cancelEvent() public onlyOwner {

      require(block.timestamp < (dateTimeOfEvent - dayInSeconds));

      eventCanceled = true;

      for(uint16 i=0; i<allParticipants.length; i++) {
        if(participants[allParticipants[i]].registered == true && participants[allParticipants[i]].paidAmount > 0) {
          participants[allParticipants[i]].registered = false;

          payable(allParticipants[i]).transfer(participants[allParticipants[i]].paidAmount);
          participants[allParticipants[i]].paidAmount = 0;
        }
      }
    }

    function retrieveEventFees() public onlyOwner {

      // funds can only be retrieved earliest 1 week after the event took place
      require(block.timestamp > getRatingFundRetrievalDeadline());

      //refund users who asked for a refund and who were not refunded deployedEvents
      if(badRatingCount > registeredParticipantCount/2) {
        for(uint16 i=0; i<allParticipants.length; i++) {

          if(participants[allParticipants[i]].registered == true && participants[allParticipants[i]].paidAmount > 0
            && badRating[allParticipants[i]] == true) {
              participants[allParticipants[i]].registered = false;
              payable(allParticipants[i]).transfer(participants[allParticipants[i]].paidAmount);
              participants[allParticipants[i]].paidAmount = 0;
          }
        }
      }

      //send the rest to the event manager
      //address contractAddress = this;
      payable(manager).transfer(contractAddress.balance);
    }

    function contractBalance() public view onlyOwner returns(uint) {
      //address contr = this;
      return contractAddress.balance;
    }

    function registerForEvent(string memory _name, string memory _email, string memory _tel) public isNotOwner payable {
      //### we could also require that a name and email address was provided
      require(block.timestamp < (dateTimeOfEvent - (1 * hourInSeconds)));
      require(msg.value >= fee);
      require(registeredParticipantCount <= maxParticipants);
      require(participants[msg.sender].registered == false);

      //by default, all int values are 0 => we want the first array index to be 1
      //allParticipantCount++;
      registeredParticipantCount++;

      Participant memory newParticipant = Participant({
          addr: msg.sender,
          name: _name,
          email: _email,
          telephone: _tel,
          registered: true,
          paidAmount: fee
      });

      participants[msg.sender] = newParticipant;

      //update arrays
      allParticipants.push(msg.sender);

      //reimburse if value is too much
      if(msg.value > fee) {
        payable(msg.sender).transfer(msg.value - fee);
      }
    }

    function unregisterFromEvent() public isNotOwner {

      Participant storage participant = participants[msg.sender];

      require(block.timestamp < (dateTimeOfEvent - (6 * hourInSeconds)));
      //make sure, this address exists
      require(msg.sender == participant.addr);
      //make sure, this address is still registered
      require(participant.registered == true);

      participant.registered = false;
      registeredParticipantCount--;

      //transfer money back to User
      payable(msg.sender).transfer(fee);
    }

    function getListOfRegisteredParticipants() public view returns (address[] memory) {
      //create an array that contains all registered users
      address[] memory listOfRegisteredParticipants = new address[](registeredParticipantCount);
      uint16 cnt = 0;
      address myAddress = address(0);

      for(uint16 i = 0; i < allParticipants.length; i++) {
        myAddress = allParticipants[i];
        if(participants[myAddress].registered == true && cnt < registeredParticipantCount) {
          //check if this element is already in our array
          bool exists = false;
          for(uint16 j = 0; j < cnt; j++) {
            if(listOfRegisteredParticipants[cnt] == myAddress)
              exists = true;
          }
          if(!exists) {
            listOfRegisteredParticipants[cnt] = myAddress;
            cnt++;
          }
        }
      }

      return listOfRegisteredParticipants;
    }

    function rateEventAsBad() public isNotOwner {

      //ratings can only be given once the event is finished
      require(block.timestamp > (dateTimeOfEvent + (hourInSeconds * 2)) );
      require(participants[msg.sender].registered == true);
      //make sure this user did not already rate this event as bad
      require(badRating[msg.sender] == false);

      //the participant has 1 week to provide a rating
      require(block.timestamp < getRatingFundRetrievalDeadline());

      badRating[msg.sender] = true;
      badRatingCount++;
    }

    function reverseBadRating() public isNotOwner {

      //ratings can only be given once the event is finished
      require(block.timestamp > (dateTimeOfEvent + (hourInSeconds * 2)) );
      require(participants[msg.sender].registered == true);
      //make sure this user previously gave a bad rating
      require(badRating[msg.sender] == true);

      //the participant has 1 week to provide a rating
      require(block.timestamp < getRatingFundRetrievalDeadline());

      badRating[msg.sender] = false;
      badRatingCount--;
    }

    function recoverPaidFees() public isNotOwner {
      //make sure we have more than 50% of bad ratings
      require(badRatingCount > registeredParticipantCount/2);

      //make sure the user is registered and provided a bad rating
      require(participants[msg.sender].registered == true);
      require(badRating[msg.sender] == true);

      payable(msg.sender).transfer(participants[msg.sender].paidAmount);
    }

    function getUserRating(address userAddr) public view returns(bool) {
      return badRating[userAddr];
    }

    function getUsersWithBadRatings() public view returns(address[] memory) {

      address[] memory addr = new address[](badRatingCount);
      uint16 cnt = 0;

      for(uint16 i=0; i<allParticipants.length; i++) {
        if(badRating[allParticipants[i]] == true) {

          //check if this element is already in our array
          bool exists = false;
          for(uint16 j = 0; j < cnt; j++) {
            if(addr[cnt] == allParticipants[i])
              exists = true;
          }
          if(!exists) {
            addr[cnt] = allParticipants[i];
            cnt++;
          }
        }
      }

      return addr;
    }

    function getEventDetails() public view returns (string memory, string memory, string memory, uint, uint16, uint,
        address, address, bool, uint16, uint16) {
        return (
            title,
            description,
            location,
            fee,
            maxParticipants,
            dateTimeOfEvent,
            manager,
            contractAddress,
            eventCanceled,
            registeredParticipantCount,
            badRatingCount
        );
    }

    // ************************** Functions - private **************************
    function getRatingFundRetrievalDeadline() private view returns (uint) {
      uint ratingDeadline = dateTimeOfEvent + (7 * dayInSeconds);
      return ratingDeadline;
    }

    // This function is just for testing date/time related functions and should be de-activated later
    function changeDateTimeOfEvent(uint newDateTime) public onlyOwner {
      dateTimeOfEvent = newDateTime;
    }
}
