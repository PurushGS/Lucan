import { readFile } from "node:fs/promises";
import { extractPdf } from "@/src/lib/content/pdf";

async function main() {
  const data = await readFile("/private/tmp/lucan-pdf-source.pdf");
  const file = new File([data], "lucan-pdf-source.pdf", { type: "application/pdf" });
  const text = await extractPdf(file);

  if (!text.includes("AI product managers should prototype early")) {
    throw new Error(`Unexpected PDF text: ${text.slice(0, 120)}`);
  }

  console.log("PDF parser reachable.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
