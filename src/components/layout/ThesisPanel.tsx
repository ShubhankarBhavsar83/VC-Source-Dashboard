"use client";
import { useState } from "react";
import {
  Drawer, Box, Typography, IconButton, Button, TextField,
  Chip, Divider, Stack, alpha, useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useAppStore } from "@/store";
import type { FundThesis } from "@/types";

const EXAMPLE_THESES: FundThesis[] = [
  {
    id: "devtools-seed",
    name: "Dev Tools Seed",
    description: "Early-stage developer tools and infrastructure companies serving engineering teams.",
    criteria: [
      "Developer-first go-to-market",
      "API or SDK as primary product surface",
      "Open-source or usage-based pricing",
      "Strong technical founder",
      "B2B or PLG motion",
    ],
    preferredStages: ["Pre-Seed", "Seed"],
    preferredSectors: ["Developer Tools", "AI Infrastructure", "Cloud Infrastructure", "Data Infrastructure"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "ai-infra-a",
    name: "AI Infrastructure Series A",
    description: "Series A AI infrastructure companies enabling the next wave of AI application development.",
    criteria: [
      "Foundational AI/ML infrastructure layer",
      "Clear enterprise path or enterprise traction",
      "Defensible data flywheel or network effect",
      "GPU or compute efficiency innovation",
    ],
    preferredStages: ["Series A", "Series B"],
    preferredSectors: ["AI Infrastructure", "Developer Tools", "Data Infrastructure"],
    createdAt: new Date().toISOString(),
  },
];

interface ThesisPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function ThesisPanel({ open, onClose }: ThesisPanelProps) {
  const theme = useTheme();
  const { activeTesis, setActiveThesis } = useAppStore();
  const [mode, setMode] = useState<"list" | "create">("list");
  const [form, setForm] = useState({ name: "", description: "", criterion: "" });
  const [criteria, setCriteria] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);

  const stageOptions = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+"];
  const sectorOptions = ["Developer Tools", "AI Infrastructure", "Cloud Infrastructure", "Data Infrastructure", "Climate Tech", "FinTech", "HealthTech", "Consumer"];

  const handleAddCriterion = () => {
    if (form.criterion.trim()) {
      setCriteria((c) => [...c, form.criterion.trim()]);
      setForm((f) => ({ ...f, criterion: "" }));
    }
  };

  const handleCreate = () => {
    if (!form.name) return;
    const thesis: FundThesis = {
      id: crypto.randomUUID(),
      name: form.name,
      description: form.description,
      criteria,
      preferredStages: stages,
      preferredSectors: sectors,
      createdAt: new Date().toISOString(),
    };
    setActiveThesis(thesis);
    setMode("list");
    setForm({ name: "", description: "", criterion: "" });
    setCriteria([]);
    setStages([]);
    setSectors([]);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 400, bgcolor: "background.paper" } }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
        <Box sx={{ px: 3, py: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AutoAwesomeIcon sx={{ fontSize: 18, color: "secondary.main" }} />
            <Typography variant="h6" sx={{ fontSize: "0.9375rem" }}>
              Fund Thesis
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        {mode === "list" ? (
          <Box sx={{ flex: 1, overflow: "auto", p: 2.5 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Quick Load
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              {EXAMPLE_THESES.map((thesis) => (
                <Box
                  key={thesis.id}
                  onClick={() => { setActiveThesis(thesis); onClose(); }}
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    border: "1px solid",
                    borderColor: activeTesis?.id === thesis.id ? "secondary.main" : "divider",
                    cursor: "pointer",
                    bgcolor: activeTesis?.id === thesis.id ? alpha(theme.palette.secondary.main, 0.06) : "transparent",
                    "&:hover": { borderColor: "secondary.main", bgcolor: alpha(theme.palette.secondary.main, 0.04) },
                    transition: "all 0.15s",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: '"DM Sans", sans-serif', mb: 0.5 }}>
                    {thesis.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
                    {thesis.description}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {thesis.preferredStages.map((s) => (
                      <Chip key={s} label={s} size="small" color="secondary" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              ))}
            </Stack>

            {activeTesis && (
              <>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Active Thesis
                </Typography>
                <Box sx={{ p: 2, borderRadius: 1.5, border: "1px solid", borderColor: "secondary.main", bgcolor: alpha(theme.palette.secondary.main, 0.06) }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: '"DM Sans", sans-serif', mb: 1 }}>
                    {activeTesis.name}
                  </Typography>
                  <Stack spacing={0.75}>
                    {activeTesis.criteria.map((c, i) => (
                      <Typography key={i} variant="caption" sx={{ color: "text.secondary", display: "flex", gap: 1 }}>
                        <span style={{ color: "#818CF8" }}>✓</span> {c}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
                <Button
                  size="small"
                  color="error"
                  onClick={() => setActiveThesis(null)}
                  sx={{ mt: 1.5, fontFamily: '"DM Sans", sans-serif' }}
                >
                  Clear Thesis
                </Button>
              </>
            )}

            <Divider sx={{ my: 2 }} />
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setMode("create")}
              sx={{ fontFamily: '"DM Sans", sans-serif' }}
            >
              Create Custom Thesis
            </Button>
          </Box>
        ) : (
          <Box sx={{ flex: 1, overflow: "auto", p: 2.5 }}>
            <Button size="small" onClick={() => setMode("list")} sx={{ mb: 2, fontFamily: '"DM Sans", sans-serif' }}>
              ← Back
            </Button>
            <Stack spacing={2}>
              <TextField label="Thesis Name" size="small" fullWidth value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <TextField label="Description" size="small" fullWidth multiline rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />

              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>Criteria</Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <TextField size="small" placeholder="Add criterion..." value={form.criterion} onChange={(e) => setForm((f) => ({ ...f, criterion: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && handleAddCriterion()} sx={{ flex: 1 }} />
                  <IconButton size="small" onClick={handleAddCriterion} color="primary"><AddIcon /></IconButton>
                </Box>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {criteria.map((c, i) => (
                    <Chip key={i} label={c} size="small" onDelete={() => setCriteria((cr) => cr.filter((_, j) => j !== i))} />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>Preferred Stages</Typography>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {stageOptions.map((s) => (
                    <Chip key={s} label={s} size="small" variant={stages.includes(s) ? "filled" : "outlined"} color={stages.includes(s) ? "secondary" : "default"}
                      onClick={() => setStages((st) => st.includes(s) ? st.filter((x) => x !== s) : [...st, s])} sx={{ cursor: "pointer" }} />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>Preferred Sectors</Typography>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {sectorOptions.map((s) => (
                    <Chip key={s} label={s} size="small" variant={sectors.includes(s) ? "filled" : "outlined"} color={sectors.includes(s) ? "primary" : "default"}
                      onClick={() => setSectors((sc) => sc.includes(s) ? sc.filter((x) => x !== s) : [...sc, s])} sx={{ cursor: "pointer" }} />
                  ))}
                </Box>
              </Box>

              <Button variant="contained" color="secondary" fullWidth onClick={handleCreate} sx={{ fontFamily: '"DM Sans", sans-serif' }}>
                Save & Activate Thesis
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}