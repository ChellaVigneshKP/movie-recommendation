import Image from "next/image";
import { CastMember } from "@/types";

interface CastListProps {
  readonly cast: CastMember[];
}

export default function CastList({ cast }: CastListProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mt-12 relative">
      <h2 className="text-2xl font-bold mb-4">Top Billed Cast</h2>
      
      {/* Wrapper to Hide Scrollbar */}
      <div className="relative -mb-4 pb-8">
        <div className="flex overflow-x-auto gap-6 hide-scrollbar pb-8 -mb-4">
          {cast.length > 0 ? (
            cast.map((actor, index) => (
              <div key={actor.id} className="flex flex-col items-center min-w-[140px] sm:min-w-[160px] md:min-w-[180px]">
                {/* Circular Image */}
                <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[160px] md:h-[160px] rounded-full overflow-hidden shadow-md bg-white">
                  <Image
                    src={
                      actor.profile_path
                        ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
                        : "/assets/placeholder.png"
                    }
                    alt={actor.name}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                    unoptimized
                    priority={index < 5}
                  />
                </div>
                {/* Name & Role */}
                <div className="text-center w-full">
                  <p className="font-bold">{actor.name}</p>
                  <p className="text-sm text-gray-600">{actor.character || "Unknown Role"}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No cast information available.</p>
          )}
        </div>
      </div>
    </div>
  );
}