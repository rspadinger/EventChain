pragma solidity ^0.4.17;

contract EventFactory {
    address[] public deployedEvents;

    //this functions creates a new Event contract - it is also possible to transfer ether along with them
    //creation of the Event contract - in that case we need to label the function as payable
    //function createEvent(string title, string description, string location, uint fee,
    //  uint16 maxParticipants, uint dateTimeOfEvent) public payable {
    function createEvent(string title, string description, string location, uint fee,
      uint16 maxParticipants, uint dateTimeOfEvent) public {

        //if we want to transfer ether with the contract creation, we need to use the .value() method
        //address newEvent = (new Event).value(msg.value)(title, description, location, fee,
        //    maxParticipants, dateTimeOfEvent, msg.sender);
        address newEvent = new Event(title, description, location, fee,
            maxParticipants, dateTimeOfEvent, msg.sender);

        deployedEvents.push(newEvent);
    }

    function getDeployedEvents() public view returns (address[]) {
        return deployedEvents;
    }
}

contract Event {

    // ************************** Variables - structs & maps **************************
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

    //uint16 public allParticipantCount;

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
    constructor (string _title, string _description, string _location, uint _fee,
        uint16 _maxParticipants, uint _dateTimeOfEvent, address _creator) public {

        //at event creation, we could specify a minimum amount for the initial contract funding
        //require(msg.value >= 500000);
        require(_maxParticipants > 0);

        //the event must be created at least 1 day before the actual event
        //require(_dateTimeOfEvent > now + dayInSeconds);
        contractAddress = this;
        manager = _creator;
        //manager = msg.sender;

        title = _title;
        description = _description;
        location = _location;
        fee = _fee;
        maxParticipants = _maxParticipants;
        dateTimeOfEvent = _dateTimeOfEvent;
    }

    function modifyEvent(string _title, string _description, string _location, uint _fee,
        uint16 _maxParticipants, uint _dateTimeOfEvent) public onlyOwner {

        require(_maxParticipants > 0);
        //the event must be created at least 1 day before the actual event
        require(_dateTimeOfEvent > (now + dayInSeconds));

        title = _title;
        description = _description;
        location = _location;
        fee = _fee;
        maxParticipants = _maxParticipants;
        dateTimeOfEvent = _dateTimeOfEvent;
    }

    // deactivate the contract
    function kill() public onlyOwner {
      selfdestruct(manager);
    }

    // ************************** Functions - public **************************
    function cancelEvent() public onlyOwner {

      require(now < (dateTimeOfEvent - dayInSeconds));

      eventCanceled = true;

      for(uint16 i=0; i<allParticipants.length; i++) {
        if(participants[allParticipants[i]].registered == true && participants[allParticipants[i]].paidAmount > 0) {
          participants[allParticipants[i]].registered = false;

          allParticipants[i].transfer(participants[allParticipants[i]].paidAmount);
          participants[allParticipants[i]].paidAmount = 0;
        }
      }
    }

    function retrieveEventFees() public onlyOwner {

      // funds can only be retrieved earliest 1 week after the event took place
      require(now > getRatingFundRetrievalDeadline());

      //refund users who asked for a refund and who were not refunded deployedEvents
      if(badRatingCount > registeredParticipantCount/2) {
        for(uint16 i=0; i<allParticipants.length; i++) {

          if(participants[allParticipants[i]].registered == true && participants[allParticipants[i]].paidAmount > 0
            && badRating[allParticipants[i]] == true) {
              participants[allParticipants[i]].registered = false;
              allParticipants[i].transfer(participants[allParticipants[i]].paidAmount);
              participants[allParticipants[i]].paidAmount = 0;
          }
        }
      }

      //send the rest to the event manager
      //address contractAddress = this;
      manager.transfer(contractAddress.balance);
    }

    function contractBalance() public view onlyOwner returns(uint) {
      //address contr = this;
      return contractAddress.balance;
    }

    function registerForEvent(string _name, string _email, string _tel) public isNotOwner payable {
      //### we could also require that a name and email address was provided
      require(now < (dateTimeOfEvent - (1 * hourInSeconds)));
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

      //check if this element is already in our array
      //the following may cost a lot of gas if we have a big array =>
      //we do array loops only in call() that cost no gas
      /* bool exists = false;
      for(uint16 j = 0; j < allParticipants.length; j++) {
        if(allParticipants[j] == msg.sender)
          exists = true;
      }
      if(!exists) {
        allParticipants.push(msg.sender);
      } */

      //reimburse if value is too much
      if(msg.value > fee) {
        msg.sender.transfer(msg.value - fee);
      }
    }

    function unregisterFromEvent() public isNotOwner {

      Participant storage participant = participants[msg.sender];

      require(now < (dateTimeOfEvent - (6 * hourInSeconds)));
      //make sure, this address exists
      require(msg.sender == participant.addr);
      //make sure, this address is still registered
      require(participant.registered == true);

      participant.registered = false;
      registeredParticipantCount--;

      //transfer money back to User
      msg.sender.transfer(fee);
    }

    function getListOfRegisteredParticipants() public view returns (address[]) {
      //create an array that contains all registered users
      address[] memory listOfRegisteredParticipants = new address[](registeredParticipantCount);
      uint16 cnt = 0;
      address myAddress = 0x0;

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
      require(now > (dateTimeOfEvent + (hourInSeconds * 2)) );
      require(participants[msg.sender].registered == true);
      //make sure this user did not already rate this event as bad
      require(badRating[msg.sender] == false);

      //the participant has 1 week to provide a rating
      require(now < getRatingFundRetrievalDeadline());

      badRating[msg.sender] = true;
      badRatingCount++;
    }

    function reverseBadRating() public isNotOwner {

      //ratings can only be given once the event is finished
      require(now > (dateTimeOfEvent + (hourInSeconds * 2)) );
      require(participants[msg.sender].registered == true);
      //make sure this user previously gave a bad rating
      require(badRating[msg.sender] == true);

      //the participant has 1 week to provide a rating
      require(now < getRatingFundRetrievalDeadline());

      badRating[msg.sender] = false;
      badRatingCount--;
    }

    function recoverPaidFees() public isNotOwner {
      //make sure we have more than 50% of bad ratings
      require(badRatingCount > registeredParticipantCount/2);

      //make sure the user is registered and provided a bad rating
      require(participants[msg.sender].registered == true);
      require(badRating[msg.sender] == true);

      msg.sender.transfer(participants[msg.sender].paidAmount);
    }

    function getUserRating(address userAddr) public view returns(bool) {
      return badRating[userAddr];
    }

    function getUsersWithBadRatings() public view returns(address[]) {

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

    function getEventDetails() public view returns (string, string, string, uint, uint16, uint,
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

    /* function unregisteredParticipantCount() public view returns(uint16) {
      return allParticipantCount - registeredParticipantCount;
    } */

    /* function getListOfUnregisteredParticipants() public view returns (address[]) {
      //create an array that contains all registered users
      uint16 unregisteredParticipantCount = allParticipantCount - registeredParticipantCount;
      address[] memory listOfUnregisteredParticipants = new address[](unregisteredParticipantCount);
      uint16 cnt = 0;
      address myAddress = 0x0;

      for(uint16 i = 0; i < allParticipantCount; i++) {
        myAddress = allParticipants[i];
        if(participants[myAddress].registered == false && cnt < registeredParticipantCount) {
          //check if this element is already in our array
          bool exists = false;
          for(uint16 j = 0; j < cnt; j++) {
            if(listOfUnregisteredParticipants[cnt] == myAddress)
              exists = true;
          }
          if(!exists) {
            listOfUnregisteredParticipants[cnt] = myAddress;
            cnt++;
          }
        }
      }

      return listOfUnregisteredParticipants;
    } */

}
