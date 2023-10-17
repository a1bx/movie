import React, { useState, useEffect } from "react";

import MovieCard from "./moviecard";
import "./App.css";

const API_URL = "http://www.omdbapi.com?apikey=e290cf78";

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    searchMovies("The Batman");
  }, []);

  const searchMovies = async (title) => {
    const response = await fetch(`${API_URL}&s=${title}`);
    const data = await response.json();

    setMovies(data.Search);
  };

  return (
    <div className="app">
      <h1>Movie arcade</h1>

      <div className="search">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Movies"
        />
        <img
          src= "https://freeiconshop.com/wp-content/uploads/edd/search-outline.png"
          alt="search"
          onClick={() => searchMovies(searchTerm)}
        />
      </div>

      {movies?.length > 0 ? (
        <div className="container">
          {movies.map((movie) => (
            <MovieCard movie={movie} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h3>No movies found</h3>
        </div>
      )}
    </div>
  );
};

export default App;
