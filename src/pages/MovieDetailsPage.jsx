import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { getImageUrl } from '../services/api';
import './MovieDetailPage.css';

const API_KEY = '9fc83f4b4ecffacae057e947953eb886';
const BASE_URL = 'https://api.themoviedb.org/3';

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchMovieDetails = async () => {
      try {
        const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos`);
        const data = await res.json();
        setMovie(data);
      } catch {
        setError('Failed to fetch movie details.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();

    const carousel = document.querySelector('.cast-carousel');
    if (carousel) {
      let isDown = false;
      let startX;
      let scrollLeft;

      // Mouse drag
      carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
      });

      carousel.addEventListener('mouseleave', () => (isDown = false));
      carousel.addEventListener('mouseup', () => (isDown = false));
      carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
      });

      // Touch swipe
      let touchStartX = 0;
      let touchScrollStart = 0;
      carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchScrollStart = carousel.scrollLeft;
      });
      carousel.addEventListener('touchmove', (e) => {
        const delta = touchStartX - e.touches[0].clientX;
        carousel.scrollLeft = touchScrollStart + delta;
      });
    }

    // Scroll-to-top button
    const btn = document.getElementById('scrollTopBtn');
    const toggleScrollButton = () => {
      if (window.scrollY > 400) btn.style.display = 'block';
      else btn.style.display = 'none';
    };
    window.addEventListener('scroll', toggleScrollButton);
    return () => window.removeEventListener('scroll', toggleScrollButton);
  }, [id]);

  const formatRuntime = (mins) => mins ? `${Math.floor(mins / 60)}h ${mins % 60}m` : 'N/A';
  const formatCurrency = (amount) => amount ? `$${amount.toLocaleString()}` : 'N/A';
  const trailerKey = movie?.videos?.results?.[0]?.key;

  if (loading) return <div className="loading">Loading...</div>;

  if (error || !movie) {
    return (
      <div className="error">
        <p>{error || 'Movie not found'}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const poster = getImageUrl(movie.poster_path, 'w500');
  const backdrop = getImageUrl(movie.backdrop_path, 'original');

  return (
    <>
      <Helmet>
        <title>{movie.title} - MovieHub</title>
        <meta name="description" content={movie.overview?.slice(0, 150)} />
      </Helmet>

      <div className="hero" style={{ backgroundImage: `url(${backdrop})` }} />

      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">← Back</button>

        <div className="details-wrapper">
          <div>
            <img src={poster} alt={movie.title} className="poster" />
          </div>

          <div className="info">
            {trailerKey && (
              <button className="watch-trailer-btn" onClick={() => setShowTrailer(true)}>
                ▶ Watch Trailer
              </button>
            )}

            <h1 className="title">{movie.title}</h1>
            {movie.tagline && <p className="tagline">"{movie.tagline}"</p>}

            <div className="genres">
              {movie.genres.map(genre => (
                <span key={genre.id} className="genre">{genre.name}</span>
              ))}
            </div>

            <div className="stats">
              <div><label>Rating</label><br /><strong>{movie.vote_average.toFixed(1)}</strong></div>
              <div><label>Runtime</label><br /><strong>{formatRuntime(movie.runtime)}</strong></div>
              <div><label>Year</label><br /><strong>{new Date(movie.release_date).getFullYear()}</strong></div>
              <div><label>Revenue</label><br /><strong>{formatCurrency(movie.revenue)}</strong></div>
            </div>

            <div className="overview">
              <h2>Overview</h2>
              <p>{movie.overview}</p>
            </div>

            {movie.production_companies?.length > 0 && (
              <div className="companies">
                <h2>Production Companies</h2>
                <div className="production-logos">
                  {movie.production_companies.map(company => (
                    company.logo_path && (
                      <img
                        key={company.id}
                        src={getImageUrl(company.logo_path, 'w200')}
                        alt={company.name}
                        title={company.name}
                      />
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* {movie.credits?.cast?.length > 0 && (
          <div className="cast-section">
            <h2>Cast</h2>
            <div className="carousel-wrapper">
              <button
                className="carousel-btn left"
                onClick={() => document.querySelector('.cast-carousel').scrollBy({ left: -300, behavior: 'smooth' })}
              >◀</button>

              <div className="cast-carousel">
                {movie.credits.cast.slice(0, 15).map(actor => (
                  <div key={actor.cast_id} className="cast-card">
                    <img loading="lazy" src={getImageUrl(actor.profile_path, 'w185')} alt={actor.name} />
                    <p className="actor-name">{actor.name}</p>
                    <p className="character-name">{actor.character}</p>
                  </div>
                ))}
              </div>

              <button
                className="carousel-btn right"
                onClick={() => document.querySelector('.cast-carousel').scrollBy({ left: 300, behavior: 'smooth' })}
              >▶</button>
            </div>
          </div>
        )} */}
      </div>

      {showTrailer && (
        <div className="modal">
          <div className="modal-content">
            <button onClick={() => setShowTrailer(false)} className="close-btn">✖</button>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}`}
              title="Trailer"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      <button
        className="scroll-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        id="scrollTopBtn"
        style={{ display: 'none' }}
      >
        ↑
      </button>
    </>
  );
}
