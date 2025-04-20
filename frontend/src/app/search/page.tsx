import { Suspense } from "react";
import SearchResults from "./SearchResults";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-white p-4">Loading search page...</div>}>
      <SearchResults />
    </Suspense>
  );
}
