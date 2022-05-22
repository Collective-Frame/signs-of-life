import React from "react";
import type { AppProps } from "next/app";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import ThirdwebGuideOverlay from "../components/ThirdwebGuideOverlay";
import "./styles/globals.css";
import Head from "next/head";
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// This is the chainId your dApp will work on.
const activeChainId = ChainId.Mumbai;

const colors = {
  brand: {
    900: '#1a365d',
    800: '#153e75',
    700: '#2a69ac',
  },
}

const theme = extendTheme({
  colors,
  textStyles: {
    h1: {
      // you can also use responsive styles
      fontSize: ['48px', '56px'],
      fontWeight: '700',
      lineHeight: '78px',
      letterSpacing: '0em',
    },
    h2: {
      fontSize: ['36px', '42px'],
      fontWeight: '600',
      lineHeight: '78px',
      letterSpacing: '0em',
    },
    title: {
      fontSize: ['1.5rem', '1.6rem'],
    },
    explain: {
      fontSize: ['1.25rem', '1.3rem'],
    },
    bodyP: {
      fontSize: ['1rem', '1rem'],
    },
    headerP: {
      color: '#e6e6e6',
    },
  }, 
  fonts: {
    heading: "Roboto",
    body: "Roboto"
  },
})

function MyApp({ Component, pageProps }: AppProps) {
  const [showGuideOverlay, setShowGuideOverlay] = React.useState(false);

  return (
    <ChakraProvider theme={theme}>
      <ThirdwebProvider desiredChainId={activeChainId}>
        <ThirdwebGuideOverlay
          show={showGuideOverlay}
          setShow={setShowGuideOverlay}
        />
        <Head>
          <title>Signs of Life</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta
            name="description"
            content="Learn How To Do Signature Based Minting With Thirdweb And Next.JS To Create A Community Made NFT Collection with Thirdweb's ERC721 NFT Collection Contracts."
          />
          <meta
            name="keywords"
            content="Thirdweb, NFT, Minting, Signature Minting, Signature Based Minting, Thirdweb NFT Collection, Thirdweb NFT Community Made Collection"
          />
        </Head>
        <Component {...pageProps} />
      </ThirdwebProvider>
    </ChakraProvider>

  );
}

export default MyApp;
