export interface FixSuggestion {
  issueType: string;
  issueKey: string;
  summary: string;
  suggestion: string;
  codeSnippet: string | null;
}

function suggestTitleFix(
  currentTitle: string,
  titleLength: number,
  url: string
): FixSuggestion | null {
  if (currentTitle.length === 0) {
    const domain = new URL(url).hostname.replace(/^www\./, "");
    const brand = domain.split(".")[0];
    const words = brand.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      issueType: "MISSING_TITLE",
      issueKey: "pageTitle",
      summary: "Missing page title tag",
      suggestion:
        "Your page has no <title> tag, which is critical for SEO. " +
        "Search engines rely on the title to understand page content. " +
        "Use a descriptive, keyword-rich title between 30–60 characters.",
      codeSnippet: `<title>${words} — ${words} Services & Products</title>`,
    };
  }
  if (titleLength < 30) {
    return {
      issueType: "TITLE_TOO_SHORT",
      issueKey: "pageTitle",
      summary: `Title tag too short (${titleLength} characters)`,
      suggestion:
        `Your title "${currentTitle}" is only ${titleLength} characters. ` +
        "Titles under 30 characters may not provide enough context. " +
        "Expand it to describe the page content in 30–60 characters.",
      codeSnippet: `<title>${currentTitle} — Trusted Solutions</title>`,
    };
  }
  if (titleLength > 60) {
    return {
      issueType: "TITLE_TOO_LONG",
      issueKey: "pageTitle",
      summary: `Title tag too long (${titleLength} characters)`,
      suggestion:
        `Your title "${currentTitle}" is ${titleLength} characters. ` +
        "Search engines typically truncate titles over 60 characters. " +
        "Shorten it to keep the most important keywords within the limit.",
      codeSnippet: null,
    };
  }
  return null;
}

function suggestMetaDescriptionFix(
  currentDesc: string,
  descLength: number
): FixSuggestion | null {
  if (currentDesc.length === 0) {
    return {
      issueType: "MISSING_META_DESC",
      issueKey: "metaDescription",
      summary: "Missing meta description",
      suggestion:
        "Your page has no meta description. This is the snippet shown in search results " +
        "and impacts click-through rates. Write a compelling 50–160 character summary " +
        "that includes your target keywords and a call to action.",
      codeSnippet:
        `<meta name="description" content="Learn about our comprehensive services and solutions. Contact us today to get started with industry-leading expertise." />`,
    };
  }
  if (descLength < 50) {
    return {
      issueType: "META_DESC_TOO_SHORT",
      issueKey: "metaDescription",
      summary: `Meta description too short (${descLength} characters)`,
      suggestion:
        `Your meta description is only ${descLength} characters. ` +
        "Descriptions under 50 characters risk being too vague or non-descriptive. " +
        "Expand to 50–160 characters with relevant keywords and a clear value proposition.",
      codeSnippet: null,
    };
  }
  if (descLength > 160) {
    return {
      issueType: "META_DESC_TOO_LONG",
      issueKey: "metaDescription",
      summary: `Meta description too long (${descLength} characters)`,
      suggestion:
        `Your meta description is ${descLength} characters, exceeding the 160 character limit. ` +
        "Search engines will truncate long descriptions in results. " +
        "Trim it to 50–160 characters while keeping the key message.",
      codeSnippet: null,
    };
  }
  return null;
}

function suggestH1Fix(
  h1Count: number,
  h1Tags: string[],
  pageTitle: string
): FixSuggestion | null {
  if (h1Count === 0) {
    return {
      issueType: "MISSING_H1",
      issueKey: "h1Tags",
      summary: "Missing H1 heading tag",
      suggestion:
        "Your page has no H1 tag, which defines the primary topic for search engines. " +
        "Include one descriptive H1 that matches your page content. " +
        "It should typically be similar to or an extension of your page title.",
      codeSnippet: pageTitle
        ? `<h1>${pageTitle}</h1>`
        : `<h1>Welcome to Our Services</h1>`,
    };
  }
  if (h1Count > 1) {
    return {
      issueType: "MULTIPLE_H1",
      issueKey: "h1Tags",
      summary: `Multiple H1 tags found (${h1Count})`,
      suggestion:
        "Your page has multiple H1 tags, which dilutes the semantic structure. " +
        "Best practice is one H1 per page. Merge your H1s: keep the most important one " +
        "and downgrade the rest to H2 or H3 as appropriate.",
      codeSnippet: null,
    };
  }
  return null;
}

function suggestAltTextFix(
  missingAltImages: { src: string }[]
): FixSuggestion[] {
  return missingAltImages.map((img) => {
    const filename =
      img.src?.split("/").pop()?.split("?").shift()?.replace(/[-_]/g, " ") ||
      "image";
    const guess = filename.replace(/\.[^.]+$/, "").replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      issueType: "MISSING_ALT",
      issueKey: `alt_${img.src}`,
      summary: `Missing alt text: ${img.src?.split("/").pop() || "unknown"}`,
      suggestion:
        "This image is missing alt text, hurting accessibility and SEO. " +
        "Add a descriptive alt attribute that explains the image content naturally. " +
        "Keep it under 125 characters and include keywords only when relevant.",
      codeSnippet: `alt="${guess}"`,
    };
  });
}

export function generateAllFixes(data: {
  pageTitle: string;
  titleLength: number;
  metaDescription: string;
  metaDescriptionLength: number;
  h1Count: number;
  h1Tags?: string[];
  missingAltImages?: { src: string }[];
  canonicalUrl?: string;
}): FixSuggestion[] {
  const fixes: FixSuggestion[] = [];

  const titleFix = suggestTitleFix(data.pageTitle, data.titleLength, "");
  if (titleFix) fixes.push(titleFix);

  const metaFix = suggestMetaDescriptionFix(data.metaDescription, data.metaDescriptionLength);
  if (metaFix) fixes.push(metaFix);

  const h1Fix = suggestH1Fix(data.h1Count, data.h1Tags ?? [], data.pageTitle);
  if (h1Fix) fixes.push(h1Fix);

  const altFixes = suggestAltTextFix(data.missingAltImages ?? []);
  fixes.push(...altFixes);

  return fixes;
}

export function computeProgress(fixes: { status: string }[]): {
  total: number;
  open: number;
  addressed: number;
  verifiedFixed: number;
  percent: number;
} {
  const total = fixes.length;
  const open = fixes.filter((f) => f.status === "OPEN").length;
  const addressed = fixes.filter((f) => f.status === "ADDRESSED").length;
  const verifiedFixed = fixes.filter((f) => f.status === "VERIFIED_FIXED").length;
  const percent = total > 0 ? Math.round(((addressed + verifiedFixed) / total) * 100) : 0;
  return { total, open, addressed, verifiedFixed, percent };
}
