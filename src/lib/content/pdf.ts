import { PDFParse } from "pdf-parse";

export async function extractPdf(file: File) {
  if (file.type !== "application/pdf") {
    throw new Error("Please upload a PDF file.");
  }

  const parser = new PDFParse({ data: Buffer.from(await file.arrayBuffer()) });
  const result = await parser.getText();
  await parser.destroy();
  const text = result.text.trim();

  if (text.length < 80) {
    throw new Error("Could not extract enough readable text from the PDF.");
  }

  return text.slice(0, 24000);
}
