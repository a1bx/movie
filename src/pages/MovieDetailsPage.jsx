import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Calendar, Clock, Star, ArrowLeft, Play, Bookmark, BookmarkCheck, Share2, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "../services/api";
import TrailerPlayer from "../components/TrailerPlayer";
import { useWatchlist } from "../context/WatchlistContext";
import { useAuth } from "../context/AuthContext";
import "./MovieDetailPage.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { isAuthenticated } = useAuth();

  const isBookmarked = isInWatchlist(parseInt(id));

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const [movieRes, videoRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`),
          fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`)
        ]);

        const movieData = await movieRes.json();
        const videoData = await videoRes.json();

        setMovie(movieData);
        const trailer = videoData.results?.find(v => v.type === "Trailer" && v.site === "YouTube");
        setTrailerKey(trailer?.key);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieData();
  }, [id]);

  const toggleWatchlist = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location } });
      return;
    }
    isBookmarked ? removeFromWatchlist(parseInt(id)) : addToWatchlist(movie);
  };

  const formatCurrency = (number) => {
    if (!number) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(number);
  };

  if (loading) return (
    <div className="details-loader">
      <div className="spinner"></div>
    </div>
  );

  if (!movie) return (
    <div className="details-error">
      <h2>Something went wrong.</h2>
      <button onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="movie-details-page"
    >
      <Helmet>
        <title>{movie.title} | Movie Arcade</title>
      </Helmet>

      {/* Hero Backdrop */}
      <div className="details-hero">
        <div
          className="details-backdrop"
          style={{ backgroundImage: `url(${getImageUrl(movie.backdrop_path, 'original')})` }}
        />
        <div className="details-overlay" />

        <header className="details-nav">
          <button onClick={() => navigate(-1)} className="nav-btn-back">
            <ArrowLeft size={20} /> Back
          </button>
          <div className="nav-actions">
            <button
              className={`btn-watchlist-minimal ${isBookmarked ? 'active' : ''}`}
              onClick={toggleWatchlist}
            >
              {isBookmarked ? <BookmarkCheck size={24} fill="#ff4c2b" color="#ff4c2b" /> : <Bookmark size={24} />}
            </button>
            <button className="nav-btn-circle"><Share2 size={20} /></button>
          </div>
        </header>
      </div>

      <div className="details-main-content">
        <div className="details-content-container">
          <div className="details-left">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="details-poster-wrapper"
            >
              <img src={getImageUrl(movie.poster_path)} alt={movie.title} />
            </motion.div>
          </div>

          <div className="details-right">
            <div className="details-header-info">
              {trailerKey && (
                <button className="btn-watch-trailer-red" onClick={() => setShowTrailer(true)}>
                  <Play size={18} fill="white" /> Watch Trailer
                </button>
              )}

              <h1 className="details-title-large brand-title">
                <span className="brand-title-primary">
                  {movie.title.split(" ").slice(0, 1).join(" ")}
                </span>
                <span className="brand-title-secondary">
                  {movie.title.split(" ").slice(1).join(" ")}
                </span>
              </h1>
              {movie.tagline && <p className="details-tagline">"{movie.tagline}"</p>}

              <div className="details-genres-pills">
                {movie.genres?.map(g => <span key={g.id} className="genre-pill">{g.name}</span>)}
              </div>

              <div className="details-stats-grid">
                <div className="stat-box">
                  <label>Rating</label>
                  <span>{movie.vote_average?.toFixed(1)}</span>
                </div>
                <div className="stat-box">
                  <label>Runtime</label>
                  <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                </div>
                <div className="stat-box">
                  <label>Year</label>
                  <span>{movie.release_date?.substring(0, 4)}</span>
                </div>
                <div className="stat-box">
                  <label>Revenue</label>
                  <span>{formatCurrency(movie.revenue)}</span>
                </div>
              </div>

              <div className="details-overview-section">
                <h3 className="overview-heading">Overview</h3>
                <p className="details-overview-text">{movie.overview}</p>
              </div>

              {movie.production_companies?.length > 0 && (
                <div className="details-companies-section">
                  <h3 className="companies-heading">Production Companies</h3>
                  <div className="companies-logos">
                    {movie.production_companies.map((company) => (
                      <div key={company.id} className="company-logo-card">
                        {company.logo_path ? (
                          <img
                            src={getImageUrl(company.logo_path, 'w300')}
                            alt={company.name}
                          />
                        ) : (
                          <span>{company.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showTrailer && (
          <TrailerPlayer
            trailerKey={trailerKey}
            onClose={() => setShowTrailer(false)}
            movieTitle={movie.title}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MovieDetailsPage;