export default function SeenStatus({ isRead, variant = "light" }) {
  return (
    <span
      className={`seen-status ${isRead ? "seen-read" : "seen-sent"} seen-${variant}`}
      title={isRead ? "Vu" : "Envoyé"}
    >
      <svg viewBox="0 0 16 11" fill="none" aria-hidden="true">
        <path
          d="M1 5.5L4.5 9L10 2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.5 5.5L9 9L15.5 2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isRead ? 1 : 0}
        />
      </svg>
      {isRead && <span className="seen-label">Vu</span>}
    </span>
  );
}
