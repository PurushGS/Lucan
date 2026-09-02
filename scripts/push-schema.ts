import { ensureSchema } from "@/src/lib/db/schema";

ensureSchema()
  .then(() => {
    console.log("Lucan schema is ready.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
