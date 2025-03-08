export async function getMovies() {
    const API_URL = "https://api.themoviedb.org/3/movie/popular?api_key=8b5e398b9f49b07797328e8bee14b93b&language=en-US&page=1";

    try {
        const res = await fetch(API_URL, { cache: "no-store" }); // Prevent caching for fresh data
        if (!res.ok) {
            throw new Error("Failed to fetch movies");
        }
        const data = await res.json();
        return data.results;
    } catch (error) {
        console.error("Error fetching movies:", error);
        return [];
    }
}
