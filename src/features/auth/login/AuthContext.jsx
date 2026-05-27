import React, { createContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { apiFactory } from '../../../api/config/apiFactory';

export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    const [authToken] = useState(null);


    const handleLogin = async (email, password) => {
        try {
            const response = await apiFactory(false).post('/api/v1/users/login', { email, password });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, error };
        }
    };

    const contextValue = useMemo(() => ({ authToken, handleLogin }), [authToken]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node,
};