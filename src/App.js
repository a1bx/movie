import React, { useState, useEffect } from "react";
// import input from "react";

import MovieCard from "./moviecard";
import "./App.css";

// input = document.getElementById("search");

const API_URL = "https://api.themoviedb.org/3/movie/550?api_key=9fc83f4b4ecffacae057e947953eb886";

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
  //http://www.omdbapi.com?apikey=e290cf78
  //9fc83f4b4ecffacae057e947953eb886
  // input.addEventListener("keypress", function(event) {
  //   if (event.key === "Enter") {
  //     event.preventDefault();
  //     document.getElementById("search").click();
  //   }
  // });

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
