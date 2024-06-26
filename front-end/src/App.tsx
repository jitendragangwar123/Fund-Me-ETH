import "@rainbow-me/rainbowkit/styles.css";
import "./App.css";

import {
  AuthenticationStatus,
  createAuthenticationAdapter,
  darkTheme,
  getDefaultConfig,
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import {
  sepolia,
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
} from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { SiweMessage } from "siwe";
import FundMe from "./FundMe";

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "YOUR_PROJECT_ID",
  chains: [sepolia, mainnet, polygon, optimism, arbitrum, base],
});

const queryClient = new QueryClient();

function App() {
  const [authStatus, setAuthStatus] = useState<AuthenticationStatus>("loading");
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("https://fund-me-eth-backend.vercel.app/address");
        const { address } = await response.json();
        setAuthStatus(address ? "authenticated" : "unauthenticated");
      } catch (error) {
        console.log("error: ", error);
        setAuthStatus("unauthenticated");
      }
    };
    fetchUser();

    window.addEventListener("focus", fetchUser);
    return () => {
      window.removeEventListener("focus", fetchUser);
    };
  }, []);

  const authAdapter = useMemo(() => {
    return createAuthenticationAdapter({
      getNonce: async () => {
        const response = await fetch("https://fund-me-eth-backend.vercel.app/nonce");
        const { nonce } = await response.json();
        return nonce;
      },

      createMessage: ({ nonce, address, chainId }) => {
        return new SiweMessage({
          domain: window.location.host,
          address,
          statement: "Sign in with Ethereum to the app.",
          uri: window.location.origin,
          version: "1",
          chainId,
          nonce,
        });
      },

      getMessageBody: ({ message }) => {
        return message.prepareMessage();
      },

      verify: async ({ message, signature }) => {
        const verifyRes = await fetch("https://fund-me-eth-backend.vercel.app/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, signature }),
        });

        return Boolean(verifyRes.ok);
      },

      signOut: async () => {
        await fetch("https://fund-me-eth-backend.vercel.app/logout");
      },
    });
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitAuthenticationProvider
          adapter={authAdapter}
          status={authStatus}
        >
          <RainbowKitProvider
          modalSize="compact"
          theme={darkTheme({
            accentColor: "#319795",
            accentColorForeground: "#FFFFFF",
            borderRadius: "medium",
            fontStack: "system",
            overlayBlur: "small",
          })}
          >
            <FundMe/>
          </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
export default App;
