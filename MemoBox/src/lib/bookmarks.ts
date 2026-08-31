import { parse } from "node-html-parser";
import { getDomain } from "@/lib/utils";

export interface ParsedBookmark {
  title: string;
  url: string;
  domain: string | null;
  addedAt: string | null;
  folder: string | null;
}

/**
 * Parse a Netscape-format bookmarks file (the HTML export used by Chrome,
 * Firefox, Edge, Safari…). Folder is taken from the nearest preceding <H3>.
 */
export function parseBookmarksHtml(html: string): ParsedBookmark[] {
  const root = parse(html);
  const out: ParsedBookmark[] = [];

  const walk = (node: ReturnType<typeof parse>, folder: string | null) => {
    let currentFolder = folder;
    for (const child of node.childNodes) {
      if (child.nodeType !== 1) continue;
      const el = child as unknown as ReturnType<typeof parse>;
      const tag = el.rawTagName?.toUpperCase();

      if (tag === "H3") {
        currentFolder = el.text.trim() || currentFolder;
      } else if (tag === "A") {
        const url = el.getAttribute("href");
        if (url && /^https?:\/\//i.test(url)) {
          const addRaw = el.getAttribute("add_date");
          out.push({
            title: el.text.trim() || url,
            url,
            domain: getDomain(url),
            addedAt: addRaw ? new Date(Number(addRaw) * 1000).toISOString() : null,
            folder: currentFolder,
          });
        }
      } else {
        walk(el, currentFolder);
      }
    }
  };

  walk(root, null);

  // De-dupe by URL.
  const seen = new Set<string>();
  return out.filter((b) => {
    if (seen.has(b.url)) return false;
    seen.add(b.url);
    return true;
  });
}
