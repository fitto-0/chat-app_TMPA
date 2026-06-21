import DoneAllIcon from "@mui/icons-material/DoneAll";

export default function SeenStatus({ isRead }) {
  return (
    <DoneAllIcon
      sx={{
        fontSize: 14,
        color: isRead ? "#53bdeb" : "rgba(255,255,255,0.55)",
        flexShrink: 0,
      }}
      titleAccess={isRead ? "Vu" : "Envoyé"}
    />
  );
}
