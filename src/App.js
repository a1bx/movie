import React, { useState, useEffect } from "react";
import MovieCard from "./moviecard";
import SearchIcon from "./search.svg";
import "./App.css";

const API_KEY = "9fc83f4b4ecffacae057e947953eb886";
const BASE_URL = "https://api.themoviedb.org/3";

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    searchMovies("spiderman");
  }, []);

  const searchMovies = async (title) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${title}`);
      const data = await response.json();
      setMovies(data.results);
    } catch (error) {
      console.error("Error searching movies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchMovies(searchTerm);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="app">
      <h1>Movie Arcade</h1>

      <div className="search">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for movies"
        />
        <img
          src={SearchIcon}
          alt="search"
          onClick={handleSearch}
        />
      </div>

      {isLoading ? (
        <div className="loader">
          <div className="spinner"></div>
          <p>Loading movies...</p>
        </div>
      ) : movies?.length > 0 ? (
        <div className="container">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h2>No movies found</h2>
        </div>
      )}
    </div>
  );
};

export default App;