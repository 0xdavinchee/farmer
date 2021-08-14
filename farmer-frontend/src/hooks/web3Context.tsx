import React, {
    useState,
    ReactElement,
    useContext,
    useEffect,
    useMemo,
    useCallback,
} from "react";
import Web3Modal from "web3modal";
import {
    StaticJsonRpcProvider,
    JsonRpcProvider,
    Web3Provider,
} from "@ethersproject/providers";
import WalletConnectProvider from "@walletconnect/web3-provider";

type onChainProvider = {
    readonly connect: () => void;
    readonly disconnect: () => void;
    readonly chainID: number;
    readonly connected: Boolean;
    readonly provider: JsonRpcProvider;
    readonly user: string;
    readonly web3Modal: Web3Modal;
};

export type Web3ContextData = {
    onChainProvider: onChainProvider;
} | null;

const Web3Context = React.createContext<Web3ContextData>(null);

// creates the web3Context hook
export const useWeb3Context = () => {
    const web3Context = useContext(Web3Context);
    if (!web3Context) {
        throw new Error(
            "useWeb3Context() can only be used inside of <Web3ContextProvider />, " +
                "please declare it at a higher level."
        );
    }
    const { onChainProvider } = web3Context;
    return useMemo(() => {
        return { ...onChainProvider };
    }, [web3Context]);
};

export const useAddress = () => {
    const { user } = useWeb3Context();
    return user;
};

export const Web3ContextProvider: React.FC<{ children: ReactElement }> = ({
    children,
}) => {
    const [connected, setConnected] = useState(false);
    const [chainID, setChainID] = useState(1);
    const [user, setUser] = useState("");
    const providerUrl =
        process.env.NODE_ENV === "development"
            ? "http://localhost:8545"
            : process.env.REACT_APP_INFURA_API_KEY;
    const [provider, setProvider] = useState<StaticJsonRpcProvider>(
        new StaticJsonRpcProvider(providerUrl)
    );

    const [web3Modal, setWeb3Modal] = useState<Web3Modal>(
        new Web3Modal({
            // network: "mainnet", // optional
            cacheProvider: true, // optional
            providerOptions: {
                walletconnect: {
                    package: WalletConnectProvider, // required
                    options: {
                        infuraId: process.env.REACT_APP_INFURA_API_KEY,
                    },
                },
            },
        })
    );

    const _hasCachedProvider = (): Boolean => {
        if (!web3Modal) return false;
        if (!web3Modal.cachedProvider) return false;
        return true;
    };

    useEffect(() => {
        if (!(window as any).ethereum) return;
        (window as any).ethereum.on("connect", (connectInfo: any) => {
            setChainID(parseInt(connectInfo.chainId));
        });

        return () => {
            (window as any).ethereum.removeListener("connect", () => {});
        };
    }, []);

    useEffect(() => {
        if (!(window as any).ethereum) return;
        (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
            setUser(accounts[0]);
        });

        return () => {
            (window as any).ethereum.removeListener(
                "accountsChanged",
                () => {}
            );
        };
    }, []);

    useEffect(() => {
        if (!(window as any).ethereum) return;
        (window as any).ethereum.on("chainChanged", (chainId: string) => {
            setChainID(Number(chainId));
        });

        return () => {
            (window as any).ethereum.removeListener("chainChanged", () => {});
        };
    }, []);

    const connect = useCallback(async () => {
        const rawProvider = await web3Modal.connect();
        const connectedProvider = new Web3Provider(rawProvider);
        const connectedAddress = await connectedProvider
            .getSigner()
            .getAddress();

        const chainId = await connectedProvider
            .getNetwork()
            .then((network) => network.chainId);
        setChainID(chainId);
        setConnected(true);
        setUser(connectedAddress);
        setProvider(connectedProvider);

        return connectedProvider;
    }, [web3Modal]);

    const disconnect = useCallback(async () => {
        web3Modal.clearCachedProvider();
        setConnected(false);

        setTimeout(() => {
            window.location.reload();
        }, 1);
    }, [provider, web3Modal, connected]);

    const onChainProvider = useMemo(
        () => ({
            connect,
            disconnect,
            provider,
            chainID,
            connected,
            user,
            web3Modal,
        }),
        [connect, disconnect, provider, chainID, connected, user, web3Modal]
    );

    useEffect(() => {
        if (_hasCachedProvider()) {
            connect();
        }
    }, []);

    return (
        <Web3Context.Provider value={{ onChainProvider }}>
            {children}
        </Web3Context.Provider>
    );
};
