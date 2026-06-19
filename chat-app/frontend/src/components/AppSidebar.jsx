import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Badge from "@mui/material/Badge";
import Typography from "@mui/material/Typography";
import LogoutIcon from "@mui/icons-material/Logout";
import UserAvatar from "./UserAvatar";

const DRAWER_WIDTH = 260;

export default function AppSidebar({
  mobileOpen,
  onMobileClose,
  logo,
  subtitle,
  navItems,
  activeTab,
  onTabChange,
  user,
  roleLabel,
  onLogout,
}) {
  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
      }}
    >
      <Box sx={{ p: 2.5, borderBottom: 1, borderColor: "divider" }}>
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{ maxWidth: "100%", height: 48, objectFit: "contain" }}
        />
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.id}
            selected={activeTab === item.id}
            onClick={() => onTabChange(item.id)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "white",
                "& .MuiListItemIcon-root": { color: "white" },
                "&:hover": { bgcolor: "primary.dark" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
            {item.badge ? (
              <Badge badgeContent={item.badge} color="error" sx={{ mr: 1 }} />
            ) : null}
          </ListItemButton>
        ))}
      </List>

      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <UserAvatar name={user?.nom} size="sm" />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {user?.nom}
          </Typography>
          <Typography variant="caption" color="success.main">
            ● {roleLabel}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onLogout} title="Déconnexion">
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            position: "relative",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export { DRAWER_WIDTH };
