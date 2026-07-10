import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import cron from "node-cron";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const app = express();
app.use(express.json());

const PORT = 3000;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OR_MODEL = "anthropic/claude-sonnet-4-6";
const OR_BASE = "https://openrouter.ai/api/v1/chat/completions";

if (!OPENROUTER_API_KEY) {
  console.warn("⚠️  OPENROUTER_API_KEY not found. AI features will use rule-based fallbacks.");
}

async function aiChat(prompt: string, retries = 3): Promise<string> {
  if (!OPENROUTER_API_KEY) throw new Error("No API key");
  let lastErr: any;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(OR_BASE, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://obsession-os.app",
          "X-Title": "Obsession OS",
        },
        body: JSON.stringify({
          model: OR_MODEL,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`OpenRouter ${res.status}: ${txt}`);
      }
      const data = await res.json() as any;
      return data.choices[0].message.content as string;
    } catch (err: any) {
      lastErr = err;
      const msg = err?.message || "";
      const isTransient = msg.includes("503") || msg.includes("429") || msg.includes("overloaded");
      if (!isTransient || i === retries - 1) break;
      const delay = 1000 * Math.pow(2, i);
      console.warn(`[OpenRouter] Retry ${i + 1} in ${delay}ms:`, msg);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

function parseJson(text: string): any {
  // Strip markdown code fences if present
  const stripped = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(stripped);
}

// ----------------------------------------------------
// Codex Hardcoded Intelligence (Predefined Playbooks)
// ----------------------------------------------------
const CODEX_PLAYBOOKS = [
  {
    id: "bh-yt-testimonials",
    title: "Micro-SaaS to Extract Video Testimonials from YouTube/TikTok",
    category: "SaaS Opportunity",
    author: "r/saas (890 upvotes)",
    difficulty: "Easy",
    timeline: "Weekly Discovery",
    metrics: "$150/mo target per creator",
    summary: "Creators and brands need a simple way to search transcripts, clip highlights, and compile video reviews from YouTube and TikTok into customizable embeddable web widgets.",
    steps: [
      "Use YouTube Transcript API to ingest video comments and metadata.",
      "Integrate a basic ffmpeg video clipping script or offer structured links to exact time stamps.",
      "Generate an iframe-based responsive testimonial wall widget for their landing pages.",
      "Upsell to premium analytics, direct video downloads, and custom domains."
    ],
    tests: [
      "DM 20 creators who already display text reviews on their websites and pitch them a 1-click video widget."
    ]
  },
  {
    id: "bh-pet-grooming-aggregator",
    title: "Local Pet Grooming & Styling Booking Aggregator",
    category: "Local Business Service",
    author: "r/Entrepreneur (1,420 upvotes)",
    difficulty: "Medium",
    timeline: "High Signal",
    metrics: "$2k/mo service commission",
    summary: "High demand, low-tech local pet salons suffer from high phone tag volume. An aggregator handles reservations, automatic reminders, and charges a premium convenience markup.",
    steps: [
      "Set up a simple directory landing page of 15 top-rated local pet groomers in your zip code.",
      "Charge a $10 flat booking deposit fee to end users, promising guaranteed priority slots.",
      "Manually book the slot with the groomer on behalf of the customer.",
      "Scale by licensing a white-label booking widget to salons for $49/mo."
    ],
    tests: [
      "Run a $25 local Facebook ad campaign for 'Express Same-Day Pet Grooming' to capture email reservations."
    ]
  },
  {
    id: "bh-zoning-reports",
    title: "Automated Weekly City Council Zoning & Permit Reports",
    category: "Developer Tool / Newsletter",
    author: "r/sidehustle (620 upvotes)",
    difficulty: "Easy",
    timeline: "Trending Opportunity",
    metrics: "$120/mo per real estate developer",
    summary: "Real estate developers, brokers, and local lenders pay massive premiums to know when commercial properties are rezoned or applied for permits. Automating the scraping of municipal PDFs solves this.",
    steps: [
      "Write a basic scraper to download weekly PDF meeting minutes from local municipality portal.",
      "Use Gemini API to extract addresses, zoning code shifts (e.g. Commercial to Residential), and permit details.",
      "Compile into a clean weekly markdown summary and send via email.",
      "Pitch a $99/mo premium alert tier for instant SMS updates."
    ],
    tests: [
      "Cold-call or LinkedIn message 15 commercial real estate brokers and offer 3 weeks of free zoning alerts."
    ]
  },
  {
    id: "bh-open-saas-boilerplate",
    title: "Open-SaaS React + Node.js Boilerplate for Local AI Apps",
    category: "SaaS Opportunity",
    author: "GitHub (18.4k stars)",
    difficulty: "Medium",
    timeline: "Exponential Growth",
    metrics: "Sell premium add-ons for $79",
    summary: "An incredibly popular open-source boilerplate. Developers are looking for pre-built modules for SQLite local vector stores, custom PDF parsers, and self-hosted model configurations.",
    steps: [
      "Fork the trending open-source repository and customize with secure local auth and vector integrations.",
      "Package premium plugins: Stripe multi-tenant billing, custom dashboard components, and a mobile-friendly layout.",
      "Post in dev subreddits showing a 5-minute setup video.",
      "Charge $79 for the commercial developer bundle."
    ],
    tests: [
      "Publish a free starter boilerplate on GitHub and post in r/reactjs. Goal: 150 stars in 7 days."
    ]
  },
  {
    id: "bh-pdf-summarizer-agent",
    title: "Autonomous Legal PDF Summarizer and Red-Team Agent",
    category: "SaaS Opportunity",
    author: "GitHub (9.2k stars)",
    difficulty: "Hard",
    signals: "9.2k Stars",
    timeline: "High Signal",
    metrics: "Charge $0.15 per analyzed page",
    summary: "B2B legal documents are tedious to audit. This self-hosted or cloud-hosted tool uses advanced LLM prompting to flag hidden liabilities, termination loops, and auto-generates renegotiation options.",
    steps: [
      "Build a file upload interface supporting bulk PDF parsing.",
      "Structure multi-stage LLM chains that audit contracts specifically looking for exit liabilities and SLA penalties.",
      "Render a side-by-side comparison screen highlighting problematic clauses with direct suggestions.",
      "Sell as a privacy-safe self-hosted Docker container to mid-sized agencies."
    ],
    tests: [
      "Upload 3 standard SaaS terms of service, find 3 vulnerabilities, and tweet them as a case study. Target: 10 comments."
    ]
  }
];

// ----------------------------------------------------
// API: Health Check
// ----------------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// ----------------------------------------------------
// API: Generate AI Insights for Pulse Heatmap
// ----------------------------------------------------
app.post("/api/generate-insights", async (req, res) => {
  const { metricName, metricUnit, logs } = req.body;

  if (!logs || !Array.isArray(logs) || logs.length === 0) {
    return res.json({
      insight: "LOG INCOMING DATA TO ACTIVATE AI COMMANDER.\nDaily tracking unlocks strategic intelligence.",
      badge: "DATA REQUIREMENT UNFULFILLED"
    });
  }

  const logsSummary = logs
    .slice(-14) // Last 14 entries
    .map(l => `${l.date}: ${l.value} (${l.note || "No note"})`)
    .join("\n");

  const prompt = `
You are the Obsession OS Income Optimizer AI Co-Pilot. Your tone is highly rigorous, metric-driven, no-fluff, tough-love, and extremely supportive of wealth creation.
Analyze this user's primary income-tracking metric:
Metric: "${metricName}" (Unit: ${metricUnit})
Recent daily entries (past 14 days maximum):
${logsSummary}

Write a short, sharp analytical assessment (maximum 3 concise bullet points, formatted as clean text with ASCII list markers, e.g. "->").
Avoid empty motivational slop. Give them hard trend observations and highly actionable suggestions.
Also, provide a single 2-4 word "badge" describing their current state (e.g. "CONSISTENT FORCE", "VELOCITY SLIPPING", "UNSTABLE OUTPUT").

Return a clean JSON object in this format:
{
  "insight": "-> Bullet 1\\n-> Bullet 2\\n-> Bullet 3",
  "badge": "BADGE STRING"
}
`;

  try {
    const text = await aiChat(prompt);
    const parsed = parseJson(text);
    return res.json(parsed);
  } catch (error: any) {
    console.warn("[AI Fallback] insights:", error?.message || error);
  }

  // Fallback response if Gemini fails or is not available
  const totalDays = logs.length;
  const activeDays = logs.filter(l => Number(l.value) > 0).length;
  const averageValue = (logs.reduce((sum, l) => sum + Number(l.value), 0) / totalDays).toFixed(1);
  const consistencyRate = Math.round((activeDays / totalDays) * 100);

  let insight = "";
  let badge = "STEADY PACE";

  if (consistencyRate > 75) {
    insight = `-> STRONG CONSISTENCY: Your tracking rate is ${consistencyRate}%. Excellent discipline.\n-> TRAJECTORY: Average contribution is currently ${averageValue} ${metricUnit}.\n-> OPTIMIZATION: Challenge yourself to raise your daily baseline target by 20% over the next 10 days.`;
    badge = "ELITE CONSISTENCY";
  } else if (consistencyRate > 40) {
    insight = `-> LEAKING MOMENTUM: Active days sit at ${consistencyRate}%. The heatmap shows gaps.\n-> GAP METRIC: Your non-zero days average ${averageValue} ${metricUnit}. Maintain the habit.\n-> ACTIONABLE SHIFT: Set a daily alarm to log at exactly 9:00 PM. Never skip twice in a row.`;
    badge = "DRIFTING EFFORT";
  } else {
    insight = `-> HIGH RAMP-UP OPPORTUNITY: Minimal input captured so far. Heatmap is mostly empty.\n-> STRATEGY: Treat logging as a non-negotiable contract with yourself.\n-> CHEAP START: Aim for a 3-day 'green day' streak of any positive value.`;
    badge = "RAMPING UP";
  }

  return res.json({ insight, badge });
});

// ----------------------------------------------------
// API: Forge Red-Teaming & Action Plan Generator
// ----------------------------------------------------
app.post("/api/forge-feedback", async (req, res) => {
  const { title, category, description, metricsGoals } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required." });
  }

  const prompt = `
You are the Obsession OS Red-Team Architect. Your mission is to brutally but constructively critique (red-team) this wealth-creation idea, outline its biggest hidden assumption, and suggest 2 incredibly cheap, fast experiments (tests) that cost $0 and take less than 48 hours to validate.
Idea:
Title: "${title}"
Category: "${category}"
Description: "${description}"
Income/Metric Goal: "${metricsGoals || "General optimization"}"

Provide your feedback in a clean structured format. Format list items with "->". Keep it punchy, practical, and devoid of startup-jargon.
Provide:
1. Red-Team critique (The hardest truth about this idea).
2. The core unproven assumption that could sink it.
3. Two fast $0 validation experiments.

Return a clean JSON object in this format:
{
  "critique": "A brief, sharp 2-sentence reality check.",
  "assumption": "The single fatal leap of faith they are making.",
  "experiments": [
    "Test 1 description with target metric (e.g. Email 10 people for X response)",
    "Test 2 description with target metric"
  ]
}
`;

  try {
    const text = await aiChat(prompt);
    const parsed = parseJson(text);
    return res.json(parsed);
  } catch (error: any) {
    console.warn("[AI Fallback] forge-feedback:", error?.message || error);
  }

  // Fallback response if Gemini fails or is not available
  const defaultCritique = `This is a viable candidate, but relies heavily on passive attraction rather than direct outbound outreach. Without aggressive outbound or pre-sales, validation will be slow.`;
  const defaultAssumption = `Assuming people will pay for the service before you have validated interest or verified their specific immediate pain point.`;
  const defaultExperiments = [
    `Draft a simple 3-sentence email pitching the core outcome and send it to 10 potential buyers on LinkedIn. Measure response rate (target: 2+ warm replies).`,
    `Build a 1-page text document with the offer details and ask 3 qualified targets for a 10-minute audit call to 'red-team' your pricing model.`
  ];

  return res.json({
    critique: defaultCritique,
    assumption: defaultAssumption,
    experiments: defaultExperiments
  });
});

// ----------------------------------------------------
// API: Generate Goals & Weekly Tasks from Idea + Critique
// ----------------------------------------------------
app.post("/api/generate-goals", async (req, res) => {
  const { title, description, critique, assumption } = req.body;

  if (!title) return res.status(400).json({ error: "Title required." });

  const prompt = `You are the Obsession OS Goal Architect. Given this business idea and its red-team critique, define a concrete 90-day goal and a list of 4-6 weekly action tasks the founder must execute to win.

Idea: "${title}"
Description: "${description || ""}"
Red-team critique: "${critique || ""}"
Core fatal assumption: "${assumption || ""}"

Return a JSON object:
{
  "goal": "One sentence: what success looks like in 90 days (specific and measurable, e.g. '$2k MRR from 10 paying customers')",
  "tasks": [
    "Task 1 — specific, doable this week",
    "Task 2 — specific action",
    "Task 3 — specific action",
    "Task 4 — specific action"
  ]
}`;

  try {
    const text = await aiChat(prompt);
    const parsed = parseJson(text);
    return res.json(parsed);
  } catch (error: any) {
    console.warn("[AI Fallback] generate-goals:", error?.message);
  }

  return res.json({
    goal: `Validate and launch "${title}" within 90 days with 3 paying customers.`,
    tasks: [
      "Define your ideal customer in one sentence",
      "Find 10 potential customers and send cold outreach today",
      "Build a one-page landing page or pitch deck",
      "Get one person to commit (even unpaid) this week",
    ],
  });
});

// ----------------------------------------------------
// API: Idea Blackhole Matcher & AI Synthesis
// ----------------------------------------------------
app.post("/api/codex-match", async (req, res) => {
  const { userSituation } = req.body;

  if (!userSituation) {
    return res.json({
      playbooks: CODEX_PLAYBOOKS,
      aiAnalysis: "Type your current situation, skills, or revenue target to let the Blackhole Match Engine align the best opportunities."
    });
  }

  const prompt = `
You are the Obsession OS Idea Blackhole Matcher.
A user is trying to find high-signal side hustles or projects. Here is their current situation / skillset:
"${userSituation}"

Given these trending Idea Blackhole opportunities (sourced from GitHub or subreddits):
${JSON.stringify(CODEX_PLAYBOOKS, null, 2)}

Do the following:
1. Select the MOST relevant opportunity ID from the list.
2. Formulate a personalized launch advice synthesis for them. Explain how they can leverage this opportunity with their background, what immediate micro-steps to take, and why it is a high-signal play.
Format as concise paragraphs or bullet points with "->". Max 4-5 sentences total.

Return a clean JSON object in this format:
{
  "matchedPlaybookId": "one of the opportunity IDs",
  "synthesis": "Your personalized strategic advice here."
}
`;

  try {
    const text = await aiChat(prompt);
    const parsed = parseJson(text);
    return res.json({
      playbooks: CODEX_PLAYBOOKS,
      matchedPlaybookId: parsed.matchedPlaybookId,
      aiAnalysis: parsed.synthesis,
    });
  } catch (error: any) {
    console.warn("[AI Fallback] codex-match:", error?.message || error);
  }

  // Fallback response if Gemini fails
  return res.json({
    playbooks: CODEX_PLAYBOOKS,
    matchedPlaybookId: "micro-agency-cold",
    aiAnalysis: `Based on your situation, we recommend starting with a low-cost, high-leverage side hustle like the Local Audit micro-agency. It validates market demand within 48 hours and requires zero initial capital. Prioritize sending 10 loom videos to warm leads immediately.`
  });
});

// ----------------------------------------------------
// User Data CRUD Endpoints
// ----------------------------------------------------

// Profile upsert
app.post("/api/profile", async (req, res) => {
  const { email, name, hustle } = req.body;
  if (!email) return res.status(400).json({ error: "email required" });
  const { error } = await supabase.from("profiles").upsert({ email, name, hustle, updated_at: new Date().toISOString() });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// Profile fetch (includes goals)
app.get("/api/profile", async (req, res) => {
  const { email } = req.query as { email: string };
  if (!email) return res.status(400).json({ error: "email required" });
  const { data, error } = await supabase.from("profiles").select("*").eq("email", email).single();
  if (error && error.code !== "PGRST116") return res.status(500).json({ error: error.message });
  res.json(data || {});
});

// Profile goals update
app.patch("/api/profile", async (req, res) => {
  const { email, weekly_goal, long_term_goal } = req.body;
  if (!email) return res.status(400).json({ error: "email required" });
  const { error } = await supabase.from("profiles")
    .update({ weekly_goal, long_term_goal, updated_at: new Date().toISOString() })
    .eq("email", email);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// Ideas
app.get("/api/ideas", async (req, res) => {
  const { email } = req.query as { email: string };
  if (!email) return res.status(400).json({ error: "email required" });
  const { data, error } = await supabase.from("ideas").select("*").eq("email", email).order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.post("/api/ideas", async (req, res) => {
  const idea = req.body;
  if (!idea?.id || !idea?.email) return res.status(400).json({ error: "id and email required" });
  const { error } = await supabase.from("ideas").upsert({
    id: idea.id, email: idea.email, title: idea.title, category: idea.category,
    description: idea.description, metrics_goals: idea.metricsGoals || "",
    github_url: idea.githubUrl || null, biz_info: idea.bizInfo || null,
    critique: idea.critique, assumption: idea.assumption, experiments: idea.experiments,
    status: idea.status, updated_at: new Date().toISOString(),
  });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.patch("/api/ideas/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (updates.critique !== undefined) dbUpdates.critique = updates.critique;
  if (updates.assumption !== undefined) dbUpdates.assumption = updates.assumption;
  if (updates.experiments !== undefined) dbUpdates.experiments = updates.experiments;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.metricsGoals !== undefined) dbUpdates.metrics_goals = updates.metricsGoals;
  const { error } = await supabase.from("ideas").update(dbUpdates).eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.delete("/api/ideas/:id", async (req, res) => {
  const { error } = await supabase.from("ideas").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// Daily logs
app.get("/api/logs", async (req, res) => {
  const { email } = req.query as { email: string };
  if (!email) return res.status(400).json({ error: "email required" });
  const { data, error } = await supabase.from("daily_logs").select("date,value,note").eq("email", email).order("date", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.post("/api/logs", async (req, res) => {
  const { email, date, value, note } = req.body;
  if (!email || !date) return res.status(400).json({ error: "email and date required" });
  const { error } = await supabase.from("daily_logs").upsert({ email, date, value: Number(value) || 0, note: note || "" }, { onConflict: "email,date" });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// Mission (goal + tasks)
app.get("/api/mission", async (req, res) => {
  const { email } = req.query as { email: string };
  if (!email) return res.status(400).json({ error: "email required" });
  const { data, error } = await supabase.from("missions").select("*").eq("email", email).order("created_at", { ascending: false }).limit(1).single();
  if (error && error.code !== "PGRST116") return res.status(500).json({ error: error.message });
  res.json(data || {});
});

app.post("/api/mission", async (req, res) => {
  const { email, goal, tasks } = req.body;
  if (!email || !goal) return res.status(400).json({ error: "email and goal required" });
  // Delete old missions and insert fresh
  await supabase.from("missions").delete().eq("email", email);
  const { data, error } = await supabase.from("missions").insert({ email, goal, tasks: tasks || [] }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Task checks (per user per day)
app.get("/api/task-checks", async (req, res) => {
  const { email, date } = req.query as { email: string; date: string };
  if (!email || !date) return res.status(400).json({ error: "email and date required" });
  const { data, error } = await supabase.from("task_checks").select("checks").eq("email", email).eq("date", date).single();
  if (error && error.code !== "PGRST116") return res.status(500).json({ error: error.message });
  res.json(data || { checks: [] });
});

app.post("/api/task-checks", async (req, res) => {
  const { email, date, checks } = req.body;
  if (!email || !date) return res.status(400).json({ error: "email and date required" });
  const { error } = await supabase.from("task_checks").upsert({ email, date, checks: checks || [] }, { onConflict: "email,date" });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ----------------------------------------------------
// Daily Ideas Cache (Reddit Scraper — Supabase backed)
// ----------------------------------------------------

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

async function loadDailyCache() {
  const { data } = await supabase.from("daily_ideas").select("ideas, date").eq("date", todayStr()).single();
  return data ?? null;
}

async function saveDailyCache(ideas: typeof CODEX_PLAYBOOKS) {
  await supabase.from("daily_ideas").upsert({ date: todayStr(), ideas, scraped_at: new Date().toISOString() });
}

const SUBREDDITS = ["Entrepreneur", "sidehustle", "smallbusiness"];

async function scrapeRedditIdeas(): Promise<typeof CODEX_PLAYBOOKS> {
  console.log("[Scraper] Starting Reddit scrape...");

  const posts: { title: string; selftext: string; url: string; score: number; subreddit: string }[] = [];

  for (const sub of SUBREDDITS) {
    try {
      const res = await fetch(
        `https://www.reddit.com/r/${sub}/top.json?t=day&limit=15&raw_json=1`,
        { headers: { "User-Agent": "ObsessionOS/1.0" } }
      );
      if (!res.ok) continue;
      const data = await res.json() as any;
      const children = data?.data?.children || [];
      for (const child of children) {
        const p = child.data;
        if (p.is_self && p.selftext?.length > 100) {
          posts.push({
            title: p.title,
            selftext: p.selftext.slice(0, 500),
            url: `https://reddit.com${p.permalink}`,
            score: p.score,
            subreddit: sub,
          });
        }
      }
    } catch (e) {
      console.warn(`[Scraper] Failed to fetch r/${sub}:`, e);
    }
  }

  if (posts.length === 0) {
    console.warn("[Scraper] No posts scraped, falling back to CODEX_PLAYBOOKS");
    return CODEX_PLAYBOOKS.slice(0, 5);
  }

  // Sort by score, take top 10 to feed to Gemini
  const topPosts = posts.sort((a, b) => b.score - a.score).slice(0, 10);

  const prompt = `You are an entrepreneurship opportunity analyst for Obsession OS.

I've scraped these top Reddit posts from entrepreneur subreddits today:

${topPosts.map((p, i) => `[${i + 1}] r/${p.subreddit} (${p.score} upvotes)
Title: "${p.title}"
Body: "${p.selftext}"
`).join("\n")}

Extract exactly 5 distinct, actionable side hustle or career income opportunities from these posts. Each should be something a solo operator can start in under 2 weeks with minimal capital.

Return a JSON object with a single key "ideas" containing an array of exactly 5 objects with this structure:
{
  "id": "reddit-<index>",
  "title": "Clear, specific opportunity title",
  "category": "one of: SaaS Opportunity | Local Agency | Freelance | Media | Digital Product | Career Leverage",
  "author": "r/<subreddit> (upvotes upvotes)",
  "difficulty": "one of: Low | Medium | High",
  "timeline": "e.g. 48h to first $ | 1 week | 2 weeks",
  "metrics": "specific revenue/outcome target e.g. $2k/mo with 10 clients",
  "summary": "2-3 sentence pitch. What the opportunity is and why it's high signal right now.",
  "steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "tests": ["One cheap 48h validation experiment with a measurable target"]
}`;

  try {
    const text = await aiChat(prompt);
    const parsed = parseJson(text);
    const ideas = Array.isArray(parsed) ? parsed : parsed.ideas ?? [];
    console.log(`[Scraper] Got ${ideas.length} ideas from Claude`);
    return ideas.slice(0, 5);
  } catch (e) {
    console.error("[Scraper] Claude parse failed:", e);
  }

  // Fallback: convert top 5 posts to basic playbook format
  return topPosts.slice(0, 5).map((p, i) => ({
    id: `reddit-${i}`,
    title: p.title.slice(0, 80),
    category: "Side Hustle",
    author: `r/${p.subreddit} (${p.score} upvotes)`,
    difficulty: "Medium",
    timeline: "1-2 weeks",
    metrics: "Validate in 48h",
    summary: p.selftext.slice(0, 200),
    steps: ["Research the opportunity", "Find 10 potential clients or customers", "Send outreach", "Close first deal"],
    tests: ["DM 10 people about this and measure response rate"],
  }));
}

async function runDailyScrape() {
  const ideas = await scrapeRedditIdeas();
  saveDailyCache(ideas);
  console.log(`[Scraper] Saved ${ideas.length} ideas for ${todayStr()}`);
}

// Cron + startup scrape only in non-Vercel environments
if (!process.env.VERCEL) {
  loadDailyCache().then(cached => {
    if (!cached) {
      runDailyScrape().catch(e => console.error("[Scraper] Startup scrape failed:", e));
    } else {
      console.log(`[Scraper] Cache fresh for ${todayStr()}, skipping startup scrape`);
    }
  });

  cron.schedule("0 6 * * *", () => {
    console.log("[Cron] Daily idea scrape triggered");
    runDailyScrape().catch(e => console.error("[Cron] Scrape failed:", e));
  });
}

// ----------------------------------------------------
// API: Get today's 5 daily ideas
// ----------------------------------------------------
app.get("/api/daily-ideas", async (req, res) => {
  // 1. Try today's Supabase cache
  const cache = await loadDailyCache();
  if (cache && Array.isArray(cache.ideas) && cache.ideas.length > 0) {
    return res.json({ date: todayStr(), ideas: cache.ideas, fresh: true });
  }

  // No data for today — fire a background scrape on local dev so next reload has fresh data
  if (!process.env.VERCEL) {
    runDailyScrape().catch(e => console.error("[Auto-scrape]", e));
  }

  // 2. Try most recent scraped data from last 7 days
  const { data: recent } = await supabase
    .from("daily_ideas")
    .select("ideas, date")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (recent && Array.isArray(recent.ideas) && recent.ideas.length > 0) {
    return res.json({ date: recent.date as string, ideas: recent.ideas, fresh: false });
  }

  // 3. No Supabase data at all — return hardcoded fallback
  return res.json({ date: todayStr(), ideas: CODEX_PLAYBOOKS.slice(0, 5), fresh: false });
});

// ----------------------------------------------------
// API: Manually trigger a scrape (admin/dev)
// ----------------------------------------------------
app.post("/api/scrape-ideas", async (req, res) => {
  try {
    await runDailyScrape();
    const cache = await loadDailyCache();
    res.json({ ok: true, date: cache?.date, count: Array.isArray(cache?.ideas) ? cache.ideas.length : 0 });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message });
  }
});

// ----------------------------------------------------
// Vite Dev & Production Client Setup
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Obsession OS server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
