import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AVATARS = [
    { id: 1, name: 'Iron Man', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tony' },
    { id: 2, name: 'Spiderman', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Peter' },
    { id: 3, name: 'Wonder Woman', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana' },
    { id: 4, name: 'Goku', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Goku' },
    { id: 5, name: 'Naruto', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Naruto' },
    { id: 6, name: 'Elsa', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elsa' },
    { id: 7, name: 'Batman', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bruce' },
    { id: 8, name: 'Luffy', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luffy' },
];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('movieArcadeUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('movieArcadeUser', JSON.stringify(userData));
    };

    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('movieArcadeUser', JSON.stringify(updatedUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('movieArcadeUser');
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};
