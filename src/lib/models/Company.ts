import mongoose, { Schema, model, models } from "mongoose";

const SignalSchema = new Schema({
  id: String,
  type: { type: String, enum: ["hiring", "product", "press", "funding", "partnership", "other"] },
  title: String,
  description: String,
  date: String,
  source: String,
});


const NoteSchema = new Schema({
  id: String,
  content: String,
  author: String,
  createdAt: String,
});

const EnrichmentSchema = new Schema({
  summary: String,
  whatTheyDo: [String],
  keywords: [String],
  derivedSignals: [
    {
      signal: String,
      evidence: String,
      type: { type: String, enum: ["growth", "technical", "market", "team", "other"] },
    },
  ],
  sources: [{ url: String, title: String, scrapedAt: String }],
  enrichedAt: String,
});

const ThesisScoreSchema = new Schema({
  score: Number,
  explanation: String,
  matchedCriteria: [String],
  missingCriteria: [String],
  generatedAt: String,
});

const EnrichmentRecordSchema = new Schema({
  id: String,
  thesis: {
    id: String,
    name: String,
  },
  score: ThesisScoreSchema,
  enrichment: EnrichmentSchema,
  createdAt: String,
});

const CompanySchema = new Schema(
  {
    name: { type: String, required: true },
    domain: { type: String, required: true, unique: true },
    website: { type: String, required: true },
    stage: {
      type: String,
      enum: ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+"],
    },
    sector: String,
    tags: [String],
    location: String,
    founded: Number,
    employees: String,
    description: String,
    logoUrl: String,
    linkedinUrl: String,
    crunchbaseUrl: String,
    signals: [SignalSchema],
    notes: [NoteSchema],
    enrichment: EnrichmentSchema,
    thesisScore: ThesisScoreSchema,
    savedToLists: [String],
    enrichmentHistory: { type: [EnrichmentRecordSchema], default: [] },
  },
  { timestamps: true }
);


export const CompanyModel = models.Company || model("Company", CompanySchema);