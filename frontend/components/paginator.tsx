"use client";

import { useEffect, useState } from "react";

type PaginatorProps = {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
};

const btnCls =
"rounded border border-black border bg-white px-3 py-1 text-sm hover:bg-gray-50 " +
"disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white";  

export default function Paginator({ page, perPage, total, onPageChange, onPerPageChange }: PaginatorProps) {
  const [perPageInput, setPerPageInput] = useState(String(perPage));
  const totalPages = Math.max(1, Math.ceil(total / perPage));
	
  const MIN_PER_PAGE = 1;
  const MAX_PER_PAGE = 100;
 
  useEffect(() => {
	setPerPageInput(String(perPage));
  }, [perPage]);
  
  const canPrev = page > 1;
  const canNext = page < totalPages;
  
  const firstRow = total === 0 ? 0 : (page - 1) * perPage + 1;
  const lastRow = Math.min(page * perPage, total);
  
  function commitPerPage() {
    const trimmed = perPageInput.trim();
    const n = Number(trimmed);
    const clamped = Number.isFinite(n)
      ? Math.min(MAX_PER_PAGE, Math.max(MIN_PER_PAGE, Math.floor(n)))
      : perPage;

    setPerPageInput(String(clamped));
    if (clamped !== perPage) onPerPageChange(clamped);
  }

    return (
    <div className="flex items-center gap-3 text-sm">
      <span>
        Showing <span className="font-medium">{firstRow}</span>
        {" - "}
        <span className="font-medium">{lastRow}</span> of{" "}
        <span className="font-medium">{total}</span>
      </span>

      <div className="ml-auto flex items-center gap-2">
        <button onClick={() => onPageChange(page - 1)} disabled={!canPrev} className={btnCls}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button onClick={() => onPageChange(page + 1)} disabled={!canNext} className={btnCls}>
          Next
        </button>

        <label className="flex items-center gap-2 ">
          Per page:
          <input
            type="number"
            min={MIN_PER_PAGE}
            max={MAX_PER_PAGE}
            value={perPageInput}
            onChange={(e) => setPerPageInput(e.target.value)}
            onBlur={commitPerPage}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitPerPage();
              }
            }}
            className="w-16 rounded border border-black border px-2 py-1 bg-white text-sm"
          />
        </label>
      </div>
    </div>
  );
}