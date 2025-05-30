import { Breakpoint } from '@/config/breakpoints';

export type Maybe<T> = T | null;

export type Dimension = {
  height: number;
  width: number;
};

export type DimensionDetail = {
  dimension: Dimension;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
};

export type Genre = {
  id: number;
  name: string;
};

export enum MediaType {
  MOVIE = 'movie',
  TV = 'tv',
}

export type Media = {
  id: number;
  title: string;
  overview: string;
  poster: string;
  banner: string;
  rating: number;
  genre: Genre[];
};

export type ImageType = 'poster' | 'original';

export type Section = {
  heading: string;
  endpoint: string;
  defaultCard?: boolean;
  topList?: boolean;
};

export type SpokenLanguage = {
  english_name: string;
  iso_639_1: string;
  name: string;
};


export type ProductionCompany = {
  id: number;
  logo_path: string;
  name: string;
  origin_country: string;
};

export type ProductionCountry = {
  iso_3166_1: string;
  name: string;
};

export type MediaFull = {
  adult: boolean;
  backdrop_path: string;
  belongs_to_collection: Collection | null;
  budget: number;
  genres: Genre[];
  homepage: string;
  id: number;
  imdb_id: string;
  origin_country: string[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  rating: number;
  predicted_rating: number;
};

export type Collection = {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
};


export type CastMember = {
  id: number;
  name: string;
  original_name: string;
  character: string;
  profile_path: string | null;
  gender: number;
  known_for_department: string;
  popularity: number;
  credit_id: string;
  order: number;
};

export type CastResponse = {
  type: "Success" | "Error";
  data: CastMember[];
};


export interface CollectionMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type: string;
  adult: boolean;
  original_language: string;
  genre_ids: number[];
  popularity: number;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface CollectionDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  parts: CollectionMovie[];
}


export interface MovieVideo {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface MovieVideosResponse {
  id: number;
  results: MovieVideo[];
}

export interface Video {
  id: string;
  name: string;
  type: string;
  site: string;
  url: string | null;
  published_at: string;
}