import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { next } = await searchParams;
  return <SignInForm next={typeof next === "string" ? next : undefined} />;
}
