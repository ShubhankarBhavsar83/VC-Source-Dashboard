"use client";
import { Chip } from "@mui/material";

const stageColors: Record<string, string> = {
  "Pre-Seed": "#94A3B8",
  "Seed": "#6EE7B7",
  "Series A": "#60A5FA",
  "Series B": "#818CF8",
  "Series C+": "#F472B6",
};

export default function StageChip({ stage }: { stage: string }) {
  const color = stageColors[stage] || "#94A3B8";
  return (
    <Chip
      label={stage}
      size="small"
      sx={{
        bgcolor: `${color}18`,
        color: color,
        border: `1px solid ${color}40`,
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: "0.6875rem",
        height: 20,
        fontWeight: 500,
      }}
    />
  );
}