import { getMovies } from "@/lib/movies"; // Server fetch function
import Banner from "./Banner";
import Navbar from "./Navbar"
import MovieList from "./MovieList";
import Footer from "./Footer";

export default async function BrowsePage() {
  const movies = await getMovies(); // ✅ This runs only on the server
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Banner movie={movies.length > 0 ? movies[0] : null} />
      <MovieList movies={movies} />
      <Footer />
    </div>
  );
}
