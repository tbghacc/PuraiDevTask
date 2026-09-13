"use client";

import { useEffect, useState } from "react";
import type { MentionsResponse } from "@/lib/types";
import Paginator  from "@/components/paginator"
import dynamic from "next/dynamic";
import type { TrendPoint } from "@/types";

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
  const TrendChart = dynamic(() => import("@/components/TrendChart"), { ssr: false });
	
  const [mentions, setMentions] = useState<Mention[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  
  const [page, setPage] = useState<int>(1)
  const [perPage, setPerPage] = useState<int>(25)
  
  useEffect(() => {
  async function load() {
    try {
	  const res = await fetch("http://localhost:8000/mentions/trends", {
					  method: "POST",
					  headers: {
						"Content-Type": "application/json",
					  },
					  body: JSON.stringify({
						date_from: "2025-01-01",
						date_to: "2025-03-01"
					  }),
					});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body: TrendPoint[] = await res.json();
      setTrend(body);
    } catch (e) {
      console.error("trend failed:", e);
    }
  }
  load();
  }, []);

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
      <h1 className="text-center text-2xl font-bold mb-6">Brand Mentions Dashboard</h1>
	  <div>
		  <Paginator
			page={page}
			perPage={perPage}
			total={total}
			onPageChange={setPage}
			onPerPageChange={handlePerPageChange}
		  />
		  <table className="w-full border-collapse border">
			<thead>
			  <tr>
				<th className="text-left border p-1">  ID </th>
				<th className="text-left border p-1"> Query</th>
				<th className="text-left border p-1"> Model</th>
				<th className="text-left border p-1"> Mentioned</th>
				<th className="text-left border p-1"> Position</th>
				<th className="text-left border p-1"> Sentiment</th>
				<th className="text-left border p-1"> Citation URL</th>
				<th className="text-left border p-1"> Created At</th>
			  </tr>
			</thead>
			<tbody>
			  {mentions.map((m) => (
				<tr key={m.id}>
				  <td className="text-left border p-1">{m.id}</td>
				  <td className="text-left border p-1">{m.query_text}</td>
				  <td className="text-left border p-1">{m.model}</td>
				  <td className="text-left border p-1">{m.mentioned ? "Yes" : "No"}</td>
				  <td className="text-left border p-1">{m.position ?? "—"}</td>
				  <td className="text-left border p-1">{m.sentiment ?? "—"}</td>
				  <td className="text-left border p-1">
					{m.citation_url ? (
					  <a href={m.citation_url} target="_blank" rel="noreferrer">
						{m.citation_url}
					  </a>
					) : (
					  "—"
					)}
				  </td>
				  <td className="text-left border p-1">{new Date(m.created_at).toLocaleString()}</td>
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
	   </div>
	    {trend.length > 0 && (
		<div className="mb-8 rounded-lg bg-white p-4 shadow-sm">
		  <TrendChart data={trend} />
		</div>
		)}
    </main>
  );
}

