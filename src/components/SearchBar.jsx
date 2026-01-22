import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import './SearchBar.css';

const SearchBar = ({ onSearch, isLoading }) => {
    const [term, setTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    const BASE_URL = 'https://api.themoviedb.org/3';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (term.trim().length < 2) {
                setSuggestions([]);
                return;
            }

            try {
                const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${term}`);
                const data = await res.json();
                setSuggestions(data.results.slice(0, 6));
            } catch (err) {
                console.error('Suggestions error:', err);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [term, API_KEY]);

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (term.trim()) {
            onSearch(term);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (movie) => {
        navigate(`/movie/${movie.id}`);
        setShowSuggestions(false);
        setTerm('');
    };

    return (
        <div className="search-container" ref={dropdownRef}>
            <form className="search-bar" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={term}
                    onChange={(e) => {
                        setTerm(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search for movies..."
                />
                <div className="search-icon-wrapper" onClick={handleSubmit}>
                    <Search className={`search-icon ${isLoading ? 'loading' : ''}`} size={20} />
                </div>
            </form>

            {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                    {suggestions.map((movie) => (
                        <div
                            key={movie.id}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(movie)}
                        >
                            <img
                                src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 'https://via.placeholder.com/92x138?text=No+Img'}
                                alt={movie.title}
                                className="suggestion-poster"
                            />
                            <div className="suggestion-info">
                                <span className="suggestion-title">{movie.title}</span>
                                <span className="suggestion-year">
                                    {movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
