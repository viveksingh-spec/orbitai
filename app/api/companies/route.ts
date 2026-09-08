import { NextResponse } from "next/server";
import { listCompanies, type CompanySort } from "@/lib/companies/queries";

const companyTypes = new Set([
  "STARTUP",
  "ENTERPRISE",
  "RESEARCH_LAB",
  "NONPROFIT",
]);

const companySorts = new Set(["newest", "oldest", "name", "featured"]);

function readPositiveInt(value: string | null, fallback: number, maximum: number) {
  if (value === null || value === "") return fallback;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new Error("INVALID_PAGINATION");
  }

  return parsed;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type")?.toUpperCase();
    const sort = searchParams.get("sort") ?? "newest";

    if (type && !companyTypes.has(type)) {
      return NextResponse.json(
        { error: { code: "INVALID_TYPE", message: "Unsupported company type." } },
        { status: 400 },
      );
    }

    if (!companySorts.has(sort)) {
      return NextResponse.json(
        { error: { code: "INVALID_SORT", message: "Unsupported sort option." } },
        { status: 400 },
      );
    }

    const page = readPositiveInt(searchParams.get("page"), 1, 10_000);
    const pageSize = readPositiveInt(searchParams.get("pageSize"), 12, 100);

    const result = await listCompanies({
      search: searchParams.get("search")?.trim() || undefined,
      industry: searchParams.get("industry")?.trim() || undefined,
      location: searchParams.get("location")?.trim() || undefined,
      type: type as "STARTUP" | "ENTERPRISE" | "RESEARCH_LAB" | "NONPROFIT" | undefined,
      sort: sort as CompanySort,
      page,
      pageSize,
    });

    return NextResponse.json({ data: result.companies, pagination: result.pagination });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_PAGINATION") {
      return NextResponse.json(
        { error: { code: "INVALID_PAGINATION", message: "Page and pageSize are invalid." } },
        { status: 400 },
      );
    }

    console.error("Failed to list companies", error);
    return NextResponse.json(
      { error: { code: "COMPANIES_UNAVAILABLE", message: "Companies are temporarily unavailable." } },
      { status: 500 },
    );
  }
}