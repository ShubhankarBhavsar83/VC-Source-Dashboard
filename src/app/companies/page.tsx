"use client";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Box, Typography, TextField, InputAdornment, Chip,
    Button, Menu, MenuItem,
    Select, FormControl, InputLabel, OutlinedInput,
    alpha, useTheme, Dialog, DialogContent, DialogTitle, DialogActions,
    Divider,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams, GridRowSelectionModel } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import FlareIcon from "@mui/icons-material/Flare";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import AddIcon from "@mui/icons-material/Add";
import type { Company } from "@/types";
import { useAppStore } from "@/store";
import StageChip from "@/components/companies/StageChip";
import ScoreBadge from "@/components/companies/ScoreBadge";

const SECTORS = ["Developer Tools", "AI Infrastructure", "Cloud Infrastructure", "Data Infrastructure", "Climate Tech", "FinTech", "HealthTech", "Consumer"];
const STAGES = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+"];

function CompaniesPage() {
    const router = useRouter();
    const theme = useTheme();
    const { activeTesis, saveSearch, lists, addToList } = useAppStore();

    const [companies, setCompanies] = useState<Company[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [selectedStages, setSelectedStages] = useState<string[]>([]);
    const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
    const [page, setPage] = useState(0);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Save search dialog
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [saveSearchName, setSaveSearchName] = useState("");

    // Bulk selection
    const [rowSelection, setRowSelection] = useState<GridRowSelectionModel>([]);

    // Bulk add to list
    const [addToListMenuAnchor, setAddToListMenuAnchor] = useState<null | HTMLElement>(null);
    const [newListDialogOpen, setNewListDialogOpen] = useState(false);
    const [newListName, setNewListName] = useState("");

    // Bulk export
    const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

    const searchParams = useSearchParams();

    useEffect(() => {
        const q = searchParams.get("query");
        const stages = searchParams.getAll("stage");
        const sectors = searchParams.getAll("sector");
        if (q) setQuery(q);
        if (stages.length) setSelectedStages(stages);
        if (sectors.length) setSelectedSectors(sectors);
    }, []);

    // Clear selection when page/filters change
    useEffect(() => {
        setRowSelection([]);
    }, [page, query, selectedStages, selectedSectors]);

    const handleSaveSearch = () => {
        if (!saveSearchName.trim()) return;
        saveSearch(saveSearchName.trim(), {
            query: query || undefined,
            stages: selectedStages.length ? selectedStages : undefined,
            sectors: selectedSectors.length ? selectedSectors : undefined,
        });
        setSaveSearchName("");
        setSaveDialogOpen(false);
    };

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (query) params.set("query", query);
            selectedStages.forEach((s) => params.append("stage", s));
            selectedSectors.forEach((s) => params.append("sector", s));
            params.set("page", String(page + 1));
            params.set("limit", "20");

            const res = await fetch(`/api/companies?${params}`);
            const data = await res.json();
            setCompanies(data.companies || []);
            setTotal(data.total || 0);
        } finally {
            setLoading(false);
        }
    }, [query, selectedStages, selectedSectors, page]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(fetchCompanies, query ? 300 : 0);
    }, [fetchCompanies, query]);

    const selectedCompanies = companies.filter((c) => rowSelection.includes(c._id));

    const handleBulkAddToList = (listId: string) => {
        selectedCompanies.forEach((c) => addToList(listId, c._id));
        setAddToListMenuAnchor(null);
        setRowSelection([]);
    };

    const handleCreateListAndAdd = () => {
        if (!newListName.trim()) return;
        const idsToAdd = selectedCompanies.map((c) => c._id);
        const newListId = crypto.randomUUID();
        // Inline list creation with pre-populated companyIds — avoids async timing issues
        useAppStore.setState((state) => ({
            lists: [
                ...state.lists,
                {
                    id: newListId,
                    name: newListName.trim(),
                    description: "",
                    companyIds: idsToAdd,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ],
        }));
        setNewListName("");
        setNewListDialogOpen(false);
        setAddToListMenuAnchor(null);
        setRowSelection([]);
    };

    const handleBulkExport = (format: "csv" | "json") => {
        setExportMenuAnchor(null);
        const targets = selectedCompanies;
        if (format === "json") {
            const data = JSON.stringify({
                exportedAt: new Date().toISOString(),
                count: targets.length,
                companies: targets.map((c) => ({
                    name: c.name, domain: c.domain, stage: c.stage,
                    sector: c.sector, location: c.location, founded: c.founded,
                    employees: c.employees, tags: c.tags, description: c.description,
                    website: c.website,
                })),
            }, null, 2);
            download(data, "application/json", "companies.json");
        } else {
            const headers = ["name", "domain", "stage", "sector", "location", "founded", "employees", "website", "tags"];
            const rows = targets.map((c) =>
                [c.name, c.domain, c.stage, c.sector, c.location, c.founded, c.employees, c.website, (c.tags || []).join(";")]
                    .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
                    .join(",")
            );
            download([headers.join(","), ...rows].join("\n"), "text/csv", "companies.csv");
        }
        setRowSelection([]);
    };

    const download = (data: string, type: string, filename: string) => {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const columns: GridColDef[] = [
        {
            field: "name",
            headerName: "Company",
            flex: 1.5,
            minWidth: 180,
            renderCell: (params: GridRenderCellParams<Company>) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, height: "100%", overflow: "hidden" }}>
                    <Box
                        sx={{
                            width: 28, height: 28, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.6875rem", fontWeight: 700, color: "primary.main",
                            fontFamily: '"DM Sans", sans-serif', flexShrink: 0,
                            border: "1px solid", borderColor: alpha(theme.palette.primary.main, 0.2),
                        }}
                    >
                        {params.row.name.charAt(0)}
                    </Box>
                    <Box sx={{ overflow: "hidden" }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: '"DM Sans", sans-serif', lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {params.row.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: '"IBM Plex Mono", monospace', whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                            {params.row.domain}
                        </Typography>
                    </Box>
                </Box>
            ),
        },
        {
            field: "stage", headerName: "Stage", width: 110,
            renderCell: (params) => (
                <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
                    <StageChip stage={params.value} />
                </Box>
            ),
        },
        {
            field: "sector", headerName: "Sector", flex: 1, minWidth: 150,
            renderCell: (params) => (
                <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>{params.value}</Typography>
                </Box>
            ),
        },
        {
            field: "location", headerName: "Location", flex: 0.8, minWidth: 130,
            renderCell: (params) => (
                <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: '"IBM Plex Mono", monospace' }}>{params.value}</Typography>
                </Box>
            ),
        },
        {
            field: "tags", headerName: "Tags", flex: 1.5, minWidth: 200, sortable: false,
            renderCell: (params: GridRenderCellParams<Company>) => (
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "center", height: "100%", overflow: "hidden" }}>
                    {(params.row.tags || []).slice(0, 3).map((tag: string) => (
                        <Chip key={tag} label={tag} size="small" sx={{ height: 18, fontSize: "0.625rem" }} />
                    ))}
                    {(params.row.tags?.length || 0) > 3 && (
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>+{params.row.tags.length - 3}</Typography>
                    )}
                </Box>
            ),
        },
        {
            field: "thesisScore", headerName: "Score", width: 90,
            renderCell: (params: GridRenderCellParams<Company>) =>
                params.row.thesisScore
                    ? <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}><ScoreBadge score={params.row.thesisScore.score} /></Box>
                    : <Typography variant="caption" sx={{ color: "text.secondary" }}>—</Typography>,
        },
        {
            field: "enrichment", headerName: "Enriched", width: 80, sortable: false,
            renderCell: (params: GridRenderCellParams<Company>) => (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
                    {params.row.enrichment
                        ? <FlareIcon sx={{ fontSize: 14, color: "primary.main" }} />
                        : <Typography variant="caption" sx={{ color: "text.secondary" }}>—</Typography>
                    }
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
            {/* Header */}
            <Box sx={{ px: 3, pt: 3, pb: 2, borderBottom: "1px solid", borderColor: "divider", flexShrink: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
                            Companies
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: '"IBM Plex Mono", monospace' }}>
                            {total} {total === 1 ? "company" : "companies"} in database
                        </Typography>
                    </Box>
                    {activeTesis && (
                        <Chip
                            icon={<FlareIcon sx={{ fontSize: "12px !important" }} />}
                            label={`Scoring: ${activeTesis.name}`}
                            color="secondary"
                            size="small"
                            sx={{ fontFamily: '"IBM Plex Mono", monospace' }}
                        />
                    )}
                </Box>

                {/* Filters */}
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                    <TextField
                        placeholder="Search companies, sectors, tags..."
                        size="small"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "text.secondary" }} /></InputAdornment>,
                        }}
                        sx={{ minWidth: 280 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Stage</InputLabel>
                        <Select
                            multiple
                            value={selectedStages}
                            onChange={(e) => setSelectedStages(typeof e.target.value === "string" ? [e.target.value] : e.target.value)}
                            input={<OutlinedInput label="Stage" />}
                            renderValue={(selected) => selected.join(", ")}
                        >
                            {STAGES.map((s) => <MenuItem key={s} value={s}><Typography variant="body2">{s}</Typography></MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Sector</InputLabel>
                        <Select
                            multiple
                            value={selectedSectors}
                            onChange={(e) => setSelectedSectors(typeof e.target.value === "string" ? [e.target.value] : e.target.value)}
                            input={<OutlinedInput label="Sector" />}
                            renderValue={(selected) => selected.slice(0, 2).join(", ")}
                        >
                            {SECTORS.map((s) => <MenuItem key={s} value={s}><Typography variant="body2">{s}</Typography></MenuItem>)}
                        </Select>
                    </FormControl>
                    {(selectedStages.length > 0 || selectedSectors.length > 0) && (
                        <Button size="small" onClick={() => { setSelectedStages([]); setSelectedSectors([]); }} sx={{ fontFamily: '"DM Sans", sans-serif' }}>
                            Clear filters
                        </Button>
                    )}
                    {(query || selectedStages.length > 0 || selectedSectors.length > 0) && (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<BookmarkBorderIcon />}
                            onClick={() => setSaveDialogOpen(true)}
                            sx={{ fontFamily: '"DM Sans", sans-serif', ml: "auto" }}
                        >
                            Save Search
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Bulk action bar — only visible when rows are selected */}
            {rowSelection.length > 0 && (
                <Box
                    sx={{
                        px: 3, py: 1.25, flexShrink: 0,
                        display: "flex", alignItems: "center", gap: 1.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                        borderBottom: "1px solid",
                        borderBottomColor: alpha(theme.palette.primary.main, 0.2),
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "primary.main", fontFamily: '"IBM Plex Mono", monospace', mr: 1 }}
                    >
                        {rowSelection.length} selected
                    </Typography>

                    {/* Add to list */}
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PlaylistAddIcon />}
                        onClick={(e) => setAddToListMenuAnchor(e.currentTarget)}
                        sx={{ fontFamily: '"DM Sans", sans-serif' }}
                    >
                        Add to List
                    </Button>
                    <Menu
                        anchorEl={addToListMenuAnchor}
                        open={Boolean(addToListMenuAnchor)}
                        onClose={() => setAddToListMenuAnchor(null)}
                    >
                        {lists.length === 0 && (
                            <MenuItem disabled>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>No lists yet</Typography>
                            </MenuItem>
                        )}
                        {lists.map((list) => (
                            <MenuItem key={list.id} onClick={() => handleBulkAddToList(list.id)}>
                                <BookmarkBorderIcon sx={{ mr: 1, fontSize: 16 }} />
                                <Typography variant="body2">{list.name}</Typography>
                                <Typography variant="caption" sx={{ ml: 1, color: "text.secondary" }}>
                                    {list.companyIds.length}
                                </Typography>
                            </MenuItem>
                        ))}
                        <Divider />
                        <MenuItem onClick={() => { setAddToListMenuAnchor(null); setNewListDialogOpen(true); }}>
                            <AddIcon sx={{ mr: 1, fontSize: 16 }} />
                            <Typography variant="body2">New List</Typography>
                        </MenuItem>
                    </Menu>

                    {/* Export selected */}
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={(e) => setExportMenuAnchor(e.currentTarget)}
                        sx={{ fontFamily: '"DM Sans", sans-serif' }}
                    >
                        Export ({rowSelection.length})
                    </Button>
                    <Menu
                        anchorEl={exportMenuAnchor}
                        open={Boolean(exportMenuAnchor)}
                        onClose={() => setExportMenuAnchor(null)}
                    >
                        <MenuItem onClick={() => handleBulkExport("csv")}>
                            <Typography variant="body2">Export as CSV</Typography>
                        </MenuItem>
                        <MenuItem onClick={() => handleBulkExport("json")}>
                            <Typography variant="body2">Export as JSON</Typography>
                        </MenuItem>
                    </Menu>

                    <Box sx={{ flex: 1 }} />

                    <Button
                        size="small"
                        onClick={() => setRowSelection([])}
                        sx={{ fontFamily: '"DM Sans", sans-serif', color: "text.secondary" }}
                    >
                        Clear
                    </Button>
                </Box>
            )}

            {/* DataGrid */}
            <Box sx={{ flex: 1, overflow: "hidden" }}>
                <DataGrid
                    rows={companies}
                    columns={columns}
                    getRowId={(row) => row._id}
                    rowCount={total}
                    loading={loading}
                    paginationMode="server"
                    paginationModel={{ page, pageSize: 20 }}
                    onPaginationModelChange={(m) => setPage(m.page)}
                    pageSizeOptions={[20]}
                    checkboxSelection
                    disableRowSelectionOnClick
                    rowSelectionModel={rowSelection}
                    onRowSelectionModelChange={setRowSelection}
                    onRowClick={(params, event) => {
                        const target = event.target as HTMLElement;
                        if (target.closest(".MuiCheckbox-root")) return;
                        router.push(`/companies/${params.id}`);
                    }}
                    getRowHeight={() => 60}
                    sx={{
                        border: "none",
                        "& .MuiDataGrid-columnHeaders": {
                            bgcolor: "background.paper",
                            borderBottom: "1px solid",
                            borderBottomColor: "divider",
                        },
                        "& .MuiDataGrid-columnHeaderTitle": {
                            fontSize: "0.6875rem",
                            fontFamily: '"IBM Plex Mono", monospace',
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "text.secondary",
                            fontWeight: 600,
                        },
                        "& .MuiDataGrid-row": {
                            cursor: "pointer",
                            "&:hover": { bgcolor: alpha(theme.palette.common.white, 0.02) },
                            "&.Mui-selected": {
                                bgcolor: alpha(theme.palette.primary.main, 0.06),
                                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                            },
                        },
                        "& .MuiDataGrid-cell": {
                            borderBottomColor: "rgba(255,255,255,0.04)",
                            outline: "none !important",
                        },
                        "& .MuiDataGrid-footerContainer": {
                            borderTopColor: "divider",
                        },
                        "& .MuiCheckbox-root": {
                            color: "text.secondary",
                            "&.Mui-checked": { color: "primary.main" },
                        },
                    }}
                />
            </Box>

            {/* Save Search Dialog */}
            <Dialog
                open={saveDialogOpen}
                onClose={() => { setSaveDialogOpen(false); setSaveSearchName(""); }}
                PaperProps={{ sx: { width: 400, bgcolor: "background.paper" } }}
            >
                <DialogTitle sx={{ fontFamily: '"DM Sans", sans-serif', pb: 1 }}>Save Search</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2, mt: 1 }}>
                        {query && <Chip label={`"${query}"`} size="small" color="primary" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />}
                        {selectedStages.map((s) => <Chip key={s} label={s} size="small" sx={{ mr: 0.5, mb: 0.5 }} />)}
                        {selectedSectors.map((s) => <Chip key={s} label={s} size="small" sx={{ mr: 0.5, mb: 0.5 }} />)}
                    </Box>
                    <TextField
                        autoFocus fullWidth size="small" label="Search name"
                        placeholder='e.g. "Seed DevTools EU"'
                        value={saveSearchName}
                        onChange={(e) => setSaveSearchName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveSearch()}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => { setSaveDialogOpen(false); setSaveSearchName(""); }} sx={{ fontFamily: '"DM Sans", sans-serif' }}>Cancel</Button>
                    <Button variant="contained" disabled={!saveSearchName.trim()} onClick={handleSaveSearch} sx={{ fontFamily: '"DM Sans", sans-serif' }}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* New List Dialog (from bulk add) */}
            <Dialog
                open={newListDialogOpen}
                onClose={() => { setNewListDialogOpen(false); setNewListName(""); }}
                PaperProps={{ sx: { width: 400, bgcolor: "background.paper" } }}
            >
                <DialogTitle sx={{ fontFamily: '"DM Sans", sans-serif', pb: 1 }}>Create New List</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus fullWidth size="small" label="List name"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && newListName.trim() && handleCreateListAndAdd()}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => { setNewListDialogOpen(false); setNewListName(""); }} sx={{ fontFamily: '"DM Sans", sans-serif' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        disabled={!newListName.trim()}
                        onClick={handleCreateListAndAdd}
                        sx={{ fontFamily: '"DM Sans", sans-serif' }}
                    >
                        Create & Add {rowSelection.length} {rowSelection.length === 1 ? "company" : "companies"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default function CompaniesPageWrapper() {
  return (
    <Suspense>
      <CompaniesPage />
    </Suspense>
  );
}