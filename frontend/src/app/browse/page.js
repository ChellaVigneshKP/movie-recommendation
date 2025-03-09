import { getMovies } from "@/lib/movies";
import Banner from "./Banner";
import Navbar from "./Navbar"
import MovieList from "./MovieList";
import Footer from "./Footer";

export default async function BrowsePage() {
  const movies = await getMovies();
  const random = movies.length > 0 ? Math.floor(Math.random() * movies.length) : 0;
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Banner movie={movies.length > 0 ? movies[random] : null} />
      <MovieList movies={movies} />
      <Footer />
    </div>
  );
}