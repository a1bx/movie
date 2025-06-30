import { Link } from "react-router-dom";

const MovieCard = ({ movie }) => {
  const {
    id,
    release_date,
    poster_path,
    title,
    media_type = "movie",
    vote_average,
  } = movie;

  const posterUrl = poster_path
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : "https://via.placeholder.com/400";

  return (
    <Link to={`/movie/${id}`}>
      <div className="movie cursor-pointer bg-gray-800 rounded-lg shadow-md transition hover:shadow-xl hover:scale-[1.02] duration-200">
        <div className="movie-info p-2 text-sm text-gray-400">
          <p>{release_date ? release_date.substring(0, 4) : "N/A"}</p>
        </div>
        <div className="w-full h-72 bg-black flex items-center justify-center rounded-t-md">
          <img
            src={posterUrl}
            alt={title}
            className="max-h-full object-contain"
          />
        </div>

        <div className="movie-details p-3">
          <span className="block text-xs uppercase text-indigo-400 mb-1">
            {media_type}
          </span>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>

        <div className="movie-rating p-2 text-sm text-gray-300">
          <p>Rating: {vote_average ? vote_average.toFixed(1) : "N/A"}</p>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
