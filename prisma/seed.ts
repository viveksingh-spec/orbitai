import "dotenv/config";
import { db } from "./db";

const companies = [
  {
    slug: "openai",
    name: "OpenAI",
    description:
      "An artificial intelligence research and deployment company building capable, broadly useful AI systems.",
    logoUrl: "https://logo.clearbit.com/openai.com",
    websiteUrl: "https://openai.com",
    industry: "Generative AI",
    location: "San Francisco, United States",
    foundedYear: 2015,
    type: "RESEARCH_LAB" as const,
    isFeatured: true,
    viewCount: 9820,
  },
  {
    slug: "anthropic",
    name: "Anthropic",
    description:
      "An AI safety and research company building reliable, interpretable, and steerable AI systems.",
    logoUrl: "https://logo.clearbit.com/anthropic.com",
    websiteUrl: "https://www.anthropic.com",
    industry: "AI Research",
    location: "San Francisco, United States",
    foundedYear: 2021,
    type: "RESEARCH_LAB" as const,
    isFeatured: true,
    viewCount: 8740,
  },
  {
    slug: "google-deepmind",
    name: "Google DeepMind",
    description:
      "A research laboratory working to build the next generation of AI systems and advance scientific discovery.",
    logoUrl: "https://logo.clearbit.com/deepmind.google",
    websiteUrl: "https://deepmind.google",
    industry: "AI Research",
    location: "London, United Kingdom",
    foundedYear: 2010,
    type: "ENTERPRISE" as const,
    isFeatured: true,
    viewCount: 7610,
  },
  {
    slug: "hugging-face",
    name: "Hugging Face",
    description:
      "The collaborative platform and community helping developers build, deploy, and share machine learning models.",
    logoUrl: "https://logo.clearbit.com/huggingface.co",
    websiteUrl: "https://huggingface.co",
    industry: "Developer Tools",
    location: "New York, United States",
    foundedYear: 2016,
    type: "STARTUP" as const,
    isFeatured: false,
    viewCount: 6430,
  },
  {
    slug: "mistral-ai",
    name: "Mistral AI",
    description:
      "A European AI company creating efficient, open, and commercially useful foundation models.",
    logoUrl: "https://logo.clearbit.com/mistral.ai",
    websiteUrl: "https://mistral.ai",
    industry: "Foundation Models",
    location: "Paris, France",
    foundedYear: 2023,
    type: "STARTUP" as const,
    isFeatured: false,
    viewCount: 5210,
  },
];

const categories = [
  { slug: "generative-ai", name: "Generative AI" },
  { slug: "ai-research", name: "AI Research" },
  { slug: "developer-tools", name: "Developer Tools" },
  { slug: "foundation-models", name: "Foundation Models" },
];

const tools = [
  {
    slug: "chatgpt",
    name: "ChatGPT",
    description: "An AI assistant for writing, analysis, coding, and everyday questions.",
    websiteUrl: "https://chatgpt.com",
  },
  {
    slug: "claude",
    name: "Claude",
    description: "An AI assistant designed for helpful, safe, and thoughtful conversations.",
    websiteUrl: "https://claude.ai",
  },
];

const models = [
  {
    slug: "gpt-4o",
    name: "GPT-4o",
    description: "A multimodal model for text, vision, and audio interactions.",
  },
  {
    slug: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    description: "A high-capability model for reasoning, coding, and analysis.",
  },
];

async function seed() {
  const categoryRows = new Map<string, number>();
  for (const category of categories) {
    const existing = await db.orm.public.Category.where({ slug: category.slug }).first();
    const row = existing ?? (await db.orm.public.Category.create(category));
    categoryRows.set(category.slug, row.id);
  }

  const toolRows = new Map<string, number>();
  for (const tool of tools) {
    const existing = await db.orm.public.Tool.where({ slug: tool.slug }).first();
    const row = existing ?? (await db.orm.public.Tool.create(tool));
    toolRows.set(tool.slug, row.id);
  }

  const modelRows = new Map<string, number>();
  for (const model of models) {
    const existing = await db.orm.public.AiModel.where({ slug: model.slug }).first();
    const row = existing ?? (await db.orm.public.AiModel.create(model));
    modelRows.set(model.slug, row.id);
  }

  for (const company of companies) {
    const existing = await db.orm.public.Company.where({ slug: company.slug }).first();
    const row = existing ?? (await db.orm.public.Company.create(company));

    const categorySlug = company.industry === "Developer Tools"
      ? "developer-tools"
      : company.industry === "Foundation Models"
        ? "foundation-models"
        : company.industry === "Generative AI"
          ? "generative-ai"
          : "ai-research";
    const categoryId = categoryRows.get(categorySlug);
    if (categoryId) {
      const relation = await db.orm.public.CompanyCategory.where({
        companyId: row.id,
        categoryId,
      }).first();
      if (!relation) {
        await db.orm.public.CompanyCategory.create({ companyId: row.id, categoryId });
      }
    }

    const toolSlug = company.slug === "anthropic" ? "claude" : "chatgpt";
    const toolId = toolRows.get(toolSlug);
    if (toolId) {
      const relation = await db.orm.public.CompanyTool.where({ companyId: row.id, toolId }).first();
      if (!relation) {
        await db.orm.public.CompanyTool.create({ companyId: row.id, toolId });
      }
    }

    const modelSlug = company.slug === "anthropic" ? "claude-3-5-sonnet" : "gpt-4o";
    const modelId = modelRows.get(modelSlug);
    if (modelId) {
      const relation = await db.orm.public.CompanyModel.where({ companyId: row.id, modelId }).first();
      if (!relation) {
        await db.orm.public.CompanyModel.create({ companyId: row.id, modelId });
      }
    }
  }

  console.log(`Seeded ${companies.length} companies.`);
}

async function main() {
  try {
    await seed();
  } finally {
    await db.close();
  }
}

void main();