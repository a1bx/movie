import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { getImageUrl } from "../services/api";
import "./MovieDetailPage.css";

const API_KEY = "9fc83f4b4ecffacae057e947953eb886";
const BASE_URL = "https://api.themoviedb.org/3";

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchMovieDetails = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos`
        );
        const data = await res.json();
        setMovie(data);
      } catch {
        setError("Failed to fetch movie details.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();

    const carousel = document.querySelector(".cast-carousel");
    if (carousel) {
      let isDown = false;
      let startX;
      let scrollLeft;

      carousel.addEventListener("mousedown", (e) => {
        isDown = true;
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
      });

      carousel.addEventListener("mouseleave", () => (isDown = false));
      carousel.addEventListener("mouseup", () => (isDown = false));
      carousel.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
      });

      let touchStartX = 0;
      let touchScrollStart = 0;
      carousel.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
        touchScrollStart = carousel.scrollLeft;
      });
      carousel.addEventListener("touchmove", (e) => {
        const delta = touchStartX - e.touches[0].clientX;
        carousel.scrollLeft = touchScrollStart + delta;
      });
    }

    const btn = document.getElementById("scrollTopBtn");
    const toggleScrollButton = () => {
      if (btn) {
        btn.style.display = window.scrollY > 400 ? "block" : "none";
      }
    };
    window.addEventListener("scroll", toggleScrollButton);
    return () => window.removeEventListener("scroll", toggleScrollButton);
  }, [id]);

  const formatRuntime = (mins) =>
    mins ? `${Math.floor(mins / 60)}h ${mins % 60}m` : "N/A";
  
  const formatCurrency = (amount) =>
    amount ? `$${amount.toLocaleString()}` : "N/A";

  const trailerKey =
    movie?.videos?.results?.find(
      (v) => v.type === "Trailer" && v.official && v.site === "YouTube"
    )?.key ||
    movie?.videos?.results?.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    )?.key;

  useEffect(() => {
    if (!showTrailer || !trailerKey) return;

    const loadYouTubeAPI = () => {
      if (!window.YT) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    };

    let player;
    let updateInterval;

    window.onYouTubeIframeAPIReady = () => {
      player = new window.YT.Player("yt-player", {
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    };

    const onPlayerReady = (event) => {
      setTimeout(() => {
        setupControls(player);
        updateInterval = setInterval(updatePlayerTime, 200);
      }, 300);
    };

    const onPlayerStateChange = (event) => {
      const playIcon = document.querySelector(".play-icon");
      const pauseIcon = document.querySelector(".pause-icon");
      if (!playIcon || !pauseIcon) return;

      if (event.data === window.YT.PlayerState.PLAYING) {
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
      } else {
        playIcon.style.display = "block";
        pauseIcon.style.display = "none";
      }
    };

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const updatePlayerTime = () => {
      if (!player) return;

      const currentTimeEl = document.querySelector(".current-time");
      const durationEl = document.querySelector(".duration");
      const progressFill = document.querySelector(".progress-fill");

      if (!currentTimeEl || !durationEl || !progressFill) return;

      try {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();

        currentTimeEl.textContent = formatTime(currentTime);
        durationEl.textContent = formatTime(duration);

        const progressPercent = (currentTime / duration) * 100;
        progressFill.style.width = `${progressPercent}%`;
      } catch (error) {
        console.error("Error updating player time:", error);
      }
    };

    const setupControls = (player) => {
      const playPauseBtn = document.querySelector(".play-pause");
      const muteBtn = document.querySelector(".mute-btn");
      const volumeSlider = document.querySelector(".volume-slider");
      const progressBar = document.querySelector(".progress-bar");
      const fullscreenBtn = document.querySelector(".fullscreen-btn");

      if (!playPauseBtn || !muteBtn || !volumeSlider || !progressBar || !fullscreenBtn) {
        return;
      }

      volumeSlider.value = player.getVolume();

      playPauseBtn.addEventListener("click", () => {
        if (player.getPlayerState() === window.YT.PlayerState.PLAYING) {
          player.pauseVideo();
        } else {
          player.playVideo();
        }
      });

      muteBtn.addEventListener("click", () => {
        const volumeIcon = document.querySelector(".volume-icon");
        const muteIcon = document.querySelector(".mute-icon");
        if (player.isMuted()) {
          player.unMute();
          if (volumeIcon) volumeIcon.style.display = "block";
          if (muteIcon) muteIcon.style.display = "none";
        } else {
          player.mute();
          if (volumeIcon) volumeIcon.style.display = "none";
          if (muteIcon) muteIcon.style.display = "block";
        }
      });

      volumeSlider.addEventListener("input", (e) => {
        player.setVolume(e.target.value);
      });

      progressBar.addEventListener("click", (e) => {
        const rect = e.target.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        player.seekTo(player.getDuration() * percent);
      });

      fullscreenBtn.addEventListener("click", () => {
        const iframe = document.querySelector("#yt-player");
        if (!iframe) return;
        
        if (iframe.requestFullscreen) {
          iframe.requestFullscreen();
        } else if (iframe.webkitRequestFullscreen) {
          iframe.webkitRequestFullscreen();
        } else if (iframe.msRequestFullscreen) {
          iframe.msRequestFullscreen();
        }
      });
    };

    loadYouTubeAPI();

    return () => {
      if (player) player.destroy();
      if (updateInterval) clearInterval(updateInterval);
      window.onYouTubeIframeAPIReady = null;
    };
  }, [showTrailer, trailerKey]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error || !movie) {
    return (
      <div className="error">
        <p>{error || "Movie not found"}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const poster = getImageUrl(movie.poster_path, "w500");
  const backdrop = getImageUrl(movie.backdrop_path, "original");

  return (
    <>
      <Helmet>
        <title>{movie?.title || 'Movie'} - MovieHub</title>
        <meta name="description" content={movie?.overview?.slice(0, 150) || ''} />
      </Helmet>

      <div className="hero" style={{ backgroundImage: `url(${backdrop})` }} />

      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>

        <div className="details-wrapper">
          <div>
            <img src={poster} alt={movie?.title || 'Movie poster'} className="poster" />
          </div>

          <div className="info">
            {trailerKey && (
              <button
                className="watch-trailer-btn"
                onClick={() => setShowTrailer(true)}
              >
                ▶ Watch Trailer
              </button>
            )}

            <h1 className="title">{movie?.title}</h1>
            {movie?.tagline && <p className="tagline">"{movie.tagline}"</p>}

            <div className="genres">
              {movie?.genres?.map((genre) => (
                <span key={genre.id} className="genre">
                  {genre.name}
                </span>
              ))}
            </div>

            <div className="stats">
              <div>
                <label>Rating</label>
                <br />
                <strong>{movie?.vote_average?.toFixed(1)}</strong>
              </div>
              <div>
                <label>Runtime</label>
                <br />
                <strong>{formatRuntime(movie?.runtime)}</strong>
              </div>
              <div>
                <label>Year</label>
                <br />
                <strong>{movie?.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</strong>
              </div>
              <div>
                <label>Revenue</label>
                <br />
                <strong>{formatCurrency(movie?.revenue)}</strong>
              </div>
            </div>

            <div className="overview">
              <h2>Overview</h2>
              <p>{movie?.overview || 'No overview available.'}</p>
            </div>

            {movie?.production_companies?.length > 0 && (
              <div className="companies">
                <h2>Production Companies</h2>
                <div className="production-logos">
                  {movie.production_companies.map(
                    (company) =>
                      company.logo_path && (
                        <img
                          key={company.id}
                          src={getImageUrl(company.logo_path, "w200")}
                          alt={company.name}
                          title={company.name}
                        />
                      )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showTrailer && (
        <div className="modal">
          <div className="modal-content">
            <div className="player-controls">
              <div className="player-header">
                <span className="trailer-title">{movie?.title || 'Movie'} - Trailer</span>
                <button
                  onClick={() => setShowTrailer(false)}
                  className="close-btn"
                >
                  ✖
                </button>
              </div>

              <div className="video-container" id="video-container">
                <iframe
                  id="yt-player"
                  src={`https://www.youtube.com/embed/${trailerKey}?enablejsapi=1&autoplay=1&modestbranding=1&controls=0`}
                  title={`${movie?.title || 'Movie'} Trailer`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>

                <div className="custom-controls">
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                  </div>

                  <div className="controls-bar">
                    <button className="control-btn play-pause" aria-label="Play/Pause">
                      <span className="play-icon">▶</span>
                      <span className="pause-icon" style={{ display: "none" }}>❚❚</span>
                    </button>

                    <div className="time-display">
                      <span className="current-time">0:00</span> /
                      <span className="duration">0:00</span>
                    </div>

                    <button className="control-btn mute-btn" aria-label="Mute/Unmute">
                      <span className="volume-icon">🔊</span>
                      <span className="mute-icon" style={{ display: "none" }}>🔇</span>
                    </button>

                    <div className="volume-control">
                      <input
                        type="range"
                        className="volume-slider"
                        min="0"
                        max="100"
                        defaultValue="100"
                        aria-label="Volume control"
                      />
                    </div>

                    <button className="control-btn fullscreen-btn" aria-label="Fullscreen">
                      <span className="fullscreen-icon">⛶</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        className="scroll-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        id="scrollTopBtn"
        style={{ display: "none" }}
      >
        ↑
      </button>
    </>
  );
}