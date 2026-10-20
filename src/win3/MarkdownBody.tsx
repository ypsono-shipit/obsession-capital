import React from "react";
import { MdBlock, parseMarkdown } from "./markdown.ts";

function RichText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
          return (
            <code key={i} className="text-white/80 bg-white/5 px-1 py-0.5">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
          return (
            <strong key={i} className="text-white font-medium">
              {part.slice(2, -2)}
            </strong>
          );
        }
        const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
        if (link) {
          return (
            <a
              key={i}
              href={link[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-white/80 hover:text-white"
            >
              {link[1]}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function Fence({ code, label, prompt }: { code: string; label?: string; prompt?: boolean }) {
  return (
    <div className={`border ${prompt ? "border-white/20 bg-white/[0.03]" : "border-[#222] bg-[#050505]"}`}>
      {label && (
        <div className={`border-b ${prompt ? "border-white/10" : "border-[#1a1a1a]"} px-4 py-2.5`}>
          <span className={`text-[9px] font-mono uppercase tracking-widest ${prompt ? "text-white/70" : "text-[#555]"}`}>
            {prompt ? "↳ Prompt · " : ""}{label}
          </span>
        </div>
      )}
      {!label && prompt && (
        <div className="border-b border-white/10 px-4 py-2.5">
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/70">↳ Prompt</span>
        </div>
      )}
      <pre className={`px-4 py-3 font-mono text-[10px] leading-relaxed whitespace-pre-wrap ${prompt ? "text-white/80" : "text-neutral-400"} overflow-x-auto`}>
        {code}
      </pre>
    </div>
  );
}

function BlockView({ block }: { block: MdBlock }) {
  if (block.type === "h2") {
    return (
      <h3 className="text-white font-mono text-sm font-medium border-l-2 border-white/30 pl-3 pt-4 first:pt-0">
        {block.text}
      </h3>
    );
  }
  if (block.type === "h3") {
    return <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">{block.text}</div>;
  }
  if (block.type === "p") {
    return <p className="text-neutral-300 font-mono text-[11px] leading-relaxed"><RichText text={block.text} /></p>;
  }
  if (block.type === "code") return <Fence code={block.code} label={block.label} />;
  if (block.type === "prompt") return <Fence code={block.code} label={block.label} prompt />;
  return (
    <ul className="space-y-2">
      {block.items.map((item, j) => (
        <li key={j} className="flex gap-2.5">
          <span className="text-[#555] font-mono flex-shrink-0 mt-0.5">
            {block.type === "ol" ? `${j + 1}.` : "→"}
          </span>
          <span className="text-neutral-300 font-mono text-[11px] leading-relaxed"><RichText text={item} /></span>
        </li>
      ))}
    </ul>
  );
}

export default function MarkdownBody({ source }: { source: string }) {
  const blocks = parseMarkdown(source);
  if (blocks.length === 0) {
    return <p className="text-[#444] font-mono text-[11px]">Nothing to preview yet.</p>;
  }

  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const next = blocks[i + 1];
    if (block.type === "h2" && /quick start/i.test(block.text) && next?.type === "ol") {
      nodes.push(
        <div key={i} className="border border-white/10 bg-white/[0.02] p-5 space-y-3">
          <h3 className="text-white font-mono text-sm font-medium">{block.text}</h3>
          <ol className="space-y-2">
            {next.items.map((step, j) => (
              <li key={j} className="flex gap-2.5">
                <span className="text-white/50 font-mono flex-shrink-0 font-bold">{j + 1}.</span>
                <span className="text-neutral-200 font-mono text-[11px] leading-relaxed"><RichText text={step} /></span>
              </li>
            ))}
          </ol>
        </div>
      );
      i++;
      continue;
    }
    nodes.push(<div key={i}><BlockView block={block} /></div>);
  }

  return <div className="space-y-4">{nodes}</div>;
}
