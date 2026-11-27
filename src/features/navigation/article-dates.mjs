import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

export const parseArticleDates = (history) => {
  const dates = history.trim().split(/\r?\n/).filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date));
  return dates.length ? { created: dates.at(-1), updated: dates[0] } : null;
};

export const articleDates = (slug) => {
  const path = ["mdx", "md"].map(extension => `src/content/docs/${slug}.${extension}`).find(file => existsSync(resolve(file)));
  if (!path) return null;
  try {
    if (execFileSync("git", ["rev-parse", "--is-shallow-repository"], { encoding: "utf8" }).trim() === "true") return null;
    const log = execFileSync("git", ["log", "--follow", "--format=%as|%aI", "--", path], { encoding: "utf8" });
    const records = log.trim().split(/\r?\n/).filter(Boolean);
    const dates = parseArticleDates(records.map(record => record.split("|")[0]).join("\n"));
    const createdAt = Date.parse(records.at(-1)?.split("|")[1] ?? "");
    return dates && Number.isFinite(createdAt) ? { ...dates, createdAt } : null;
  } catch {
    return null;
  }
};

export const newestArticles = (articles, limit = 3) => [...articles].sort((a, b) => b.createdAt - a.createdAt || a.id.localeCompare(b.id)).slice(0, limit);
