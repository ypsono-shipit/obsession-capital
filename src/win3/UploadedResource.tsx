import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import MarkdownBody from "./MarkdownBody.tsx";
import { ResourceRecord } from "./builtinResources.ts";

export default function UploadedResource({ slug }: { slug: string }) {
  const [resource, setResource] = useState<ResourceRecord | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetch(`/api/resources/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (res.status === 404) {
          if (!cancelled) setStatus("missing");
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load this playbook.");
        if (!cancelled) {
          setResource(data);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#070707] text-[#d1d1d1] font-mono text-xs">
      <div className="border-b border-[#222] bg-[#0a0a0a] px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <a href="https://obsession.club" className="text-white font-bold bg-neutral-900 px-2 py-0.5 border border-neutral-800 tracking-wider text-xs">
          [ OBSESSION_OS ]
        </a>
        <a href="/resource" className="text-[10px] font-mono text-[#555] uppercase tracking-widest hover:text-white transition flex items-center gap-1.5">
          <ArrowLeft className="w-3 h-3" /> Library
        </a>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {status === "loading" && <p className="text-[#555] font-mono text-[11px]">Loading playbook…</p>}

        {status === "missing" && (
          <div>
            <h1 className="text-white font-mono text-xl font-light mb-3">Playbook not found</h1>
            <p className="text-neutral-500 font-mono text-[11px] mb-6">This resource is not published.</p>
            <a href="/resource" className="text-[10px] font-mono text-[#555] uppercase tracking-widest hover:text-white transition inline-flex items-center gap-1.5">
              <ArrowLeft className="w-3 h-3" /> Back to Library
            </a>
          </div>
        )}

        {status === "error" && (
          <div>
            <h1 className="text-white font-mono text-xl font-light mb-3">Could not load this playbook</h1>
            <p className="text-neutral-500 font-mono text-[11px]">The library is still available.</p>
          </div>
        )}

        {status === "ready" && resource && (
          <>
            <div className="mb-8">
              <div className="inline-block text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border mb-4 text-white/60 bg-white/5 border-white/10">
                {resource.category} · {resource.level} · {resource.read_minutes} min read
              </div>
              <h1 className="text-white font-mono text-2xl font-light leading-snug mb-3">{resource.title}</h1>
              {resource.summary && (
                <p className="text-neutral-500 font-mono text-[11px] leading-relaxed border-l-2 border-[#333] pl-4">
                  {resource.summary}
                </p>
              )}
            </div>

            <MarkdownBody source={resource.body || ""} />

            <div className="mt-10 pt-6 border-t border-[#1a1a1a] flex items-center justify-between">
              <a href="/resource" className="text-[10px] font-mono text-[#555] uppercase tracking-widest hover:text-white transition flex items-center gap-1.5">
                <ArrowLeft className="w-3 h-3" /> Back to Library
              </a>
              <a
                href="/win"
                className="inline-flex items-center gap-2 bg-white text-black font-mono text-[10px] font-bold px-5 py-2.5 uppercase tracking-widest hover:bg-neutral-200 transition"
              >
                Apply this in Forge <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
