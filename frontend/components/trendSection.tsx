"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { TrendFilters, TrendGroupBy, TrendPoint } from "@/types";

const TrendChart = dynamic(() => import("./TrendChart"), { ssr: false });

const inputCls = "rounded border border-black px-2 py-1 text-sm";

export default function TrendSection() {
	console.log("HI")
   const [filters, setFilters] = useState<TrendFilters>({
	date_from: "",
	date_to: "",
	group_by: "day",
  });
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  async function load() {
    try {
	  const res = await fetch("http://localhost:8000/mentions/trends", {
					  method: "POST",
					  headers: {
						"Content-Type": "application/json",
					  },
					  body: JSON.stringify({
						date_from: filters.date_from || null,
						date_to: filters.date_to || null,
						group_by: filters.group_by
					  }),
					});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body: TrendPoint[] = await res.json();
      setTrend(body);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
  }
  load();
  }, [filters]);

  function update<K extends keyof TrendFilters>(key: K, value: TrendFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }
  return (
    <div className="mb-8 rounded-lg bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          From:
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => update("date_from", e.target.value)}
            className={inputCls}
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          To:
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => update("date_to", e.target.value)}
            className={inputCls}
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          Group by:
          <select
            value={filters.group_by}
            onChange={(e) => update("group_by", e.target.value as TrendGroupBy)}
            className={inputCls}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
          </select>
        </label>
      </div>

      {error && <p className="text-sm text-red-600">Error: {error}</p>}

      {loading && <div className="h-72 w-full animate-pulse rounded" />}

      {!loading && !error && trend.length === 0 && (
        <div className="flex h-72 items-center justify-center text-sm">
          No data for this period.
        </div>
      )}

      {!loading && !error && trend.length > 0 && <TrendChart data={trend} />}
    </div>
  );
}