import React, { createContext, useContext, useState, useEffect } from 'react';

const WatchlistContext = createContext();

export const useWatchlist = () => useContext(WatchlistContext);

export const WatchlistProvider = ({ children }) => {
    const [watchlist, setWatchlist] = useState(() => {
        const saved = localStorage.getItem('movieArcadeWatchlist');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('movieArcadeWatchlist', JSON.stringify(watchlist));
    }, [watchlist]);

    const addToWatchlist = (movie) => {
        if (!watchlist.find(m => m.id === movie.id)) {
            setWatchlist(prev => [movie, ...prev]);
        }
    };

    const removeFromWatchlist = (movieId) => {
        setWatchlist(prev => prev.filter(m => m.id !== movieId));
    };

    const isInWatchlist = (movieId) => {
        return !!watchlist.find(m => m.id === movieId);
    };

    return (
        <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}>
            {children}
        </WatchlistContext.Provider>
    );
};
