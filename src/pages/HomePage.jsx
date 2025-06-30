import { useState, useEffect, useRef, useCallback } from "react";
import MovieCard from "../components/MovieCard";
import SearchIcon from "../search.svg";
import "./HomePage.css";

const API_KEY = "9fc83f4b4ecffacae057e947953eb886";
const BASE_URL = "https://api.themoviedb.org/3";

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const trendingRef = useRef(null);
  const popularRef = useRef(null);
  const upcomingRef = useRef(null);

  useEffect(() => {
    fetchTrendingMovies();
    fetchPopularMovies();
    fetchUpcomingMovies();
  }, []);

  // Enhanced carousel drag/swipe handler
  const setupCarouselDrag = useCallback((ref) => {
    const carousel = ref.current;
    if (!carousel) return;

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;
    let velocity = 0;
    let animationFrame;
    let lastTime = 0;
    let lastScrollLeft = 0;

    const mouseDownHandler = (e) => {
      isDragging = true;
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
      carousel.style.cursor = 'grabbing';
      carousel.style.scrollBehavior = 'auto';
      cancelMomentumTracking();
    };

    const mouseMoveHandler = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 1.5; // Adjust multiplier for sensitivity
      carousel.scrollLeft = scrollLeft - walk;
    };

    const mouseUpHandler = () => {
      isDragging = false;
      carousel.style.cursor = 'grab';
      beginMomentumTracking();
    };

    const touchStartHandler = (e) => {
      isDragging = true;
      startX = e.touches[0].pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
      carousel.style.scrollBehavior = 'auto';
      cancelMomentumTracking();
    };

    const touchMoveHandler = (e) => {
      if (!isDragging) return;
      const x = e.touches[0].pageX - carousel.offsetLeft;
      const walk = (x - startX) * 1.5;
      carousel.scrollLeft = scrollLeft - walk;
    };

    const touchEndHandler = () => {
      isDragging = false;
      beginMomentumTracking();
    };

    // Momentum animation for smoother scrolling
    const beginMomentumTracking = () => {
      cancelMomentumTracking();
      lastScrollLeft = carousel.scrollLeft;
      lastTime = performance.now();
      animationFrame = requestAnimationFrame(momentumAnimation);
    };

    const cancelMomentumTracking = () => {
      cancelAnimationFrame(animationFrame);
    };

    const momentumAnimation = (time) => {
      const delta = time - lastTime;
      if (delta > 100) {
        lastTime = time;
        lastScrollLeft = carousel.scrollLeft;
        animationFrame = requestAnimationFrame(momentumAnimation);
        return;
      }

      const newScrollLeft = carousel.scrollLeft;
      const distance = newScrollLeft - lastScrollLeft;
      velocity = distance / delta;
      lastTime = time;
      lastScrollLeft = newScrollLeft;

      if (isDragging) {
        cancelMomentumTracking();
        return;
      }

      if (Math.abs(velocity) > 0.5) {
        carousel.scrollLeft += velocity * 15;
        animationFrame = requestAnimationFrame(momentumAnimation);
      }
    };

    // Add event listeners
    carousel.addEventListener('mousedown', mouseDownHandler);
    carousel.addEventListener('mousemove', mouseMoveHandler);
    carousel.addEventListener('mouseup', mouseUpHandler);
    carousel.addEventListener('mouseleave', mouseUpHandler);
    carousel.addEventListener('touchstart', touchStartHandler, { passive: false });
    carousel.addEventListener('touchmove', touchMoveHandler, { passive: false });
    carousel.addEventListener('touchend', touchEndHandler);

    // Prevent vertical scroll when swiping horizontally
    const preventVerticalScroll = (e) => {
      if (isDragging) {
        e.preventDefault();
      }
    };
    carousel.addEventListener('touchmove', preventVerticalScroll, { passive: false });

    // Cleanup function
    return () => {
      carousel.removeEventListener('mousedown', mouseDownHandler);
      carousel.removeEventListener('mousemove', mouseMoveHandler);
      carousel.removeEventListener('mouseup', mouseUpHandler);
      carousel.removeEventListener('mouseleave', mouseUpHandler);
      carousel.removeEventListener('touchstart', touchStartHandler);
      carousel.removeEventListener('touchmove', touchMoveHandler);
      carousel.removeEventListener('touchend', touchEndHandler);
      carousel.removeEventListener('touchmove', preventVerticalScroll);
      cancelMomentumTracking();
    };
  }, []);

  // Initialize drag/swipe for carousels
  useEffect(() => {
    const cleanups = [
      setupCarouselDrag(trendingRef),
      setupCarouselDrag(popularRef),
      setupCarouselDrag(upcomingRef),
    ];

    return () => cleanups.forEach((cleanup) => cleanup && cleanup());
  }, [setupCarouselDrag]);

  const fetchTrendingMovies = async () => {
    const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
    const data = await res.json();
    setTrendingMovies(data.results);
  };

  const fetchPopularMovies = async () => {
    const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    const data = await res.json();
    setPopularMovies(data.results);
  };

  const fetchUpcomingMovies = async () => {
    const res = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`);
    const data = await res.json();
    setUpcomingMovies(data.results);
  };

  const searchMovies = async (title) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${title}`);
      const data = await res.json();
      setSearchResults(data.results);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) searchMovies(searchTerm);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="app">
      <h1>Movie Arcade</h1>

      <div className="search">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for movies"
        />
        <img
          src={SearchIcon}
          alt="search"
          onClick={handleSearch}
          className={isLoading ? "disabled" : ""}
        />
      </div>

      {searchTerm ? (
        isLoading ? (
          <div className="loader">
            <div className="spinner"></div>
            <p>Loading movies...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <section>
            <h2 className="section-title">Search Results</h2>
            <div className="container">
              {searchResults.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        ) : (
          <div className="empty">
            <h2>No movies found</h2>
          </div>
        )
      ) : (
        <>
          <section className="carousel-section">
            <h2 className="section-title">Coming Soon</h2>
            <div className="carousel" ref={upcomingRef}>
              {upcomingMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>

          <section className="carousel-section">
            <h2 className="section-title">Trending Now</h2>
            <div className="carousel" ref={trendingRef}>
              {trendingMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>

          <section className="carousel-section">
            <h2 className="section-title">Popular Movies</h2>
            <div className="carousel" ref={popularRef}>
              {popularMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default HomePage;