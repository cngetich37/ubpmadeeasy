// Full-height placeholder shown while a lazily loaded page downloads.
const PageLoader = () => (
  <div
    className="flex justify-center items-center min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 dark:from-[var(--color-bg)] dark:via-[var(--color-surface)] dark:to-[var(--color-bg)]"
    role="status"
    aria-label="Loading page"
  >
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FFD700]" />
  </div>
);

export default PageLoader;
