import { signIn } from "@logto/next/server-actions";
import { logtoConfig } from "@/app/logto";

export const GET = async () => {
  await signIn(logtoConfig);
};
