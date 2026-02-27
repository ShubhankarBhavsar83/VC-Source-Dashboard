"use client";
import { createTheme, alpha } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6EE7B7",
      light: "#A7F3D0",
      dark: "#34D399",
      contrastText: "#0A0F1E",
    },
    secondary: {
      main: "#818CF8",
      light: "#A5B4FC",
      dark: "#6366F1",
    },
    background: {
      default: "#070B14",
      paper: "#0D1117",
    },
    divider: "rgba(255,255,255,0.06)",
    text: {
      primary: "#F0F4FF",
      secondary: "#8B95AE",
    },
    success: { main: "#6EE7B7" },
    warning: { main: "#FCD34D" },
    error: { main: "#F87171" },
    info: { main: "#60A5FA" },
  },
  typography: {
    fontFamily: '"IBM Plex Mono", "JetBrains Mono", "Fira Code", monospace',
    h1: { fontFamily: '"DM Sans", sans-serif', fontWeight: 700, letterSpacing: "-0.03em" },
    h2: { fontFamily: '"DM Sans", sans-serif', fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontFamily: '"DM Sans", sans-serif', fontWeight: 600, letterSpacing: "-0.02em" },
    h4: { fontFamily: '"DM Sans", sans-serif', fontWeight: 600, letterSpacing: "-0.01em" },
    h5: { fontFamily: '"DM Sans", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"DM Sans", sans-serif', fontWeight: 600 },
    body1: { fontSize: "0.875rem", lineHeight: 1.6 },
    body2: { fontSize: "0.8125rem", lineHeight: 1.5 },
    caption: { fontSize: "0.75rem", letterSpacing: "0.04em" },
    overline: { fontSize: "0.6875rem", letterSpacing: "0.1em", fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `radial-gradient(ellipse at 20% 0%, rgba(110, 231, 183, 0.04) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 100%, rgba(129, 140, 248, 0.04) 0%, transparent 60%)`,
          backgroundAttachment: "fixed",
          scrollbarWidth: "thin",
          scrollbarColor: "#1E2333 transparent",
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: "#1E2333", borderRadius: 3 },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(8px)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          letterSpacing: "0.01em",
          fontFamily: '"DM Sans", sans-serif',
        },
        contained: {
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: "0.6875rem",
          height: 22,
          borderRadius: 4,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.1)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.2)",
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "1px solid rgba(255,255,255,0.06)",
          background: "#0A0E1A",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: "rgba(255,255,255,0.04)",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: "0.6875rem",
          background: "#1A2035",
          border: "1px solid rgba(255,255,255,0.1)",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4 },
      },
    },
  },
});