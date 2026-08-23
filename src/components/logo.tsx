import Link from "next/link";

export function Logo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className={compact ? "brand-logo brand-logo--compact" : "brand-logo"} aria-label="Contact Me home">
      <img src="/contact-me-logo.svg" alt="Contact Me" />
    </Link>
  );
}
