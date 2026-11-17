import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/session";

export const instant = false;

export default async function Home() {
  const user = await getAuthUser();
  redirect(user ? "/dashboard" : "/login");
}
