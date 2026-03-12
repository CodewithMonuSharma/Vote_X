// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ShieldVote {
    address public owner;
    bool public electionActive;

    uint256[] public candidateIds;
    mapping(uint256 => string) public candidateNames;
    mapping(uint256 => bool) public candidateExists;

    // commitmentHash => candidateId (latest vote)
    mapping(bytes32 => uint256) public votes;
    // commitmentHash => whether this voter has voted
    mapping(bytes32 => bool) public hasVoted;
    // candidateId => running vote count
    mapping(uint256 => uint256) public voteCounts;
    // commitmentHash => keccak256 vote hash for verification
    mapping(bytes32 => bytes32) public lastVoteHash;
    // commitmentHash => block timestamp of last vote
    mapping(bytes32 => uint256) public voteTimestamp;
    // commitmentHash => block number of last vote
    mapping(bytes32 => uint256) public voteBlock;

    event ElectionStarted(uint256 timestamp, uint256 candidateCount);
    event VoteCast(
        bytes32 indexed commitmentHash,
        uint256 candidateId,
        bytes32 voteHash,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier electionIsActive() {
        require(electionActive, "Election is not active");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function startElection(
        uint256[] calldata _ids,
        string[] calldata _names
    ) external onlyOwner {
        require(!electionActive, "Election already active");
        require(_ids.length == _names.length, "IDs and names length mismatch");
        require(_ids.length > 0, "Must have at least one candidate");

        for (uint256 i = 0; i < _ids.length; i++) {
            candidateIds.push(_ids[i]);
            candidateNames[_ids[i]] = _names[i];
            candidateExists[_ids[i]] = true;
        }

        electionActive = true;
        emit ElectionStarted(block.timestamp, _ids.length);
    }

    function castVote(
        bytes32 commitmentHash,
        uint256 candidateId
    ) external electionIsActive {
        require(candidateExists[candidateId] || candidateId == 0, "Invalid candidate");

        // If voter already voted, decrement old candidate count
        if (hasVoted[commitmentHash]) {
            uint256 oldCandidate = votes[commitmentHash];
            if (voteCounts[oldCandidate] > 0) {
                voteCounts[oldCandidate]--;
            }
        }

        // Store the vote (overwrites previous - silent override)
        votes[commitmentHash] = candidateId;
        hasVoted[commitmentHash] = true;
        voteTimestamp[commitmentHash] = block.timestamp;
        voteBlock[commitmentHash] = block.number;

        // Increment new candidate count
        voteCounts[candidateId]++;

        // Generate a verification hash
        bytes32 voteHash = keccak256(
            abi.encodePacked(commitmentHash, candidateId, block.timestamp, msg.sender)
        );
        lastVoteHash[commitmentHash] = voteHash;

        emit VoteCast(commitmentHash, candidateId, voteHash, block.timestamp);
    }

    function getResults()
        external
        view
        returns (uint256[] memory ids, string[] memory names, uint256[] memory counts)
    {
        uint256 len = candidateIds.length;
        ids = new uint256[](len);
        names = new string[](len);
        counts = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            ids[i] = candidateIds[i];
            names[i] = candidateNames[candidateIds[i]];
            counts[i] = voteCounts[candidateIds[i]];
        }

        return (ids, names, counts);
    }

    function verifyVote(
        bytes32 commitmentHash
    )
        external
        view
        returns (
            bool exists,
            uint256 candidateId,
            bytes32 voteHash,
            uint256 timestamp,
            uint256 blockNumber
        )
    {
        exists = hasVoted[commitmentHash];
        candidateId = votes[commitmentHash];
        voteHash = lastVoteHash[commitmentHash];
        timestamp = voteTimestamp[commitmentHash];
        blockNumber = voteBlock[commitmentHash];
    }

    function getCandidate(uint256 id) external view returns (string memory) {
        return candidateNames[id];
    }

    function getCandidateCount() external view returns (uint256) {
        return candidateIds.length;
    }
}
