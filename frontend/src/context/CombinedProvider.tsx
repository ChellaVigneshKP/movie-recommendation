import { Providers } from "./Providers";
import { ModalProvider } from './ModalContext';
import { ReactNode } from "react";

interface CombinedProviderProps {
    children: ReactNode;
}

export const CombinedProvider: React.FC<CombinedProviderProps> = ({ children }) => {
    return (
        <Providers>
            <ModalProvider>{children}</ModalProvider>
        </Providers>
    );
};
