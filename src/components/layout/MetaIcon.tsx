export function MetaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="12" width="4.6" height="9" rx="1.2" fill="currentColor" opacity=".75" />
      <rect x="9.7" y="4" width="4.6" height="17" rx="1.2" fill="currentColor" />
      <rect x="16.4" y="8.5" width="4.6" height="12.5" rx="1.2" fill="currentColor" opacity=".85" />
    </svg>
  );
}
