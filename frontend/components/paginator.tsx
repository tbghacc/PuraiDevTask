"use client";

import { useState } from "react";

type PaginatorProps = {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
};

export default function Paginator({ page, perPage, total, onPageChange, onPerPageChange }: PaginatorProps) {
  const [perPageInput, setPerPageInput] = useState(String(perPage));
  const totalPages = Math.max(1, Math.ceil(total / perPage));
	
  const minPages = 1;
  const maxPages = 100; 
	
  if (totalPages <= 1) return null;
  const canPrev = page > 1;
  const canNext = page < totalPages;
  
  function commitPerPage() {
    const trimmed = perPageInput.trim();
    const n = Number(trimmed);
    const clamped = Number.isFinite(n)
      ? Math.min(maxPages, Math.max(minPages, Math.floor(n)))
      : perPage;

    setPerPageInput(String(clamped));
    if (clamped !== perPage) onPerPageChange(clamped);
  }

  return (
    <div className="flex items-center gap-3 mt-2 mb-2 justify-end">
      <button onClick={() => onPageChange(page - 1)} disabled={!canPrev}>
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button onClick={() => onPageChange(page + 1)} disabled={!canNext}>
        Next
      </button>
	  <label>
        Per page:
        <input
          type="number"
          min={minPages}
          max={maxPages}
          value={perPageInput}
          onChange={(e) => setPerPageInput(e.target.value)}
          onBlur={commitPerPage}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitPerPage();
            }
          }}
        />
      </label>
    </div>
  );
}