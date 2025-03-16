/* eslint-disable @next/next/no-img-element */
import { MediaFull } from "@/types";
import CollectionDetails from "./CollectionDetails";
interface MovieDetailsProps {
    movie: MediaFull;
}

export default function MovieDetailsSection({ movie }: MovieDetailsProps) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mt-12 text-white">
            <h2 className="text-2xl font-bold mb-4">Movie Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-10 text-gray-400">

                {movie.original_title && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-200">Original Title</h4>
                        <p>{movie.original_title}</p>
                    </div>
                )}
                {movie.original_language && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-200">Original Language</h4>
                        <p className="uppercase">{movie.original_language}</p>
                    </div>
                )}
                {movie.production_countries?.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-200">Origin Country</h4>
                        <p>{movie.production_countries.map((country) => country.iso_3166_1).join(", ") || "N/A"}</p>
                    </div>
                )}
                {movie.release_date && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-200">Release Date</h4>
                        <p>{new Date(movie.release_date).toLocaleDateString()}</p>
                    </div>
                )}
                {movie.budget > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-200">Budget</h4>
                        <p>${movie.budget.toLocaleString()}</p>
                    </div>
                )}
                {movie.revenue > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-200">Revenue</h4>
                        <p>${movie.revenue.toLocaleString()}</p>
                    </div>
                )}

                {/* Status */}
                {movie.status && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-200">Status</h4>
                        <p>{movie.status}</p>
                    </div>
                )}

                {/* Adult Content */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-200">Adult</h4>
                    <p>{movie.adult ? "Yes" : "No"}</p>
                </div>

                {/* IMDb Link */}
                {movie.imdb_id && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-200">IMDb</h4>
                        <a
                            href={`https://www.imdb.com/title/${movie.imdb_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                        >
                            View on IMDb
                        </a>
                    </div>
                )}
                {movie.homepage && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-200">Official Website</h4>
                        <a
                            href={movie.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                        >
                            Visit Homepage
                        </a>
                    </div>
                )}

                {/* Spoken Languages */}
                {movie.spoken_languages?.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-200">Spoken Languages</h4>
                        <p>{movie.spoken_languages.map((lang) => lang.english_name).join(", ") || "N/A"}</p>
                    </div>
                )}
                {movie.production_companies?.length > 0 && (
                    <div className="col-span-1 sm:col-span-2 md:col-span-3">
                        <h4 className="text-sm font-semibold text-gray-200 mb-2">Production Companies</h4>
                        <div className="flex flex-wrap gap-4">
                            {movie.production_companies.map((company) => (
                                <div key={company.id} className="flex items-center gap-2">
                                    {company.logo_path && (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                                            alt={company.name}
                                            className="w-16 h-auto object-contain bg-gray-800 p-2 rounded-md"
                                        />
                                    )}
                                    <p>{company.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {movie.belongs_to_collection && (
                <CollectionDetails collectionId={movie.belongs_to_collection.id} />
            )}

        </div>
    );
}