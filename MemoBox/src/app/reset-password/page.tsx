import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/forms";
import { Logo } from "@/components/brand";

export const metadata: Metadata = { title: "Nova senha" };

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <Link href="/" className="mb-10 inline-block">
          <Logo />
        </Link>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
