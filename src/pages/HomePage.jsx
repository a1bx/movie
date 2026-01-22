import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, User } from "lucide-react";
import SearchBar from "../components/SearchBar";
import MovieCarousel from "../components/MovieCarousel";
import MovieCard from "../components/MovieCard";
import { useWatchlist } from "../context/WatchlistContext";
import { useAuth } from "../context/AuthContext";
import "./HomePage.css";

const GENRES = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [genreMovies, setGenreMovies] = useState([]);
  const [activeGenre, setActiveGenre] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const autoScrollRef = useRef(null);

  const { watchlist } = useWatchlist();
  const { user } = useAuth();

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const BASE_URL = "https://api.themoviedb.org/3";

  const fetchMainData = useCallback(async () => {
    try {
      const [trending, popular, upcoming] = await Promise.all([
        fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`).then(res => res.json()),
        fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`).then(res => res.json()),
        fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`).then(res => res.json())
      ]);

      setTrendingMovies(trending.results || []);
      setPopularMovies(popular.results || []);
      setUpcomingMovies(upcoming.results || []);
    } catch (err) {
      console.error("Error fetching homepage data:", err);
    }
  }, [API_KEY, BASE_URL]);

  const fetchGenreMovies = useCallback(async (genreId) => {
    try {
      const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`);
      const data = await res.json();
      setGenreMovies(data.results || []);
    } catch (err) {
      console.error("Genre fetch error:", err);
    }
  }, [API_KEY, BASE_URL]);

  useEffect(() => {
    fetchMainData();
  }, [fetchMainData]);

  useEffect(() => {
    if (activeGenre) {
      fetchGenreMovies(activeGenre);
    }
  }, [activeGenre, fetchGenreMovies]);

  // Handle scroll for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (trendingMovies.length > 0 && !searchTerm) {
      autoScrollRef.current = setInterval(() => {
        setHeroIndex(prev => (prev + 1) % Math.min(10, trendingMovies.length));
      }, 10000);
    }
    return () => clearInterval(autoScrollRef.current);
  }, [trendingMovies, searchTerm]);

  const handleSearch = async (title) => {
    setSearchTerm(title);
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${title}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSurpriseMe = () => {
    const randomIndex = Math.floor(Math.random() * Math.min(10, trendingMovies.length));
    setHeroIndex(randomIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextHero = () => {
    setHeroIndex((heroIndex + 1) % Math.min(10, trendingMovies.length));
    clearInterval(autoScrollRef.current);
  };

  const prevHero = () => {
    setHeroIndex((heroIndex - 1 + Math.min(10, trendingMovies.length)) % Math.min(10, trendingMovies.length));
    clearInterval(autoScrollRef.current);
  };

  const heroMovie = trendingMovies[heroIndex];

  return (
    <div className="home-page">
      <header className={searchTerm || isScrolled || !heroMovie ? "header-fixed" : ""}>
        <div className="logo brand-title" onClick={() => navigate("/")}>
          <span className="brand-title-primary">Movie</span>
          <span className="brand-title-secondary">Arcade</span>
        </div>
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        <div className="user-profile-header">
          {user ? (
            <div className="profile-trigger" onClick={() => navigate('/settings')}>
              <img src={user.avatar} alt={user.name} className="header-avatar" />
              <span className="user-name-small">{user.name.split(' ')[0]}</span>
            </div>
          ) : (
            <button className="btn-login-small" onClick={() => navigate('/login')}>
              Sign In
            </button>
          )}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!searchTerm && heroMovie && (
          <motion.div
            key={heroMovie.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="hero-section"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), #0b0b0b), url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path})`
            }}
          >
            <div className="hero-content">
              <motion.span
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="hero-badge"
              >
                Top Pick of the Day
              </motion.span>
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="hero-title"
              >
                {heroMovie.title}
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="hero-overview"
              >
                {heroMovie.overview}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="hero-buttons"
              >
                <button
                  className="btn-primary"
                  onClick={() => navigate(`/movie/${heroMovie.id}`)}
                >
                  View Details
                </button>
                <button
                  className="btn-secondary"
                  onClick={handleSurpriseMe}
                >
                  <Sparkles size={18} /> Surprise Me
                </button>
              </motion.div>
            </div>

            <div className="hero-controls">
              <button onClick={prevHero} className="hero-nav-btn"><ChevronLeft size={30} /></button>
              <div className="hero-bullets">
                {trendingMovies.slice(0, 10).map((_, i) => (
                  <div
                    key={i}
                    className={`bullet ${i === heroIndex ? 'active' : ''}`}
                    onClick={() => { setHeroIndex(i); clearInterval(autoScrollRef.current); }}
                  />
                ))}
              </div>
              <button onClick={nextHero} className="hero-nav-btn"><ChevronRight size={30} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="content-wrapper">
        {searchTerm ? (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="search-results-section"
          >
            <div className="section-header">
              <h2>Search Results for "{searchTerm}"</h2>
              <button className="clear-search" onClick={() => setSearchTerm("")}>Clear</button>
            </div>
            {isLoading ? (
              <div className="loader">
                <div className="spinner"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="movie-grid">
                {searchResults.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No movies found. Try another search!</p>
              </div>
            )}
          </motion.section>
        ) : (
          <div className="carousels-wrapper">
            {/* Watchlist Section */}
            {watchlist.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <MovieCarousel title="Your Watchlist" movies={watchlist} />
              </motion.div>
            )}

            {/* Genre Tabs */}
            <section className="genre-discovery">
              <div className="genre-tabs">
                <button
                  className={`genre-tab ${!activeGenre ? 'active' : ''}`}
                  onClick={() => setActiveGenre(null)}
                >
                  All Genres
                </button>
                {GENRES.map(genre => (
                  <button
                    key={genre.id}
                    className={`genre-tab ${activeGenre === genre.id ? 'active' : ''}`}
                    onClick={() => setActiveGenre(genre.id)}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>

              {activeGenre && (
                <motion.div
                  key={activeGenre}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <MovieCarousel title={`${GENRES.find(g => g.id === activeGenre)?.name} Hits`} movies={genreMovies} />
                </motion.div>
              )}
            </section>

            <MovieCarousel title="Coming Soon" movies={upcomingMovies} />
            <MovieCarousel title="Trending Now" movies={trendingMovies} />
            <MovieCarousel title="Most Popular" movies={popularMovies} />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;