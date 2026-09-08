import { db } from "@/prisma/db";

export async function getCompanyBySlug(slug: string) {
  const company = await db.orm.public.Company.where({ slug }).first();

  if (!company) return null;

  const [categoryLinks, toolLinks, modelLinks] = await Promise.all([
    db.orm.public.CompanyCategory.where({ companyId: company.id }).all(),
    db.orm.public.CompanyTool.where({ companyId: company.id }).all(),
    db.orm.public.CompanyModel.where({ companyId: company.id }).all(),
  ]);

  const categoryIds = categoryLinks.map((link) => link.categoryId);
  const toolIds = toolLinks.map((link) => link.toolId);
  const modelIds = modelLinks.map((link) => link.modelId);

  const [categories, tools, models] = await Promise.all([
    categoryIds.length
      ? db.orm.public.Category.where((category) => category.id.in(categoryIds)).all()
      : Promise.resolve([]),
    toolIds.length
      ? db.orm.public.Tool.where((tool) => tool.id.in(toolIds)).all()
      : Promise.resolve([]),
    modelIds.length
      ? db.orm.public.AiModel.where((model) => model.id.in(modelIds)).all()
      : Promise.resolve([]),
  ]);

  return {
    ...company,
    categories,
    tools,
    models,
  };
}