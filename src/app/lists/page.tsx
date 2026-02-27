"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Typography, Button, Paper, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, alpha, useTheme, Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { useAppStore } from "@/store";

export default function ListsPage() {
  const router = useRouter();
  const theme = useTheme();
  const { lists, createList, deleteList } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const handleCreate = () => {
    if (!form.name.trim()) return;
    createList(form.name.trim(), form.description.trim());
    setForm({ name: "", description: "" });
    setDialogOpen(false);
  };

  const handleExport = (list: typeof lists[0], format: "csv" | "json") => {
    const data = format === "json"
      ? JSON.stringify({ name: list.name, companies: list.companyIds }, null, 2)
      : `id\n${list.companyIds.join("\n")}`;
    const blob = new Blob([data], { type: format === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${list.name.toLowerCase().replace(/\s+/g, "-")}.${format}`;
    a.click();
  };

  return (
    <Box sx={{ height: "100vh", overflow: "auto" }}>
      <Box sx={{ px: 3, pt: 3, pb: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>Lists</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: '"IBM Plex Mono", monospace' }}>
              {lists.length} {lists.length === 1 ? "list" : "lists"}
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ fontFamily: '"DM Sans", sans-serif' }}>
            New List
          </Button>
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        {lists.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <FolderOpenIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2, opacity: 0.4 }} />
            <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>No lists yet. Create one to start organizing companies.</Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ fontFamily: '"DM Sans", sans-serif' }}>
              Create your first list
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 2 }}>
            {lists.map((list) => (
              <Paper
                key={list.id}
                sx={{
                  p: 3, cursor: "pointer",
                  "&:hover": { borderColor: alpha(theme.palette.primary.main, 0.4) },
                  transition: "border-color 0.15s",
                }}
                onClick={() => router.push(`/lists/${list.id}`)}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: '"DM Sans", sans-serif', mb: 0.5 }}>{list.name}</Typography>
                    {list.description && (
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>{list.description}</Typography>
                    )}
                    <Chip
                      label={`${list.companyIds.length} ${list.companyIds.length === 1 ? "company" : "companies"}`}
                      size="small"
                      sx={{ fontFamily: '"IBM Plex Mono", monospace' }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Export JSON">
                      <IconButton size="small" onClick={() => handleExport(list, "json")}>
                        <FileDownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete list">
                      <IconButton size="small" color="error" onClick={() => deleteList(list.id)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: '"IBM Plex Mono", monospace', mt: 1.5, display: "block" }}>
                  Updated {new Date(list.updatedAt).toLocaleDateString()}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} PaperProps={{ sx: { width: 400 } }}>
        <DialogTitle sx={{ fontFamily: '"DM Sans", sans-serif' }}>Create New List</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="List name" size="small" fullWidth value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && handleCreate()} autoFocus />
            <TextField label="Description (optional)" size="small" fullWidth value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ fontFamily: '"DM Sans", sans-serif' }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.name.trim()} sx={{ fontFamily: '"DM Sans", sans-serif' }}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}