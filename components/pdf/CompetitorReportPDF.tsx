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
  siteLabel: {
    fontSize: 9,
    color: "#71717a",
    marginBottom: 2,
  },
  siteUrl: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#18181b",
    marginBottom: 12,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f4f4f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f5",
  },
  tableRowLast: {
    flexDirection: "row",
  },
  cellMetric: {
    flex: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontWeight: "bold",
    fontSize: 9,
    color: "#18181b",
  },
  cellValue: {
    flex: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: "center",
    fontSize: 9,
  },
  cellHeader: {
    flex: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: "center",
    fontSize: 8,
    fontWeight: "bold",
    color: "#71717a",
    textTransform: "uppercase",
  },
  cellResult: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: "center",
    fontSize: 9,
    fontWeight: "bold",
  },
  winText: {
    color: "#059669",
  },
  lossText: {
    color: "#dc2626",
  },
  tieText: {
    color: "#71717a",
  },
  summaryContainer: {
    backgroundColor: "#fafafa",
    borderRadius: 4,
    padding: 12,
    marginTop: 8,
  },
  summaryText: {
    fontSize: 9,
    color: "#52525b",
    lineHeight: 1.5,
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
});

interface ComparisonMetric {
  label: string;
  yourValue: number | string;
  competitorValue: number | string;
  yourWins: boolean;
  competitorWins: boolean;
}

interface CompetitorReportPDFProps {
  yourSite: string;
  competitorSite: string;
  yourData: {
    pageTitle: string;
    seoScore: number;
  };
  competitorData: {
    pageTitle: string;
    seoScore: number;
  };
  metrics: ComparisonMetric[];
  summary: string;
}

export default function CompetitorReportPDF(data: CompetitorReportPDFProps) {
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const yourLabel = data.yourData.pageTitle || data.yourSite;
  const compLabel = data.competitorData.pageTitle || data.competitorSite;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>WebNova</Text>
          <View style={styles.headerRight}>
            <Text style={styles.reportTitle}>Competitor Analysis</Text>
            <Text style={styles.dateText}>{generatedDate}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Websites Compared</Text>
          <Text style={styles.siteLabel}>Your Site</Text>
          <Text style={styles.siteUrl}>{data.yourSite}</Text>
          <Text style={styles.siteLabel}>Competitor</Text>
          <Text style={styles.siteUrl}>{data.competitorSite}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Side-by-Side Comparison</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.cellMetric}>Metric</Text>
              <Text style={styles.cellHeader}>Your Site</Text>
              <Text style={styles.cellHeader}>Competitor</Text>
              <Text style={styles.cellHeader}>Result</Text>
            </View>
            {data.metrics.map((metric, i) => {
              const isLast = i === data.metrics.length - 1;
              const RowComponent = isLast ? styles.tableRowLast : styles.tableRow;
              return (
                <View key={metric.label} style={RowComponent}>
                  <Text style={styles.cellMetric}>{metric.label}</Text>
                  <Text
                    style={
                      metric.yourWins
                        ? [styles.cellValue, styles.winText]
                        : styles.cellValue
                    }
                  >
                    {metric.yourValue}
                  </Text>
                  <Text
                    style={
                      metric.competitorWins
                        ? [styles.cellValue, styles.winText]
                        : styles.cellValue
                    }
                  >
                    {metric.competitorValue}
                  </Text>
                  <Text
                    style={
                      metric.yourWins
                        ? [styles.cellResult, styles.winText]
                        : metric.competitorWins
                          ? [styles.cellResult, styles.lossText]
                          : [styles.cellResult, styles.tieText]
                    }
                  >
                    {metric.yourWins
                      ? "WIN"
                      : metric.competitorWins
                        ? "LOSS"
                        : "TIE"}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>{data.summary}</Text>
          </View>
        </View>

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
