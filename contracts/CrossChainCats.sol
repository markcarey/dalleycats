// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity ^0.8.2;

//import "hardhat-deploy/solc_0.8/proxy/Proxied.sol";
import "@layerzerolabs/solidity-examples/contracts/contracts-upgradable/token/ONFT721/ONFT721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

contract CrossChainCats is Initializable, ONFT721Upgradeable, ERC721URIStorageUpgradeable {
    uint public nextMintId;
    uint public maxMintId;

    function initialize(string memory _name, string memory _symbol, address _lzEndpoint, uint _startMintId, uint _endMintId) public initializer {
        __ONFT721UpgradeableMock_init(_name, _symbol, _lzEndpoint);
        nextMintId = _startMintId;
        maxMintId = _endMintId;
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
        override(ERC721Upgradeable, ONFT721Upgradeable)
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