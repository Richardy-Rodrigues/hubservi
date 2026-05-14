import { supabase } from "./client";

export interface PublicProfileSummary {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

// public_profiles is a view added by migration 20260514100200; types.ts is auto-
// generated and still references the pre-view schema, so we centralise the cast
// here instead of leaking `as any` into the call sites.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const publicProfiles = () => (supabase as any).from("public_profiles");

export async function fetchPublicProfilesByIds(ids: string[]): Promise<PublicProfileSummary[]> {
  if (ids.length === 0) return [];
  const { data } = await publicProfiles().select("id, full_name, avatar_url").in("id", ids);
  return (data ?? []) as PublicProfileSummary[];
}

export async function fetchPublicProfileById(id: string): Promise<PublicProfileSummary | null> {
  const { data } = await publicProfiles()
    .select("id, full_name, avatar_url")
    .eq("id", id)
    .maybeSingle();
  return (data as PublicProfileSummary | null) ?? null;
}
