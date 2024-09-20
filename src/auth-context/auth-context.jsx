import PropTypes from 'prop-types';
import React, { useMemo, useState, useEffect, useContext, useCallback, createContext } from 'react';

import { socket } from '../websocket/websocket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [systemConfig, setSystemConfig] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);  // New loading state

  useEffect(() => {
    const storedUserData = sessionStorage.getItem('userData');
    const storedConfig = sessionStorage.getItem('systemConfig');
    if (storedUserData && storedConfig) {
      setUserData(JSON.parse(storedUserData));
      setSystemConfig(JSON.parse(storedConfig));
      setIsAuthenticated(true);
    }
    setIsLoading(false);  // Set loading to false once the check is complete
  }, []);

  const login = useCallback((user, config, tabId) => {
    setUserData(user);
    setSystemConfig(config);
    setIsAuthenticated(true);
    socket.connect();
    sessionStorage.setItem('userData', JSON.stringify(user));
    sessionStorage.setItem('systemConfig', JSON.stringify(config));
    sessionStorage.setItem('tabId', tabId);
  }, []);

  const logout = useCallback(() => {
    setUserData(null);
    setSystemConfig(null);
    setIsAuthenticated(false);
    socket.disconnect();
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('systemConfig');
    sessionStorage.removeItem('tabId');
  }, []);

  socket.on('newRole', (data) => {
    const storedUserData = JSON.parse(sessionStorage.getItem('userData'));
    if (storedUserData.user_id === data.userId) {
      storedUserData.role = data.roleId;
      sessionStorage.removeItem('userData');
      sessionStorage.setItem('userData', JSON.stringify(storedUserData));
      window.location.reload();
      socket.disconnect();
    }
    // console.log('storedUserData',storedUserData.role, ' new data',data);
  });

  const saveConfiguration = useCallback((config) => {
    setSystemConfig(config);
    sessionStorage.setItem('systemConfig', JSON.stringify(config));
  }, []);

  const authValue = useMemo(() => ({
    user: userData,
    config: systemConfig,
    isAuthenticated,
    login,
    logout,
    saveConfiguration
  }), [userData, systemConfig, isAuthenticated, login, logout, saveConfiguration]);

  if (isLoading) {
    // Render a loading state if still checking authentication data
    return <div>Loading...</div>;
  }

  return (<AuthContext.Provider value={authValue}>
    {children}
  </AuthContext.Provider>);
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
