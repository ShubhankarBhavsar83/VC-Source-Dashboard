"use client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "@/lib/theme";
import AppShell from "../layout/AppShell";

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppShell>{children}</AppShell>
    </ThemeProvider>
  );
}