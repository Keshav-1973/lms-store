import { CartProvider } from "@/components/cart-provider";
import { CommonFooter } from "@/components/common-footer";
import { CommonHeader } from "@/components/common-header";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import "./globals.css";
import "./theme.css";

export const metadata: Metadata = {
  title: "SkillSolutions",
  description:
    "Digital courses platform for Data Science, Web Development, and AI/ML.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialUserRole: "admin" | "student" | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin" || profile?.role === "student") {
      initialUserRole = profile.role;
    }
  }

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <CommonHeader
            initialUserEmail={user?.email ?? null}
            initialUserRole={initialUserRole}
          />
          {children}
          <CommonFooter />
        </CartProvider>
      </body>
    </html>
  );
}
