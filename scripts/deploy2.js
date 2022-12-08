const cdaABI = [{"inputs":[],"name":"EmptyBytecode","type":"error"},{"inputs":[],"name":"FailedDeploy","type":"error"},{"inputs":[],"name":"FailedInit","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"bytecodeHash","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"salt","type":"bytes32"},{"indexed":true,"internalType":"address","name":"deployedAddress","type":"address"}],"name":"Deployed","type":"event"},{"inputs":[{"internalType":"bytes","name":"bytecode","type":"bytes"},{"internalType":"bytes32","name":"salt","type":"bytes32"}],"name":"deploy","outputs":[{"internalType":"address","name":"deployedAddress_","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"bytecode","type":"bytes"},{"internalType":"bytes32","name":"salt","type":"bytes32"},{"internalType":"bytes","name":"init","type":"bytes"}],"name":"deployAndInit","outputs":[{"internalType":"address","name":"deployedAddress_","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"bytecode","type":"bytes"},{"internalType":"address","name":"sender","type":"address"},{"internalType":"bytes32","name":"salt","type":"bytes32"}],"name":"deployedAddress","outputs":[{"internalType":"address","name":"deployedAddress_","type":"address"}],"stateMutability":"view","type":"function"}];
const cdaAddress = '0x98B2920D53612483F91F12Ed7754E51b4A77919e';

const nftJSON = require("../artifacts/contracts/CrossChainNFT.sol/CrossChainNFT.json");
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const signer = new ethers.Wallet(PRIVATE_KEY, ethers.provider);

const v = "five";
const salt = ethers.utils.formatBytes32String(v);

//const emptyBytes = ethers.utils.solidityPack(["string"] , [""]);
//const AddressBytes = ethers.utils.solidityPack(["address"] , [PUBLIC_KEY]);
//console.log(emptyBytes, " ", AddressBytes);
//return;

const ABI = ["initialize(string memory _name, string memory _symbol, address _lzEndpoint, uint _startMintId, uint _endMintId, address sender, uint16[] memory remoteChainIds, string memory _contractURIHash)"];
const iface = new ethers.utils.Interface(ABI);

const name = "Dalley Cats";
const symbol = "dCAT";
const contractHash = "bafkreib3fkefxbdirxctaodpcwmlacnsijpy7j2k7piqn4j6vis7o3ilta";

const chain = hre.network.name;
var addr = {};
addr.goerli = {
    "start": 1,
    "end": 1000,
    "lzEndpoint": "0xbfD2135BFfbb0B5378b56643c2Df8a87552Bfa23",
    "chainId": 10121
};
addr.mumbai = {
    "start": 1001,
    "end": 2000,
    "lzEndpoint": "0xf69186dfBa60DdB133E91E9A4B5673624293d8F8",
    "chainId": 10109
};
addr["arbitrum-goerli"] = {
    "start": 2001,
    "end": 3000,
    "lzEndpoint": "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab",
    "chainId": 10143
};
addr["moonbeam-alpha"] = {
    "start": 3001,
    "end": 4000,
    "lzEndpoint": "0xb23b28012ee92E8dE39DEb57Af31722223034747",
    "chainId": 10126
};
const targetChains = [ "goerli", "moonbeam-alpha", "mumbai" ];
var chainIds = [];
for (let i = 0; i < targetChains.length; i++) {
    var thisChain = targetChains[i];
    if ( thisChain == chain ) {
        // do nothing
    } else {
        chainIds.push(addr[thisChain].chainId);
    }
}
console.log(chainIds);
const init = iface.encodeFunctionData("initialize", [ name, symbol, addr[chain].lzEndpoint, addr[chain].start, addr[chain].end, PUBLIC_KEY, chainIds, contractHash ]);


async function main() {

    const factory = new ethers.Contract(cdaAddress, cdaABI, signer);
    const result = await factory.deployAndInit(nftJSON.bytecode, salt, init);
    console.log(result);
    await result.wait();

}

main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });