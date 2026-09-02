import { signOut } from "@logto/next/server-actions";
import { logtoConfig } from "@/app/logto";

export const GET = async () => {
  await signOut(logtoConfig);
};
