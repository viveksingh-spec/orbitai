import { NextResponse } from "next/server";
import { getCompanyBySlug } from "@/lib/companies/detail";

interface CompanyRouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: CompanyRouteContext) {
  const { slug } = await context.params;

  if (!slug.trim()) {
    return NextResponse.json(
      { error: { code: "INVALID_SLUG", message: "Company slug is required." } },
      { status: 400 },
    );
  }

  try {
    const company = await getCompanyBySlug(slug);

    if (!company) {
      return NextResponse.json(
        { error: { code: "COMPANY_NOT_FOUND", message: "Company not found." } },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: company });
  } catch (error) {
    console.error("Failed to load company", error);
    return NextResponse.json(
      { error: { code: "COMPANY_UNAVAILABLE", message: "Company is temporarily unavailable." } },
      { status: 500 },
    );
  }
}