import "dotenv/config";
import { Temporal } from "@js-temporal/polyfill";
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "./schema.d";
import contractJson from "./schema.json" with { type: "json" };

Object.assign(globalThis, { Temporal });

export const db = postgres<Contract>({
  contractJson,
  url: process.env["DATABASE_URL"],
});