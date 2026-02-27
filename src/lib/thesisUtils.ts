import type { Company, ThesisScore, FundThesis } from "@/types";

export function getActiveThesisScore(
  company: Pick<Company, "thesisScore" | "enrichmentHistory">,
  activeThesis: FundThesis | null
): ThesisScore | null {
  if (!activeThesis) {
    return company.thesisScore ?? null;
  }

  const record = (company.enrichmentHistory ?? [])
    .slice()
    .reverse() // newest first
    .find((r) => r.thesis?.id === activeThesis.id && r.score != null);

  return record?.score ?? null;
}