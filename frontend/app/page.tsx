"use client";

import { useEffect, useState } from "react";
import type { MentionsResponse } from "@/lib/types";
import Paginator  from "@/components/paginator"

// TODO: Build a Brand Mentions Dashboard with:
//
// 1. A mentions table with pagination
//    - Show: query_text, model, mentioned (yes/no), position, sentiment, citation_url, date
//    - Paginate through results
//
// 2. Filter controls
//    - Model dropdown (chatgpt, claude, gemini, perplexity)
//    - Sentiment dropdown (positive, neutral, negative)
//    - Date range inputs
//
// 3. A trend chart (line or bar)
//    - Show total mentions vs. mentioned=true over time
//    - Use recharts or any charting library
//
// 4. Loading and empty states
//
// API base URL: http://localhost:8000
// See /lib/types.ts for request/response types

export default function Dashboard() {
  const [mentions, setMentions] = useState<Mention[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [page, setPage] = useState<int>(1)
  const [perPage, setPerPage] = useState<int>(25)

  useEffect(() => {
    async function load() {
      try {
		const res = await fetch("http://localhost:8000/mentions", {
						  method: "POST",
						  headers: {
							"Content-Type": "application/json",
						  },
						  body: JSON.stringify({
							page: page,
							per_page: perPage,
						  }),
						});
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body: MentionsResponse = await res.json();
        setMentions(body.data);
        setTotal(body.total);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page, perPage]);
  
   function handlePerPageChange(next: number) {
    setPerPage(next);
    setPage(1);
  }

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Brand Mentions Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Query</th>
            <th>Model</th>
            <th>Mentioned</th>
            <th>Position</th>
            <th>Sentiment</th>
            <th>Citation URL</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {mentions.map((m) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.query_text}</td>
              <td>{m.model}</td>
              <td>{m.mentioned ? "Yes" : "No"}</td>
              <td>{m.position ?? "—"}</td>
              <td>{m.sentiment ?? "—"}</td>
              <td>
                {m.citation_url ? (
                  <a href={m.citation_url} target="_blank" rel="noreferrer">
                    {m.citation_url}
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td>{new Date(m.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
	  <Paginator
            page={page}
            perPage={perPage}
            total={total}
            onPageChange={setPage}
			onPerPageChange={handlePerPageChange}
          />
    </main>
  );
}

