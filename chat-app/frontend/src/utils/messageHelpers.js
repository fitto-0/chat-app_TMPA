export function getSenderId(msg) {
  if (!msg?.senderId) return "";
  if (typeof msg.senderId === "object") {
    return String(msg.senderId._id ?? msg.senderId.id ?? "");
  }
  return String(msg.senderId);
}

export function isOwnMessage(msg, userId) {
  if (!userId || !msg) return false;
  return getSenderId(msg) === String(userId);
}
