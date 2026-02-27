"use client";
import { useState } from "react";
import {
    Box, Typography, Paper, Chip, Stack, Divider,
    Collapse, IconButton, alpha, useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckIcon from "@mui/icons-material/Check";
import LinkIcon from "@mui/icons-material/Link";
import type { EnrichmentRecord } from "@/types";
import ScoreBadge from "@/components/companies/ScoreBadge";

interface EnrichmentHistoryProps {
    history: EnrichmentRecord[];
}

const signalTypeColors: Record<string, string> = {
    growth: "#6EE7B7",
    technical: "#60A5FA",
    market: "#818CF8",
    team: "#FCD34D",
    other: "#94A3B8",
};

function EnrichmentRecordCard({ record }: { record: EnrichmentRecord }) {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(false);

    return (
        <Paper sx={{ overflow: "hidden" }}>
            {/* Header row — always visible */}
            <Box
                onClick={() => setExpanded((e) => !e)}
                sx={{
                    px: 2.5, py: 2,
                    display: "flex", alignItems: "center", gap: 2,
                    cursor: "pointer",
                    "&:hover": { bgcolor: alpha(theme.palette.common.white, 0.02) },
                    transition: "background 0.15s",
                }}
            >
                {/* Thesis badge or "No Thesis" */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
                    {record.thesis ? (
                        <>
                            <AutoAwesomeIcon sx={{ fontSize: 14, color: "secondary.main", flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: '"DM Sans", sans-serif', whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {record.thesis.name}
                            </Typography>
                        </>
                    ) : (
                        <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                            No thesis
                        </Typography>
                    )}
                </Box>

                {/* Score */}
                {record.score && (
                    <ScoreBadge score={record.score.score} size="small" />
                )}

                {/* Date */}
                <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: '"IBM Plex Mono", monospace', flexShrink: 0 }}>
                    {new Date(record.createdAt).toLocaleDateString()}
                </Typography>

                {/* Expand toggle */}
                <IconButton size="small" sx={{ flexShrink: 0 }}>
                    {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </IconButton>
            </Box>

            {/* Summary always visible below header */}
            <Box sx={{ px: 2.5, pb: expanded ? 0 : 2 }}>
                <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                    {record.enrichment.summary}
                </Typography>
            </Box>

            {/* Expanded details */}
            <Collapse in={expanded}>
                <Box sx={{ px: 2.5, pb: 2.5 }}>
                    <Divider sx={{ my: 2 }} />

                    {/* Thesis score breakdown */}
                    {record.score && (
                        <>
                            <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", mb: 1.5 }}>
                                Thesis Score Breakdown
                            </Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5, lineHeight: 1.7 }}>
                                {record.score.explanation}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>Matched</Typography>
                                    {record.score.matchedCriteria.map((c, i) => (
                                        <Box key={i} sx={{ display: "flex", gap: 1, mb: 0.75, alignItems: "flex-start" }}>
                                            <CheckCircleOutlineIcon sx={{ fontSize: 13, color: "success.main", mt: 0.2, flexShrink: 0 }} />
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>{c}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>Missing</Typography>
                                    {record.score.missingCriteria.map((c, i) => (
                                        <Box key={i} sx={{ display: "flex", gap: 1, mb: 0.75, alignItems: "flex-start" }}>
                                            <CancelOutlinedIcon sx={{ fontSize: 13, color: "text.secondary", mt: 0.2, flexShrink: 0 }} />
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>{c}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                        </>
                    )}

                    {/* What they do */}
                    <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", mb: 1.5 }}>
                        What They Do
                    </Typography>
                    <Stack spacing={0.75} sx={{ mb: 2 }}>
                        {record.enrichment.whatTheyDo.map((bullet, i) => (
                            <Box key={i} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                                <Box sx={{
                                    width: 16, height: 16, borderRadius: "50%",
                                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0, mt: 0.2,
                                }}>
                                    <CheckIcon sx={{ fontSize: 9, color: "primary.main" }} />
                                </Box>
                                <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.6 }}>{bullet}</Typography>
                            </Box>
                        ))}
                    </Stack>

                    {/* Keywords */}
                    <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", mb: 1 }}>
                        Keywords
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 2 }}>
                        {record.enrichment.keywords.map((kw) => (
                            <Chip key={kw} label={kw} size="small" color="primary" variant="outlined" />
                        ))}
                    </Box>

                    {/* Derived signals */}
                    <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", mb: 1.5 }}>
                        Derived Signals
                    </Typography>
                    <Stack spacing={1} sx={{ mb: 2 }}>
                        {record.enrichment.derivedSignals.map((signal, i) => {
                            const color = signalTypeColors[signal.type] || signalTypeColors.other;
                            return (
                                <Box key={i} sx={{ display: "flex", gap: 1.5, p: 1.5, borderRadius: 1.5, bgcolor: alpha(color, 0.05), border: "1px solid", borderColor: alpha(color, 0.15) }}>
                                    <Box sx={{ width: 3, borderRadius: 2, bgcolor: color, flexShrink: 0 }} />
                                    <Box>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{signal.signal}</Typography>
                                            <Chip label={signal.type} size="small" sx={{ height: 16, fontSize: "0.5625rem", color, bgcolor: alpha(color, 0.1), border: "none" }} />
                                        </Box>
                                        <Typography variant="caption" sx={{ color: "text.secondary" }}>{signal.evidence}</Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Stack>

                    {/* Sources */}
                    <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", mb: 1 }}>
                        Sources
                    </Typography>
                    {record.enrichment.sources.map((source, i) => (
                        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <LinkIcon sx={{ fontSize: 12, color: "text.secondary", flexShrink: 0 }} />
                            <Typography
                                component="a"
                                href={source.url}
                                target="_blank"
                                variant="caption"
                                sx={{
                                    color: "primary.main", textDecoration: "none",
                                    fontFamily: '"IBM Plex Mono", monospace',
                                    "&:hover": { textDecoration: "underline" },
                                }}
                            >
                                {source.url}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Collapse>
        </Paper>
    );
}

export default function EnrichmentHistory({ history }: EnrichmentHistoryProps) {
    if (!history || history.length === 0) {
        return (
            <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    No enrichments yet. Click "Enrich" to fetch live company data.
                </Typography>
            </Box>
        );
    }

    return (
        <Stack spacing={1.5}>
            {[...history].reverse().map((record) => (
                <EnrichmentRecordCard key={record.id} record={record} />
            ))}
        </Stack>
    );
}