import type { Component } from 'solid-js';
import { createSignal, observable } from "solid-js";

import styles from './App.module.css';
import {ethers} from 'ethers'
import { sequence } from '0xsequence'
import { Fluence } from '@fluencelabs/fluence'
import { krasnodar } from '@fluencelabs/fluence-network-environment'
import { from } from "rxjs";

import { getRelayTime } from '../generated/Relay';

import { SequenceIndexerClient } from '@0xsequence/indexer'

const indexer = new SequenceIndexerClient('https://goerli-indexer.sequence.app')

var startTime: any, endTime: any;

function start() {
  startTime = new Date();
};

function end() {
  endTime = new Date();
  var timeDiff = endTime - startTime; //in ms
  var ms = Math.round(timeDiff);
  return ms
}

const contractAddress = '0xd704c95127b8a984a9d4e700477efc3b5535a890'

const App: Component = () => {
  const [signedIn, setSignedIn] = createSignal(false)
  const [transition, setTransition] = createSignal('fade-in')
  const [reveal, setReveal] = createSignal(false)
  const [item, setItem] = createSignal(false)
  const [itemImage, setItemImage] = createSignal('')
  const [itemId, setItemId] = createSignal(null)
  const [itemDescription, setItemDescription] = createSignal(null)


  const wallet = sequence.initWallet('mumbai')
  Fluence.start({connectTo: krasnodar[0]})

  const obsv$ = from(observable(itemId));

  // This breaks with fetch undefined
  async function checkBalances(){
    const nftBalances = await indexer.getTokenBalances({
      contractAddress: contractAddress,
      accountAddress: contractAddress,
      includeMetadata: true
    })
    console.log(nftBalances)
  }
  checkBalances()

  obsv$.subscribe(async (v) => {
    console.log(v)

    // do an off-chain computation on inprogress claiming
    // balanceOf()
  });


  const claim = async (claimedNft: any) => {
    console.log('claiming NFT: ', claimedNft)
    setItemId(claimedNft)
    const erc1155Interface = new ethers.utils.Interface([
      'function claim(uint id, uint _type)'
    ])
    
    // // Encode the transfer of the collectible to recipient
    // const address = await wallet.getAddress()
    // const data = erc1155Interface.encodeFunctionData(
    //   'safeTransferFrom', [address, recipientAddress, tokenId, amount, '0x']
    // )
    
    // const transaction = {
    //   to: erc1155TokenAddress,
    //   data
    // }
    
    // const signer = wallet.getSigner()
    // const txnResponse = await signer.sendTransaction(transaction)
    // console.log(txnResponse)

    setTransition('fade-out')
    setTimeout(async () => {
      setReveal(true)
      setItem(true)
      const res = await fetch(`https://bafybeifr2ugaueljk5tixayp3uhr57zsf6qqpx4jdpx5iw72pwym6mga4m.ipfs.nftstorage.link/${claimedNft}.json`)
      const metadata = await res.json()
      setItemImage(`https://${metadata.image}.ipfs.nftstorage.link`)
      setItemDescription(metadata.name)
    }, 4000)
  }

  const timeRandom = async () => {
    console.log('time NFT')
    // TODO: replace with blockchain block.number + 1
    claim(Math.floor(Math.random() * 7))
  }

  const hexRandom = async () => {
    console.log('hex NFT')
    const diff = ethers.BigNumber.from(ethers.utils.hexlify(ethers.utils.randomBytes(20)))
    claim(Number(diff.toString().substring(0,6)) % 6)
  }

  const spaceRandom = async () => {
    console.log('space NFT')
    start()
    const claimedNft = await getRelayTime(krasnodar[0].peerId) % 6
    console.log(end())
    claim(claimedNft)
  }

  const connect = async () => {
    const wallet = sequence.getWallet()

    const connectWallet = await wallet.connect({
      app: 'drop',
      authorize: true,
      settings: {
        theme: 'light'
      }
    })
    if(connectWallet.connected == true) setSignedIn(true)
  }
  return (
    <div >
      {/* Loading */}
      {transition() == 'fade-out' && !reveal() ? <div class="loading">Loading&#8230;</div> : null}
      <br/>
      <br/>
      {/* Banner */}
      <img class="center" src="https://sequence.xyz/sequence-wordmark.svg" />
      <br/>
      <br/>
      {/* Pulled Item */}
      {
        item() ? 
        (
          <>
            <img class="center item-card" src={itemImage()} />
            <p class="item fade-in">You pulled {itemDescription()}</p>
          </>
        ) : null
      }
      {/* randomization shelf */}
      {
        signedIn() ? 
          <>
            <br/>
            { 
              ! item() ? <p class={`prompt ${transition()}`}>claim an NFT, choose your type of randomness</p> : null
            }
            <br/>
            <div class={`container ${transition()}`}>
              <div onClick={timeRandom}><p class="random">time</p></div>
              <div onClick={hexRandom}><p class="random">hex</p></div>
              <div onClick={spaceRandom}><p class="random">space</p></div>
            </div>
          </>
        : 
          <button class="connect-button" onClick={connect}>connect</button>
      }
    </div>
  );
};

export default App;