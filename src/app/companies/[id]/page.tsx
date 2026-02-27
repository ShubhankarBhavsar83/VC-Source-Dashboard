"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Box, Typography, Button, Chip, Paper, Divider, IconButton,
    TextField, Stack, Skeleton, Alert, Tooltip, LinearProgress,
    Menu, MenuItem, Tab, Tabs, alpha, useTheme, Dialog, DialogContent, DialogTitle, DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FlareIcon from "@mui/icons-material/Flare";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import type { Company } from "@/types";
import { useAppStore } from "@/store";
import StageChip from "@/components/companies/StageChip";
import ScoreBadge from "@/components/companies/ScoreBadge";
import EnrichmentHistory from "@/components/enrichment/EnrichmentHistory";

export default function CompanyProfilePage() {
    const params = useParams();
    const router = useRouter();
    const theme = useTheme();
    const id = params.id as string;
    const { lists, addToList, createList, activeTesis } = useAppStore();

    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(0);
    const [noteText, setNoteText] = useState("");
    const [savingNote, setSavingNote] = useState(false);
    const [listMenuAnchor, setListMenuAnchor] = useState<null | HTMLElement>(null);
    const [enriching, setEnriching] = useState(false);
    const [enrichError, setEnrichError] = useState<string | null>(null);
    const [newListDialogOpen, setNewListDialogOpen] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [cacheHit, setCacheHit] = useState(false);

    useEffect(() => {
        fetch(`/api/companies/${id}`)
            .then((r) => r.json())
            .then((d) => { setCompany(d.company); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);

    const enrichingRef = useRef(false);
    const handleEnrich = async () => {
        if (!company || enrichingRef.current) return;
        enrichingRef.current = true;
        setEnriching(true);
        setEnrichError(null);
        setCacheHit(false);
        try {
            const res = await fetch("/api/enrich", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyId: id,
                    url: company.website,
                    thesis: activeTesis
                        ? `${activeTesis.name}: ${activeTesis.description}\nCriteria:\n${activeTesis.criteria.join("\n")}`
                        : undefined,
                    thesisId: activeTesis?.id ?? null,
                    thesisName: activeTesis?.name ?? null,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Enrichment failed");

            if (data.cached) setCacheHit(true);

            setCompany((c) => {
                if (!c) return c;
                const newHistory = data.enrichmentHistory
                    ?? (data.record ? [...(c.enrichmentHistory || []), data.record] : c.enrichmentHistory);
                return {
                    ...c,
                    enrichment: data.enrichment,
                    thesisScore: data.thesisScore ?? c.thesisScore,
                    enrichmentHistory: newHistory,
                };
            });

            if (!data.cached) setTab(1);

        } catch (err: unknown) {
            setEnrichError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setEnriching(false);
            enrichingRef.current = false;
        }
    };

    const handleAddNote = async () => {
        if (!noteText.trim() || !company) return;
        setSavingNote(true);
        const newNote = { id: crypto.randomUUID(), content: noteText.trim(), author: "You", createdAt: new Date().toISOString() };
        const notes = [...(company.notes || []), newNote];
        await fetch(`/api/companies/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notes }) });
        setCompany((c) => c ? { ...c, notes } : c);
        setNoteText("");
        setSavingNote(false);
    };

    const isInList = (listId: string) => lists.find((l) => l.id === listId)?.companyIds.includes(id);

    if (loading) {
        return (
            <Box sx={{ p: 4 }}>
                <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 2 }} />
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Box>
        );
    }

    if (!company) {
        return (
            <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6" color="error">Company not found</Typography>
                <Button onClick={() => router.push("/companies")} sx={{ mt: 2 }}>← Back to Companies</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ height: "100vh", overflow: "auto" }}>
            {/* Top bar */}
            <Box sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1.5, position: "sticky", top: 0, zIndex: 10, bgcolor: "background.default", backdropFilter: "blur(8px)" }}>
                <IconButton size="small" onClick={() => router.push("/companies")}>
                    <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>Companies</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>/</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{company.name}</Typography>
                <Box sx={{ flex: 1 }} />
                <IconButton size="small" component="a" href={company.website} target="_blank">
                    <OpenInNewIcon fontSize="small" />
                </IconButton>
                <Button size="small" startIcon={<BookmarkBorderIcon />} onClick={(e) => setListMenuAnchor(e.currentTarget)} variant="outlined" sx={{ fontFamily: '"DM Sans", sans-serif' }}>
                    Save to List
                </Button>
                <Menu anchorEl={listMenuAnchor} open={Boolean(listMenuAnchor)} onClose={() => setListMenuAnchor(null)}>
                    {lists.map((list) => (
                        <MenuItem key={list.id} onClick={() => { addToList(list.id, id); setListMenuAnchor(null); }}>
                            {isInList(list.id) ? <BookmarkIcon sx={{ mr: 1, fontSize: 16, color: "primary.main" }} /> : <BookmarkBorderIcon sx={{ mr: 1, fontSize: 16 }} />}
                            {list.name}
                        </MenuItem>
                    ))}
                    <Divider />
                    <MenuItem onClick={() => { setListMenuAnchor(null); setNewListDialogOpen(true); }}>
                        <AddIcon sx={{ mr: 1, fontSize: 16 }} /> New List
                    </MenuItem>
                </Menu>
            </Box>

            <Box sx={{ maxWidth: 900, mx: "auto", px: 3, pb: 6 }}>
                {/* Hero */}
                <Box sx={{ py: 3, display: "flex", gap: 3, alignItems: "flex-start" }}>
                    <Box
                        sx={{
                            width: 56, height: 56, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1.25rem", fontWeight: 700, color: "primary.main",
                            fontFamily: '"DM Sans", sans-serif', flexShrink: 0,
                            border: "1px solid", borderColor: alpha(theme.palette.primary.main, 0.2),
                        }}
                    >
                        {company.name.charAt(0)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>{company.name}</Typography>
                            <StageChip stage={company.stage} />
                            {company.thesisScore && <ScoreBadge score={company.thesisScore.score} size="small" />}
                        </Box>
                        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5, fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.8rem" }}>
                            {company.domain} · {company.location} · Founded {company.founded} · {company.employees} employees
                        </Typography>
                        <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                            {company.description}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1.5 }}>
                            {company.tags?.map((tag) => <Chip key={tag} label={tag} size="small" />)}
                        </Box>
                    </Box>


                    {/* Enrich button */}
                    <Box sx={{ flexShrink: 0 }}>
                        {(() => {
                            // Check if active thesis already has a score in history
                            const hasThesisScore = activeTesis
                                ? (company.enrichmentHistory || []).some(
                                    (r) => r.thesis?.id === activeTesis.id
                                )
                                : false;

                            // Show "Enrich" if: never enriched, OR thesis active with no score yet
                            const showEnrichButton = !company.enrichment || (activeTesis && !hasThesisScore);

                            return (
                                <>
                                    {showEnrichButton ? (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={enriching ? undefined : <FlareIcon />}
                                            onClick={handleEnrich}
                                            disabled={enriching}
                                            sx={{ fontFamily: '"DM Sans", sans-serif', minWidth: 120 }}
                                        >
                                            {enriching
                                                ? <LinearProgress sx={{ width: 60 }} />
                                                : activeTesis && !hasThesisScore && company.enrichment
                                                    ? `Score: ${activeTesis.name}`
                                                    : "Enrich"
                                            }
                                        </Button>
                                    ) : (
                                        <Chip
                                            icon={<FlareIcon />}
                                            label="Enriched"
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                        />
                                    )}
                                    {company.enrichment && (
                                        <Button
                                            size="small"
                                            onClick={handleEnrich}
                                            disabled={enriching}
                                            sx={{ display: "block", mt: 0.5, fontFamily: '"DM Sans", sans-serif', fontSize: "0.6875rem", color: "text.secondary" }}
                                        >
                                            Re-enrich
                                        </Button>
                                    )}
                                </>
                            );
                        })()}
                    </Box>
                </Box>

                {cacheHit && (
                    <Alert
                        severity="info"
                        sx={{ mb: 2 }}
                        onClose={() => setCacheHit(false)}
                    >
                        Loaded from cache — this enrichment was already run for the current thesis. Use <strong>Re-enrich</strong> to force a fresh fetch.
                    </Alert>
                )}

                {enrichError && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setEnrichError(null)}>
                        {enrichError}
                    </Alert>
                )}
                {enriching && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}


                {/* Tabs */}
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid", borderColor: "divider", mb: 3 }}>
                    <Tab label="Overview" sx={{ fontFamily: '"DM Sans", sans-serif', textTransform: "none", fontSize: "0.8125rem" }} />
                    <Tab label="Enrichment" sx={{ fontFamily: '"DM Sans", sans-serif', textTransform: "none", fontSize: "0.8125rem" }} />
                    <Tab label="Signals" sx={{ fontFamily: '"DM Sans", sans-serif', textTransform: "none", fontSize: "0.8125rem" }} />
                    <Tab label="Notes" sx={{ fontFamily: '"DM Sans", sans-serif', textTransform: "none", fontSize: "0.8125rem" }} />
                </Tabs>

                {/* Tab 0: Overview */}
                {tab === 0 && (
                    <Stack spacing={3}>
                        {company.thesisScore && (
                            <Paper sx={{ p: 3 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                                    <ScoreBadge score={company.thesisScore.score} size="large" />
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Thesis Match Score</Typography>
                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>{company.thesisScore.explanation}</Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: "flex", gap: 3 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", mb: 1 }}>Matched</Typography>
                                        {company.thesisScore.matchedCriteria.map((c, i) => (
                                            <Box key={i} sx={{ display: "flex", gap: 1, mb: 0.75, alignItems: "flex-start" }}>
                                                <CheckCircleOutlineIcon sx={{ fontSize: 14, color: "success.main", mt: 0.25, flexShrink: 0 }} />
                                                <Typography variant="caption" sx={{ color: "text.secondary" }}>{c}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", mb: 1 }}>Missing</Typography>
                                        {company.thesisScore.missingCriteria.map((c, i) => (
                                            <Box key={i} sx={{ display: "flex", gap: 1, mb: 0.75, alignItems: "flex-start" }}>
                                                <CancelOutlinedIcon sx={{ fontSize: 14, color: "text.secondary", mt: 0.25, flexShrink: 0 }} />
                                                <Typography variant="caption" sx={{ color: "text.secondary" }}>{c}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Paper>
                        )}

                        <Paper sx={{ p: 3 }}>
                            <Typography variant="overline" sx={{ color: "text.secondary", display: "block", mb: 2 }}>Company Details</Typography>
                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                                {[
                                    ["Sector", company.sector],
                                    ["Stage", company.stage],
                                    ["Location", company.location],
                                    ["Founded", company.founded],
                                    ["Employees", company.employees],
                                    ["Website", company.domain],
                                ].map(([label, value]) => (
                                    <Box key={label as string}>
                                        <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>{label}</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.25 }}>{value}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    </Stack>
                )}

                {/* Tab 1: Enrichment */}
                {tab === 1 && (
                    <>
                        {(!company.enrichmentHistory || company.enrichmentHistory.length === 0) && !enriching ? (
                            <Box
                                sx={{
                                    textAlign: "center", py: 10,
                                    border: "1px dashed", borderColor: "divider",
                                    borderRadius: 2,
                                }}
                            >
                                <FlareIcon sx={{ fontSize: 36, color: "text.secondary", opacity: 0.3, mb: 2 }} />
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.75 }}>
                                    No enrichments yet
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, maxWidth: 340, mx: "auto" }}>
                                    Click <strong>Enrich</strong> to fetch live data from {company.domain} and extract signals, keywords, and a thesis match score.
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<FlareIcon />}
                                    onClick={() => { handleEnrich(); }}
                                    sx={{ fontFamily: '"DM Sans", sans-serif' }}
                                >
                                    Enrich Now
                                </Button>
                            </Box>
                        ) : enriching ? (
                            <Box sx={{ textAlign: "center", py: 10 }}>
                                <LinearProgress sx={{ maxWidth: 240, mx: "auto", mb: 2, borderRadius: 1 }} />
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    Fetching and analyzing {company.domain}...
                                </Typography>
                            </Box>
                        ) : (
                            <EnrichmentHistory history={company.enrichmentHistory || []} />
                        )}
                    </>
                )}

                {/* Tab 2: Signals */}
                {tab === 2 && (
                    <Stack spacing={1.5}>
                        {(company.signals || []).length === 0 ? (
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>No signals yet.</Typography>
                        ) : (
                            company.signals.map((signal) => (
                                <Paper key={signal.id} sx={{ p: 2.5, display: "flex", gap: 2 }}>
                                    <Box
                                        sx={{
                                            width: 8, borderRadius: 4, flexShrink: 0,
                                            bgcolor: signal.type === "funding" ? "#818CF8" : signal.type === "hiring" ? "#6EE7B7" : signal.type === "product" ? "#60A5FA" : "#FCD34D",
                                        }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{signal.title}</Typography>
                                            <Chip label={signal.type} size="small" sx={{ height: 18, fontSize: "0.625rem" }} />
                                        </Box>
                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>{signal.description}</Typography>
                                        <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: '"IBM Plex Mono", monospace', mt: 0.75, display: "block" }}>
                                            {signal.date} {signal.source && `· ${signal.source}`}
                                        </Typography>
                                    </Box>
                                </Paper>
                            ))
                        )}
                    </Stack>
                )}

                {/* Tab 3: Notes */}
                {tab === 3 && (
                    <Stack spacing={2}>
                        <Box sx={{ display: "flex", gap: 1.5 }}>
                            <TextField
                                fullWidth
                                placeholder="Add a note..."
                                size="small"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddNote()}
                                multiline
                                maxRows={4}
                            />
                            <Button variant="contained" onClick={handleAddNote} disabled={savingNote || !noteText.trim()} sx={{ fontFamily: '"DM Sans", sans-serif', flexShrink: 0 }}>
                                Add
                            </Button>
                        </Box>
                        {(company.notes || []).map((note) => (
                            <Paper key={note.id} sx={{ p: 2.5 }}>
                                <Typography variant="body2" sx={{ lineHeight: 1.7 }}>{note.content}</Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: '"IBM Plex Mono", monospace', mt: 1, display: "block" }}>
                                    {note.author} · {new Date(note.createdAt).toLocaleDateString()}
                                </Typography>
                            </Paper>
                        ))}
                        {(company.notes || []).length === 0 && (
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>No notes yet. Add your first note above.</Typography>
                        )}
                    </Stack>
                )}


            </Box>


            {/* New List Dialog */}
            <Dialog
                open={newListDialogOpen}
                onClose={() => { setNewListDialogOpen(false); setNewListName(""); }}
                PaperProps={{ sx: { width: 400, bgcolor: "background.paper" } }}
            >
                <DialogTitle sx={{ fontFamily: '"DM Sans", sans-serif', pb: 1 }}>
                    Create New List
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        size="small"
                        label="List name"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && newListName.trim()) {
                                createList(newListName.trim());
                                setNewListDialogOpen(false);
                                setNewListName("");
                            }
                        }}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => { setNewListDialogOpen(false); setNewListName(""); }}
                        sx={{ fontFamily: '"DM Sans", sans-serif' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={!newListName.trim()}
                        onClick={() => {
                            createList(newListName.trim());
                            setNewListDialogOpen(false);
                            setNewListName("");
                        }}
                        sx={{ fontFamily: '"DM Sans", sans-serif' }}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}