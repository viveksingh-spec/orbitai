"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";

type Company = {
  id: number;
  slug: string;
  name: string;
  description: string;
  logoUrl: string | null;
  websiteUrl: string;
  industry: string;
  location: string | null;
  foundedYear: number | null;
  type: string;
  isFeatured: boolean;
  viewCount: number;
};

type ApiResponse = {
  data: Company[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
};

const industries = ["All industries", "Generative AI", "AI Research", "Developer Tools", "Foundation Models"];
const types = ["All company types", "STARTUP", "ENTERPRISE", "RESEARCH_LAB", "NONPROFIT"];

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function CompanyLogo({ company }: { company: Company }) {
  const [failed, setFailed] = useState(false);
  const [source, setSource] = useState(company.logoUrl);
  const favicon = `https://www.google.com/s2/favicons?domain=${new URL(company.websiteUrl).hostname}&sz=128`;

  return failed || !company.logoUrl ? (
    <div className="company-logo company-logo-fallback">{initials(company.name)}</div>
  ) : (
    <img className="company-logo" src={source ?? favicon} alt="" onError={() => { if (source !== favicon) setSource(favicon); else setFailed(true); }} />
  );
}

export default function CompaniesExplorer() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ page: String(page), pageSize: "12", sort });
    if (search.trim()) params.set("search", search.trim());
    if (industry) params.set("industry", industry);
    if (type) params.set("type", type);

    startTransition(() => {
      setLoading(true);
      setError(false);
    });
    fetch(`/api/companies?${params}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Request failed");
        return response.json() as Promise<ApiResponse>;
      })
      .then(setResult)
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [search, industry, type, sort, page]);

  function clearFilters() {
    setSearch("");
    setIndustry("");
    setType("");
    setSort("newest");
    setPage(1);
  }

  return (
    <main className="orbit-shell">
      <header className="orbit-header">
        <button className="menu-button" aria-label="Open navigation menu">☰</button>
        <Link href="/companies" className="brand-mark"><span>AI</span> ORBIT</Link>
        <div className="header-actions"><Link href="/companies" className="submit-link">＋ <span>Submit Tool</span></Link><Link href="/companies" className="login-link">Log In</Link></div>
      </header>

      <section className="directory-hero">
        <h1>The Home of Everything <em>AI</em></h1>
        <p className="hero-copy">Explore the companies shaping the global AI ecosystem.</p>
        <div className="hero-chips"><button className="hero-chip chip-red">◉ Trending</button><button className="hero-chip chip-yellow">◉ Popular</button><button className="hero-chip chip-purple">◉ New</button><button className="hero-chip chip-green">◉ Free</button><button className="hero-chip chip-blue">◉ Top Rated</button></div>
      </section>

      <nav className="orbit-tabs" aria-label="Explore AI categories">{["✦ New", "⌕ Tools", "▣ Agents", "≡ Tasks", "◎ Companies", "◉ News", "▷ Videos"].map((tab) => <Link className={tab.includes("Companies") ? "orbit-tab tab-active" : "orbit-tab"} href="/companies" key={tab}>{tab}</Link>)}</nav>

      <section className="directory-controls" aria-label="Company filters">
        <label className="search-box"><span>⌕</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search companies..." /></label>
        <select value={industry} onChange={(event) => { setIndustry(event.target.value); setPage(1); }} aria-label="Industry">
          {industries.map((option) => <option key={option} value={option === "All industries" ? "" : option}>{option}</option>)}
        </select>
        <select value={type} onChange={(event) => { setType(event.target.value); setPage(1); }} aria-label="Company type">
          {types.map((option) => <option key={option} value={option === "All company types" ? "" : option}>{option.replaceAll("_", " ")}</option>)}
        </select>
        <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} aria-label="Sort companies">
          <option value="newest">Recently added</option><option value="oldest">Oldest first</option><option value="name">Name A-Z</option><option value="featured">Featured only</option>
        </select>
        {(search || industry || type || sort !== "newest") && <button className="clear-button" onClick={clearFilters}>Clear</button>}
      </section>

      <div className="category-strip"><span className="category-label">Browse</span>{industries.map((option) => <button className={industry === (option === "All industries" ? "" : option) ? "category-active" : ""} key={option} onClick={() => { setIndustry(option === "All industries" ? "" : option); setPage(1); }}>{option}</button>)}</div>

      <div className="directory-bar"><span>{result?.pagination.total ?? "--"} companies</span><span className="directory-rule" /><span className="muted">Updated live</span></div>
      <div className="table-head"><span>Company ↕</span><span>Location</span><span>Industry</span><span>Type</span><span>Views ↕</span></div>

      {loading && <div className="company-grid" aria-label="Loading companies">{Array.from({ length: 6 }, (_, index) => <div className="company-card skeleton" key={index} />)}</div>}
      {!loading && error && <div className="state-panel"><strong>Directory unavailable</strong><span>We could not load the company directory.</span><button onClick={() => setPage(page)}>Try again</button></div>}
      {!loading && !error && result?.data.length === 0 && <div className="state-panel"><strong>No companies found</strong><span>Try a different search or clear your filters.</span><button onClick={clearFilters}>Reset filters</button></div>}
      {!loading && !error && result && result.data.length > 0 && <div className="company-grid">{result.data.map((company) => <Link href={`/companies/${company.slug}`} className="company-card" key={company.id}><div className="card-top"><CompanyLogo company={company} /></div><h2>{company.name}</h2><p>{company.description}</p><div className="card-meta"><span>{company.industry}</span><span>{company.type.replaceAll("_", " ")}</span></div><div className="card-footer"><span>{company.location ?? "Global"}</span><span>{company.viewCount.toLocaleString()} views <b>↗</b></span></div></Link>)}</div>}

      {!loading && !error && result && result.pagination.totalPages > 1 && <div className="pagination"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>←</button><span>Page {page} of {result.pagination.totalPages}</span><button disabled={page === result.pagination.totalPages} onClick={() => setPage((value) => value + 1)}>→</button></div>}
    </main>
  );
}