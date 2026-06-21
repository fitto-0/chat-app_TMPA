import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import UserAvatar from "./UserAvatar";
import SeenStatus from "./SeenStatus";
import formatTime from "../utils/formatTime";

export default function ChatMessage({
  msg,
  isOwn,
  avatarName,
  showAvatar = true,
  showTime = false,
}) {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: isOwn ? "flex-end" : "flex-start",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="flex-end"
        sx={{ maxWidth: "78%" }}
      >
        {!isOwn && showAvatar && <UserAvatar name={avatarName} size="sm" />}

        <Paper
          elevation={0}
          sx={{
            px: 1.5,
            py: 0.75,
            borderRadius: 2.5,
            borderBottomRightRadius: isOwn ? 4 : 16,
            borderBottomLeftRadius: isOwn ? 16 : 4,
            bgcolor: isOwn ? "primary.main" : "background.paper",
            color: isOwn ? "white" : "text.primary",
            border: isOwn ? "none" : 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
            {msg.contenu}
          </Typography>

          {(showTime || isOwn) && (
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              justifyContent="flex-end"
              sx={{ mt: 0.25, minHeight: 16 }}
            >
              {showTime && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.65rem",
                    lineHeight: 1,
                    color: isOwn ? "rgba(255,255,255,0.75)" : "text.secondary",
                  }}
                >
                  {formatTime(msg.createdAt)}
                </Typography>
              )}
              {isOwn && <SeenStatus isRead={msg.isRead} />}
            </Stack>
          )}
        </Paper>

        {isOwn && showAvatar && avatarName && (
          <UserAvatar name={avatarName} size="sm" />
        )}
      </Stack>
    </Box>
  );
}
