import { db } from "@/prisma/db";

export type CompanySort = "newest" | "oldest" | "name" | "featured";

export interface ListCompaniesInput {
  search?: string;
  industry?: string;
  type?: "STARTUP" | "ENTERPRISE" | "RESEARCH_LAB" | "NONPROFIT";
  location?: string;
  sort: CompanySort;
  page: number;
  pageSize: number;
}

export async function listCompanies(input: ListCompaniesInput) {
  let query = db.orm.public.Company.where((company) =>
    company.status.eq("PUBLISHED"),
  );

  if (input.search) {
    query = query.where((company) =>
      company.name.ilike(`%${input.search}%`),
    );
  }

  if (input.industry) {
    const industry = input.industry;
    query = query.where((company) => company.industry.eq(industry));
  }

  if (input.type) {
    const type = input.type;
    query = query.where((company) => company.type.eq(type));
  }

  if (input.location) {
    query = query.where((company) => company.location.ilike(`%${input.location}%`));
  }

  switch (input.sort) {
    case "oldest":
      query = query.orderBy((company) => company.createdAt.asc());
      break;
    case "name":
      query = query.orderBy((company) => company.name.asc());
      break;
    case "featured":
      query = query.where((company) => company.isFeatured.eq(true));
      query = query.orderBy((company) => company.createdAt.desc());
      break;
    case "newest":
    default:
      query = query.orderBy((company) => company.createdAt.desc());
  }

  const [matchingCompanies, companies] = await Promise.all([
    query.select("id").all(),
    query
      .select(
        "id",
        "slug",
        "name",
        "description",
        "logoUrl",
        "websiteUrl",
        "industry",
        "location",
        "foundedYear",
        "type",
        "isFeatured",
        "viewCount",
      )
      .limit(input.pageSize)
      .offset((input.page - 1) * input.pageSize)
      .all(),
  ]);

  const totalCount = matchingCompanies.length;

  return {
    companies,
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total: totalCount,
      totalPages: Math.ceil(totalCount / input.pageSize),
    },
  };
}