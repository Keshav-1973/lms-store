"use client";

import { logout } from "@/app/login/actions";
import { useCart } from "@/components/cart-provider";
import { createClient } from "@/lib/supabase/client";
import {
  Home,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  ShoppingCart,
  UserCircle2,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";

type UserRole = "admin" | "student" | null;

function DesktopAccountControl({
  checkingSession,
  userEmail,
  userRole,
  loginHref,
  accountDetailsRef,
  closeAccountMenu,
  onLogout,
  isLoggingOut = false,
}: {
  checkingSession: boolean;
  userEmail: string | null;
  userRole: UserRole;
  loginHref: string;
  accountDetailsRef: RefObject<HTMLDetailsElement | null>;
  closeAccountMenu: () => void;
  onLogout: () => Promise<void>;
  isLoggingOut?: boolean;
}) {
  if (checkingSession) {
    return (
      <span className="hidden h-10 w-28 animate-pulse rounded-full bg-slate-100 md:inline-flex" />
    );
  }

  if (!userEmail) {
    return (
      <Link
        href={loginHref}
        className="relative hidden items-center gap-1.5 overflow-hidden rounded-full bg-cyan-100 px-5 py-2 text-cyan-700 transition-all duration-300 hover:bg-linear-to-r hover:from-[#6B73FF] hover:to-[#000DFF] hover:text-white md:inline-flex"
      >
        <LogIn className="h-4 w-4" aria-hidden="true" />
        <span>Sign In</span>
      </Link>
    );
  }

  return (
    <details ref={accountDetailsRef} className="relative hidden md:block">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100 [&::-webkit-details-marker]:hidden">
        <UserCircle2 className="h-4 w-4" aria-hidden="true" />
        Account
      </summary>

      <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
          Signed in as
        </p>
        <p className="truncate px-2 text-sm font-medium text-slate-800">
          {userEmail}
        </p>

        {userRole === "admin" ? (
          <Link
            href="/admin/students"
            onClick={closeAccountMenu}
            className="mt-3 block rounded-lg px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Admin Dashboard
          </Link>
        ) : null}
        {userRole === "student" ? (
          <Link
            href="/student"
            onClick={closeAccountMenu}
            className="mt-1 block rounded-lg px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Student Dashboard
          </Link>
        ) : null}

        <button
          type="button"
          onClick={() => onLogout()}
          disabled={isLoggingOut}
          className="mt-2 flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          {isLoggingOut ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </details>
  );
}

export function CommonHeader({
  initialUserEmail,
  initialUserRole,
}: {
  initialUserEmail: string | null;
  initialUserRole: UserRole;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const accountDetailsRef = useRef<HTMLDetailsElement>(null);
  const { totalItems } = useCart();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail);
  const [userRole, setUserRole] = useState<UserRole>(initialUserRole);
  const [checkingSession, setCheckingSession] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const loginHref = useMemo(
    () => `/login?redirectTo=${encodeURIComponent(pathname || "/")}`,
    [pathname],
  );

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const syncRole = async (userId: string) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (!active) {
        return;
      }

      if (profile?.role === "admin" || profile?.role === "student") {
        setUserRole(profile.role);
      }
    };

    supabase.auth.getUser().then(({ data }) => {
      if (!active) {
        return;
      }

      if (data.user) {
        setUserEmail(data.user.email ?? null);
        void syncRole(data.user.id);
      } else if (!initialUserEmail) {
        // Avoid clobbering a valid server-provided auth state during hydration.
        setUserEmail(null);
        setUserRole(null);
      }

      setCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) {
        return;
      }

      if (event === "SIGNED_OUT") {
        setUserEmail(null);
        setUserRole(null);
      } else if (session?.user) {
        setUserEmail(session.user.email ?? null);
        void syncRole(session.user.id);
      }

      setCheckingSession(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [initialUserEmail]);

  const closeMenu = () => {
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const menu = detailsRef.current;

      if (!menu?.open) {
        return;
      }

      if (!menu.contains(event.target as Node)) {
        menu.open = false;
      }
    };

    const handleScroll = () => {
      const menu = detailsRef.current;

      if (menu?.open) {
        menu.open = false;
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const closeAccountMenu = () => {
    if (accountDetailsRef.current) {
      accountDetailsRef.current.open = false;
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Clear all localStorage items
      globalThis.localStorage.clear();

      // Clear all sessionStorage items
      globalThis.sessionStorage.clear();

      // Call the logout server action
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  const isInAdmin = pathname.startsWith("/admin");
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-30 mt-0 w-full rounded-2xl border border-white/70 bg-white/72 px-2 py-4 shadow-sm backdrop-blur-md sm:px-3">
      <div className="flex w-full items-center justify-between pl-2 pr-1 transition-[width] duration-500 ease-in-out sm:pl-3">
        <div className="flex flex-wrap items-center gap-2 text-sm transition-all duration-300 md:gap-4 md:text-base">
          <span className="flex h-7.5 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white md:h-9.5 md:w-7.5">
            SS
          </span>
          {isInAdmin ? (
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Admin Panel
            </p>
          ) : (
            <Link
              className="flex items-baseline gap-1 text-lg font-bold min-[400px]:text-xl md:text-2xl"
              href="/"
              onClick={closeAccountMenu}
            >
              SkillSolutions
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <nav
            className="hidden items-center gap-4 md:flex"
            aria-label="Primary"
          >
            {isInAdmin ? (
              <>
                <Link
                  href="/"
                  onClick={closeAccountMenu}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    pathname === "/"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Home size={20} /> Home
                </Link>
                <Link
                  href="/admin/courses"
                  onClick={closeAccountMenu}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    isActive("/admin/courses")
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Manage Courses
                </Link>
                <Link
                  href="/admin/students"
                  onClick={closeAccountMenu}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    isActive("/admin/students")
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Manage Students
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  onClick={closeAccountMenu}
                  className="relative cursor-pointer font-bold text-slate-900 transition-opacity hover:opacity-60"
                >
                  <span>Home</span>
                  {pathname === "/" ? (
                    <span className="pointer-events-none absolute -bottom-1.75 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-cyan-600" />
                  ) : null}
                </Link>
                <Link
                  href="/courses"
                  onClick={closeAccountMenu}
                  className="relative cursor-pointer text-slate-900 transition-opacity hover:opacity-60"
                >
                  <span>Courses</span>
                  {pathname === "/courses" ? (
                    <span className="pointer-events-none absolute -bottom-1.75 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-cyan-600" />
                  ) : null}
                </Link>
              </>
            )}
          </nav>
          {userRole === "admin" ? null : (
            <Link
              href="/cart"
              onClick={closeAccountMenu}
              className="relative inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              <span className="ml-1">Cart</span>
              {isHydrated && totalItems > 0 ? (
                <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-black px-1.5 py-0.5 text-xs text-white">
                  {totalItems}
                </span>
              ) : null}
            </Link>
          )}

          <DesktopAccountControl
            checkingSession={checkingSession}
            userEmail={userEmail}
            userRole={userRole}
            loginHref={loginHref}
            accountDetailsRef={accountDetailsRef}
            closeAccountMenu={closeAccountMenu}
            onLogout={handleLogout}
            isLoggingOut={loggingOut}
          />

          <details ref={detailsRef} className="group md:hidden">
            <summary
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-800 shadow-sm transition hover:bg-slate-100 [&::-webkit-details-marker]:hidden"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5 group-open:hidden" aria-hidden="true" />
              <X
                className="h-5 w-5 hidden group-open:block"
                aria-hidden="true"
              />
            </summary>

            <div className="fixed left-0 right-0 top-20 z-40 w-full border-y border-white/80 bg-white/95 p-3 shadow-xl backdrop-blur-md">
              <div className="mx-auto w-full max-w-7xl">
                {isInAdmin ? (
                  <>
                    <Link
                      href="/"
                      onClick={closeMenu}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                        pathname === "/"
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Home size={20} /> Home
                    </Link>
                    <Link
                      href="/admin/courses"
                      onClick={closeMenu}
                      className={`block rounded-xl px-3 py-2 text-sm font-semibold transition ${
                        isActive("/admin/courses")
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Manage Courses
                    </Link>
                    <Link
                      href="/admin/students"
                      onClick={closeMenu}
                      className={`mt-1 block rounded-xl px-3 py-2 text-sm font-semibold transition ${
                        isActive("/admin/students")
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Manage Students
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/"
                      onClick={closeMenu}
                      className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                    >
                      Home
                    </Link>
                    <Link
                      href="/courses"
                      onClick={closeMenu}
                      className="mt-1 block rounded-xl px-3 py-2 text-sm text-slate-900 transition hover:bg-slate-100"
                    >
                      Courses
                    </Link>
                  </>
                )}
                {userRole === "admin" ? null : (
                  <Link
                    href="/cart"
                    onClick={closeMenu}
                    className="mt-1 flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    <span>Cart</span>
                    {isHydrated && totalItems > 0 ? (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-black px-1.5 py-0.5 text-xs text-white">
                        {totalItems}
                      </span>
                    ) : null}
                  </Link>
                )}
                {userEmail ? null : (
                  <Link
                    href={loginHref}
                    onClick={closeMenu}
                    className="mt-2 block rounded-xl bg-cyan-100 px-3 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-200"
                  >
                    Sign In
                  </Link>
                )}

                {userRole === "student" ? (
                  <Link
                    href="/student"
                    onClick={closeMenu}
                    className="mt-1 block rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Student Dashboard
                  </Link>
                ) : null}

                {userRole === "admin" ? (
                  <Link
                    href="/admin/students"
                    onClick={closeMenu}
                    className="mt-1 block rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Admin Dashboard
                  </Link>
                ) : null}

                {userEmail ? (
                  <button
                    type="button"
                    onClick={() => handleLogout()}
                    disabled={loggingOut}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loggingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    {loggingOut ? "Signing out…" : "Sign Out"}
                  </button>
                ) : null}
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
