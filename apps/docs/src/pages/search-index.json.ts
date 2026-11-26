import { getCollection } from "astro:content";
import { articleKeywords, searchTopics, type SearchArticle } from "src/lib/search/search-index";

export const prerender = true;

const clean = (text: string) => text
  .replace(/<[^>]*>/g, " ")
  .replace(/!?(?:\[([^\]]*)\])\([^)]*\)/g, "$1")
  .replace(/^[\s#>|*-]+/gm, "")
  .replace(/[`*_]/g, "")
  .replace(/\s+/g, " ")
  .trim();

const sectionsOf = (body: string) => {
  const sections: SearchArticle["sections"] = [];
  const source = body.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, " ")
    .replace(/^import .*$/gm, "")
    .replace(/<ExampleFrame[\s\S]*?<\/ExampleFrame>/g, "");
  let title = "";
  let lines: string[] = [];
  const flush = () => {
    const text = clean(lines.join("\n"));
    if (text) sections.push({ title, text });
    lines = [];
  };
  for (const line of source.split("\n")) {
    const heading = line.match(/^#{2,6}\s+(.+)$/);
    if (heading) {
      flush();
      title = clean(heading[1]);
    } else lines.push(line);
  }
  flush();
  return sections;
};

export const GET = async () => {
  const articles = await getCollection("docs", ({ id, data }) => id.includes("/") && !data.draft);
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const index: SearchArticle[] = articles.map(({ id, data, body }) => {
    const topic = searchTopics[id.split("/")[0]];
    return {
      id,
      title: data.title,
      description: data.description ?? "",
      category: id === "browser/layout-observation" ? "CSS·텍스트·렌더링" : ["architecture/testing", "architecture/delivery"].includes(id) ? "검증·배포·운영" : topic?.category ?? "",
      url: base + "/" + id + "/",
      keywords: [...new Set([...(articleKeywords[id] ?? []), ...(topic?.keywords ?? [])])],
      sections: sectionsOf(body ?? ""),
    };
  });
  return new Response(JSON.stringify(index), { headers: { "Content-Type": "application/json; charset=utf-8" } });
};
