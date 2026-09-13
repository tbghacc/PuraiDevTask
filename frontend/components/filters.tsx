"use client";

import type { MentionFilters } from "@/lib/types";

type FiltersProps = {
  filters: MentionFilters;
  models: string[];
  onChange: (filters: MentionFilters) => void;
};

const inputCls = "rounded border border-black border px-2 py-1 bg-white text-sm";

export default function Filters({ filters, models, onChange }: FiltersProps) {
  function update<K extends keyof MentionFilters>(key: K, value: MentionFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm">
        Model:
        <select
          value={filters.model}
          onChange={(e) => update("model", e.target.value)}
          className={inputCls}
        >
          <option value="">All</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        Sentiment:
        <select
          value={filters.sentiment}
          onChange={(e) => update("sentiment", e.target.value as MentionFilters["sentiment"])}
          className={inputCls}
        >
          <option value="">All</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
      </label>

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
    </div>
  );
}