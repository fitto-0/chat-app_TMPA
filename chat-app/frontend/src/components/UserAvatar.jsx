import Avatar from "@mui/material/Avatar";
import { getAvatarColor } from "../utils/avatarColor";

const SIZES = { sm: 32, md: 40, lg: 48 };

export default function UserAvatar({ name = "?", size = "md" }) {
  const px = SIZES[size] || SIZES.md;
  const color = getAvatarColor(name);

  return (
    <Avatar
      sx={{
        width: px,
        height: px,
        fontSize: px * 0.4,
        bgcolor: color,
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </Avatar>
  );
}
