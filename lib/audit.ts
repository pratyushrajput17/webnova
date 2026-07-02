import axios from "axios";
import * as cheerio from "cheerio";

export interface LinkItem {
  href: string;
  text: string;
}

export interface ImageItem {
  src: string;
  alt: string;
  hasAlt: boolean;
}

export interface AuditResult {
  pageTitle: string;
  metaDescription: string;
  h1Count: number;
  h1Tags: string[];
  imageCount: number;
  missingAltCount: number;
  internalLinks: number;
  internalLinksData: LinkItem[];
  externalLinks: number;
  externalLinksData: LinkItem[];
  imagesData: ImageItem[];
  missingAltImages: { src: string }[];
  titleLength: number;
  metaDescriptionLength: number;
  seoScore: number;
  performanceScore: number;
  accessibilityScore: number;
  aiRecommendations: string[];
}

export function validateUrl(url: string): string | null {
  if (!url || url.trim().length === 0) {
    return "Please enter a valid URL.";
  }

  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = "https://" + normalized;
  }

  try {
    const parsed = new URL(normalized);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "URL must start with http:// or https://.";
    }
    if (!parsed.hostname.includes(".")) {
      return "Please enter a valid URL.";
    }
  } catch {
    return "Please enter a valid URL.";
  }

  return null;
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return "https://" + trimmed;
}

function calculateSeoScore(data: {
  title: string;
  titleLength: number;
  metaDescription: string;
  metaDescriptionLength: number;
  h1Count: number;
  missingAltCount: number;
}): number {
  let score = 100;
  if (!data.title) score -= 20;
  else if (data.titleLength < 30 || data.titleLength > 60) score -= 5;
  if (!data.metaDescription) score -= 20;
  else if (data.metaDescriptionLength < 50 || data.metaDescriptionLength > 160) score -= 5;
  if (data.h1Count === 0) score -= 15;
  if (data.missingAltCount > 5) score -= 10;
  return Math.max(0, score);
}

function calculatePerformanceScore(data: {
  imageCount: number;
  externalLinks: number;
  internalLinks: number;
}): number {
  let score = 100;
  if (data.imageCount > 20) score -= 15;
  else if (data.imageCount > 10) score -= 5;
  if (data.externalLinks > 50) score -= 15;
  else if (data.externalLinks > 20) score -= 5;
  score += Math.min(10, Math.floor(data.internalLinks / 5));
  return Math.max(0, Math.min(100, score));
}

function calculateAccessibilityScore(data: {
  missingAltCount: number;
  h1Count: number;
  metaDescription: string;
}): number {
  let score = 100;
  if (data.missingAltCount > 10) score -= 25;
  else if (data.missingAltCount > 5) score -= 15;
  else if (data.missingAltCount > 0) score -= 5;
  if (data.h1Count === 0) score -= 20;
  else if (data.h1Count > 3) score -= 5;
  if (!data.metaDescription) score -= 15;
  return Math.max(0, score);
}

function generateRecommendations(data: {
  pageTitle: string;
  titleLength: number;
  metaDescription: string;
  metaDescriptionLength: number;
  h1Tags: string[];
  h1Count: number;
  imageCount: number;
  missingAltCount: number;
  internalLinks: number;
  externalLinks: number;
  seoScore: number;
  performanceScore: number;
  accessibilityScore: number;
}): string[] {
  const recs: string[] = [];
  if (!data.pageTitle) {
    recs.push("Add a descriptive title tag — it's the first thing search engines and users see.");
  } else if (data.titleLength < 30 || data.titleLength > 60) {
    recs.push("Optimize your title tag length (aim for 30–60 characters) for better search visibility.");
  }
  if (!data.metaDescription) {
    recs.push("Write a compelling meta description to improve click-through rates from search results.");
  } else if (data.metaDescriptionLength < 50) {
    recs.push("Your meta description is short. Expand it to 120–158 characters for better engagement.");
  } else if (data.metaDescriptionLength > 160) {
    recs.push("Your meta description is too long (over 160 characters). Search engines may truncate it.");
  }
  if (data.h1Count === 0) {
    recs.push("Include at least one H1 heading to define your page's primary topic for search engines.");
  } else if (data.h1Count > 1) {
    recs.push(`Your page has ${data.h1Count} H1 tags. Limit to one H1 per page to avoid confusing search engines.`);
  }
  if (data.missingAltCount > 0) {
    recs.push(`Add descriptive alt text to ${data.missingAltCount} image(s) to boost accessibility and give screen readers useful context.`);
  }
  if (data.imageCount > 20) {
    recs.push("Your page has many images. Consider lazy loading and compressing them to improve load speed.");
  }
  if (data.externalLinks > 50) {
    recs.push("Reduce excessive external links — too many can dilute authority and distract users.");
  }
  if (data.internalLinks < 5) {
    recs.push("Add more internal links to help users and crawlers navigate your site effectively.");
  }
  if (data.seoScore < 70) {
    recs.push("Your overall SEO score needs attention. Focus on fixing the critical issues above for the biggest impact.");
  } else if (data.seoScore >= 90) {
    recs.push("Excellent SEO foundation! Keep monitoring your pages regularly to maintain this standard.");
  }
  if (data.performanceScore < 70) {
    recs.push("Optimize page performance by reducing image sizes, minimizing external scripts, and leveraging caching.");
  }
  if (data.accessibilityScore < 70) {
    recs.push("Improve accessibility by fixing alt text gaps, using proper heading hierarchy, and ensuring good color contrast.");
  }
  return recs;
}

export async function analyzeWebsite(url: string): Promise<AuditResult> {
  const targetUrl = normalizeUrl(url);

  const response = await axios.get(targetUrl, {
    timeout: 15000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; WebNovaAudit/1.0; +https://webnova.ai)",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
    maxRedirects: 5,
    validateStatus: (status) => status < 500,
  });

  const html = response.data as string;

  if (!html || html.length === 0) {
    throw new Error("Website returned empty content.");
  }

  const $ = cheerio.load(html);

  const pageTitle =
    $("title").first().text().trim() ||
    $("meta[property='og:title']").attr("content")?.trim() ||
    "";

  const metaDescription =
    $("meta[name='description']").attr("content")?.trim() ||
    $("meta[property='og:description']").attr("content")?.trim() ||
    "";

  const titleLength = pageTitle.length;
  const metaDescriptionLength = metaDescription.length;

  const h1Tags: string[] = [];
  $("h1").each((_, el) => {
    const text = $(el).text().trim();
    if (text) h1Tags.push(text);
  });
  const h1Count = h1Tags.length;

  const imagesData: ImageItem[] = [];
  const missingAltImages: { src: string }[] = [];
  const imageElements = $("img");
  const imageCount = imageElements.length;
  let missingAltCount = 0;

  imageElements.each((_, el) => {
    const src = $(el).attr("src")?.trim() || "";
    const alt = $(el).attr("alt")?.trim() || "";
    const hasAlt = alt !== "";
    if (!hasAlt && src) {
      missingAltCount++;
      missingAltImages.push({ src });
    }
    imagesData.push({ src, alt, hasAlt });
  });

  const baseUrl = response.request?.res?.responseUrl || targetUrl;
  const base = new URL(baseUrl);

  const internalLinksData: LinkItem[] = [];
  const externalLinksData: LinkItem[] = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")?.trim();
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) {
      return;
    }
    try {
      const resolved = new URL(href, base.origin);
      const text = $(el).text().trim().substring(0, 200) || href;
      if (resolved.hostname === base.hostname) {
        internalLinksData.push({ href: resolved.href, text });
      } else {
        externalLinksData.push({ href: resolved.href, text });
      }
    } catch {
      // skip invalid URLs
    }
  });

  const internalLinks = internalLinksData.length;
  const externalLinks = externalLinksData.length;

  const seoScore = calculateSeoScore({
    title: pageTitle,
    titleLength,
    metaDescription,
    metaDescriptionLength,
    h1Count,
    missingAltCount,
  });

  const performanceScore = calculatePerformanceScore({
    imageCount,
    externalLinks,
    internalLinks,
  });

  const accessibilityScore = calculateAccessibilityScore({
    missingAltCount,
    h1Count,
    metaDescription,
  });

  const aiRecommendations = generateRecommendations({
    pageTitle,
    titleLength,
    metaDescription,
    metaDescriptionLength,
    h1Tags,
    h1Count,
    imageCount,
    missingAltCount,
    internalLinks,
    externalLinks,
    seoScore,
    performanceScore,
    accessibilityScore,
  });

  return {
    pageTitle,
    metaDescription,
    h1Count,
    h1Tags,
    imageCount,
    missingAltCount,
    imagesData,
    missingAltImages,
    internalLinks,
    internalLinksData,
    externalLinks,
    externalLinksData,
    titleLength,
    metaDescriptionLength,
    seoScore,
    performanceScore,
    accessibilityScore,
    aiRecommendations,
  };
}
