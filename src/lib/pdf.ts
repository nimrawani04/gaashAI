/**
 * Browser-side PDF ingestion for lesson input.
 *
 * Digital PDFs give us their text layer directly. Scanned textbook pages have
 * no usable text layer, so those pages are rasterised to PNG data URLs and
 * handed to the vision OCR pipeline by the caller.
 */

export type PdfPage = {
  page: number;
  /** Text pulled from the PDF text layer (empty for scanned pages). */
  text: string;
  /** PNG data URL, present only when the page needs OCR. */
  imageData?: string;
};

export type PdfExtraction = {
  pages: PdfPage[];
  /** Joined text layer content across all pages. */
  text: string;
  /** Pages with too little text to be usable — need OCR. */
  needsOcr: PdfPage[];
};

/** Below this many characters a page is treated as scanned. */
const MIN_CHARS_PER_PAGE = 40;
const MAX_PAGES = 10;

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjs;
}

export async function extractPdf(
  file: File,
  onProgress?: (done: number, total: number) => void,
): Promise<PdfExtraction> {
  const pdfjs = await loadPdfjs();
  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;

  const total = Math.min(doc.numPages, MAX_PAGES);
  const pages: PdfPage[] = [];

  for (let i = 1; i <= total; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => (item && typeof item === "object" && "str" in item ? String(item.str) : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (text.length >= MIN_CHARS_PER_PAGE) {
      pages.push({ page: i, text });
    } else {
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        pages.push({ page: i, text: "", imageData: canvas.toDataURL("image/png") });
      } else {
        pages.push({ page: i, text: "" });
      }
    }
    onProgress?.(i, total);
  }

  doc.cleanup();

  return {
    pages,
    text: pages
      .map((p) => p.text)
      .filter(Boolean)
      .join("\n\n"),
    needsOcr: pages.filter((p) => p.imageData),
  };
}
