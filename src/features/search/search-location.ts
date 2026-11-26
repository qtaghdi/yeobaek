export const searchMatchStateKey = "yeobaekSearchMatch";

export type SearchMatchLocation = {
  pathname: string;
  query: string;
  anchor?: string;
};

export const getStoredSearchMatchLocation = (): SearchMatchLocation | undefined => {
  const match = history.state?.[searchMatchStateKey] as SearchMatchLocation | undefined;
  if (match?.pathname === location.pathname) return match;
};

export const readSearchMatchLocation = (): SearchMatchLocation | undefined => {
  const url = new URL(location.href);
  const stored = getStoredSearchMatchLocation();
  const query = url.searchParams.get("highlight")?.slice(0, 100);
  if (query) {
    let anchor = stored?.query === query ? stored.anchor : undefined;
    if (url.hash) {
      try { anchor = decodeURIComponent(url.hash.slice(1)); } catch { anchor = undefined; }
    }
    const match = { pathname: url.pathname, query, anchor };
    url.searchParams.delete("highlight");
    url.hash = "";
    history.replaceState({ ...history.state, [searchMatchStateKey]: match }, "", url);
    return match;
  }
  return stored;
};
