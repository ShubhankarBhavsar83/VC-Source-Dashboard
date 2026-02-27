"use client";
import { Box, Typography, Chip, Paper, Skeleton, Stack, Divider, alpha, useTheme } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import LinkIcon from "@mui/icons-material/Link";
import type { EnrichmentResult } from "@/types";

interface EnrichmentPanelProps {
  enrichment?: EnrichmentResult;
  loading?: boolean;
}

const signalTypeColors: Record<string, string> = {
  growth: "#6EE7B7",
  technical: "#60A5FA",
  market: "#818CF8",
  team: "#FCD34D",
  other: "#94A3B8",
};

export default function EnrichmentPanel({ enrichment, loading }: EnrichmentPanelProps) {
  const theme = useTheme();

  if (loading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
      </Stack>
    );
  }

  if (!enrichment) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          No enrichment data yet. Click "Enrich" to fetch live company data.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2.5}>
      {/* Summary */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="overline" sx={{ color: "primary.main", display: "block", mb: 1.5 }}>Summary</Typography>
        <Typography variant="body1" sx={{ lineHeight: 1.8 }}>{enrichment.summary}</Typography>
      </Paper>

      {/* What they do */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>What They Do</Typography>
        <Stack spacing={1}>
          {enrichment.whatTheyDo.map((bullet, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
              <Box sx={{
                width: 18, height: 18, borderRadius: "50%", bgcolor: alpha(theme.palette.primary.main, 0.12),
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, mt: 0.25,
              }}>
                <CheckIcon sx={{ fontSize: 10, color: "primary.main" }} />
              </Box>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{bullet}</Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* Keywords */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>Keywords</Typography>
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
          {enrichment.keywords.map((kw) => (
            <Chip key={kw} label={kw} size="small" color="primary" variant="outlined" />
          ))}
        </Box>
      </Paper>

      {/* Derived Signals */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>Derived Signals</Typography>
        <Stack spacing={1.5}>
          {enrichment.derivedSignals.map((signal, i) => {
            const color = signalTypeColors[signal.type] || signalTypeColors.other;
            return (
              <Box key={i} sx={{ display: "flex", gap: 2, p: 2, borderRadius: 1.5, bgcolor: alpha(color, 0.05), border: "1px solid", borderColor: alpha(color, 0.15) }}>
                <Box sx={{ width: 3, borderRadius: 2, bgcolor: color, flexShrink: 0 }} />
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{signal.signal}</Typography>
                    <Chip label={signal.type} size="small" sx={{ height: 18, fontSize: "0.625rem", color, bgcolor: alpha(color, 0.1), border: "none" }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>{signal.evidence}</Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Paper>

      {/* Sources */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>Sources</Typography>
        <Stack spacing={1}>
          {enrichment.sources.map((source, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <LinkIcon sx={{ fontSize: 14, color: "text.secondary", flexShrink: 0 }} />
              <Box sx={{ flex: 1, overflow: "hidden" }}>
                <Typography
                  component="a"
                  href={source.url}
                  target="_blank"
                  variant="caption"
                  sx={{
                    color: "primary.main", textDecoration: "none", fontFamily: '"IBM Plex Mono", monospace',
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {source.url}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Scraped {new Date(source.scrapedAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
        <Typography variant="caption" sx={{ color: "text.secondary", mt: 1.5, display: "block", fontFamily: '"IBM Plex Mono", monospace' }}>
          Enriched {new Date(enrichment.enrichedAt).toLocaleString()}
        </Typography>
      </Paper>
    </Stack>
  );
}