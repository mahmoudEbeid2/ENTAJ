"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileText, Printer } from "lucide-react";

export function DocumentActions({
  fileHref,
  downloadHref,
  backHref,
}: {
  fileHref: string;
  downloadHref: string;
  backHref: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  const handlePrint = () => {
    const win = iframeRef.current?.contentWindow;
    if (win) {
      win.focus();
      win.print();
    } else {
      window.open(fileHref, "_blank");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={downloadHref}
            className="flex h-12 items-center gap-2 rounded-full bg-entaj-blue px-6 font-expanded text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-entaj-blue/90 hover:shadow-lg"
          >
            <Download className="size-4" />
            Download PDF
          </a>
          <button
            type="button"
            onClick={handlePrint}
            className="flex h-12 items-center gap-2 rounded-full border border-entaj-blue/20 bg-white px-6 font-expanded text-sm font-semibold text-entaj-blue transition-all duration-200 hover:-translate-y-0.5 hover:bg-entaj-light-grey"
          >
            <Printer className="size-4" />
            Print
          </button>
        </div>
        <Link
          href={backHref}
          className="flex w-fit items-center gap-1.5 rounded-full px-4 py-2 font-expanded text-sm font-semibold text-entaj-medium-grey transition-colors duration-200 hover:text-entaj-blue"
        >
          <ArrowLeft className="size-4" />
          Back to Product
        </Link>
      </div>

      <div className="relative mt-6 h-[60vh] min-h-[420px] w-full overflow-hidden rounded-2xl border border-entaj-blue/10 bg-white shadow-[0_1px_2px_rgba(44,56,142,0.06)] sm:h-[70vh] lg:h-[75vh]">
        {!loaded ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-entaj-light-grey">
            <FileText className="size-8 animate-pulse text-entaj-blue/40" />
            <span className="font-expanded text-sm text-entaj-medium-grey">Loading document…</span>
          </div>
        ) : null}
        <iframe
          ref={iframeRef}
          src={fileHref}
          title="Document preview"
          className="size-full"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </>
  );
}
