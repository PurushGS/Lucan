import { handleSignIn } from "@logto/next/server-actions";
import { redirect } from "next/navigation";
import { logtoConfig } from "@/app/logto";

export const GET = async (request: Request) => {
  await handleSignIn(logtoConfig, new URL(request.url));
  redirect("/");
};
