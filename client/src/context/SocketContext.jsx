import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (user) {
            const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
                query: { userId: user._id },
            });

            newSocket.on('connect', () => {
                toast.success('Connected to real-time updates');
                console.log('Socket connected');
            });

            newSocket.on('disconnect', () => {
                toast.error('Disconnected from real-time updates');
                console.log('Socket disconnected');
            });

            newSocket.on('gig:hired', (data) => {
                toast.success(`You have been hired for ${data.title}!`, {
                    duration: 6000,
                    icon: '🎉',
                });
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
