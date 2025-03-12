import axios from 'axios';

export const formatTrailerUrl = (url: string): string | null => {
  if (!url) return null;
  if (url.includes("watch?v=")) {
    return url.replace("watch?v=", "embed/");
  } else if (url.includes("youtu.be/")) {
    return url.replace("youtu.be/", "www.youtube-nocookie.com/embed/");
  }
  return url;
};

export const getTrailerUrl = async (movieId: number): Promise<string | null> => {
  try {
    const response = await axios.get(`/api/getTrailer?movieId=${movieId}`);
    if (response.data.type === 'Success' && response.data.videoUrl) {
      const formattedUrl = formatTrailerUrl(response.data.videoUrl);
      return formattedUrl;
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};
