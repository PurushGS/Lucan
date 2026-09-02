import { db } from "@/src/lib/db/client";
import { ensureSchema } from "@/src/lib/db/schema";
import { handleRouteError, jsonOk } from "@/src/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSchema();
    const result = await db.execute("select 1 as ok");
    return jsonOk({ ok: Number(result.rows[0]?.ok) === 1 });
  } catch (error) {
    return handleRouteError(error);
  }
}
