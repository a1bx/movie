import React, { useState, useRef, useEffect } from 'react';

const API_KEY = "9fc83f4b4ecffacae057e947953eb886";
const BASE_URL = "https://api.themoviedb.org/3";

const MovieCard = ({ movie }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [extraInfo, setExtraInfo] = useState(null);
  const { id, release_date, poster_path, title, media_type, vote_average } = movie;
  const modalRef = useRef();

  const posterUrl = poster_path
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : "https://via.placeholder.com/400";

  const fetchExtraInfo = async () => {
    try {
      const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits`);
      const data = await response.json();
      setExtraInfo(data);
    } catch (error) {
      console.error("Error fetching extra movie info:", error);
    }
  };

  const openModal = () => {
    fetchExtraInfo();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <>
      <div className="movie" key={id} onClick={openModal}>
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
          <p>Rating: {vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
        </div>
      </div>

      {isModalOpen && extraInfo && (
        <div className="modal-overlay">
          <div className="modal-content" ref={modalRef}>
            <h2>{title}</h2>
            <p>Release Date: {release_date || 'N/A'}</p>
            <p>Budget: ${extraInfo.budget?.toLocaleString() || 'N/A'}</p>
            <p>Box Office: ${extraInfo.revenue?.toLocaleString() || 'N/A'}</p>
            <h3>Cast:</h3>
            <div className="cast-list">
              {extraInfo.credits.cast.slice(0, 5).map(actor => (
                <div key={actor.id} className="cast-member">
                  <img 
                    src={actor.profile_path 
                      ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                      : "https://via.placeholder.com/185x278"} 
                    alt={actor.name}
                  />
                  <p>{actor.name}</p>
                  <p className="character">{actor.character}</p>
                </div>
              ))}
            </div>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default MovieCard;