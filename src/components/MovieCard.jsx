import { useNavigate, Link } from "react-router-dom";
import { Star, Bookmark, BookmarkCheck } from "lucide-react";
import { useWatchlist } from "../context/WatchlistContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import "./MovieCard.css";

const MovieCard = ({ movie }) => {
  const {
    id,
    release_date,
    poster_path,
    title,
    vote_average,
  } = movie;

  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isBookmarked = isInWatchlist(id);

  const toggleWatchlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location } });
      return;
    }

    if (isBookmarked) {
      removeFromWatchlist(id);
    } else {
      addToWatchlist(movie);
    }
  };

  const posterUrl = poster_path
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Poster";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -10 }}
    >
      <Link to={`/movie/${id}`} className="movie-card-link">
        <div className="movie-card">
          <div className="movie-card-poster">
            <img
              src={posterUrl}
              alt={title}
              loading="lazy"
            />
            <div className="movie-card-badge">
              <Star size={14} fill="#facc15" color="#facc15" />
              <span>{vote_average ? vote_average.toFixed(1) : "N/A"}</span>
            </div>

            <button
              className={`watchlist-btn ${isBookmarked ? 'active' : ''}`}
              onClick={toggleWatchlist}
              title={isBookmarked ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              {isBookmarked ? <BookmarkCheck size={20} fill="#ff4c2b" color="#ff4c2b" /> : <Bookmark size={20} />}
            </button>
          </div>

          <div className="movie-card-info">
            <h3 className="movie-card-title">{title}</h3>
            <div className="movie-card-meta">
              <span>{release_date ? release_date.substring(0, 4) : "N/A"}</span>
              <span className="dot">•</span>
              <span>Movie</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MovieCard;
