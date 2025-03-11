import { Media, MediaType, ImageType } from '@/types';
import { genres } from '@/config/genres';


interface MediaElement {
  id: number;
  name?: string;
  title?: string;
  vote_average: number;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  genre_ids: number[];
}
export function parse(array: MediaElement[], type: MediaType): Media[] {
  const parsedResponse: Media[] = [];

  array.forEach((element: MediaElement): void => {
    const resolved: Media = {
      id: element.id,
      title: element.name || element.title || 'Untitled',
      rating: element.vote_average,
      overview: element.overview,
      poster: getImageUrl(element.poster_path, 'poster'),
      banner: getImageUrl(element.backdrop_path, 'original'),
      genre: getGenre(element.genre_ids, type)
    };

    parsedResponse.push(resolved);
  });

  return parsedResponse;
}

function getImageUrl(path: string, type: ImageType): string {
  if (!path) {
    return '/assets/no-results.jpg';
  }
  const dimension: string = type === 'poster' ? 'w500' : 'original';
  return `https://image.tmdb.org/t/p/${dimension}${path}`;
}

function getGenre(genreIds: number[], type: MediaType) {
  const result = genres[type].filter(item => genreIds.includes(item.id));
  if (result.length > 3) {
    return result.slice(0,3);
  }
  return result;
}
