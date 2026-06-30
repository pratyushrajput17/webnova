import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#18181b",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#18181b",
    marginBottom: 24,
  },
  logo: {
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#18181b",
  },
  dateText: {
    fontSize: 9,
    color: "#71717a",
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#18181b",
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f5",
  },
  label: {
    color: "#71717a",
    flex: 1,
  },
  value: {
    fontWeight: "bold",
    flex: 2,
    textAlign: "right",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  scoreBadge: {
    backgroundColor: "#18181b",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    fontSize: 18,
    fontWeight: "bold",
    minWidth: 50,
    textAlign: "center",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#18181b",
    fontWeight: "bold",
  },
  scoreSubtext: {
    fontSize: 9,
    color: "#71717a",
  },
  recItem: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#fafafa",
    borderRadius: 4,
    marginBottom: 4,
  },
  recBullet: {
    color: "#18181b",
    fontSize: 10,
  },
  recText: {
    color: "#52525b",
    fontSize: 9,
    flex: 1,
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e4e4e7",
    paddingTop: 10,
    fontSize: 8,
    color: "#a1a1aa",
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 40,
    fontSize: 8,
    color: "#a1a1aa",
  },
  urlText: {
    fontSize: 9,
    color: "#71717a",
    marginTop: 2,
  },
});

interface AuditReportPDFProps {
  websiteUrl: string;
  pageTitle: string;
  metaDescription: string | null;
  seoScore: number;
  performanceScore: number;
  accessibilityScore: number;
  h1Count: number;
  imageCount: number;
  missingAltCount: number;
  internalLinks: number;
  externalLinks: number;
  aiRecommendations: string[];
  createdAt: string;
}

export default function AuditReportPDF(data: AuditReportPDFProps) {
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const recommendations = Array.isArray(data.aiRecommendations)
    ? data.aiRecommendations
    : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>WebNova</Text>
          <View style={styles.headerRight}>
            <Text style={styles.reportTitle}>Audit Report</Text>
            <Text style={styles.dateText}>{generatedDate}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Website Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>URL</Text>
            <Text style={styles.value}>{data.websiteUrl}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Page Title</Text>
            <Text style={styles.value}>{data.pageTitle || "—"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Generated</Text>
            <Text style={styles.value}>{generatedDate}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scores</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreBadge}>{data.seoScore}</Text>
            <View>
              <Text style={styles.scoreLabel}>SEO Score</Text>
              <Text style={styles.scoreSubtext}>
                {data.seoScore >= 90
                  ? "Excellent"
                  : data.seoScore >= 70
                    ? "Good"
                    : data.seoScore >= 50
                      ? "Needs Work"
                      : "Poor"}
              </Text>
            </View>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreBadge}>{data.performanceScore}</Text>
            <View>
              <Text style={styles.scoreLabel}>Performance Score</Text>
              <Text style={styles.scoreSubtext}>
                {data.performanceScore >= 90
                  ? "Excellent"
                  : data.performanceScore >= 70
                    ? "Good"
                    : data.performanceScore >= 50
                      ? "Needs Work"
                      : "Poor"}
              </Text>
            </View>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreBadge}>{data.accessibilityScore}</Text>
            <View>
              <Text style={styles.scoreLabel}>Accessibility Score</Text>
              <Text style={styles.scoreSubtext}>
                {data.accessibilityScore >= 90
                  ? "Excellent"
                  : data.accessibilityScore >= 70
                    ? "Good"
                    : data.accessibilityScore >= 50
                      ? "Needs Work"
                      : "Poor"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Page Statistics</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Meta Description</Text>
            <Text style={[styles.value, { fontSize: 9 }]}>
              {data.metaDescription || "None"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>H1 Tags</Text>
            <Text style={styles.value}>{data.h1Count}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total Images</Text>
            <Text style={styles.value}>{data.imageCount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Missing Alt Tags</Text>
            <Text style={styles.value}>{data.missingAltCount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Internal Links</Text>
            <Text style={styles.value}>{data.internalLinks}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>External Links</Text>
            <Text style={styles.value}>{data.externalLinks}</Text>
          </View>
        </View>

        {recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {recommendations.map((rec, i) => (
              <View key={i} style={styles.recItem}>
                <Text style={styles.recBullet}>•</Text>
                <Text style={styles.recText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          <Text>Generated by WebNova</Text>
          <Text>www.webnova.ai</Text>
        </Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
