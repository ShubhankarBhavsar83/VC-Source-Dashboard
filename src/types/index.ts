export interface Company {
  _id: string;
  name: string;
  domain: string;
  website: string;
  stage: "Pre-Seed" | "Seed" | "Series A" | "Series B" | "Series C+";
  sector: string;
  tags: string[];
  location: string;
  founded: number;
  employees: string;
  description: string;
  logoUrl?: string;
  linkedinUrl?: string;
  crunchbaseUrl?: string;
  signals: Signal[];
  notes: Note[];
  enrichment?: EnrichmentResult;
  thesisScore?: ThesisScore;
  enrichmentHistory: EnrichmentRecord[];
  savedToLists: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Signal {
  id: string;
  type: "hiring" | "product" | "press" | "funding" | "partnership" | "other";
  title: string;
  description: string;
  date: string;
  source?: string;
}

export interface Note {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface EnrichmentResult {
  summary: string;
  whatTheyDo: string[];
  keywords: string[];
  derivedSignals: DerivedSignal[];
  sources: EnrichmentSource[];
  enrichedAt: string;
}

export interface DerivedSignal {
  signal: string;
  evidence: string;
  type: "growth" | "technical" | "market" | "team" | "other";
}

export interface EnrichmentSource {
  url: string;
  title: string;
  scrapedAt: string;
}

export interface ThesisScore {
  score: number;
  explanation: string;
  matchedCriteria: string[];
  missingCriteria: string[];
  generatedAt: string;
}

export interface FundThesis {
  id: string;
  name: string;
  description: string;
  criteria: string[];
  preferredStages: string[];
  preferredSectors: string[];
  createdAt: string;
}

export interface SavedList {
  id: string;
  name: string;
  description: string;
  companyIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: CompanyFilters;
  createdAt: string;
}

export interface CompanyFilters {
  query?: string;
  stages?: string[];
  sectors?: string[];
  locations?: string[];
  tags?: string[];
  minScore?: number;
}

export interface EnrichmentRecord {
  id: string;
  thesis: {
    id: string;
    name: string;
  } | null;
  score: ThesisScore | null;
  enrichment: EnrichmentResult;
  createdAt: string;
}
