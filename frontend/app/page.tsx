"use client";

import { useEffect, useState } from "react";
import type { MentionsResponse } from "@/lib/types";
import Paginator  from "@/components/paginator"
import Filters from "@/components/filters";
import TrendSection from "@/components/trendSection";
import TableSkeleton from "@/components/tableSkeleton";
import ErrorState from "@/components/errorState";

export default function Dashboard() {

	
  const [mentions, setMentions] = useState<Mention[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  
  
  const [filters, setFilters] = useState<MentionFilters>({
    model: "",
    sentiment: "",
    date_from: "",
    date_to: "",
  });
  
  const [models, setModels] = useState<string[]>([]);

  useEffect(() => {
	  fetch("http://localhost:8000/mentions/models")
		.then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
		.then((data: string[]) => setModels(data))
		.catch((e) => console.error("models failed:", e));
  }, []);

  useEffect(() => {
    async function load() {
      try {
		//setLoading(true); looks awful
		setError(null);
		const res = await fetch("http://localhost:8000/mentions", {
						  method: "POST",
						  headers: {
							"Content-Type": "application/json",
						  },
						  body: JSON.stringify({
							page: page,
							per_page: perPage,
							model: filters.model || null,
							sentiment: filters.sentiment || null,
							date_from: filters.date_from || null,
							date_to: filters.date_to || null
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
  }, [page, perPage, filters]);
  
  const longestModel = Math.max("Model".length, ...models.map((m) => m.length));
  const idWidth = Math.max(5, String(total).length) + 3;
  
  function handlePerPageChange(next: number) {
    setPerPage(next);
    setPage(1);
  }
  
  function updateFilters(next: MentionFilters) {
    setFilters(next);
    setPage(1);
  }

  return (
    <main className="min-h-screen p-8 ">
	  <h1 className="text-center text-2xl font-bold mb-6">Brand Mentions Dashboard</h1>
	  {error && <ErrorState message={error}/>}
	  {loading && <TableSkeleton rows={Math.min(perPage, 15)} idWidth={idWidth} longestModel={longestModel}/>}
      {!loading && !error && (<>
	  <div>
		  <div className="flex justify-between mt-4 mb-4">
			  <Filters filters={filters} models={models} onChange={updateFilters} />
			  <Paginator
					page={page}
					perPage={perPage}
					total={total}
					onPageChange={setPage}
					onPerPageChange={handlePerPageChange}
				  />
		   </div>
		  <table className="w-full border-collapse table-fixed border border-2"> 
			<thead>
			  <tr>
				<th className="text-left bg-sky-500 border p-2 whitespace-nowrap" style={{ width: `${idWidth}ch` }}>  ID </th>
				<th className="text-left bg-sky-500 border p-2 whitespace-nowrap" style={{ width: "25%" }}> Query </th>
				<th className="text-left bg-sky-500 border p-2 whitespace-nowrap" style={{ width: `${longestModel}ch` }}> Model</th>
				<th className="text-left bg-sky-500 border p-2 whitespace-nowrap" style={{ width: "11ch" }}> Mentioned</th>
				<th className="text-left bg-sky-500 border p-2 whitespace-nowrap" style={{ width: "10ch" }}> Position</th>
				<th className="text-left bg-sky-500 border p-2 whitespace-nowrap" style={{ width: "11ch" }}> Sentiment</th>
				<th className="text-left bg-sky-500 border p-2 whitespace-nowrap" style={{ width: "25%" }}> Citation URL</th>
				<th className="text-left bg-sky-500 border p-2 whitespace-nowrap" style={{ width: "22%" }}> Created At</th>
			  </tr>
			</thead>
			<tbody>
			  {mentions.map((m) => (
				<tr key={m.id}>	
				  <td className="text-left bg-sky-300 border p-2 whitespace-nowrap">{m.id}</td>
				  <td className="text-left bg-sky-300 border p-2">{m.query_text}</td>
				  <td className="text-left bg-sky-300 border p-2 whitespace-nowrap">{m.model}</td>
				  <td className="text-left bg-sky-300 border p-2">{m.mentioned ? "Yes" : "No"}</td>
				  <td className="text-left bg-sky-300 border p-2">{m.position ?? "-"}</td>
				  <td className="text-left bg-sky-300 border p-2">{m.sentiment ?? "-"}</td>
				  <td className="text-left bg-sky-300 border p-2 break-words">
					{m.citation_url ? (
					  <a target="_blank" rel="noreferrer">
						{m.citation_url}
					  </a>
					) : (
					  "-"
					)}
				  </td>
				  <td className="text-left bg-sky-300 border p-2">{new Date(m.created_at).toLocaleString(undefined, {year: "2-digit",
																													 month: "numeric",
																													 day: "numeric",
																													 hour: "numeric",
																													 minute: "2-digit",
																													})}</td>
				</tr>
			  ))}
			</tbody>
		  </table>
		  <div className="flex justify-between mt-4 mb-4">
			  <Filters filters={filters} models={models} onChange={updateFilters} />
			  <Paginator
					page={page}
					perPage={perPage}
					total={total}
					onPageChange={setPage}
					onPerPageChange={handlePerPageChange}
				  />
		   </div>
	   </div>
	   <hr className="mb-5"/>
	   <h2 className="text-center text-xl font-bold mb-6">Trend Chart</h2>
		<div className="mb-8 rounded-lg bg-white p-4 border border-2 border-black">
		   <TrendSection />
		</div>
	  </>)}
    </main>
  );
}

