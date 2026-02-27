"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
    Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
    Typography, IconButton, Divider, Chip, Avatar, Tooltip,
    useTheme, alpha, Badge,
} from "@mui/material";
import {
    GridView as GridViewIcon,
    BookmarkBorder as BookmarkIcon,
    FolderOpenOutlined as FolderIcon,
    TuneOutlined as TuneIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    FlareOutlined as FlareIcon,
    SearchOutlined as SearchIcon,
    KeyboardCommandKey as CmdIcon,
} from "@mui/icons-material";
import { useAppStore } from "@/store";
import ThesisPanel from "../layout/ThesisPanel";
import GlobalSearch from "./GlobalSearch";

const DRAWER_WIDTH = 220;
const COLLAPSED_WIDTH = 64;

const navItems = [
    { label: "Companies", icon: <GridViewIcon fontSize="small" />, path: "/companies" },
    { label: "Saved", icon: <BookmarkIcon fontSize="small" />, path: "/saved" },
    { label: "Lists", icon: <FolderIcon fontSize="small" />, path: "/lists" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const theme = useTheme();
    const { sidebarOpen, setSidebarOpen } = useAppStore();
    const [thesisPanelOpen, setThesisPanelOpen] = useState(false);
    const { activeTesis } = useAppStore();
    const [searchOpen, setSearchOpen] = useState(false);


    const drawerWidth = sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH;

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setSearchOpen(true);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    return (

        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
            {/* Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    transition: "width 0.2s ease",
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        overflowX: "hidden",
                        transition: "width 0.2s ease",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                    },
                }}
            >
                {/* Logo */}
                <Box sx={{ px: sidebarOpen ? 2.5 : 1.5, py: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            fontFamily: '"DM Sans", sans-serif',
                            flexShrink: 0,
                        }}
                    >
                        S
                    </Avatar>
                    {sidebarOpen && (
                        <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                            Scout
                        </Typography>
                    )}
                </Box>

                <Divider />

                {/* Search */}
                {sidebarOpen ? (
                    <Box sx={{ px: 1.5, py: 1.5 }}>
                        <Box
                            onClick={() => setSearchOpen(true)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                px: 1.5,
                                py: 1,
                                borderRadius: 1,
                                border: "1px solid",
                                borderColor: "divider",
                                cursor: "pointer",
                                color: "text.secondary",
                                fontSize: "0.75rem",
                                fontFamily: '"IBM Plex Mono", monospace',
                                "&:hover": { borderColor: "primary.main", color: "primary.main" },
                                transition: "all 0.15s",
                            }}
                        >
                            <SearchIcon sx={{ fontSize: 14, flexShrink: 0 }} />
                            <Typography variant="caption" sx={{ flex: 1, fontFamily: "inherit" }}>
                                Search...
                            </Typography>
                            <Chip label="⌘K" size="small" sx={{ height: 16, fontSize: "0.625rem" }} />
                        </Box>
                    </Box>
                ) : (
                    <Tooltip title="Search (⌘K)" placement="right">
                        <Box
                            onClick={() => setSearchOpen(true)}
                            sx={{
                                mx: "auto",
                                width: 36,
                                height: 36,
                                borderRadius: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                color: "text.secondary",
                                border: "1px solid",
                                borderColor: "divider",
                                mt: 1,
                                "&:hover": { borderColor: "primary.main", color: "primary.main" },
                                transition: "all 0.15s",
                            }}
                        >
                            <SearchIcon sx={{ fontSize: 16 }} />
                        </Box>
                    </Tooltip>
                )}
                {/* Nav items */}
                <List sx={{ px: 1, py: 0.5, flex: 1 }}>
                    {navItems.map((item) => {
                        const active = pathname === item.path || pathname.startsWith(item.path + "/");
                        return (
                            <Tooltip key={item.path} title={!sidebarOpen ? item.label : ""} placement="right">
                                <ListItemButton
                                    onClick={() => router.push(item.path)}
                                    selected={active}
                                    sx={{
                                        borderRadius: 1,
                                        mb: 0.5,
                                        px: sidebarOpen ? 1.5 : 1,
                                        py: 0.875,
                                        minHeight: 36,
                                        justifyContent: sidebarOpen ? "flex-start" : "center",
                                        "&.Mui-selected": {
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: "primary.main",
                                            "& .MuiListItemIcon-root": { color: "primary.main" },
                                            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.14) },
                                        },
                                        "&:hover": { bgcolor: alpha(theme.palette.common.white, 0.04) },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: sidebarOpen ? 32 : "unset", color: "text.secondary" }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    {sidebarOpen && (
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{
                                                fontSize: "0.8125rem",
                                                fontWeight: active ? 600 : 400,
                                                fontFamily: '"DM Sans", sans-serif',
                                            }}
                                        />
                                    )}
                                </ListItemButton>
                            </Tooltip>
                        );
                    })}
                </List>

                <Divider />

                {/* Thesis button */}
                <Box sx={{ px: 1, py: 1 }}>
                    <Tooltip title={!sidebarOpen ? "Fund Thesis" : ""} placement="right">
                        <ListItemButton
                            onClick={() => setThesisPanelOpen(true)}
                            sx={{
                                borderRadius: 1,
                                px: sidebarOpen ? 1.5 : 1,
                                py: 0.875,
                                justifyContent: sidebarOpen ? "flex-start" : "center",
                                color: activeTesis ? "secondary.main" : "text.secondary",
                                "&:hover": { bgcolor: alpha(theme.palette.secondary.main, 0.08) },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: sidebarOpen ? 32 : "unset", color: "inherit" }}>
                                <Badge variant="dot" color="secondary" invisible={!activeTesis}>
                                    <TuneIcon fontSize="small" />
                                </Badge>
                            </ListItemIcon>
                            {sidebarOpen && (
                                <ListItemText
                                    primary="Thesis"
                                    secondary={activeTesis ? activeTesis.name : "Not configured"}
                                    primaryTypographyProps={{ fontSize: "0.8125rem", fontWeight: 500, fontFamily: '"DM Sans", sans-serif' }}
                                    secondaryTypographyProps={{ fontSize: "0.6875rem", fontFamily: '"IBM Plex Mono", monospace', noWrap: true }}
                                />
                            )}
                        </ListItemButton>
                    </Tooltip>
                </Box>

                {/* Collapse toggle */}
                <Box sx={{ px: 1, pb: 1.5 }}>
                    <IconButton
                        size="small"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        sx={{
                            width: "100%",
                            borderRadius: 1,
                            color: "text.secondary",
                            "&:hover": { bgcolor: alpha(theme.palette.common.white, 0.04) },
                        }}
                    >
                        {sidebarOpen ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                    </IconButton>
                </Box>
            </Drawer>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    overflow: "hidden",
                }}
            >
                {children}
            </Box>

            {/* Thesis panel drawer */}
            <ThesisPanel open={thesisPanelOpen} onClose={() => setThesisPanelOpen(false)} />
            <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
        </Box>
    );
}