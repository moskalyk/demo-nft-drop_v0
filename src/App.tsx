import type { Component } from 'solid-js';
import { createSignal } from "solid-js";

import logo from './logo.svg';
import styles from './App.module.css';

import { sequence } from '0xsequence'

const App: Component = () => {
  const [signedIn, setSignedIn] = createSignal(false)
  const goerlidChainId = "0x05"

  const wallet = sequence.initWallet('goerli')
  console.log(wallet)
  const claim = async () => {

  }
  const connect = async () => {
    const wallet = sequence.getWallet()

    const connectWallet = await wallet.connect({
      networkId: goerlidChainId,
      app: 'drop',
      authorize: true,
      settings: {
        theme: 'dark'
      }
    })
    console.log(connectWallet)
  }
  return (
    <div class={styles.App}>
      {
        signedIn() ? 
          <button onClick={claim}>claim</button> 
          : 
          <button onClick={connect}>connect</button>
      }
      
    </div>
  );
};

export default App;