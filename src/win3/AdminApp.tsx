import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Trash2, Upload } from "lucide-react";
import MarkdownBody from "./MarkdownBody.tsx";
import { ResourceRecord, ResourceSummary, isBuiltinSlug } from "./builtinResources.ts";
import { slugify, splitFrontmatter } from "./markdown.ts";

const ADMIN_KEY = "obsession_admin_key";

type Editor = {
  originalSlug: string | null;
  source: "new" | "upload" | "builtin";
  title: string;
  slug: string;
  category: string;
  level: string;
  readMinutes: string;
  summary: string;
  body: string;
  status: "draft" | "published";
};

const EMPTY_EDITOR: Editor = {
  originalSlug: null,
  source: "new",
  title: "",
  slug: "",
  category: "",
  level: "Starter",
  readMinutes: "10",
  summary: "",
  body: "",
  status: "draft",
};

class AdminError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function adminFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("x-admin-key", sessionStorage.getItem(ADMIN_KEY) || "");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const res = await fetch(path, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AdminError(data.error || `Request failed (${res.status})`, res.status);
  return data;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[9px] font-mono text-[#555] uppercase tracking-widest mb-1.5">{label}</div>
      {children}
    </label>
  );
}

const inputClass =
  "w-full bg-transparent border border-[#333] px-3 py-2 font-mono text-[11px] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/40";

export default function AdminApp() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [warning, setWarning] = useState("");
  const [editor, setEditor] = useState<Editor>(EMPTY_EDITOR);
  const [slugTouched, setSlugTouched] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadList = async () => {
    const data = await adminFetch("/api/admin/resources");
    setResources(data.resources || []);
    setWarning(data.warning || "");
  };

  useEffect(() => {
    const key = sessionStorage.getItem(ADMIN_KEY);
    if (!key) {
      setChecking(false);
      return;
    }
    loadList()
      .then(() => setAuthed(true))
      .catch(() => sessionStorage.removeItem(ADMIN_KEY))
      .finally(() => setChecking(false));
  }, []);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    sessionStorage.setItem(ADMIN_KEY, password);
    try {
      await loadList();
      setAuthed(true);
      setPassword("");
    } catch (err) {
      sessionStorage.removeItem(ADMIN_KEY);
      setError(err instanceof Error ? err.message : "Could not sign in.");
    }
  };

  const signOut = () => {
    sessionStorage.removeItem(ADMIN_KEY);
    setAuthed(false);
    setResources([]);
    setEditor(EMPTY_EDITOR);
  };

  const openNew = () => {
    setEditor(EMPTY_EDITOR);
    setSlugTouched(false);
    setMessage("");
    setError("");
  };

  const openResource = async (item: ResourceSummary) => {
    setMessage("");
    setError("");
    if (item.source === "builtin") {
      setEditor({
        ...EMPTY_EDITOR,
        originalSlug: item.slug,
        source: "builtin",
        title: item.title,
        slug: item.slug,
        category: item.category,
        level: item.level,
        readMinutes: String(item.read_minutes),
        summary: item.summary,
        status: "published",
      });
      setSlugTouched(true);
      return;
    }
    try {
      const data = await adminFetch(`/api/admin/resources/${encodeURIComponent(item.slug)}`) as ResourceRecord;
      setEditor({
        originalSlug: data.slug,
        source: "upload",
        title: data.title,
        slug: data.slug,
        category: data.category,
        level: data.level,
        readMinutes: String(data.read_minutes),
        summary: data.summary,
        body: data.body || "",
        status: data.status,
      });
      setSlugTouched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open that resource.");
    }
  };

  const onTitle = (title: string) => {
    setEditor((prev) => ({
      ...prev,
      title,
      slug: prev.source === "new" && !slugTouched ? slugify(title) : prev.slug,
    }));
  };

  const onFile = async (file: File) => {
    setError("");
    if (file.size > 500_000) {
      setError("That file is over 500KB. Paste a shorter markdown file.");
      return;
    }
    const text = await file.text();
    const { meta, body } = splitFrontmatter(text);
    const nextBody = body.trim() ? body.replace(/^\n/, "") : text;
    setEditor((prev) => {
      const title = meta.title || prev.title || file.name.replace(/\.(md|markdown|txt)$/i, "");
      const nextSlug = meta.slug || (prev.source === "new" && !slugTouched ? slugify(title) : prev.slug);
      return {
        ...prev,
        title,
        slug: nextSlug,
        category: meta.category || prev.category,
        level: meta.level || prev.level,
        readMinutes: meta.read_minutes || prev.readMinutes,
        summary: meta.summary || prev.summary,
        body: nextBody,
        status: meta.status === "published" || meta.status === "draft" ? meta.status : prev.status,
      };
    });
    if (meta.slug) setSlugTouched(true);
    setMessage(`Loaded ${file.name}. Review it, then save or publish.`);
  };

  const save = async (status: "draft" | "published") => {
    setError("");
    setMessage("");
    const title = editor.title.trim();
    const slug = editor.source === "upload" && editor.originalSlug
      ? editor.originalSlug
      : slugify(editor.slug || title);
    if (!title) {
      setError("Add a title.");
      return;
    }
    if (!slug) {
      setError("Use a title with letters or numbers so the link can be created.");
      return;
    }
    if (!editor.body.trim()) {
      setError("Add a body. Paste markdown or upload a .md file.");
      return;
    }
    if (isBuiltinSlug(slug)) {
      setError("That slug belongs to the built-in guide.");
      return;
    }
    const payload = {
      title,
      slug,
      category: editor.category.trim() || "General",
      level: editor.level.trim() || "Starter",
      read_minutes: Number(editor.readMinutes) || 10,
      summary: editor.summary.trim(),
      body: editor.body,
      status,
    };
    setSaving(true);
    try {
      const path = editor.source === "upload" && editor.originalSlug
        ? `/api/admin/resources/${encodeURIComponent(editor.originalSlug)}`
        : "/api/admin/resources";
      const method = editor.source === "upload" && editor.originalSlug ? "PUT" : "POST";
      const saved = await adminFetch(path, { method, body: JSON.stringify(payload) }) as ResourceRecord;
      setEditor({
        originalSlug: saved.slug,
        source: "upload",
        title: saved.title,
        slug: saved.slug,
        category: saved.category,
        level: saved.level,
        readMinutes: String(saved.read_minutes),
        summary: saved.summary,
        body: saved.body || editor.body,
        status: saved.status,
      });
      setSlugTouched(true);
      await loadList();
      setMessage(status === "published" ? "Published. It is live in the library." : "Saved as a draft. Drafts stay off the library.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!editor.originalSlug || editor.source !== "upload") return;
    if (!window.confirm(`Delete "${editor.title || editor.originalSlug}"? This removes it from the library.`)) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await adminFetch(`/api/admin/resources/${encodeURIComponent(editor.originalSlug)}`, { method: "DELETE" });
      await loadList();
      openNew();
      setMessage("Deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
    } finally {
      setSaving(false);
    }
  };

  if (checking) {
    return <Shell><p className="text-[#555] text-[11px]">Checking admin session…</p></Shell>;
  }

  if (!authed) {
    return (
      <Shell>
        <form onSubmit={signIn} className="max-w-sm mx-auto mt-24 border border-[#222] bg-[#0a0a0a] p-6">
          <div className="text-[9px] font-mono text-[#444] uppercase tracking-widest mb-2">Admin</div>
          <h1 className="text-white font-mono text-xl font-light mb-2">Upload resources</h1>
          <p className="text-[#555] font-mono text-[10px] leading-relaxed mb-5">
            Use the server <span className="text-neutral-400">ADMIN_PASSWORD</span>. This is separate from an operator login.
          </p>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className={inputClass}
            autoComplete="current-password"
          />
          {error && <p className="text-[10px] font-mono text-rose-400 mt-3">{error}</p>}
          <button
            type="submit"
            className="mt-4 w-full bg-white text-black font-mono text-[10px] font-bold px-4 py-2.5 uppercase tracking-widest hover:bg-neutral-200 transition"
          >
            Enter
          </button>
        </form>
      </Shell>
    );
  }

  const readOnly = editor.source === "builtin";

  return (
    <Shell onSignOut={signOut}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-[9px] font-mono text-[#444] uppercase tracking-widest mb-2">Admin</div>
            <h1 className="text-white font-mono text-xl font-light">Resource library</h1>
          </div>
          <a href="/resource" className="text-[10px] font-mono text-[#555] uppercase tracking-widest hover:text-white transition flex items-center gap-1">
            View library <ArrowRight className="w-3 h-3" />
          </a>
        </div>

        {warning && (
          <div className="mb-6 border border-amber-900/60 bg-amber-950/20 px-4 py-3 text-[11px] font-mono text-amber-200/90 leading-relaxed">
            {warning}
          </div>
        )}

        <div className="grid lg:grid-cols-[240px_1fr] gap-6 items-start">
          <aside className="border border-[#222] bg-[#0a0a0a]">
            <button
              type="button"
              onClick={openNew}
              className="w-full text-left px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-white border-b border-[#222] hover:bg-white/5 transition"
            >
              + New resource
            </button>
            <div className="max-h-[70vh] overflow-auto">
              {resources.map((item) => {
                const active = editor.slug === item.slug && editor.source !== "new";
                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => openResource(item)}
                    className={`w-full text-left px-4 py-3 border-b border-[#1a1a1a] transition ${active ? "bg-white/5" : "hover:bg-white/[0.03]"}`}
                  >
                    <div className="text-white font-mono text-[11px] leading-snug">{item.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-[#555]">
                      <span>{item.source === "builtin" ? "Built-in" : item.status}</span>
                      <span>{item.category}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {readOnly ? (
            <div className="border border-[#222] bg-[#0a0a0a] p-6">
              <div className="text-[9px] font-mono text-[#555] uppercase tracking-widest mb-2">Built-in</div>
              <h2 className="text-white font-mono text-lg font-light mb-3">{editor.title}</h2>
              <p className="text-neutral-400 font-mono text-[11px] leading-relaxed max-w-xl">
                This guide ships with the app. Upload a new markdown file to add another playbook. Published uploads show up on the library next to this one.
              </p>
              <a href={`/resource/${editor.slug}`} className="inline-flex items-center gap-1 mt-5 text-[10px] font-mono uppercase tracking-widest text-[#555] hover:text-white">
                Open guide <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <div className="grid xl:grid-cols-2 gap-6 items-start">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  save("draft");
                }}
                className="border border-[#222] bg-[#0a0a0a] p-5 space-y-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[9px] font-mono text-[#555] uppercase tracking-widest">
                    {editor.source === "upload" ? editor.status : "New"}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-white border border-[#333] px-3 py-1.5 hover:border-neutral-500 transition"
                  >
                    <Upload className="w-3 h-3" /> Upload .md
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".md,.markdown,.txt,text/markdown,text/plain"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onFile(file);
                      e.target.value = "";
                    }}
                  />
                </div>

                <Field label="Title">
                  <input value={editor.title} onChange={(e) => onTitle(e.target.value)} className={inputClass} placeholder="The 48-Hour Idea Validation Playbook" />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Slug">
                    <input
                      value={editor.slug}
                      readOnly={editor.source === "upload"}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setEditor((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }));
                      }}
                      className={`${inputClass} ${editor.source === "upload" ? "text-[#777]" : ""}`}
                      placeholder="idea-validation"
                    />
                  </Field>
                  <Field label="Read minutes">
                    <input
                      value={editor.readMinutes}
                      onChange={(e) => setEditor((prev) => ({ ...prev, readMinutes: e.target.value }))}
                      className={inputClass}
                      inputMode="numeric"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Category">
                    <input
                      value={editor.category}
                      onChange={(e) => setEditor((prev) => ({ ...prev, category: e.target.value }))}
                      className={inputClass}
                      placeholder="Validation"
                    />
                  </Field>
                  <Field label="Level">
                    <input
                      value={editor.level}
                      onChange={(e) => setEditor((prev) => ({ ...prev, level: e.target.value }))}
                      className={inputClass}
                      placeholder="Starter"
                    />
                  </Field>
                </div>

                <Field label="Summary">
                  <textarea
                    value={editor.summary}
                    onChange={(e) => setEditor((prev) => ({ ...prev, summary: e.target.value }))}
                    className={`${inputClass} min-h-16 resize-y`}
                    placeholder="One or two lines for the library card. Leave blank to use the first paragraph."
                  />
                </Field>

                <Field label="Body">
                  <textarea
                    value={editor.body}
                    onChange={(e) => setEditor((prev) => ({ ...prev, body: e.target.value }))}
                    className={`${inputClass} min-h-72 resize-y leading-relaxed`}
                    placeholder={"## Phase 1 — Setup\n\n1. First step\n2. Second step\n\n- A note\n\n```prompt Daily prompt\nYou are...\n```"}
                  />
                </Field>
                <p className="text-[10px] font-mono text-[#444] leading-relaxed -mt-2">
                  Markdown. <span className="text-[#666]">##</span> starts a section, numbered lines are steps, dashes are bullets, and a <span className="text-[#666]">```prompt</span> fence is a prompt. A file can start with title, slug, category, summary, read_minutes, level, and status between --- lines.
                </p>

                {editor.originalSlug && (
                  <a href={`/resource/${editor.originalSlug}`} className="inline-flex text-[10px] font-mono text-[#555] hover:text-white uppercase tracking-widest">
                    /resource/{editor.originalSlug}
                  </a>
                )}

                {message && <p className="text-[10px] font-mono text-emerald-400">{message}</p>}
                {error && <p className="text-[10px] font-mono text-rose-400">{error}</p>}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="border border-[#333] text-white font-mono text-[10px] font-bold px-4 py-2 uppercase tracking-widest hover:border-neutral-500 transition disabled:opacity-50"
                  >
                    Save draft
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => save("published")}
                    className="bg-white text-black font-mono text-[10px] font-bold px-4 py-2 uppercase tracking-widest hover:bg-neutral-200 transition disabled:opacity-50"
                  >
                    Publish
                  </button>
                  {editor.source === "upload" && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={remove}
                      className="ml-auto flex items-center gap-1.5 text-rose-400 font-mono text-[10px] uppercase tracking-widest hover:text-rose-300 disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  )}
                </div>
              </form>

              <div className="border border-[#222] bg-[#0a0a0a] p-5 xl:max-h-[calc(100vh-8rem)] xl:overflow-auto">
                <div className="text-[9px] font-mono text-[#555] uppercase tracking-widest mb-4">Preview</div>
                <div className="inline-block text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border mb-4 text-white/60 bg-white/5 border-white/10">
                  {(editor.category || "General")} · {(editor.level || "Starter")} · {editor.readMinutes || "10"} min read
                </div>
                <h2 className="text-white font-mono text-lg font-light leading-snug mb-3">{editor.title || "Untitled"}</h2>
                {editor.summary && (
                  <p className="text-neutral-500 font-mono text-[11px] leading-relaxed border-l-2 border-[#333] pl-4 mb-6">{editor.summary}</p>
                )}
                <MarkdownBody source={editor.body} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children, onSignOut }: { children: React.ReactNode; onSignOut?: () => void }) {
  return (
    <div className="min-h-screen bg-[#070707] text-[#d1d1d1] font-mono text-xs">
      <div className="border-b border-[#222] bg-[#0a0a0a] px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <a href="https://obsession.club" className="text-white font-bold bg-neutral-900 px-2 py-0.5 border border-neutral-800 tracking-wider text-xs">
          [ OBSESSION_OS ]
        </a>
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="text-[10px] font-mono text-[#555] uppercase tracking-widest hover:text-white transition"
          >
            Lock admin
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
