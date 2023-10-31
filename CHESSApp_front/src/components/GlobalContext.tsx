import React from 'react';

const GlobalContext = React.createContext<{ [key: string]: { [key: string]: any } }>({});

export default GlobalContext;