import styles from "./styles/Home.module.css";
import {
  MediaRenderer,
  useAddress,
  useDisconnect,
  useMetamask,
  useNetwork,
  useNetworkMismatch,
  useNFTCollection,
  useSigner,
} from "@thirdweb-dev/react";
import { ChainId, NFTMetadataOwner, ThirdwebSDK } from "@thirdweb-dev/sdk";
import type { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import Image from 'next/image'
import { Box, Input, Stack } from "@chakra-ui/react";

const Home: NextPage = () => {
  // Helpful thirdweb hooks to connect and manage the wallet from metamask.
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const disconnectWallet = useDisconnect();
  const signer = useSigner();
  const isOnWrongNetwork = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();

  // Fetch the NFT collection from thirdweb via it's contract address.
  const nftCollection = useNFTCollection(
    // Replace this with your NFT Collection contract address
    process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS
  );

  // Loading flag to show while we fetch the NFTs from the smart contract
  const [loadingNfts, setLoadingNfts] = useState(true);
  // Here we will store the existing NFT's from the collection.
  const [nfts, setNfts] = useState<NFTMetadataOwner[]>([]);

  // Here we store the user inputs for their NFT.
  const [nftName, setNftName] = useState<string>("");
  const [file, setFile] = useState<File>();

  // This useEffect block runs whenever the value of nftCollection changes.
  // When the collection is loaded from the above useNFTCollection hook, we'll call getAll()
  // to get all the NFT's from the collection and store them in state.
  useEffect(() => {
    if (nftCollection) {
      (async () => {
        const loadedNfts = await nftCollection.getAll();
        setNfts(loadedNfts);
        setLoadingNfts(false);
      })();
    }
  }, [nftCollection]);

  // Magic to get the file upload even though its hidden
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Function to store file in state when user uploads it
  const uploadFile = () => {
    if (fileInputRef?.current) {
      fileInputRef.current.click();

      fileInputRef.current.onchange = () => {
        if (fileInputRef?.current?.files?.length) {
          const file = fileInputRef.current.files[0];
          setFile(file);
        }
      };
    }
  };

  // This function calls a Next JS API route that mints an NFT with signature-based minting.
  // We send in the address of the current user, and the text they entered as part of the request.
  const mintWithSignature = async () => {
    if (!address) {
      connectWithMetamask();
      return;
    }

    if (isOnWrongNetwork) {
      switchNetwork && switchNetwork(ChainId.Mumbai);
      return;
    }

    try {
      if (!file || !nftName) {
        alert("Please enter a name and upload a file.");
        return;
      }

      if (!address || !signer) {
        alert("Please connect to your wallet.");
        return;
      }

      // Upload image to IPFS using the sdk.storage
      const tw = new ThirdwebSDK(signer);
      const ipfsHash = await tw.storage.upload(file);
      const url = `${ipfsHash}.${file.type.split("/")[1]}`;

      // Make a request to /api/server
      const signedPayloadReq = await fetch(`/api/server`, {
        method: "POST",
        body: JSON.stringify({
          authorAddress: address, // Address of the current user
          nftName: nftName,
          imagePath: url,
        }),
      });

      console.log("Received Signed payload", signedPayloadReq);

      // Grab the JSON from the response
      const json = await signedPayloadReq.json();

      console.log("Signed payload JSON:", json);

      // If the request failed, we'll show an error.
      if (!signedPayloadReq.ok) {
        alert(json.error);
        return;
      }

      // If the request succeeded, we'll get the signed payload from the response.
      // The API should come back with a JSON object containing a field called signedPayload.
      // This line of code will parse the response and store it in a variable called signedPayload.
      const signedPayload = json.signedPayload;

      // Now we can call signature.mint and pass in the signed payload that we received from the server.
      // This means we provided a signature for the user to mint an NFT with.
      const nft = await nftCollection?.signature.mint(signedPayload);

      console.log("Successfully minted NFT with signature", nft);

      alert("Successfully minted NFT with signature");

      return nft;
    } catch (e) {
      console.error("An error occurred trying to mint the NFT:", e);
    }
  };

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.left}>
          <div>
            <a
              href="https://signs-of-life.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src={`/signsoflife.svg`} alt="Signs of Life Logo" height={100} width={200} />
            </a>
          </div>
        </div>
        <div className={styles.right}>
          {address ? (
            <>
              <a
                className={styles.secondaryButton}
                onClick={() => disconnectWallet()}
              >
                Disconnect Wallet
              </a>
              <p style={{ marginLeft: 8, marginRight: 8, color: "grey" }}>|</p>
              <Box textStyle={"headerP"}>
                {address.slice(0, 6).concat("...").concat(address.slice(-4))}
              </Box>
            </>
          ) : (
            <a
              className={styles.mainButton}
              onClick={() => connectWithMetamask()}
            >
              Connect Wallet
            </a>
          )}
        </div>
      </div>

      <div className={styles.container}>
        <Box textStyle='h2' py={2}>Mint NFTs for Research</Box>
        <Box textStyle='explain' py={2}>
          Community-minted NFTs in exchange for annotating peer reviews of reproducible research
        </Box>

        <Box pb={8}>
          Note: see instructions in our{" "}
          <a href="https://github.com/Collective-Frame/signs-of-life">Github Repository</a>{" "}
          and examples to earn your NFT signature and mint your NFT.
        </Box>

        <hr className={styles.divider} />

        <Stack spacing={4} py={8}>
          <Box textStyle={"title"}>
            Mint your own NFT into the collection:
          </Box>

          <Input
            type="text"
            variant="outline"
            placeholder="Input your NFT Minting Code"
            maxLength={26}
            onChange={(e) => setNftName(e.target.value)}
          />

          <Box>

            {file ? (
              <Image
                className={styles.imageUpload}
                src={URL.createObjectURL(file)}
                onClick={() => setFile(undefined)}
                width={250}
                height={250}
                alt="Uploaded file"
              />
            ) : (
              <div
                className={styles.imageInput}
                onClick={uploadFile}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  setFile(e.dataTransfer.files[0]);
                }}
              >
                Drag and drop an image here to upload it!
              </div>
            )}
          </Box>
        </Stack>
        
        <input
          type="file"
          accept="image/png, image/gif, image/jpeg"
          id="profile-picture-input"
          ref={fileInputRef}
          style={{ display: "none" }}
        />

        <div style={{ marginTop: 24 }}>
          {address ? (
            <a className={styles.mainButton} onClick={mintWithSignature}>
              Mint NFT
            </a>
          ) : (
            <a className={styles.mainButton} onClick={connectWithMetamask}>
              Connect Wallet
            </a>
          )}
        </div>

        <hr className={styles.smallDivider} />

        <div className={styles.collectionContainer}>
          <h2 className={styles.ourCollection}>
            Other NFTs in this collection:
          </h2>

          {loadingNfts ? (
            <p>Loading...</p>
          ) : (
            <div className={styles.nftGrid}>
              {nfts?.map((nft) => (
                <div
                  className={styles.nftItem}
                  key={nft.metadata.id.toString()}
                >
                  <div>
                    <MediaRenderer
                      src={nft.metadata.image}
                      style={{
                        height: 90,
                        borderRadius: 16,
                      }}
                    />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p>Named</p>
                    <p>
                      <b>{nft.metadata.name}</b>
                    </p>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <p>Owned by</p>
                    <p>
                      <b>
                        {nft.owner
                          .slice(0, 6)
                          .concat("...")
                          .concat(nft.owner.slice(-4))}
                      </b>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
