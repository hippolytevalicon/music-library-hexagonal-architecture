import React, { createContext, useContext } from 'react';
import { Container } from './container';

const DIContext = createContext<Container>(Container.getInstance());

export const DIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <DIContext.Provider value={Container.getInstance()}>
            {children}
        </DIContext.Provider>
    );
};

export const useMediaLibrary = () => {
    const container = useContext(DIContext);
    return container.getMediaLibrary();
};