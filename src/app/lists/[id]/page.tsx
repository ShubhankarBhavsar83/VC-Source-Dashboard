"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box, Typography, Button, Paper, IconButton,  Stack,
  Tooltip, alpha, useTheme,  Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Menu, MenuItem, Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FlareIcon from "@mui/icons-material/Flare";
import { useAppStore } from "@/store";
import type { Company } from "@/types";
import StageChip from "@/components/companies/StageChip";
import ScoreBadge from "@/components/companies/ScoreBadge";

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const listId = params.id as string;

  const { lists, removeFromList, deleteList } = useAppStore();
  const list = lists.find((l) => l.id === listId);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch company data for all IDs in the list
  const fetchCompanies = useCallback(async () => {
    if (!list || list.companyIds.length === 0) {
      setCompanies([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.all(
        list.companyIds.map((id) =>
          fetch(`/api/companies/${id}`)
            .then((r) => r.json())
            .then((d) => d.company as Company)
            .catch(() => null)
        )
      );
      setCompanies(results.filter(Boolean) as Company[]);
    } catch {
      setError("Failed to load companies.");
    } finally {
      setLoading(false);
    }
  }, [list?.companyIds.join(",")]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Redirect if list not found
  useEffect(() => {
    if (!loading && !list) router.push("/lists");
  }, [list, loading]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === companies.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(companies.map((c) => c._id)));
    }
  };

  const targetCompanies = selected.size > 0
    ? companies.filter((c) => selected.has(c._id))
    : companies;

  const handleExport = (format: "csv" | "json") => {
    setExportMenuAnchor(null);
    if (format === "json") {
      const data = JSON.stringify({
        list: list?.name,
        exportedAt: new Date().toISOString(),
        companies: targetCompanies.map((c) => ({
          name: c.name,
          domain: c.domain,
          stage: c.stage,
          sector: c.sector,
          location: c.location,
          founded: c.founded,
          employees: c.employees,
          tags: c.tags,
          description: c.description,
          website: c.website,
        })),
      }, null, 2);
      download(data, "application/json", `${list?.name ?? "list"}.json`);
    } else {
      const headers = ["name", "domain", "stage", "sector", "location", "founded", "employees", "website", "tags"];
      const rows = targetCompanies.map((c) =>
        [c.name, c.domain, c.stage, c.sector, c.location, c.founded, c.employees, c.website, (c.tags || []).join(";")]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(",")
      );
      const csv = [headers.join(","), ...rows].join("\n");
      download(csv, "text/csv", `${list?.name ?? "list"}.csv`);
    }
  };

  const download = (data: string, type: string, filename: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.toLowerCase().replace(/\s+/g, "-");
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRemove = (companyId: string) => {
    removeFromList(listId, companyId);
    setCompanies((prev) => prev.filter((c) => c._id !== companyId));
    setSelected((prev) => { const next = new Set(prev); next.delete(companyId); return next; });
    setRemoveTarget(null);
  };

  const handleBulkRemove = () => {
    selected.forEach((id) => removeFromList(listId, id));
    setCompanies((prev) => prev.filter((c) => !selected.has(c._id)));
    setSelected(new Set());
  };

  const handleDeleteList = () => {
    deleteList(listId);
    router.push("/lists");
  };

  if (!list) return null;

  return (
    <Box sx={{ height: "100vh", overflow: "auto" }}>
      {/* Top bar */}
      <Box
        sx={{
          px: 3, py: 2,
          borderBottom: "1px solid", borderColor: "divider",
          display: "flex", alignItems: "center", gap: 1.5,
          position: "sticky", top: 0, zIndex: 10,
          bgcolor: "background.default", backdropFilter: "blur(8px)",
        }}
      >
        <IconButton size="small" onClick={() => router.push("/lists")}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>Lists</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>/</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{list.name}</Typography>
        <Box sx={{ flex: 1 }} />

        {/* Export button */}
        <Button
          size="small"
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={(e) => setExportMenuAnchor(e.currentTarget)}
          disabled={companies.length === 0}
          sx={{ fontFamily: '"DM Sans", sans-serif' }}
        >
          {selected.size > 0 ? `Export (${selected.size})` : "Export"}
        </Button>
        <Menu
          anchorEl={exportMenuAnchor}
          open={Boolean(exportMenuAnchor)}
          onClose={() => setExportMenuAnchor(null)}
        >
          <MenuItem onClick={() => handleExport("csv")}>
            <Typography variant="body2">Export as CSV</Typography>
          </MenuItem>
          <MenuItem onClick={() => handleExport("json")}>
            <Typography variant="body2">Export as JSON</Typography>
          </MenuItem>
        </Menu>

        {/* Delete list */}
        <Tooltip title="Delete list">
          <IconButton size="small" color="error" onClick={() => setDeleteDialogOpen(true)}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ maxWidth: 960, mx: "auto", px: 3, pb: 6 }}>
        {/* List header */}
        <Box sx={{ py: 3 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            <Box
              sx={{
                width: 48, height: 48, borderRadius: 2, flexShrink: 0,
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid", borderColor: alpha(theme.palette.secondary.main, 0.2),
              }}
            >
              <FolderOpenIcon sx={{ color: "secondary.main", fontSize: 22 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.02em", mb: 0.5 }}>
                {list.name}
              </Typography>
              {list.description && (
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                  {list.description}
                </Typography>
              )}
              <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: '"IBM Plex Mono", monospace' }}>
                {list.companyIds.length} {list.companyIds.length === 1 ? "company" : "companies"} · Updated {new Date(list.updatedAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>
        )}

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <Paper
            sx={{
              px: 2.5, py: 1.5, mb: 2,
              display: "flex", alignItems: "center", gap: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              border: "1px solid", borderColor: alpha(theme.palette.primary.main, 0.2),
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main", fontFamily: '"IBM Plex Mono", monospace' }}>
              {selected.size} selected
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Button
              size="small"
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={(e) => setExportMenuAnchor(e.currentTarget)}
              sx={{ fontFamily: '"DM Sans", sans-serif' }}
            >
              Export selected
            </Button>
            <Button
              size="small"
              color="error"
              variant="outlined"
              startIcon={<DeleteOutlineIcon />}
              onClick={handleBulkRemove}
              sx={{ fontFamily: '"DM Sans", sans-serif' }}
            >
              Remove selected
            </Button>
            <Button
              size="small"
              onClick={() => setSelected(new Set())}
              sx={{ fontFamily: '"DM Sans", sans-serif', color: "text.secondary" }}
            >
              Clear
            </Button>
          </Paper>
        )}

        {/* Companies list */}
        {loading ? (
          <Stack spacing={1.5}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Paper key={i} sx={{ p: 2.5, opacity: 0.5 }}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: "divider" }} />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ width: 140, height: 14, borderRadius: 1, bgcolor: "divider", mb: 1 }} />
                    <Box sx={{ width: 200, height: 11, borderRadius: 1, bgcolor: "divider" }} />
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        ) : companies.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <FolderOpenIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2, opacity: 0.3 }} />
            <Typography variant="body1" sx={{ color: "text.secondary", mb: 1 }}>
              This list is empty.
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Save companies to this list from their profile page.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button variant="outlined" onClick={() => router.push("/companies")} sx={{ fontFamily: '"DM Sans", sans-serif' }}>
                Browse Companies
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            {/* Select all row */}
            <Box sx={{ display: "flex", alignItems: "center", px: 1, mb: 1 }}>
              <Button
                size="small"
                onClick={toggleSelectAll}
                sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.6875rem", color: "text.secondary" }}
              >
                {selected.size === companies.length ? "Deselect all" : "Select all"}
              </Button>
              <Typography variant="caption" sx={{ ml: "auto", color: "text.secondary", fontFamily: '"IBM Plex Mono", monospace' }}>
                {companies.length} {companies.length === 1 ? "company" : "companies"}
              </Typography>
            </Box>

            <Stack spacing={1}>
              {companies.map((company) => {
                const isSelected = selected.has(company._id);
                return (
                  <Paper
                    key={company._id}
                    onClick={() => toggleSelect(company._id)}
                    sx={{
                      px: 2.5, py: 2,
                      display: "flex", alignItems: "center", gap: 2,
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: isSelected
                        ? alpha(theme.palette.primary.main, 0.4)
                        : "rgba(255,255,255,0.06)",
                      bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.04) : "background.paper",
                      transition: "border-color 0.15s, background-color 0.15s",
                      "&:hover": {
                        borderColor: isSelected
                          ? alpha(theme.palette.primary.main, 0.5)
                          : alpha(theme.palette.common.white, 0.12),
                      },
                    }}
                  >
                    {/* Avatar */}
                    <Box
                      sx={{
                        width: 36, height: 36, borderRadius: 1, flexShrink: 0,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.8125rem", fontWeight: 700, color: "primary.main",
                        fontFamily: '"DM Sans", sans-serif',
                        border: "1px solid", borderColor: alpha(theme.palette.primary.main, 0.2),
                      }}
                    >
                      {company.name.charAt(0)}
                    </Box>

                    {/* Name + domain */}
                    <Box sx={{ flex: 1.5, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600, fontFamily: '"DM Sans", sans-serif',
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}
                      >
                        {company.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary", fontFamily: '"IBM Plex Mono", monospace',
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block",
                        }}
                      >
                        {company.domain}
                      </Typography>
                    </Box>

                    {/* Stage */}
                    <Box sx={{ flexShrink: 0 }}>
                      <StageChip stage={company.stage} />
                    </Box>

                    {/* Sector */}
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary", flex: 1, minWidth: 0,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}
                    >
                      {company.sector}
                    </Typography>

                    {/* Location */}
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary", fontFamily: '"IBM Plex Mono", monospace',
                        flexShrink: 0, display: { xs: "none", md: "block" },
                      }}
                    >
                      {company.location}
                    </Typography>

                    {/* Score badge */}
                    <Box sx={{ flexShrink: 0, width: 36, display: "flex", justifyContent: "center" }}>
                      {company.thesisScore ? (
                        <ScoreBadge score={company.thesisScore.score} size="small" />
                      ) : (
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>—</Typography>
                      )}
                    </Box>

                    {/* Enriched indicator */}
                    <Box sx={{ flexShrink: 0, width: 20, display: "flex", justifyContent: "center" }}>
                      {company.enrichment && (
                        <FlareIcon sx={{ fontSize: 14, color: "primary.main" }} />
                      )}
                    </Box>

                    {/* Actions */}
                    <Box
                      sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tooltip title="Open profile">
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/companies/${company._id}`)}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove from list">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setRemoveTarget(company._id)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          </>
        )}
      </Box>

      {/* Remove single company confirm */}
      <Dialog
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        PaperProps={{ sx: { width: 380 } }}
      >
        <DialogTitle sx={{ fontFamily: '"DM Sans", sans-serif' }}>Remove from list?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            This will remove the company from <strong>{list.name}</strong>. The company profile will not be affected.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRemoveTarget(null)} sx={{ fontFamily: '"DM Sans", sans-serif' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => removeTarget && handleRemove(removeTarget)}
            sx={{ fontFamily: '"DM Sans", sans-serif' }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete list confirm */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { width: 380 } }}
      >
        <DialogTitle sx={{ fontFamily: '"DM Sans", sans-serif' }}>Delete list?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            <strong>{list.name}</strong> and all {list.companyIds.length} saved {list.companyIds.length === 1 ? "company" : "companies"} will be permanently removed. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ fontFamily: '"DM Sans", sans-serif' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteList}
            sx={{ fontFamily: '"DM Sans", sans-serif' }}
          >
            Delete List
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}