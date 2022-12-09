// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity ^0.8.2;

import "@layerzerolabs/solidity-examples/contracts/contracts-upgradable/token/ONFT721/ONFT721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract CrossChainNFT is Initializable, ONFT721Upgradeable, ERC721URIStorageUpgradeable, AccessControlUpgradeable {
    uint public nextMintId;
    uint public maxMintId;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant METADATA_ROLE = keccak256("METADATA_ROLE");
    string private contractURIHash;

    function initialize(string memory _name, string memory _symbol, address _lzEndpoint, uint _startMintId, uint _endMintId, address sender, uint16[] memory remoteChainIds, string memory _contractURIHash) public initializer {
        __ONFT721UpgradeableMock_init(_name, _symbol, _lzEndpoint);
        nextMintId = _startMintId;
        maxMintId = _endMintId;
        contractURIHash = _contractURIHash;
        _transferOwnership(sender);
        _grantRole(DEFAULT_ADMIN_ROLE, sender);
        _grantRole(MINTER_ROLE, sender);
        _grantRole(METADATA_ROLE, sender);
        for(uint i = 0; i < remoteChainIds.length; i++) {
            trustedRemoteLookup[remoteChainIds[i]] = abi.encodePacked(address(this), address(this));
        }
    }

    function __ONFT721UpgradeableMock_init(string memory _name, string memory _symbol, address _lzEndpoint) internal onlyInitializing {
        __Ownable_init();
        __ONFT721Upgradeable_init(_name, _symbol, _lzEndpoint);
    }

    function __ONFT721UpgradeableMock_init_unchained(string memory _name, string memory _symbol, address _lzEndpoint) internal onlyInitializing {}

    function mint(string memory uri) external payable {
        require(nextMintId <= maxMintId, "UniversalONFT721: max mint limit reached");

        uint tokenId = nextMintId;
        nextMintId++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // @dev mint on this chain and immediate send it to the same address on a different chain
    function mintAndSend(string memory uri, uint16 _dstChainId ) external payable {
        require(nextMintId <= maxMintId, "UniversalONFT721: max mint limit reached");

        uint tokenId = nextMintId;
        nextMintId++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        _send(msg.sender, _dstChainId, abi.encodePacked(msg.sender), tokenId, payable(msg.sender), address(0), "");
    }

    function evmEstimateSendFee(uint16 _dstChainId, address _to, uint _tokenId) public view returns (uint nativeFee, uint zroFee) {
        bytes memory payload = abi.encode(abi.encodePacked(_to), _tokenId, this.tokenURI(_tokenId));
        return lzEndpoint.estimateFees(_dstChainId, address(this), payload, false, "");
    }

    // @dev convenience method
    function evmSend(address payable _from, uint16 _dstChainId, address _to, uint _tokenId) public payable {
        _send(_from, _dstChainId, abi.encodePacked(_to), _tokenId, _from, address(0), "");
    }

    function _send(address _from, uint16 _dstChainId, bytes memory _toAddress, uint _tokenId, address payable _refundAddress, address _zroPaymentAddress, bytes memory _adapterParams) internal virtual override {
        _debitFrom(_from, _dstChainId, _toAddress, _tokenId);

        bytes memory payload = abi.encode(_toAddress, _tokenId, this.tokenURI(_tokenId));
        if (useCustomAdapterParams) {
            _checkGasLimit(_dstChainId, FUNCTION_TYPE_SEND, _adapterParams, NO_EXTRA_GAS);
        } else {
            require(_adapterParams.length == 0, "LzApp: _adapterParams must be empty.");
        }
        _lzSend(_dstChainId, payload, _refundAddress, _zroPaymentAddress, _adapterParams);

        uint64 nonce = lzEndpoint.getOutboundNonce(_dstChainId, address(this));
        emit SendToChain(_from, _dstChainId, _toAddress, _tokenId, nonce);
    }

    function _nonblockingLzReceive(uint16 _srcChainId, bytes memory _srcAddress, uint64 _nonce, bytes memory _payload) internal virtual override {
        // decode and load the toAddress
        (bytes memory toAddressBytes, uint amount, string memory uri) = abi.decode(_payload, (bytes, uint, string));
        address toAddress;
        assembly {
            toAddress := mload(add(toAddressBytes, 20))
        }

        _creditTo(_srcChainId, toAddress, amount, uri);

        emit ReceiveFromChain(_srcChainId, _srcAddress, toAddress, amount, _nonce);
    }

    function _creditTo(uint16, address _toAddress, uint _tokenId, string memory uri) internal {
        require(!_exists(_tokenId) || (_exists(_tokenId) && ERC721Upgradeable.ownerOf(_tokenId) == address(this)));
        if (!_exists(_tokenId)) {
            _safeMint(_toAddress, _tokenId);
            _setTokenURI(_tokenId, uri);
        } else {
            _transfer(address(this), _toAddress, _tokenId);
            _setTokenURI(_tokenId, uri);
        }
    }

    /**
     * @notice The IPFS URI of contract-level metadata for OpenSea, etrc.
     */
    function contractURI() external view returns (string memory) {
        return string(abi.encodePacked('ipfs://', contractURIHash));
    }

    /**
     * @notice Set the _contractURIHash.
     * @dev Only callable by the owner.
     */
    function setContractURIHash(string memory _newContractURIHash) external onlyOwner {
        contractURIHash = _newContractURIHash;
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ONFT721Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }


    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint[50] private __gap;
}