"use client";

import { useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { X, Download, Loader2 } from "lucide-react";
import AuditReportPDF from "./AuditReportPDF";
import { downloadPDF } from "@/lib/pdf";

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

interface PDFPreviewProps {
  audit: AuditData;
  branding?: Branding | null;
  whiteLabel?: boolean;
  filename: string;
  open: boolean;
  onClose: () => void;
}

export default function PDFPreview({
  audit,
  branding,
  whiteLabel,
  filename,
  open,
  onClose,
}: PDFPreviewProps) {
  const [downloading, setDownloading] = useState(false);

  if (!open) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadPDF(
        <AuditReportPDF audit={audit} branding={branding} whiteLabel={whiteLabel} />,
        filename
      );
    } catch {
      // silently fail
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Report Preview</h2>
            <p className="mt-0.5 text-sm text-zinc-500">{filename}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {downloading ? "Generating..." : "Download PDF"}
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <PDFViewer width="100%" height="100%" showToolbar={false}>
            <AuditReportPDF
              audit={audit}
              branding={branding}
              whiteLabel={whiteLabel}
            />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
