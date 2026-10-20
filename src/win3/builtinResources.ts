export type ResourceStatus = "draft" | "published";
export type ResourceSource = "builtin" | "upload";

export interface ResourceSummary {
  slug: string;
  title: string;
  category: string;
  summary: string;
  read_minutes: number;
  level: string;
  status: ResourceStatus;
  source: ResourceSource;
  updated_at?: string | null;
}

export interface ResourceRecord extends ResourceSummary {
  body: string;
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const BUILTIN_RESOURCES: ResourceSummary[] = [
  {
    slug: "compounding-second-brain",
    title: "Compounding Second Brain: Claude Code + Obsidian",
    category: "Productivity",
    summary:
      "Turn your daily notes into a growing, intelligent knowledge base that actively finds connections and compounds over time.",
    read_minutes: 20,
    level: "Starter",
    status: "published",
    source: "builtin",
  },
];

export function isBuiltinSlug(slug: string): boolean {
  return BUILTIN_RESOURCES.some((resource) => resource.slug === slug);
}
