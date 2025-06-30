import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { searchMovies } from '../services/api';
import { Movie } from '../types/movie';
import MovieCard from '../components/moviecard';
import LoadingSpinner from '../components/LoadingSpinner';
const SearchResultsPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('query') || '';
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  useEffect(() => {
    if (!query) return;
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const data = await searchMovies(query, page);
        setMovies(prev => page === 1 ? data.results : [...prev, ...data.results]);
        setTotalPages(data.total_pages);
      } catch (err) {
        setError('Failed to fetch search results. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSearchResults();
  }, [query, page]);
  // Reset page when query changes
  useEffect(() => {
    setPage(1);
    setMovies([]);
  }, [query]);
  const loadMore = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };
  if (!query) {
    return <div className="text-center py-20">
        <p>Please enter a search term to find movies.</p>
      </div>;
  }
  return <div>
      <h1 className="text-3xl font-bold mb-2">Search Results</h1>
      <p className="text-gray-400 mb-8">Showing results for: "{query}"</p>
      {loading && page === 1 ? <LoadingSpinner /> : error && movies.length === 0 ? <div className="text-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => {
        setError('');
        setPage(1);
      }} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700">
            Try Again
          </button>
        </div> : movies.length > 0 ? <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
          </div>
          {page < totalPages && <div className="mt-10 text-center">
              <button onClick={loadMore} disabled={loading} className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>}
        </> : <p className="text-center py-20">No movies found matching "{query}".</p>}
    </div>;
};
export default SearchResultsPage;