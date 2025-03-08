import PropTypes from "prop-types";
import Image from "next/image";

const MovieList = ({ movies }) => {
  return (
    <section className="px-6 md:px-10 py-8 bg-black">
      <h3 className="text-xl font-semibold mb-4">Popular on Netflix</h3>
      <div className="flex gap-3 overflow-x-scroll scrollbar-hide">
        {movies.slice(0, 10).map((movie) => (
          <Image
            key={movie.id}
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            width={250}
            height={140}
            alt={movie.title}
            className="rounded-md cursor-pointer"
          />
        ))}
      </div>
    </section>
  );
};

MovieList.propTypes = {
  movies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      poster_path: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default MovieList;
