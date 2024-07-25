import React from 'react';

const MovieCard = ({ movie }) => {
  const { id, release_date, poster_path, title, media_type, vote_average } = movie;

  const posterUrl = poster_path
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : "https://via.placeholder.com/400";

  return (
    <div className="movie" key={id}>
      <div className="movie-info">
        <p>{release_date ? release_date.substring(0, 4) : 'N/A'}</p>
      </div>

      <div className="movie-poster">
        <img src={posterUrl} alt={title} />
      </div>

      <div className="movie-details">
        <span>{media_type || 'movie'}</span>
        <h3>{title}</h3>
      </div>

      <div className="movie-rating">
        <p>Rating: {vote_average ? vote_average : 'N/A'}</p>
      </div>
    </div>
  );
}

export default MovieCard;
