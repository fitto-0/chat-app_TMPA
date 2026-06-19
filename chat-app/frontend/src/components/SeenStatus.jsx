import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";

export default function SeenStatus({ isRead }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.25,
        color: isRead ? "#53bdeb" : "rgba(255,255,255,0.65)",
      }}
      title={isRead ? "Vu" : "Envoyé"}
    >
      {isRead ? (
        <DoneAllIcon sx={{ fontSize: 14 }} />
      ) : (
        <DoneIcon sx={{ fontSize: 14 }} />
      )}
      {isRead && (
        <Typography component="span" sx={{ fontSize: "0.65rem", fontWeight: 500 }}>
          Vu
        </Typography>
      )}
    </Box>
  );
}
