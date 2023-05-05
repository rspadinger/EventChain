// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./Event.sol";

contract EventFactory {
    address[] public deployedEvents;

    event EventCreated(address indexed creator, address eventAddress, string title);

    //this functions creates a new Event contract 
    function createEvent(string memory title, string memory description, string memory location, uint fee,
      uint16 maxParticipants, uint dateTimeOfEvent) public {
        
        Evt newEvent = new Evt(title, description, location, fee, maxParticipants, dateTimeOfEvent, msg.sender);
        address eventAddress = address(newEvent);

        deployedEvents.push(eventAddress);

        emit EventCreated(msg.sender, eventAddress, title);
    }

    function getDeployedEvents() public view returns (address[] memory) {
        return deployedEvents;
    }
}