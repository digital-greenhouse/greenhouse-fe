import React, { createContext, useState } from 'react';
//import { apiFactory } from '../../api/config/ApiFactory';

export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(null);



    const handleLogin = async (username, password) => {
        // try {
        //     const response = await apiFactory(false).post('/api/api/v1/auth/login', { username, password }).then(
        //         (response) => {
        //             return { ok: true, response: response }; // Retorna la respuesta para que pueda ser manejada en el bloque then
        //         }
        //     ).catch((error) => {
        //         return { ok: false, error: error }
        //     });

        //     return response; // Retorna el token si la solicitud es exitosa
        // } catch (error) {
        //     // Manejo de errores para que se pueda capturar en Login
        //     console.error(error);
        // }
    };

    return (
        <AuthContext.Provider value={{ authToken, handleLogin }}>
            {children}
        </AuthContext.Provider>
    );
};