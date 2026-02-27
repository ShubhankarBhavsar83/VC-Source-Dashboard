"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, TextField, Box, Typography,
  List, ListItemButton, ListItemText, Divider, Chip,
  InputAdornment, CircularProgress, alpha, useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NorthWestIcon from "@mui/icons-material/NorthWest";

interface SearchResult {
  _id: string;
  name: string;
  domain: string;
  sector: string;
  stage: string;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const theme = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/companies?query=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        setResults(data.companies || []);
        setActiveIndex(0);
      } finally {
        setLoading(false);
      }
    }, 250);
  }, [query]);

  const handleSelect = (id: string) => {
    router.push(`/companies/${id}`);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIndex]) {
        handleSelect(results[activeIndex]._id);
      } else if (query.trim()) {
        router.push(`/companies?query=${encodeURIComponent(query)}`);
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 560,
          maxWidth: "90vw",
          bgcolor: "background.paper",
          backgroundImage: "none",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
          mt: "10vh",
          verticalAlign: "top",
        },
      }}
      sx={{ alignItems: "flex-start" }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Input */}
        <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
          {loading
            ? <CircularProgress size={16} sx={{ flexShrink: 0, color: "text.secondary" }} />
            : <SearchIcon sx={{ fontSize: 18, color: "text.secondary", flexShrink: 0 }} />
          }
          <TextField
            inputRef={inputRef}
            fullWidth
            placeholder="Search companies, sectors, tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="standard"
            InputProps={{ disableUnderline: true }}
            sx={{
              "& input": {
                fontSize: "0.9375rem",
                fontFamily: '"DM Sans", sans-serif',
                color: "text.primary",
                "&::placeholder": { color: "text.secondary" },
              },
            }}
          />
          <Chip
            label="ESC"
            size="small"
            onClick={onClose}
            sx={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: "0.625rem",
              height: 20,
              cursor: "pointer",
              flexShrink: 0,
            }}
          />
        </Box>

        {/* Results */}
        {results.length > 0 && (
          <>
            <Divider />
            <List disablePadding>
              {results.map((company, index) => (
                <ListItemButton
                  key={company._id}
                  selected={index === activeIndex}
                  onClick={() => handleSelect(company._id)}
                  onMouseEnter={() => setActiveIndex(index)}
                  sx={{
                    px: 2,
                    py: 1.25,
                    gap: 1.5,
                    "&.Mui-selected": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 28, height: 28, borderRadius: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.6875rem", fontWeight: 700, color: "primary.main",
                      fontFamily: '"DM Sans", sans-serif', flexShrink: 0,
                      border: "1px solid", borderColor: alpha(theme.palette.primary.main, 0.2),
                    }}
                  >
                    {company.name.charAt(0)}
                  </Box>
                  <ListItemText
                    primary={company.name}
                    secondary={`${company.domain} · ${company.sector}`}
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      fontFamily: '"DM Sans", sans-serif',
                    }}
                    secondaryTypographyProps={{
                      fontSize: "0.75rem",
                      fontFamily: '"IBM Plex Mono", monospace',
                    }}
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                    <Chip
                      label={company.stage}
                      size="small"
                      sx={{ height: 18, fontSize: "0.625rem", fontFamily: '"IBM Plex Mono", monospace' }}
                    />
                    <NorthWestIcon sx={{ fontSize: 14, color: "text.secondary", opacity: index === activeIndex ? 1 : 0 }} />
                  </Box>
                </ListItemButton>
              ))}
            </List>
          </>
        )}

        {/* No results */}
        {query.trim() && !loading && results.length === 0 && (
          <>
            <Divider />
            <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No companies found for <strong>"{query}"</strong>
              </Typography>
            </Box>
          </>
        )}

        {/* Footer hint */}
        <Divider />
        <Box sx={{ px: 2, py: 1, display: "flex", gap: 2 }}>
          {[["↑↓", "navigate"], ["↵", "open"], ["ESC", "close"]].map(([key, label]) => (
            <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Chip label={key} size="small" sx={{ height: 18, fontSize: "0.625rem", fontFamily: '"IBM Plex Mono", monospace' }} />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>{label}</Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}