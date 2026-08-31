import { parse } from "node-html-parser";
import type { ItemType, UrlMetadata } from "@/lib/types";
import { faviconFor, getDomain, normalizeUrl } from "@/lib/utils";

/** Guess a content type from the URL alone — good enough as a default. */
export function guessType(url: string): ItemType {
  const d = getDomain(url) ?? "";
  if (/youtube\.com|youtu\.be|vimeo\.com|twitch\.tv/.test(d)) return "video";
  if (/github\.com|gitlab\.com|npmjs\.com|vercel\.com|figma\.com/.test(d)) return "tool";
  if (/medium\.com|dev\.to|substack\.com|/.test(d) && /\/(blog|post|article|p)\//.test(url))
    return "article";
  if (/amazon\.|mercadolivre\.|aliexpress\./.test(d)) return "product";
  if (/udemy\.com|coursera\.org|alura\.com|rocketseat/.test(d)) return "course";
  return "link";
}

function absolute(base: string, maybeRelative: string | undefined): string | null {
  if (!maybeRelative) return null;
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return null;
  }
}

/**
 * Fetch a page and extract Open Graph / Twitter / standard metadata.
 * Fails soft: on any error it still returns a sensible skeleton so the quick-add
 * flow never blocks on a flaky remote site.
 */
export async function fetchUrlMetadata(rawUrl: string): Promise<UrlMetadata> {
  const url = normalizeUrl(rawUrl);
  const domain = getDomain(url);
  const skeleton: UrlMetadata = {
    url,
    title: domain,
    description: null,
    image: null,
    favicon: faviconFor(domain),
    domain,
    type: guessType(url),
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; IdeaVaultBot/1.0; +https://ideavault.app)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return skeleton;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return skeleton;

    const html = await res.text();
    const root = parse(html, { comment: false });

    const meta = (names: string[]): string | undefined => {
      for (const name of names) {
        const el =
          root.querySelector(`meta[property="${name}"]`) ??
          root.querySelector(`meta[name="${name}"]`);
        const content = el?.getAttribute("content")?.trim();
        if (content) return content;
      }
      return undefined;
    };

    const title =
      meta(["og:title", "twitter:title"]) ??
      root.querySelector("title")?.text?.trim() ??
      domain;

    const description =
      meta(["og:description", "twitter:description", "description"]) ?? null;

    const image =
      absolute(url, meta(["og:image", "og:image:url", "twitter:image", "twitter:image:src"])) ??
      null;

    const iconHref =
      root.querySelector('link[rel="icon"]')?.getAttribute("href") ??
      root.querySelector('link[rel="shortcut icon"]')?.getAttribute("href") ??
      root.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href");

    const favicon = absolute(url, iconHref) ?? faviconFor(domain);

    return {
      url,
      title: title || domain,
      description,
      image,
      favicon,
      domain,
      type: guessType(url),
    };
  } catch {
    return skeleton;
  }
}
