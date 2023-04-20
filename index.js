const ethers = require("ethers");
const axios = require("axios");
const bytes32 = require("bytes32");
const { Network, Alchemy } = require("alchemy-sdk");

const RPC = "https://rpc.ankr.com/eth_goerli";
const provider = new ethers.providers.JsonRpcProvider(RPC);

const registrarAbi = require("./ABIs/Registrar.json");
const registryAbi = require("./ABIs/Registry.json");

const registryAddress = "0xCc6B2c224595b7d294e1af4b1cc51e51612bfC10";

const registryContract = new ethers.Contract(
  registryAddress,
  registryAbi,
  provider
);

const settings = {
  apiKey: "o9GU7BCXu0H7HzjnZIX-ueMyUpKRH6I3 ",
  network: Network.ETH_GOERLI,
};

const getPrimaryDomain = async (addr) => {
  if (!ethers.utils.isAddress(addr)) return;

  const data = await registryContract.primaryDomain(addr);

  if (data === bytes32({ input: "" })) {
    return JSON.stringify(addr);
  } else {
    return JSON.stringify(
      bytes32({
        input: data,
      })
    );
  }
};

const bytesDomainToData = async (name) => {
  const data = await registryContract.registry(name);
  console.log({ address: data.owner, registrar: data.registrar });
  return JSON.stringify({ address: data.owner, registrar: data.registrar });
};

const getDomainsByAddress = async (addr) => {
  if (!ethers.utils.isAddress(addr)) return;

  const rawBalance = await registryContract.balanceOf(addr);
  const balance = ethers.utils.formatUnits(rawBalance, 0);

  const domains = [];

  for (let i = 0; i < balance; i++) {
    const tokenId = await registryContract.tokenOfOwnerByIndex(addr, i);
    const rawDomain = await registryContract.tokenToDomain(tokenId);

    domains.push(rawDomain);
  }

  return JSON.stringify(domains);
};

const getAllDomains = async () => {
  const rawBalance = await registryContract.totalSupply();
  const balance = ethers.utils.formatUnits(rawBalance, 0);

  const allDomains = [];

  for (let i = 0; i < balance; i++) {
    const rawDomain = await registryContract.tokenToDomain(i);
    console.log(rawDomain);
    const data = await registryContract.registry(rawDomain);

    allDomains.push({ owner: data.owner, registrar: data.registrar });
  }

  return JSON.stringify(allDomains);
};

const getSubdomainsByRegistrar = async (registrarAddr) => {
  const registrarContract = new ethers.Contract(
    registrarAddr,
    registrarAbi,
    provider
  );

  const subdomains = await registrarContract.getAllSubDomains();
  const parentDomain = await registrarContract.parentDomain();

  return JSON.stringify(parentDomain, subdomains, subdomains.length);
};

module.exports = {
  getPrimaryDomain,
  getAllDomains,
  getSubdomainsByRegistrar,
  getDomainsByAddress,
  bytesDomainToData,
};
