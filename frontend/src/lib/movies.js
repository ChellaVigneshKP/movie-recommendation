export async function getMovies() {
    const API_URL = "https://api.themoviedb.org/3/movie/popular?api_key=API_KEY&language=en-US&page=1";

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
