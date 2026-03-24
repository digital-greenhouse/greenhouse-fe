import React, { createContext, useState } from 'react';
import { apiFactory } from '../../../api/config/apiFactory';

export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(null);


    const handleLogin = async (email, password) => {
        try {
            const response = await apiFactory(false).post('/api/v1/users/login', { email, password });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, error };
        }
    };

    return (
        <AuthContext.Provider value={{ authToken, handleLogin }}>
            {children}
        </AuthContext.Provider>
    );
};