"use client";
import { Box, Typography, Tooltip } from "@mui/material";

function getScoreColor(score: number) {
  if (score >= 80) return "#6EE7B7";
  if (score >= 60) return "#FCD34D";
  if (score >= 40) return "#FB923C";
  return "#F87171";
}

export default function ScoreBadge({ score, size = "small" }: { score: number; size?: "small" | "large" }) {
  const color = getScoreColor(score);
  const isLarge = size === "large";

  return (
    <Tooltip title={`Thesis match: ${score}/100`}>
      <Box
        sx={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: isLarge ? 56 : 36,
          height: isLarge ? 56 : 24,
          borderRadius: isLarge ? 2 : 1,
          bgcolor: `${color}15`,
          border: `1px solid ${color}40`,
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
          "&::before": {
            content: '""',
            position: "absolute",
            left: 0,
            bottom: 0,
            right: 0,
            height: `${score}%`,
            bgcolor: `${color}08`,
          },
        }}
      >
        <Typography
          sx={{
            fontSize: isLarge ? "1.125rem" : "0.6875rem",
            fontWeight: 700,
            color,
            fontFamily: '"IBM Plex Mono", monospace',
            position: "relative",
            zIndex: 1,
            lineHeight: 1,
          }}
        >
          {score}
        </Typography>
        {isLarge && (
          <Typography
            sx={{
              fontSize: "0.5rem",
              color,
              fontFamily: '"IBM Plex Mono", monospace',
              position: "relative",
              zIndex: 1,
              lineHeight: 1,
              mt: 0.5,
              opacity: 0.7,
              letterSpacing: "0.05em",
            }}
          >
            / 100
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}