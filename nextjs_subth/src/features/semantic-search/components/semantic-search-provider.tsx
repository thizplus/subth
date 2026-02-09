"use client";

import { SearchModal } from "./search-modal";
import { SearchFab } from "./search-fab";

export function SemanticSearchProvider() {
  return (
    <>
      <SearchFab />
      <SearchModal />
    </>
  );
}
