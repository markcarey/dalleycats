const zeroAddress = "0x0000000000000000000000000000000000000000";
const nftAddress = "0xeCd4113f4Bf51FcfC309750355B507b4ca798867"; // all chains

var addr = {};

addr.goerli = {
    "evmChainId": 5,
    "name": "Etheruem Goerli",
    "rpc": "eth-goerli.alchemyapi.io/v2/n_mDCfTpJ8I959arPP7PwiOptjubLm57",
    "start": 1,
    "end": 1000,
    "lzEndpoint": "0xbfD2135BFfbb0B5378b56643c2Df8a87552Bfa23",
    "chainId": "10121",
    "bgcolor": "grey",
    "slug": "goerli"
};
addr.mumbai = {
    "evmChainId": 80001,
    "name": "Polygon Mumbai",
    "rpc": "polygon-mumbai.g.alchemy.com/v2/Ptsa6JdQQUtTbRGM1Elvw_ed3cTszLoj",
    "start": 1001,
    "end": 2000,
    "lzEndpoint": "0xf69186dfBa60DdB133E91E9A4B5673624293d8F8",
    "chainId": 10109,
    "bgcolor": "purple",
    "slug": "mumbai"
};
addr["arbitrum-goerli"] = {
    "evmChainId": 421613,
    "name": "Arbitrum Goerli",
    "rpc": "arb-goerli.g.alchemy.com/v2/jb4AhFhyR0X_ChVX5J1f0oWQ6GvJqLK0",
    "start": 2001,
    "end": 3000,
    "lzEndpoint": "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab",
    "chainId": 10143,
    "bgcolor": "blue",
    "slug": "arbitrum-goerli"
};
addr["moonbeam-alpha"] = {
    "evmChainId": 1287,
    "name": "Moonbase Alpha",
    "rpc": "moonbase-alpha.public.blastapi.io",
    "start": 3001,
    "end": 4000,
    "lzEndpoint": "0xb23b28012ee92E8dE39DEb57Af31722223034747",
    "chainId": 10126,
    "bgcolor": "red",
    "slug": "moonbase-alpha"
};

var rpcURLs = {};
rpcURLs.goerli = "eth-goerli.alchemyapi.io/v2/n_mDCfTpJ8I959arPP7PwiOptjubLm57";
rpcURLs.mumbai = "polygon-mumbai.g.alchemy.com/v2/Ptsa6JdQQUtTbRGM1Elvw_ed3cTszLoj";
rpcURLs.optigoerli = "opt-goerli.g.alchemy.com/v2/jb4AhFhyR0X_ChVX5J1f0oWQ6GvJqLK0";

const nftPortAPI = "https://api.nftport.xyz/v0/accounts/";
const sidedoorAPI = "https://api.sidedoor.tools/";

var chain = "moonbeam-alpha";
//var chain = "optigoerli";
var web3, dalley;
var accounts = [];
var provider, ethersSigner;

var tokenId;

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
};

var allChains = ["goerli", "mumbai", "arbitrum-goerli", "moonbeam-alpha"];
for (let i = 0; i < allChains.length; i++) {
    var thisChain = allChains[i];
    const chainProvider = new ethers.providers.JsonRpcProvider({"url": "https://"+addr[thisChain].rpc});
    addr[thisChain].dalley = new ethers.Contract(nftAddress, onftABI, chainProvider);
}

function setupChain() {
    var rpcURL = addr[chain].rpc;
    const prov = {"url": "https://"+rpcURL};
    provider = new ethers.providers.JsonRpcProvider(prov);
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    var wssProvider = new ethers.providers.WebSocketProvider(
        "wss://" + rpcURL
    );
    if (chain == "moonbeam-alpha") {
        wssProvider = new ethers.providers.WebSocketProvider(
            "wss://moonbeam-alpha.api.onfinality.io/ws?apikey=63f987d5-9673-4446-a49a-0c72b9dc4899"
        );
    }
    dalley = new ethers.Contract(
        nftAddress,
        onftABI,
        wssProvider
    );
    web3 = AlchemyWeb3.createAlchemyWeb3("wss://"+rpcURL);
    updateRemaining(chain);
}
setupChain();

provider.on("network", (newNetwork, oldNetwork) => {
    if (oldNetwork) {
        console.log(newNetwork, oldNetwork);
        //setupChain();
    }
});

const chains = {};
chains["5"] = {
    "chainId":  web3.utils.toHex(5),
    "chainName": "Goerli Test Network",
    "nativeCurrency": {
        "name": "Goerli ETH",
        "symbol": "GoerliETH",
        "decimals": 18
    },
    "rpcUrls": ["https://goerli.infura.io/v3/"],
    "blockExplorerUrls": ["https://goerli.etherscan.io"],
}
chains["420"] = {
    "chainId":  web3.utils.toHex(420),
    "chainName": "Optimism Goerli",
    "nativeCurrency": {
        "name": "KOR",
        "symbol": "KOR",
        "decimals": 18
    },
    "rpcUrls": ["https://goerli.optimism.io"],
    "blockExplorerUrls": ["https://blockscout.com/optimism/goerli"],
}
chains["80001"] = {
    "chainId":  web3.utils.toHex(80001),
    "chainName": "Polygon Mumbai",
    "nativeCurrency": {
        "name": "MATIC",
        "symbol": "MATIC",
        "decimals": 18
    },
    "rpcUrls": ["https://matic-mumbai.chainstacklabs.com"],
    "blockExplorerUrls": ["https://mumbai.polygonscan.com/"],
}
chains["421613"] = {
    "chainId":  web3.utils.toHex(421613),
    "chainName": "Arbitrum Goerli Testnet",
    "nativeCurrency": {
        "name": "ETH",
        "symbol": "ETH",
        "decimals": 18
    },
    "rpcUrls": ["https://goerli-rollup.arbitrum.io/rpc"],
    "blockExplorerUrls": ["https://goerli.arbiscan.io/"],
}
chains["1287"] = {
    "chainId":  web3.utils.toHex(1287),
    "chainName": "Moonbase Alpha",
    "nativeCurrency": {
        "name": "DEV",
        "symbol": "DEV",
        "decimals": 18
    },
    "rpcUrls": ["https://rpc.api.moonbase.moonbeam.network"],
    "blockExplorerUrls": ["https://moonbase.moonscan.io/"],
}

async function connect(){
    if (window.ethereum) {
        //console.log("window.ethereum true");
        await provider.send("eth_requestAccounts", []);
        ethersSigner = provider.getSigner();
        accounts[0] = await ethersSigner.getAddress();
        console.log(accounts);
        const userChain = await ethereum.request({ method: 'eth_chainId' });
        if (web3.utils.hexToNumber(userChain) != chain) {
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: web3.utils.toHex(addr[chain].evmChainId) }],
            });
        }
        $("#offcanvas").find("button").click();
    } else {
        // The user doesn't have Metamask installed.
        console.log("window.ethereum false");
    } 
}

async function mint(mintChain, color, wearing, deliveryChain) {
    var jumping = false;
    console.log(mintChain, color, wearing, deliveryChain);
    // TODO: prompt network change if network doesn't match mintChain
    const params = {
        "chain": addr[chain].name,
        "color": color,
        "wearing": wearing,
        "bgcolor": addr[chain].bgcolor
    };
    //const res = await fetch(sidedoorAPI + '/nfts/metadata', { 
    //    method: 'post', 
    //    headers: new Headers({
    //        'Authorization': 'Bearer apikeytbd', 
    //        'Content-Type': 'application/json'
    //    }), 
    //    body: params
    //});
    //var result = await res.json();
    var result ={
        "result": "ok",
        "image": "bafybeibecrfyszdg6mi4fjehtqhncodppjn5upnw3as632sknh3gtiwr4e",
        "meta": "bafkreibzsfck7kkrxcocxx2tqlwkk3g4fw3lwcaejiznhn4uvp5wklnowq"
        };
    const ipfsMeta = "ipfs://" + result.meta;
    const imageURL = ipfsToHttp(result.image);
    var tx;
    if (mintChain != deliveryChain) {
        jumping = true;
        const fee = await dalley.connect(ethersSigner).evmEstimateSendFee(addr[deliveryChain].chainId, accounts[0], 0);
        console.log("estFee", fee[0]);
        tx = await dalley.connect(ethersSigner).mintAndSend(ipfsMeta, addr[deliveryChain].chainId, {"value": ''+fee[0]});
    } else {
        tx = await dalley.connect(ethersSigner).mint(ipfsMeta);
    }
    let mintFilter = dalley.filters.Transfer(zeroAddress, accounts[0]);
    dalley.once(mintFilter, async (from, to, id, event) => { 
        tokenId = id;
        console.log('tokenId:' + tokenId);
        $("#mint-image").attr("src", imageURL);
        $("#tokenid").text(tokenId);
        $("#mint-title").text("");
        $("#mint-title-label").text("Minted!");
        $("#birth-chain, #color, #wearing").parents(".mint-field").hide();
        if (jumping) {
            $("#delivery-chain").parents(".mint-field").hide();
        }
        $("#mint-button").text("Minted!");
        await sleep(2000);
        if (jumping) {
            $("#mint-button").text("Jumping...");
            // TODO: filter for arrival on destination chain
        } else {
            $("#mint-button").attr("href", getMarketplaceURL(mintChain, tokenId)).text("View on Opensea");
            $("#jump-button").show();
        }
        updateRemaining(chain);
    });
    await tx.wait();
}

async function jump(tokenId, deliveryChain) {
    console.log(deliveryChain, addr[deliveryChain].chainId);
    const fee = await dalley.connect(ethersSigner).evmEstimateSendFee(addr[deliveryChain].chainId, accounts[0], tokenId);
    console.log("estFee", fee[0]);
    const tx = await dalley.connect(ethersSigner).evmSend(accounts[0], addr[deliveryChain].chainId, accounts[0], tokenId, {"value": ''+fee[0]});
    let mintFilter = dalley.filters.Transfer(accounts[0], nftAddress);
    dalley.once(mintFilter, async (from, to, id, event) => { 
        tokenId = id;
        $("#jump-button").text("Jump Started...");
    });
    let arrivalFilter = addr[deliveryChain].dalley.filters.Transfer(nftAddress, accounts[0]);
    dalley.once(mintFilter, async (from, to, id, event) => { 
        tokenId = id;
        $("#mint-title").text("");
        $("#mint-title-label").text("Jump Completed!");
        $("#jump-button").text("Jump Completed.");
        await sleep(2000);
        $("#jump-button").hide();
        $("#mint-button").show().attr("href", getMarketplaceURL(deliveryChain, tokenId)).text("View on Opensea");
    });
    tx.wait();
    // TODO: filter for arrival on destination chain
    return false;
}

async function switchChain(chainId) {
    try {
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: web3.utils.toHex(chainId) }],
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
            try {
                await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        chains[chainId]
                    ],
                });
                switchChain(chainId);
            } catch (addError) {
                // handle "add" error
            }
        }
        // handle other "switch" errors
    }
    if (chainId == 80001) {
        chain = "mumbai";
    }
    if (chainId == 420) {
        chain = "optigoerli";
    }
    if (chainId == 5) {
        chain = "goerli";
    }
    if (chainId == 421613) {
        chain = "arbitrum-goerli";
    }
    if (chainId == 1287) {
        chain = "moonbeam-alpha";
    }
    setupChain();
}

async function updateRemaining(targetChain) {
    const max = await addr[targetChain].dalley.maxMintId();
    const next = await addr[targetChain].dalley.nextMintId();
    const remaining = parseInt(max) - parseInt(next) + 1;
    $("#remaining").text(remaining);
}

function ipfsToHttp(ipfs) {
    var http = "";
    var cid = ipfs.replace("ipfs://", "");
    //http = "https://" + cid + ".ipfs.dweb.link";
    //http = "https://ipfs.io/ipfs/" + cid;
    http = "https://nftstorage.link/ipfs/" + cid;
    return http;
}

function getMarketplaceURL(currentChain, tokenId) {
    var slug = addr[currentChain].slug;
    var url = `https://testnets.opensea.io/assets/${slug}/${nftAddress}/${tokenId}`;
    return url;
}

$( document ).ready(function() {

    $(".connect").click(function(){
        connect();
        return false;
    });

    $("#mint-button").click(function(){
        if (tokenId) {
            return true;
        }
        $(this).text("Minting...");
        const mintChain = $("#birth-chain").val();
        const color = $("#color").val();
        const wearing = $("#wearing").val();
        const deliveryChain = $("#delivery-chain").val();
        mint(mintChain, color, wearing, deliveryChain);
        return false;
    });

    $("#jump-button").click(function(){
        if (!tokenId) {
            console.log("need tokenId to jump");
            return false;
        }
        $(this).text("Jumping...");
        const deliveryChain = $("#delivery-chain").val();
        jump(tokenId, deliveryChain);
        return false;
    });

    $(".switch").click(async function(){
        var chainId = $(this).data("chain");
        await switchChain(chainId);
        return false;
    });

    $("#birth-chain").change(async function(){
        const newChain = $(this).val();
        $(".birth-chain-name").text(addr[newChain].name);
        updateRemaining(newChain);
        await switchChain(addr[newChain].evmChainId);
    });

});