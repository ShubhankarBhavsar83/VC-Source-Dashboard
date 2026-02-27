"use client";
import { useRouter } from "next/navigation";
import {
    Box, Typography, Button, Paper, IconButton, Chip, Stack,
    alpha, useTheme,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import { useAppStore } from "@/store";

export default function SavedPage() {
    const router = useRouter();
    const theme = useTheme();
    const { savedSearches, deleteSavedSearch } = useAppStore();

    const runSearch = (filters: Record<string, unknown>) => {
        const params = new URLSearchParams();
        if (filters.query) params.set("query", filters.query as string);
        (filters.stages as string[] || []).forEach((s) => params.append("stage", s));
        (filters.sectors as string[] || []).forEach((s) => params.append("sector", s));
        router.push(`/companies?${params.toString()}`);
    };

    return (
        <Box sx={{ height: "100vh", overflow: "auto" }}>
            <Box sx={{ px: 3, pt: 3, pb: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>Saved Searches</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: '"IBM Plex Mono", monospace' }}>
                    {savedSearches.length} saved {savedSearches.length === 1 ? "search" : "searches"}
                </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
                {savedSearches.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 10 }}>
                        <BookmarkBorderIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2, opacity: 0.4 }} />
                        <Typography variant="body1" sx={{ color: "text.secondary", mb: 1 }}>No saved searches yet.</Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Go to Companies, filter by what you need, and save the search for quick access.
                        </Typography>
                        <Box sx={{ mt: 3 }}>
                            <Button variant="outlined" startIcon={<SearchIcon />} onClick={() => router.push("/companies")} sx={{ fontFamily: '"DM Sans", sans-serif' }}>
                                Browse Companies
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Stack spacing={1.5}>
                        {savedSearches.map((search) => (
                            <Paper key={search.id} sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
                                <SearchIcon sx={{ fontSize: 18, color: "text.secondary", flexShrink: 0 }} />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: '"DM Sans", sans-serif', mb: 0.75 }}>
                                        {search.name}
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                                        {search.filters.query && (
                                            <Chip label={`"${search.filters.query}"`} size="small" color="primary" variant="outlined" />
                                        )}
                                        {(search.filters.stages || []).map((s) => <Chip key={s} label={s} size="small" />)}
                                        {(search.filters.sectors || []).map((s) => <Chip key={s} label={s} size="small" />)}
                                    </Box>
                                </Box>
                                <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: '"IBM Plex Mono", monospace', flexShrink: 0 }}>
                                    {new Date(search.createdAt).toLocaleDateString()}
                                </Typography>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<PlayArrowIcon />}
                                    onClick={() => runSearch(search.filters as Record<string, unknown>)}
                                    sx={{ fontFamily: '"DM Sans", sans-serif', flexShrink: 0 }}
                                >
                                    Run
                                </Button>
                                <IconButton size="small" color="error" onClick={() => deleteSavedSearch(search.id)}>
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Box>
        </Box>
    );
}