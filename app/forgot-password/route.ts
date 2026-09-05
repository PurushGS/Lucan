import { redirect } from "next/navigation";

export const GET = async () => {
  redirect("/sign-in?screen=reset-password");
};
