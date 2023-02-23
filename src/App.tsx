import type { Component } from 'solid-js';
import { createSignal } from "solid-js";

import logo from './logo.svg';
import styles from './App.module.css';

import { sequence } from '0xsequence'

const App: Component = () => {
  const [signedIn, setSignedIn] = createSignal(false)

  const wallet = sequence.initWallet('mumbai')

  const claim = async () => {
    console.log('claiming NFT')
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