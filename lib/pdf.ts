import { pdf } from "@react-pdf/renderer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function downloadPDF(doc: any, filename: string): Promise<void> {
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "")
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
