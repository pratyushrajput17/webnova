import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { generateAllFixes } from "@/lib/fix-assistant";

interface Branding {
  companyName?: string | null;
  logoUrl?: string | null;
  preparedBy?: string | null;
  websiteUrl?: string | null;
  supportEmail?: string | null;
}

interface AuditData {
  websiteUrl: string;
  pageTitle: string;
  metaDescription: string | null;
  seoScore: number;
  performanceScore: number;
  accessibilityScore: number;
  h1Count: number;
  h1Tags?: string[];
  h2Tags?: string[];
  h3Tags?: string[];
  canonicalUrl?: string | null;
  imageCount: number;
  missingAltCount: number;
  imagesData?: { src: string; alt: string; hasAlt: boolean }[];
  missingAltImages?: { src: string }[];
  internalLinks: number;
  internalLinksData?: { href: string; text: string }[];
  externalLinks: number;
  externalLinksData?: { href: string; text: string }[];
  titleLength?: number;
  metaDescriptionLength?: number;
  aiRecommendations?: string[];
  createdAt: string;
}

interface AuditReportPDFProps {
  audit: AuditData;
  branding?: Branding | null;
  whiteLabel?: boolean;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a2e",
  },

  coverPage: {
    padding: 0,
    fontFamily: "Helvetica",
    color: "#1a1a2e",
  },
  coverTop: {
    backgroundColor: "#1a1a2e",
    padding: 50,
    paddingBottom: 40,
  },
  coverLogoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  coverBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  coverBadgeText: {
    fontSize: 10,
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  coverBody: {
    padding: 50,
    paddingTop: 30,
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 30,
    lineHeight: 1.2,
  },
  coverFieldRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 12,
  },
  coverFieldLabel: {
    width: 140,
    fontSize: 10,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  coverFieldValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  coverScoreBlock: {
    marginTop: 30,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 25,
    borderLeftWidth: 4,
    borderLeftColor: "#1a1a2e",
  },
  coverScoreTitle: {
    fontSize: 10,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  coverScoreValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  coverScoreLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  coverScoreRow: {
    flexDirection: "row",
    marginTop: 15,
    gap: 20,
  },
  coverMiniScore: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 6,
    padding: 12,
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  coverMiniScoreNum: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  coverMiniScoreLabel: {
    fontSize: 8,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#1a1a2e",
    marginBottom: 20,
  },
  headerLogo: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 10,
    color: "#6b7280",
  },
  headerDate: {
    fontSize: 8,
    color: "#9ca3af",
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginTop: 20,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 14,
    marginBottom: 8,
  },

  summaryGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  summaryCardValue: {
    fontSize: 22,
    fontWeight: "bold",
  },
  summaryCardLabel: {
    fontSize: 8,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },

  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  scoreBar: {
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  scoreBarText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  scoreInfo: {
    flex: 1,
  },
  scoreName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  scoreStatus: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 1,
  },

  issueCard: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
  },
  issueCritical: {
    backgroundColor: "#fef2f2",
    borderLeftColor: "#ef4444",
  },
  issueWarning: {
    backgroundColor: "#fffbeb",
    borderLeftColor: "#f59e0b",
  },
  issueInfo: {
    backgroundColor: "#f0f9ff",
    borderLeftColor: "#3b82f6",
  },
  issuePassed: {
    backgroundColor: "#f0fdf4",
    borderLeftColor: "#22c55e",
  },
  issueTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 3,
  },
  issueDescription: {
    fontSize: 9,
    color: "#4b5563",
    lineHeight: 1.4,
  },
  issueMeta: {
    fontSize: 8,
    color: "#9ca3af",
    marginTop: 4,
  },

  dataRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dataLabel: {
    width: 130,
    fontSize: 9,
    color: "#6b7280",
  },
  dataValue: {
    flex: 1,
    fontSize: 9,
    color: "#1a1a2e",
    fontWeight: "500",
  },

  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  tag: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    fontSize: 8,
    color: "#374151",
  },

  actionCard: {
    marginBottom: 8,
    padding: 10,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  actionPriority: {
    width: 56,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    alignItems: "center",
  },
  actionPriorityHigh: {
    backgroundColor: "#fef2f2",
  },
  actionPriorityMed: {
    backgroundColor: "#fffbeb",
  },
  actionPriorityLow: {
    backgroundColor: "#f0f9ff",
  },
  actionPriorityText: {
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actionText: {
    flex: 1,
    fontSize: 9,
    color: "#1a1a2e",
    lineHeight: 1.4,
  },

  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    fontSize: 7,
    color: "#9ca3af",
  },
  pageNumber: {
    position: "absolute",
    bottom: 25,
    right: 40,
    fontSize: 7,
    color: "#9ca3af",
  },
});

function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 60) return "Needs Improvement";
  return "Poor";
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
}

interface Issue {
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  resource?: string;
  fix?: string;
}

function categorizeIssues(audit: AuditData): {
  critical: Issue[];
  warnings: Issue[];
  info: Issue[];
  passed: Issue[];
} {
  const critical: Issue[] = [];
  const warnings: Issue[] = [];
  const info: Issue[] = [];
  const passed: Issue[] = [];

  if (!audit.pageTitle || audit.pageTitle.trim().length === 0) {
    critical.push({
      title: "Missing Page Title",
      description:
        "The page has no title tag. Search engines rely on titles to understand page content and display it in search results.",
      severity: "critical",
      resource: audit.websiteUrl,
      fix: "Add a descriptive title tag between 30-60 characters in your HTML head section.",
    });
  } else if (
    audit.titleLength &&
    (audit.titleLength < 30 || audit.titleLength > 60)
  ) {
    warnings.push({
      title: "Suboptimal Title Length",
      description: `The title is ${audit.titleLength} characters. Titles between 30-60 characters display best in search results.`,
      severity: "warning",
      fix: "Adjust your title to be between 30-60 characters for optimal display.",
    });
  } else {
    passed.push({
      title: "Page Title Present",
      description: "The page has a well-structured title tag.",
      severity: "info",
    });
  }

  if (!audit.metaDescription || audit.metaDescription.trim().length === 0) {
    critical.push({
      title: "Missing Meta Description",
      description:
        "The page has no meta description. This is the snippet shown below your title in search results and heavily influences click-through rates.",
      severity: "critical",
      resource: audit.websiteUrl,
      fix: "Add a compelling meta description between 120-160 characters summarising the page content.",
    });
  } else if (
    audit.metaDescriptionLength &&
    (audit.metaDescriptionLength < 120 || audit.metaDescriptionLength > 160)
  ) {
    warnings.push({
      title: "Suboptimal Meta Description Length",
      description: `The meta description is ${audit.metaDescriptionLength} characters. Descriptions between 120-160 characters perform best.`,
      severity: "warning",
      fix: "Adjust your meta description to be between 120-160 characters.",
    });
  } else {
    passed.push({
      title: "Meta Description Present",
      description: "The page has a well-crafted meta description.",
      severity: "info",
    });
  }

  if (audit.h1Count === 0) {
    critical.push({
      title: "Missing H1 Tag",
      description:
        "The page has no H1 heading. H1 tags are the most important on-page SEO signal and help search engines understand the main topic.",
      severity: "critical",
      resource: audit.websiteUrl,
      fix: "Add exactly one H1 tag that clearly describes the page content.",
    });
  } else if (audit.h1Count > 1) {
    warnings.push({
      title: "Multiple H1 Tags",
      description: `The page has ${audit.h1Count} H1 tags. Best practice is to have exactly one H1 per page.`,
      severity: "warning",
      fix: "Consolidate your headings so there is only one H1 tag per page.",
    });
  } else {
    passed.push({
      title: "H1 Tag Present",
      description: "The page has a single H1 heading tag.",
      severity: "info",
    });
  }

  if (!audit.canonicalUrl) {
    warnings.push({
      title: "Missing Canonical URL",
      description:
        "The page has no canonical tag. Canonical tags help prevent duplicate content issues by telling search engines which URL is the preferred version.",
      severity: "warning",
      resource: audit.websiteUrl,
      fix: "Add a canonical tag pointing to the preferred URL for this page.",
    });
  } else {
    passed.push({
      title: "Canonical URL Present",
      description: "The page has a canonical tag properly configured.",
      severity: "info",
    });
  }

  if (audit.missingAltCount > 0) {
    const severity = audit.missingAltCount > 3 ? "critical" : "warning";
    critical.push({
      title: `${audit.missingAltCount} Image${audit.missingAltCount > 1 ? "s" : ""} Missing Alt Text`,
      description:
        "Images without alt text cannot be understood by search engines or screen readers, affecting both SEO and accessibility.",
      severity,
      resource: `${audit.missingAltCount} of ${audit.imageCount} images`,
      fix: "Add descriptive alt text to all images that convey meaningful content.",
    });
  } else if (audit.imageCount > 0) {
    passed.push({
      title: "All Images Have Alt Text",
      description: "All images on the page have proper alt text.",
      severity: "info",
    });
  }

  if (audit.internalLinks === 0) {
    warnings.push({
      title: "No Internal Links Found",
      description:
        "The page has no internal links. Internal linking helps search engines discover and rank your content.",
      severity: "warning",
      fix: "Add relevant internal links to connect this page with other content on your site.",
    });
  } else {
    passed.push({
      title: "Internal Links Present",
      description: `The page has ${audit.internalLinks} internal link${audit.internalLinks > 1 ? "s" : ""}.`,
      severity: "info",
    });
  }

  if (audit.externalLinks === 0) {
    info.push({
      title: "No External Links",
      description:
        "The page has no external links. Linking to authoritative sources can improve topical relevance.",
      severity: "info",
      fix: "Consider linking to relevant authoritative resources where appropriate.",
    });
  }

  if (audit.h2Tags && audit.h2Tags.length === 0) {
    warnings.push({
      title: "No H2 Headings",
      description:
        "The page has no H2 sub-headings. H2 tags help structure content and improve readability for both users and search engines.",
      severity: "warning",
      fix: "Add H2 headings to organise your content into logical sections.",
    });
  } else if (audit.h2Tags && audit.h2Tags.length > 0) {
    passed.push({
      title: "H2 Headings Present",
      description: `The page has ${audit.h2Tags.length} H2 heading${audit.h2Tags.length > 1 ? "s" : ""} structuring the content.`,
      severity: "info",
    });
  }

  return { critical, warnings, info, passed };
}

interface ActionItem {
  priority: "high" | "medium" | "low";
  text: string;
}

function generateActionPlan(
  issues: { critical: Issue[]; warnings: Issue[]; info: Issue[] }
): ActionItem[] {
  const actions: ActionItem[] = [];

  for (const issue of issues.critical) {
    actions.push({ priority: "high", text: issue.fix || issue.title });
  }
  for (const issue of issues.warnings) {
    actions.push({ priority: "medium", text: issue.fix || issue.title });
  }
  for (const issue of issues.info) {
    if (issue.fix) {
      actions.push({ priority: "low", text: issue.fix });
    }
  }

  return actions;
}

const Footer = ({
  whiteLabel,
  branding,
  generatedDate,
}: {
  whiteLabel: boolean;
  branding?: Branding | null;
  generatedDate: string;
}) => (
  <View style={styles.footer} fixed>
    <Text>
      {whiteLabel && branding?.companyName
        ? `${branding.companyName} | ${generatedDate}`
        : `WebNova | ${generatedDate}`}
    </Text>
    <Text
      render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
    />
  </View>
);

const Header = ({
  whiteLabel,
  branding,
  generatedDate,
}: {
  whiteLabel: boolean;
  branding?: Branding | null;
  generatedDate: string;
}) => (
  <View style={styles.header}>
    <Text style={styles.headerLogo}>
      {whiteLabel && branding?.companyName
        ? branding.companyName
        : "WebNova"}
    </Text>
    <View style={styles.headerRight}>
      <Text style={styles.headerTitle}>SEO Audit Report</Text>
      <Text style={styles.headerDate}>{generatedDate}</Text>
    </View>
  </View>
);

function CoverPage({
  audit,
  whiteLabel,
  branding,
  generatedDate,
}: {
  audit: AuditData;
  whiteLabel: boolean;
  branding?: Branding | null;
  generatedDate: string;
}) {
  const domain = extractDomain(audit.websiteUrl);
  const hasLogo =
    whiteLabel && branding?.logoUrl && branding.logoUrl.length > 0;

  return (
    <Page size="A4" style={styles.coverPage}>
      <View style={styles.coverTop}>
        {hasLogo ? (
          // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image does not support alt prop
          <Image
            src={branding!.logoUrl!}
            style={{ width: 120, height: 40, objectFit: "contain" }}
          />
        ) : (
          <Text style={styles.coverLogoText}>
            {whiteLabel && branding?.companyName
              ? branding.companyName
              : "WebNova"}
          </Text>
        )}
        <View style={styles.coverBadge}>
          <Text style={styles.coverBadgeText}>SEO Audit Report</Text>
        </View>
      </View>
      <View style={styles.coverBody}>
        <Text style={styles.coverTitle}>SEO Audit Report</Text>

        <View style={styles.coverFieldRow}>
          <Text style={styles.coverFieldLabel}>Client / Website</Text>
          <Text style={styles.coverFieldValue}>{domain}</Text>
        </View>
        <View style={styles.coverFieldRow}>
          <Text style={styles.coverFieldLabel}>Full URL</Text>
          <Text style={[styles.coverFieldValue, { fontSize: 10 }]}>
            {audit.websiteUrl}
          </Text>
        </View>
        <View style={styles.coverFieldRow}>
          <Text style={styles.coverFieldLabel}>Audit Date</Text>
          <Text style={styles.coverFieldValue}>{generatedDate}</Text>
        </View>
        {whiteLabel && branding?.preparedBy && (
          <View style={styles.coverFieldRow}>
            <Text style={styles.coverFieldLabel}>Prepared By</Text>
            <Text style={styles.coverFieldValue}>{branding.preparedBy}</Text>
          </View>
        )}
        {whiteLabel && branding?.supportEmail && (
          <View style={styles.coverFieldRow}>
            <Text style={styles.coverFieldLabel}>Support</Text>
            <Text style={styles.coverFieldValue}>{branding.supportEmail}</Text>
          </View>
        )}

        <View style={styles.coverScoreBlock}>
          <Text style={styles.coverScoreTitle}>Overall SEO Score</Text>
          <Text style={styles.coverScoreValue}>{audit.seoScore}/100</Text>
          <Text style={styles.coverScoreLabel}>
            {getScoreLabel(audit.seoScore)}
          </Text>
          <View style={styles.coverScoreRow}>
            <View style={styles.coverMiniScore}>
              <Text style={styles.coverMiniScoreNum}>
                {audit.performanceScore}
              </Text>
              <Text style={styles.coverMiniScoreLabel}>Performance</Text>
            </View>
            <View style={styles.coverMiniScore}>
              <Text style={styles.coverMiniScoreNum}>
                {audit.accessibilityScore}
              </Text>
              <Text style={styles.coverMiniScoreLabel}>Accessibility</Text>
            </View>
          </View>
        </View>
      </View>

      <Footer
        whiteLabel={whiteLabel}
        branding={branding}
        generatedDate={generatedDate}
      />
    </Page>
  );
}

export default function AuditReportPDF({
 audit,
 branding,
 whiteLabel = false,
}: AuditReportPDFProps) {
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const issues = categorizeIssues(audit);
  const totalIssues =
    issues.critical.length + issues.warnings.length + issues.info.length;
  const actionPlan = generateActionPlan(issues);

  const h1Tags = Array.isArray(audit.h1Tags) ? audit.h1Tags : [];
  const h2Tags = Array.isArray(audit.h2Tags) ? audit.h2Tags : [];
  const h3Tags = Array.isArray(audit.h3Tags) ? audit.h3Tags : [];
  const recommendations = Array.isArray(audit.aiRecommendations)
    ? audit.aiRecommendations
    : [];

  const fixSuggestions = generateAllFixes({
    pageTitle: audit.pageTitle ?? "",
    titleLength: audit.titleLength ?? 0,
    metaDescription: audit.metaDescription ?? "",
    metaDescriptionLength: audit.metaDescriptionLength ?? 0,
    h1Count: audit.h1Count ?? 0,
    h1Tags: (audit.h1Tags ?? []) as string[],
    missingAltImages: (audit.missingAltImages ?? []) as { src: string }[],
    canonicalUrl: audit.canonicalUrl ?? undefined,
  });

  return (
    <Document>
      <CoverPage
        audit={audit}
        whiteLabel={whiteLabel}
        branding={branding}
        generatedDate={generatedDate}
      />

      <Page size="A4" style={styles.page}>
        <Header
          whiteLabel={whiteLabel}
          branding={branding}
          generatedDate={generatedDate}
        />

        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text
              style={[
                styles.summaryCardValue,
                { color: getScoreColor(audit.seoScore) },
              ]}
            >
              {audit.seoScore}
            </Text>
            <Text style={styles.summaryCardLabel}>SEO Score</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text
              style={[
                styles.summaryCardValue,
                { color: getScoreColor(audit.performanceScore) },
              ]}
            >
              {audit.performanceScore}
            </Text>
            <Text style={styles.summaryCardLabel}>Performance</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text
              style={[
                styles.summaryCardValue,
                { color: getScoreColor(audit.accessibilityScore) },
              ]}
            >
              {audit.accessibilityScore}
            </Text>
            <Text style={styles.summaryCardLabel}>Accessibility</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text
              style={[
                styles.summaryCardValue,
                { color: "#ef4444" },
              ]}
            >
              {issues.critical.length}
            </Text>
            <Text style={styles.summaryCardLabel}>Critical Issues</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text
              style={[
                styles.summaryCardValue,
                { color: "#f59e0b" },
              ]}
            >
              {issues.warnings.length}
            </Text>
            <Text style={styles.summaryCardLabel}>Warnings</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text
              style={[
                styles.summaryCardValue,
                { color: "#22c55e" },
              ]}
            >
              {issues.passed.length}
            </Text>
            <Text style={styles.summaryCardLabel}>Passed</Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: 6,
            padding: 12,
            marginTop: 10,
            borderWidth: 1,
            borderColor: "#e5e7eb",
          }}
        >
          <Text style={{ fontSize: 9, color: "#4b5563", lineHeight: 1.5 }}>
            {audit.websiteUrl} received an overall SEO score of{" "}
            {audit.seoScore}/100. The audit identified {issues.critical.length}{" "}
            critical issue{issues.critical.length !== 1 ? "s" : ""} and{" "}
            {issues.warnings.length} warning{issues.warnings.length !== 1 ? "s" : ""}{" "}
            that should be addressed to improve search visibility.
            {issues.critical.length > 0
              ? " The critical issues require immediate attention as they directly impact search engine rankings."
              : ""}
          </Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Header
          whiteLabel={whiteLabel}
          branding={branding}
          generatedDate={generatedDate}
        />

        <Text style={styles.sectionTitle}>SEO Score Breakdown</Text>
        {[
          {
            label: "SEO Score",
            value: audit.seoScore,
            desc: "Overall search engine optimisation effectiveness.",
          },
          {
            label: "Performance",
            value: audit.performanceScore,
            desc: "Page load speed and rendering efficiency.",
          },
          {
            label: "Accessibility",
            value: audit.accessibilityScore,
            desc: "Usability for users with disabilities.",
          },
        ].map((score) => (
          <View key={score.label} style={styles.scoreRow}>
            <View
              style={[
                styles.scoreBar,
                { backgroundColor: getScoreColor(score.value) },
              ]}
            >
              <Text style={styles.scoreBarText}>{score.value}</Text>
            </View>
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreName}>{score.label}</Text>
              <Text style={styles.scoreStatus}>
                {getScoreLabel(score.value)} — {score.desc}
              </Text>
            </View>
          </View>
        ))}

        {totalIssues > 0 && (
          <>
            <Text style={styles.sectionTitle}>Issue Prioritisation</Text>

            {issues.critical.length > 0 && (
              <>
                <Text style={styles.subsectionTitle}>
                  Critical Issues ({issues.critical.length})
                </Text>
                {issues.critical.map((issue, i) => (
                  <View
                    key={`c-${i}`}
                    style={[styles.issueCard, styles.issueCritical]}
                  >
                    <Text style={styles.issueTitle}>{issue.title}</Text>
                    <Text style={styles.issueDescription}>
                      {issue.description}
                    </Text>
                    {issue.resource && (
                      <Text style={styles.issueMeta}>
                        Affected: {issue.resource}
                      </Text>
                    )}
                    {issue.fix && (
                      <Text style={[styles.issueMeta, { color: "#374151" }]}>
                        Fix: {issue.fix}
                      </Text>
                    )}
                  </View>
                ))}
              </>
            )}

            {issues.warnings.length > 0 && (
              <>
                <Text style={styles.subsectionTitle}>
                  Warnings ({issues.warnings.length})
                </Text>
                {issues.warnings.map((issue, i) => (
                  <View
                    key={`w-${i}`}
                    style={[styles.issueCard, styles.issueWarning]}
                  >
                    <Text style={styles.issueTitle}>{issue.title}</Text>
                    <Text style={styles.issueDescription}>
                      {issue.description}
                    </Text>
                    {issue.fix && (
                      <Text style={[styles.issueMeta, { color: "#374151" }]}>
                        Fix: {issue.fix}
                      </Text>
                    )}
                  </View>
                ))}
              </>
            )}

            {issues.info.length > 0 && (
              <>
                <Text style={styles.subsectionTitle}>
                  Recommendations ({issues.info.length})
                </Text>
                {issues.info.map((issue, i) => (
                  <View
                    key={`i-${i}`}
                    style={[styles.issueCard, styles.issueInfo]}
                  >
                    <Text style={styles.issueTitle}>{issue.title}</Text>
                    <Text style={styles.issueDescription}>
                      {issue.description}
                    </Text>
                    {issue.fix && (
                      <Text style={[styles.issueMeta, { color: "#374151" }]}>
                        Suggestion: {issue.fix}
                      </Text>
                    )}
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {issues.passed.length > 0 && (
          <>
            <Text style={styles.subsectionTitle}>
              Passed Checks ({issues.passed.length})
            </Text>
            {issues.passed.map((issue, i) => (
              <View
                key={`p-${i}`}
                style={[styles.issueCard, styles.issuePassed]}
              >
                <Text style={styles.issueTitle}>{issue.title}</Text>
                <Text style={styles.issueDescription}>
                  {issue.description}
                </Text>
              </View>
            ))}
          </>
        )}
      </Page>

      <Page size="A4" style={styles.page}>
        <Header
          whiteLabel={whiteLabel}
          branding={branding}
          generatedDate={generatedDate}
        />

        <Text style={styles.sectionTitle}>Detailed SEO Data</Text>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Page Title</Text>
          <Text style={styles.dataValue}>{audit.pageTitle || "—"}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Title Length</Text>
          <Text style={styles.dataValue}>
            {audit.titleLength ?? audit.pageTitle?.length ?? 0} characters
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Meta Description</Text>
          <Text style={[styles.dataValue, { flex: 1 }]}>
            {audit.metaDescription || "Not set"}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Meta Desc. Length</Text>
          <Text style={styles.dataValue}>
            {audit.metaDescriptionLength ??
              audit.metaDescription?.length ??
              0}{" "}
            characters
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Canonical URL</Text>
          <Text style={[styles.dataValue, { flex: 1 }]}>
            {audit.canonicalUrl || "Not set"}
          </Text>
        </View>

        {h1Tags.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.subsectionTitle}>
              H1 Tags ({h1Tags.length})
            </Text>
            <View style={styles.tagContainer}>
              {h1Tags.map((tag, i) => (
                <Text key={i} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          </View>
        )}

        {h2Tags.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.subsectionTitle}>
              H2 Tags ({h2Tags.length})
            </Text>
            <View style={styles.tagContainer}>
              {h2Tags.map((tag, i) => (
                <Text key={i} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          </View>
        )}

        {h3Tags.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.subsectionTitle}>
              H3 Tags ({h3Tags.length})
            </Text>
            <View style={styles.tagContainer}>
              {h3Tags.map((tag, i) => (
                <Text key={i} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Links &amp; Images</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Internal Links</Text>
          <Text style={styles.dataValue}>{audit.internalLinks}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>External Links</Text>
          <Text style={styles.dataValue}>{audit.externalLinks}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Total Images</Text>
          <Text style={styles.dataValue}>{audit.imageCount}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Missing Alt Text</Text>
          <Text style={styles.dataValue}>{audit.missingAltCount}</Text>
        </View>

        {recommendations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>AI Recommendations</Text>
            {recommendations.map((rec, i) => (
              <View
                key={i}
                style={{
                  marginBottom: 6,
                  padding: 8,
                  backgroundColor: "#f8fafc",
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    color: "#374151",
                    lineHeight: 1.4,
                  }}
                >
                  {rec}
                </Text>
              </View>
            ))}
          </>
        )}

        {fixSuggestions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Fix Suggestions</Text>
            {fixSuggestions.slice(0, 8).map((fix, i) => (
              <View
                key={i}
                style={{
                  marginBottom: 6,
                  padding: 8,
                  backgroundColor: "#ecfdf5",
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: "#a7f3d0",
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    fontFamily: "Helvetica-Bold",
                    color: "#065f46",
                    marginBottom: 2,
                  }}
                >
                  {fix.summary}
                </Text>
                <Text
                  style={{
                    fontSize: 8,
                    color: "#374151",
                    lineHeight: 1.4,
                  }}
                >
                  {fix.suggestion}
                </Text>
              </View>
            ))}
          </>
        )}
      </Page>

      {actionPlan.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Header
            whiteLabel={whiteLabel}
            branding={branding}
            generatedDate={generatedDate}
          />

          <Text style={styles.sectionTitle}>SEO Action Plan</Text>

          <Text
            style={{
              fontSize: 9,
              color: "#6b7280",
              marginBottom: 16,
              lineHeight: 1.4,
            }}
          >
            Below are the recommended actions to improve the SEO health of{" "}
            {extractDomain(audit.websiteUrl)}, organised by priority.
          </Text>

          {actionPlan.filter((a) => a.priority === "high").length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>High Priority</Text>
              {actionPlan
                .filter((a) => a.priority === "high")
                .map((action, i) => (
                  <View
                    key={`h-${i}`}
                    style={[styles.actionCard, { backgroundColor: "#fef2f2" }]}
                  >
                    <View
                      style={[
                        styles.actionPriority,
                        styles.actionPriorityHigh,
                      ]}
                    >
                      <Text
                        style={[
                          styles.actionPriorityText,
                          { color: "#ef4444" },
                        ]}
                      >
                        High
                      </Text>
                    </View>
                    <Text style={styles.actionText}>{action.text}</Text>
                  </View>
                ))}
            </>
          )}

          {actionPlan.filter((a) => a.priority === "medium").length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>Medium Priority</Text>
              {actionPlan
                .filter((a) => a.priority === "medium")
                .map((action, i) => (
                  <View
                    key={`m-${i}`}
                    style={[styles.actionCard, { backgroundColor: "#fffbeb" }]}
                  >
                    <View
                      style={[
                        styles.actionPriority,
                        styles.actionPriorityMed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.actionPriorityText,
                          { color: "#d97706" },
                        ]}
                      >
                        Medium
                      </Text>
                    </View>
                    <Text style={styles.actionText}>{action.text}</Text>
                  </View>
                ))}
            </>
          )}

          {actionPlan.filter((a) => a.priority === "low").length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>Low Priority</Text>
              {actionPlan
                .filter((a) => a.priority === "low")
                .map((action, i) => (
                  <View
                    key={`l-${i}`}
                    style={[styles.actionCard, { backgroundColor: "#f0f9ff" }]}
                  >
                    <View
                      style={[
                        styles.actionPriority,
                        styles.actionPriorityLow,
                      ]}
                    >
                      <Text
                        style={[
                          styles.actionPriorityText,
                          { color: "#2563eb" },
                        ]}
                      >
                        Low
                      </Text>
                    </View>
                    <Text style={styles.actionText}>{action.text}</Text>
                  </View>
                ))}
            </>
          )}
        </Page>
      )}
    </Document>
  );
}
