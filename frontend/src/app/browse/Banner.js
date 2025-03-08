import PropTypes from "prop-types";
import Image from "next/image";
import { IoMdPlay } from "react-icons/io";
import { AiOutlineInfoCircle } from "react-icons/ai";

const Banner = ({ movie }) => {
    if (!movie) return <div className="h-[85vh] flex items-center justify-center">No movies available</div>;

    return (
        <section className="relative w-full h-[85vh]">
            <Image
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                alt={movie.title}
                fill
                className="object-cover opacity-90"
            />
            <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 bg-gradient-to-b from-black/70 via-black/30 to-black">
                <h2 className="text-3xl md:text-5xl font-bold">{movie.title}</h2>
                <p className="text-gray-300 mt-2 max-w-lg">{movie.overview}</p>
                <div className="mt-5 flex gap-3">
                    <button className="bg-white text-black px-4 md:px-6 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-gray-200">
                        <IoMdPlay className="w-4 h-4 md:w-5 md:h-5" /> Play
                    </button>
                    <button className="bg-gray-600 text-white px-4 md:px-6 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-gray-700">
                        <AiOutlineInfoCircle className="w-5 h-5" /> More Info
                    </button>
                </div>
            </div>
        </section>
    );
};

// ✅ Define expected props and types
Banner.propTypes = {
    movie: PropTypes.shape({
        title: PropTypes.string.isRequired,
        backdrop_path: PropTypes.string.isRequired,
        overview: PropTypes.string.isRequired,
    }).isRequired,
};

export default Banner;
