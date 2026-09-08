"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type RelatedItem = { id: number; name: string; slug: string; description: string; websiteUrl?: string };
type Company = {
  name: string; slug: string; description: string; logoUrl: string | null; websiteUrl: string;
  industry: string; location: string | null; foundedYear: number | null; type: string;
  isFeatured: boolean; viewCount: number; categories: RelatedItem[]; tools: RelatedItem[]; models: RelatedItem[];
};

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export default function CompanyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"not-found" | "error" | null>(null);

  useEffect(() => {
    let active = true;
    void params.then(({ slug }) => fetch(`/api/companies/${slug}`))
      .then(async (response) => {
        if (response.status === 404) throw new Error("not-found");
        if (!response.ok) throw new Error("error");
        return response.json() as Promise<{ data: Company }>;
      })
      .then((response) => { if (active) setCompany(response.data); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error && reason.message === "not-found" ? "not-found" : "error"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params]);

  if (loading) return <main className="orbit-shell detail-shell"><div className="detail-loading"><div className="detail-logo skeleton" /><div className="skeleton-line" /><div className="skeleton-copy" /></div></main>;
  if (error === "not-found") return <main className="orbit-shell detail-shell"><div className="state-panel"><strong>Company not found</strong><span>This company does not exist in the public directory.</span><Link href="/companies" className="state-link">Back to companies</Link></div></main>;
  if (error || !company) return <main className="orbit-shell detail-shell"><div className="state-panel"><strong>Company unavailable</strong><span>We could not load this company right now.</span><Link href="/companies" className="state-link">Back to companies</Link></div></main>;

  return <main className="orbit-shell detail-shell">
    <header className="orbit-header"><button className="menu-button" aria-label="Open navigation menu">☰</button><Link href="/companies" className="brand-mark"><span>AI</span> ORBIT</Link><div className="header-actions"><Link href="/companies" className="submit-link">＋ <span>Submit Tool</span></Link><Link href="/companies" className="login-link">Log In</Link></div></header>
    <Link href="/companies" className="back-link">← All companies</Link>
    <section className="company-hero">
      <div className="detail-identity"><div className="detail-logo-wrap">{company.logoUrl ? <img className="detail-logo" src={company.logoUrl} alt="" onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.nextElementSibling?.classList.remove("hidden"); }} /> : null}<div className={`detail-logo detail-logo-fallback ${company.logoUrl ? "hidden" : ""}`}>{initials(company.name)}</div></div><div><div className="eyebrow">Company profile / {company.type.replaceAll("_", " ")}</div><h1>{company.name}</h1><p className="company-location">{company.location ?? "Global"} <span>·</span> Founded {company.foundedYear ?? "—"}</p></div></div>
      <div className="hero-actions"><a className="primary-action" href={company.websiteUrl} target="_blank" rel="noreferrer">Visit website ↗</a><span className="view-count">{company.viewCount.toLocaleString()} views</span></div>
    </section>
    <div className="detail-layout"><article className="detail-main"><section className="detail-section"><p className="eyebrow">About</p><p className="detail-description">{company.description}</p></section><section className="detail-section"><p className="eyebrow">Categories</p><div className="tag-list">{company.categories.map((category) => <span key={category.id}>{category.name}</span>)}</div></section><section className="detail-section"><p className="eyebrow">On the radar</p><div className="related-grid"><RelatedList title="Tools" items={company.tools} /><RelatedList title="AI models" items={company.models} /></div></section></article><aside className="detail-aside"><div className="fact-block"><span>Industry</span><strong>{company.industry}</strong></div><div className="fact-block"><span>Company type</span><strong>{company.type.replaceAll("_", " ")}</strong></div><div className="fact-block"><span>Directory status</span><strong className="published"><i /> Published</strong></div><div className="fact-block"><span>Website</span><a href={company.websiteUrl} target="_blank" rel="noreferrer">{company.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}</a></div></aside></div>
  </main>;
}

function RelatedList({ title, items }: { title: string; items: RelatedItem[] }) {
  return <div className="related-list"><div className="related-heading"><span>{title}</span><small>{items.length}</small></div>{items.length ? items.map((item) => <a href={item.websiteUrl ?? "#"} target="_blank" rel="noreferrer" key={item.id}><strong>{item.name}</strong><span>{item.description}</span></a>) : <p className="muted">No related {title.toLowerCase()} yet.</p>}</div>;
}