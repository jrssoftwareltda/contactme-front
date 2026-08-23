export function Avatar({
  initials,
  online = false,
  size = "md",
}: {
  initials: string;
  online?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return (
    <span className={`avatar avatar--${size}`} aria-label={`Avatar ${initials}`}>
      {initials}
      {online ? <span className="avatar__status" aria-label="Online" /> : null}
    </span>
  );
}
