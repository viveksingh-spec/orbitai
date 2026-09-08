export default function CompanyLoading() {
  return (
    <main className="orbit-shell detail-shell">
      <header className="orbit-header">
        <span className="brand-mark"><span>AI</span> ORBIT</span>
      </header>
      <div className="detail-loading" aria-label="Loading company">
        <div className="detail-logo skeleton" />
        <div className="skeleton-line" />
        <div className="skeleton-copy" />
      </div>
    </main>
  );
}
