"use client";

import { useCart } from "@/components/cart-provider";
import { ConfirmPopup } from "@/components/confirm-popup";
import { BookOpen, Loader2, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CartPage() {
  const { items, totalItems, totalPrice, removeFromCart, clearCart } =
    useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<{
    slug: string;
    name: string;
  } | null>(null);

  const confirmAndRemove = (slug: string, name: string) => {
    setPendingRemoval({ slug, name });
  };

  const cancelRemove = () => {
    setPendingRemoval(null);
  };

  const proceedRemove = () => {
    if (!pendingRemoval) {
      return;
    }

    setIsRemoving(true);
    removeFromCart(pendingRemoval.slug);
    setPendingRemoval(null);
    setIsRemoving(false);
  };

  const totalSavings = items.reduce(
    (sum, item) =>
      item.compareAtPrice > item.price
        ? sum + (item.compareAtPrice - item.price) * item.quantity
        : sum,
    0,
  );

  const courseSuffix = totalItems === 1 ? "course" : "courses";

  useEffect(() => {
    const checkoutState = searchParams.get("checkout");

    if (!checkoutState) {
      return;
    }

    if (checkoutState === "success") {
      clearCart();
      toast.success(
        "Payment successful. Sign in with the same email to unlock courses.",
      );
      router.replace("/cart");
      return;
    }

    if (checkoutState === "cancelled") {
      toast.info("Checkout was cancelled.");
      router.replace("/cart");
    }
  }, [clearCart, router, searchParams]);

  const handleProceedToCheckout = async () => {
    if (items.length === 0 || isCheckingOut) {
      return;
    }

    setIsCheckingOut(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            slug: item.slug,
            quantity: item.quantity,
          })),
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (response.status === 401) {
        const params = new URLSearchParams({ redirectTo: "/cart" });
        globalThis.window.location.assign(`/login?${params.toString()}`);
        return;
      }

      if (!response.ok || !data.url) {
        toast.error(data.error ?? "Unable to start checkout right now.");
        return;
      }

      globalThis.window.location.assign(data.url);
    } catch {
      toast.error("Unable to start checkout right now.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Your Cart
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {totalItems === 0
            ? "No courses added yet."
            : `${totalItems} ${courseSuffix} ready to checkout`}
        </p>
      </div>

      {items.length === 0 ? (
        /* ── Empty state ── */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-8 py-20 text-center shadow-sm">
          <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <ShoppingCart className="h-8 w-8 text-slate-400" />
          </span>
          <h2 className="text-xl font-semibold text-slate-800">
            Your cart is empty
          </h2>
          <p className="mt-2 max-w-xs text-sm text-slate-500">
            Looks like you haven&apos;t added any courses yet. Browse our
            catalogue to get started.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <BookOpen className="h-4 w-4" />
            Browse Courses
          </Link>
        </div>
      ) : (
        /* ── Cart layout ── */
        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* Left – item list */}
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.slug}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
              >
                {/* accent strip */}
                <div
                  className="absolute inset-y-0 left-0 w-1 rounded-l-2xl"
                  style={{ background: item.accent ?? "#111" }}
                />

                <div className="flex items-start gap-4 p-5 pl-6">
                  {/* icon placeholder */}
                  <span
                    className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: item.accent ? `${item.accent}18` : "#f1f5f9",
                    }}
                  >
                    <BookOpen
                      className="h-5 w-5"
                      style={{ color: item.accent ?? "#64748b" }}
                    />
                  </span>

                  {/* details */}
                  <div className="min-w-0 flex-1">
                    <h2 className="wrap-break-word text-base font-semibold leading-snug text-slate-900 sm:truncate">
                      {item.name}
                    </h2>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-slate-900">
                        ${item.price}
                      </span>
                      {item.compareAtPrice > item.price && (
                        <span className="text-sm text-slate-400 line-through">
                          ${item.compareAtPrice}
                        </span>
                      )}
                      {item.compareAtPrice > item.price && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          Save ${item.compareAtPrice - item.price}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* remove */}
                  <button
                    type="button"
                    onClick={() => confirmAndRemove(item.slug, item.name)}
                    aria-label={`Remove ${item.name}`}
                    className="ml-2 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Right – order summary */}
          <aside className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-base font-semibold uppercase tracking-widest text-slate-400">
              Order Summary
            </h2>

            <ul className="mt-5 space-y-3">
              {items.map((item) => (
                <li
                  key={item.slug}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 pr-2 text-slate-600 wrap-break-word">
                    {item.name}
                  </span>
                  <span className="shrink-0 font-medium text-slate-900">
                    ${item.price}
                  </span>
                </li>
              ))}
            </ul>

            <div className="my-5 border-t border-dashed border-slate-200" />

            {totalSavings > 0 && (
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">Savings</span>
                <span className="font-semibold text-emerald-600">
                  −${totalSavings}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-slate-900">
                Total
              </span>
              <span className="text-xl font-bold text-slate-900">
                ${totalPrice}
              </span>
            </div>

            <button
              type="button"
              onClick={() => void handleProceedToCheckout()}
              disabled={isCheckingOut || items.length === 0}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isCheckingOut && <Loader2 className="h-4 w-4 animate-spin" />}
              {isCheckingOut
                ? "Redirecting to Stripe..."
                : "Proceed to Checkout"}
            </button>

            <p className="mt-3 text-center text-xs text-slate-400">
              Secure checkout · No hidden fees
            </p>
          </aside>
        </div>
      )}

      <ConfirmPopup
        open={Boolean(pendingRemoval)}
        title="Remove course?"
        description={
          pendingRemoval ? (
            <>
              <span className="font-medium text-slate-700">
                {pendingRemoval.name}
              </span>{" "}
              will be removed from your cart.
            </>
          ) : (
            "This course will be removed from your cart."
          )
        }
        icon={<Trash2 className="h-5 w-5 text-red-500" />}
        cancelLabel="Keep it"
        confirmLabel="Remove"
        isLoading={isRemoving}
        onCancel={cancelRemove}
        onConfirm={proceedRemove}
      />
    </main>
  );
}
