"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Hash,
  Link,
  ExternalLink,
  Image,
  ImageOff,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";

interface LinkItem {
  href: string;
  text: string;
}

interface ImageItem {
  src: string;
  alt: string;
  hasAlt: boolean;
}

interface AuditSectionsData {
  h1Tags?: string[];
  h2Tags?: string[];
  h3Tags?: string[];
  canonicalUrl?: string;
  internalLinksData?: LinkItem[];
  externalLinksData?: LinkItem[];
  imagesData?: ImageItem[];
  missingAltImages?: { src: string }[];
  titleLength?: number;
  metaDescriptionLength?: number;
  h1Count?: number;
  internalLinks?: number;
  externalLinks?: number;
  imageCount?: number;
  missingAltCount?: number;
  pageTitle?: string;
  metaDescription?: string;
}

function hasDetailData(arr: unknown[] | undefined | null): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

function showUnavailable(count: number) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-blue-50 px-4 py-3">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
      <div>
        <p className="text-sm font-medium text-blue-800">
          {count} item{count !== 1 ? "s" : ""} detected
        </p>
        <p className="mt-0.5 text-xs text-blue-600">
          Detailed breakdown unavailable for audits created before the schema
          upgrade. Run a new audit to get full detail.
        </p>
      </div>
    </div>
  );
}

export default function AuditDetailSections({ data }: { data: AuditSectionsData }) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const badges = [
    { id: "h1", label: "H1 Tags", arr: data.h1Tags, count: data.h1Count ?? 0, icon: Hash, color: "bg-blue-50 text-blue-700" },
    { id: "h2", label: "H2 Tags", arr: data.h2Tags, count: data.h2Tags?.length ?? 0, icon: Hash, color: "bg-indigo-50 text-indigo-700" },
    { id: "h3", label: "H3 Tags", arr: data.h3Tags, count: data.h3Tags?.length ?? 0, icon: Hash, color: "bg-sky-50 text-sky-700" },
    { id: "internal", label: "Internal Links", arr: data.internalLinksData, count: data.internalLinks ?? 0, icon: Link, color: "bg-emerald-50 text-emerald-700" },
    { id: "external", label: "External Links", arr: data.externalLinksData, count: data.externalLinks ?? 0, icon: ExternalLink, color: "bg-amber-50 text-amber-700" },
    { id: "images", label: "Images", arr: data.imagesData, count: data.imageCount ?? 0, icon: Image, color: "bg-violet-50 text-violet-700" },
    { id: "missing-alt", label: "Missing Alt Tags", arr: data.missingAltImages, count: data.missingAltCount ?? 0, icon: ImageOff, color: "bg-red-50 text-red-700" },
    { id: "meta", label: "Meta Info", arr: null, count: 0, icon: FileText, color: "bg-zinc-50 text-zinc-700" },
  ];

  const toggle = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8">
      <h2 className="text-lg font-semibold text-zinc-800">Detailed Analysis</h2>
      <div className="mt-5 space-y-3">
        {badges.map((badge) => {
          const Icon = badge.icon;
          const isOpen = openSection === badge.id;
          const detailLen = hasDetailData(badge.arr) ? badge.arr!.length : 0;
          const showCount = badge.id === "meta" ? 0 : Math.max(badge.count, detailLen);
          const hasMismatch = detailLen > 0 && badge.count !== detailLen;

          return (
            <div
              key={badge.id}
              className="overflow-hidden rounded-xl border border-zinc-100"
            >
              <button
                onClick={() => toggle(badge.id)}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-zinc-50"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-700">
                    {badge.label}
                  </span>
                  {hasMismatch ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {badge.count} <span className="text-amber-400">·</span> {detailLen}
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.color}`}
                    >
                      {showCount}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-400 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-zinc-100 px-5 py-4">
                      {badge.id === "h1" && (
                        hasDetailData(data.h1Tags)
                          ? renderHTags(data.h1Tags!, "H1")
                          : (data.h1Count ?? 0) > 0 ? showUnavailable(data.h1Count ?? 0) : renderHTags([], "H1")
                      )}
                      {badge.id === "h2" && renderHTags(data.h2Tags ?? [], "H2")}
                      {badge.id === "h3" && renderHTags(data.h3Tags ?? [], "H3")}
                      {badge.id === "internal" && (
                        hasDetailData(data.internalLinksData)
                          ? renderLinks(data.internalLinksData, true)
                          : (data.internalLinks ?? 0) > 0 ? showUnavailable(data.internalLinks ?? 0) : renderLinks([], true)
                      )}
                      {badge.id === "external" && (
                        hasDetailData(data.externalLinksData)
                          ? renderLinks(data.externalLinksData, false)
                          : (data.externalLinks ?? 0) > 0 ? showUnavailable(data.externalLinks ?? 0) : renderLinks([], false)
                      )}
                      {badge.id === "images" && (
                        hasDetailData(data.imagesData)
                          ? renderImages(data.imagesData)
                          : (data.imageCount ?? 0) > 0 ? showUnavailable(data.imageCount ?? 0) : renderImages([])
                      )}
                      {badge.id === "missing-alt" && (
                        hasDetailData(data.missingAltImages)
                          ? renderMissingAlt(data.missingAltImages)
                          : (data.missingAltCount ?? 0) > 0 ? showUnavailable(data.missingAltCount ?? 0) : renderMissingAlt([])
                      )}
                      {badge.id === "meta" && renderMetaInfo(data)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderHTags(tags: string[], tagName: string) {
  if (!tags || tags.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
        No {tagName} tags found on this page.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {tags.map((tag, i) => (
        <div
          key={i}
          className="rounded-lg bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800"
        >
          <span className="mr-2 text-xs font-medium text-zinc-400">#{i + 1}</span>
          {tag}
        </div>
      ))}
      {tagName === "H1" && tags.length > 1 && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2 text-xs text-amber-700">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Multiple H1 tags found. Best practice is to use one H1 per page.
        </div>
      )}
    </div>
  );
}

function renderLinks(links?: LinkItem[], isInternal?: boolean) {
  if (!links || links.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
        {isInternal
          ? "No internal links found on this page."
          : "No external links found on this page."}
      </div>
    );
  }
  return (
    <div className="space-y-1.5 max-h-80 overflow-y-auto">
      {links.map((link, i) => (
        <a
          key={i}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col gap-0.5 rounded-lg px-4 py-2 transition-colors hover:bg-zinc-50"
        >
          {link.text && (
            <span className="text-sm font-medium text-zinc-800 line-clamp-1">
              {link.text}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-zinc-400 transition-colors group-hover:text-blue-600">
            {link.href}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </span>
        </a>
      ))}
    </div>
  );
}

function renderImages(images?: ImageItem[]) {
  if (!images || images.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
        No images found on this page.
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {images.map((img, i) => (
        <div
          key={i}
          className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3"
        >
          <div className="mb-2 flex h-20 items-center justify-center overflow-hidden rounded-lg bg-white">
            {img.src ? (
              <img
                src={img.src}
                alt={img.alt || "No alt text"}
                className="max-h-full max-w-full object-contain"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).parentElement!.classList.add(
                    "flex",
                    "items-center",
                    "justify-center",
                    "text-zinc-300"
                  );
                  (e.target as HTMLImageElement).parentElement!.innerText =
                    "Failed to load";
                }}
              />
            ) : (
              <span className="text-xs text-zinc-300">No source</span>
            )}
          </div>
          <div className="space-y-1">
            {img.src ? (
              <a href={img.src} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-zinc-500 transition-colors hover:text-blue-600" title={img.src}>
                {img.src}
              </a>
            ) : (
              <p className="truncate text-xs text-zinc-500">—</p>
            )}
            <div className="flex items-center gap-1.5">
              {img.hasAlt ? (
                <>
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                  <span className="truncate text-xs text-zinc-600">
                    {img.alt}
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-red-500">
                  <ImageOff className="h-3 w-3" />
                  Missing alt text
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function renderMissingAlt(images?: { src: string }[]) {
  if (!images || images.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        All images have proper alt text.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-xs text-red-700">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        {images.length} image(s) missing descriptive alt text. This hurts
        accessibility and SEO.
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {images.map((img, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50/30 p-3"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
              {img.src ? (
                <img
                  src={img.src}
                  alt=""
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <ImageOff className="h-5 w-5 text-zinc-300" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {img.src ? (
                <a href={img.src} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-zinc-500 transition-colors hover:text-blue-600" title={img.src}>
                  {img.src}
                </a>
              ) : (
                <p className="truncate text-xs text-zinc-500">No source URL</p>
              )}
              <span className="mt-1 inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                <ImageOff className="h-3 w-3" />
                Missing alt
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderMetaInfo(data: AuditSectionsData) {
  const titleLen = data.titleLength ?? 0;
  const descLen = data.metaDescriptionLength ?? 0;
  const titleOk = titleLen >= 30 && titleLen <= 60;
  const descOk = descLen >= 50 && descLen <= 160;

  return (
    <div className="space-y-4">
      {data.canonicalUrl && (
        <div>
          <span className="text-sm font-medium text-zinc-700">Canonical URL</span>
          <a
            href={data.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center gap-1.5 truncate text-sm text-blue-600 transition-colors hover:text-blue-800"
          >
            {data.canonicalUrl}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        </div>
      )}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-700">
            Page Title
          </span>
          {data.pageTitle && (
            <span className="text-xs text-zinc-400 truncate ml-4 max-w-[60%]">{data.pageTitle}</span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-zinc-500">Title Length</span>
          <span className="text-sm text-zinc-500">{titleLen} characters</span>
        </div>
        <div className="mt-1.5 h-2 w-full rounded-full bg-zinc-100">
          <div
            className={`h-2 rounded-full transition-all ${
              titleOk ? "bg-emerald-500" : "bg-amber-500"
            }`}
            style={{ width: `${Math.min(100, (titleLen / 60) * 100)}%` }}
          />
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          {titleOk ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          )}
          <span className="text-xs text-zinc-500">
            {titleLen === 0
              ? "No title tag found"
              : titleOk
                ? "SEO-friendly length (30–60 characters)"
                : titleLen < 30
                  ? "Too short — aim for 30–60 characters"
                  : "Too long — aim for 30–60 characters"}
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-700">
            Meta Description
          </span>
          {data.metaDescription && (
            <span className="text-xs text-zinc-400 truncate ml-4 max-w-[60%]">{data.metaDescription}</span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-zinc-500">Description Length</span>
          <span className="text-sm text-zinc-500">{descLen} characters</span>
        </div>
        <div className="mt-1.5 h-2 w-full rounded-full bg-zinc-100">
          <div
            className={`h-2 rounded-full transition-all ${
              descOk ? "bg-emerald-500" : "bg-amber-500"
            }`}
            style={{ width: `${Math.min(100, (descLen / 160) * 100)}%` }}
          />
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          {descOk ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          )}
          <span className="text-xs text-zinc-500">
            {descLen === 0
              ? "No meta description found"
              : descOk
                ? "Good length (50–160 characters)"
                : descLen < 50
                  ? "Too short — aim for 50–160 characters"
                  : "Too long — may be truncated in search results"}
          </span>
        </div>
      </div>
    </div>
  );
}
