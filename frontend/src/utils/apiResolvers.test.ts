import { describe, it, expect, vi } from "vitest";
import { parse } from "@/utils/apiResolvers";
import { MediaType } from "@/types";

// Mock genres to match test cases
vi.mock("@/config/genres", () => ({
  genres: {
    movie: [
      { id: 28, name: "Action" },
      { id: 12, name: "Adventure" },
      { id: 16, name: "Animation" },
    ],
    tv: [
      { id: 35, name: "Comedy" },
      { id: 18, name: "Drama" },
      { id: 10765, name: "Sci-Fi & Fantasy" },
    ],
  },
}));

describe("parse function", () => {
  it("should correctly parse media elements", () => {
    const input = [
      {
        id: 1,
        title: "Test Movie",
        vote_average: 8.5,
        overview: "Test Overview",
        poster_path: "/test_poster.jpg",
        backdrop_path: "/test_banner.jpg",
        genre_ids: [28, 12],
      },
    ];

    const result = parse(input, MediaType.MOVIE);

    expect(result).toEqual([
      {
        id: 1,
        title: "Test Movie",
        rating: 8.5,
        overview: "Test Overview",
        poster: "https://image.tmdb.org/t/p/w500/test_poster.jpg",
        banner: "https://image.tmdb.org/t/p/original/test_banner.jpg",
        genre: [
          { id: 28, name: "Action" },
          { id: 12, name: "Adventure" },
        ],
      },
    ]);
  });

  it("should use 'Untitled' when title and name are missing", () => {
    const input = [
      {
        id: 2,
        vote_average: 7.2,
        overview: "Another Test Overview",
        poster_path: "/another_poster.jpg",
        backdrop_path: "/another_banner.jpg",
        genre_ids: [16],
      },
    ];

    const result = parse(input, MediaType.MOVIE);

    expect(result[0].title).toBe("Untitled");
  });

  it("should return default image when poster or banner is missing", () => {
    const input = [
      {
        id: 3,
        title: "Missing Images",
        vote_average: 5.5,
        overview: "Overview",
        poster_path: "", // No poster
        backdrop_path: "", // No banner
        genre_ids: [],
      },
    ];

    const result = parse(input, MediaType.MOVIE);

    expect(result[0].poster).toBe("/assets/no-results.jpg");
    expect(result[0].banner).toBe("/assets/no-results.jpg");
  });

  it("should limit genres to a maximum of 3", () => {
    const input = [
      {
        id: 4,
        title: "Test Show",
        vote_average: 6.9,
        overview: "A TV Show Overview",
        poster_path: "/show_poster.jpg",
        backdrop_path: "/show_banner.jpg",
        genre_ids: [35, 18, 10765, 28], // 4 genres
      },
    ];

    const result = parse(input, MediaType.TV);

    expect(result[0].genre.length).toBe(3); // Should be limited to 3
  });

  it("should handle empty input array", () => {
    const result = parse([], MediaType.MOVIE);
    expect(result).toEqual([]);
  });

  it("should handle unknown genre IDs gracefully", () => {
    const input = [
      {
        id: 5,
        title: "Unknown Genre Movie",
        vote_average: 7.8,
        overview: "An unknown genre test.",
        poster_path: "/unknown_poster.jpg",
        backdrop_path: "/unknown_banner.jpg",
        genre_ids: [9999, 8888], // Unknown genres
      },
    ];

    const result = parse(input, MediaType.MOVIE);

    expect(result[0].genre).toEqual([]); // No matching genres
  });

  it("should correctly parse TV media elements", () => {
    const input = [
      {
        id: 6,
        name: "Test TV Show",
        vote_average: 8.9,
        overview: "A test TV show overview",
        poster_path: "/tv_poster.jpg",
        backdrop_path: "/tv_banner.jpg",
        genre_ids: [35, 18],
      },
    ];

    const result = parse(input, MediaType.TV);

    expect(result).toEqual([
      {
        id: 6,
        title: "Test TV Show",
        rating: 8.9,
        overview: "A test TV show overview",
        poster: "https://image.tmdb.org/t/p/w500/tv_poster.jpg",
        banner: "https://image.tmdb.org/t/p/original/tv_banner.jpg",
        genre: [
          { id: 35, name: "Comedy" },
          { id: 18, name: "Drama" },
        ],
      },
    ]);
  });
});