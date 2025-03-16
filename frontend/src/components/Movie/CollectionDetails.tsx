/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { ArrowRight, ImageOff, Clapperboard } from "lucide-react"; // Icons from lucide-react
import {Collection} from "@/types";
interface CollectionDetailsProps {
  readonly collectionId: number;
}

export default function CollectionDetails({ collectionId }: Readonly<CollectionDetailsProps>) {
  const [collection, setCollection] = useState<Collection|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollection() {
      try {
        const res = await fetch(`/api/collection?id=${collectionId}`);
        if (!res.ok) throw new Error("Failed to fetch collection");
        const data = await res.json();
        if (data.type === "Success") {
          setCollection(data.data);
        } else {
          throw new Error("Failed to load collection details");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchCollection();
  }, [collectionId]);

  if (loading) return <p className="text-gray-400">Loading collection details...</p>;
  if (!collection) return null;

  return (
    <div className="mt-12 border-t border-gray-700 pt-6">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Clapperboard className="w-6 h-6 text-gray-300" /> Part of {collection.name}
      </h2>
      <a
        href={`/collection/${collection.id}`}
        className="flex items-center gap-6 bg-gray-800/40 hover:bg-gray-800/70 p-4 rounded-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
      >
        {/* Collection Poster */}
        {collection.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${collection.poster_path}`}
            alt={collection.name}
            className="w-36 h-52 rounded-lg shadow-lg object-cover"
          />
        ) : (
          <div className="w-36 h-52 flex items-center justify-center bg-gray-700 rounded-lg">
            <ImageOff className="w-10 h-10 text-gray-400" />
          </div>
        )}
        
        {/* Collection Info */}
        <div className="flex-1">
          <p className="text-lg font-bold text-white">{collection.name}</p>
          <p className="text-sm text-gray-400 mt-1">
            {collection.overview ? collection.overview : "No overview available."}
          </p>
          <div className="mt-4">
            <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition">
              View Collection <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </a>
    </div>
  );
}