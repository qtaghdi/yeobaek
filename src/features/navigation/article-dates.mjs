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
    const log = execFileSync("git", ["log", "--follow", "--format=%as", "--", path], { encoding: "utf8" });
    return parseArticleDates(log);
  } catch {
    return null;
  }
};
