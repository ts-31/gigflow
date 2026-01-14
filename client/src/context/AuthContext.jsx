import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const { data } = await api.get('/auth/me');
            if (data.success) {
                setUser(data.user);
            }
        } catch (error) {
            console.error('Auth check failed', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        if (data.success) {
            setUser(data.user);
            return data.user;
        }
    };

    const register = async (name, email, password) => {
        const { data } = await api.post('/auth/register', { name, email, password });
        if (data.success) {
            setUser(data.user);
            return data.user;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
