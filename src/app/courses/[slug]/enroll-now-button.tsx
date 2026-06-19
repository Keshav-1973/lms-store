"use client";

import { useCart } from "@/components/cart-provider";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type EnrollNowButtonProps = {
  courseSlug: string;
  courseName: string;
  price: number;
  compareAtPrice: number;
  accent: string;
};

export default function EnrollNowButton({
  courseSlug,
  courseName,
  price,
  compareAtPrice,
  accent,
}: EnrollNowButtonProps) {
  const { addToCart } = useCart();
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug }),
      });

      const data = (await res.json()) as { message?: string; error?: string };

      if (res.status === 401) {
        addToCart({
          slug: courseSlug,
          name: courseName,
          price,
          compareAtPrice,
          accent,
          category: "",
          tagline: "",
          description: "",
          descriptionDetailed: "",
          rating: 0,
          reviewCount: 0,
          downloads: "",
          modules: [],
          included: [],
          outcomes: [],
        });
        return;
      }

      if (!res.ok && res.status !== 200) {
        toast.error(data.error ?? "Enrollment failed.");
        return;
      }

      // Also add to cart so the user can checkout / pay later.
      addToCart({
        slug: courseSlug,
        name: courseName,
        price,
        compareAtPrice,
        accent,
        category: "",
        tagline: "",
        description: "",
        descriptionDetailed: "",
        rating: 0,
        reviewCount: 0,
        downloads: "",
        modules: [],
        included: [],
        outcomes: [],
      });

      toast.success(data.message ?? `Enrolled in ${courseName}!`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleEnroll}
      disabled={enrolling}
      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--theme-btn-primary-bg) px-4 py-2.5 text-sm font-semibold text-(--theme-btn-primary-text) transition hover:bg-(--theme-brand-hover) disabled:opacity-60"
    >
      {enrolling && <Loader2 className="h-4 w-4 animate-spin" />}
      {enrolling ? "Enrolling…" : "Enroll Now"}
    </button>
  );
}
