const API_KEY = '9fc83f4b4ecffacae057e947953eb886';
const BASE_URL = 'https://api.themoviedb.org/3';

export const getImageUrl = (path, size = 'w500') => {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : '';
};

export const getMovieDetails = async (id) => {
  const res = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits`
  );
  if (!res.ok) throw new Error('Failed to fetch movie details');
  return res.json();
};
