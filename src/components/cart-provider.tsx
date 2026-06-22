"use client";

import { Product } from "@/data/products";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Toaster, toast } from "sonner";

type CartItem = {
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number;
  accent: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CART_STORAGE_KEY = "skillsolutions_cart_v1";

type CoursesApiResponse = {
  courses?: Array<{ slug: string }>;
};

async function fetchPublishedCourseSlugs() {
  const response = await fetch("/api/courses", { cache: "no-store" });
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as CoursesApiResponse;
  return new Set((data.courses ?? []).map((course) => course.slug));
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isStorageHydrated, setIsStorageHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const hydrateCartFromStorage = () => {
      const stored = globalThis.localStorage.getItem(CART_STORAGE_KEY);

      if (!stored) {
        if (!cancelled) {
          setIsStorageHydrated(true);
        }
        return;
      }

      try {
        const parsed = JSON.parse(stored) as CartItem[];
        if (!cancelled) {
          setItems(Array.isArray(parsed) ? parsed : []);
          setIsStorageHydrated(true);
        }
      } catch {
        globalThis.localStorage.removeItem(CART_STORAGE_KEY);
        if (!cancelled) {
          setItems([]);
          setIsStorageHydrated(true);
        }
      }
    };

    globalThis.queueMicrotask(hydrateCartFromStorage);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isStorageHydrated) {
      return;
    }

    globalThis.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, isStorageHydrated]);

  useEffect(() => {
    if (!isStorageHydrated) {
      return;
    }

    let cancelled = false;

    const reconcileWithPublishedCourses = async () => {
      try {
        const publishedSlugs = await fetchPublishedCourseSlugs();

        if (!publishedSlugs) {
          return;
        }

        if (cancelled) {
          return;
        }

        setItems((current) => {
          const next = current.filter((item) => publishedSlugs.has(item.slug));

          if (next.length !== current.length) {
            toast.info("Unavailable courses were removed from your cart.");
          }

          return next;
        });
      } catch {
        // Ignore transient network issues and keep current cart state.
      }
    };

    const handleWindowFocus = () => {
      void reconcileWithPublishedCourses();
    };

    void reconcileWithPublishedCourses();
    globalThis.window.addEventListener("focus", handleWindowFocus);

    return () => {
      cancelled = true;
      globalThis.window.removeEventListener("focus", handleWindowFocus);
    };
  }, [isStorageHydrated]);

  const addToCart = useCallback((product: Product) => {
    setItems((current) => {
      const existing = current.find((item) => item.slug === product.slug);
      if (existing) {
        toast.info(`${product.name} is already in your cart.`);
        return current;
      }

      toast.success(`${product.name} added to cart.`);

      return [
        ...current,
        {
          slug: product.slug,
          name: product.name,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          accent: product.accent,
          quantity: 1,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((slug: string) => {
    setItems((current) => current.filter((item) => item.slug !== slug));
  }, []);

  const updateQuantity = useCallback((slug: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((current) => current.filter((item) => item.slug !== slug));
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.slug === slug ? { ...item, quantity } : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    }),
    [
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <Toaster position="bottom-right" richColors visibleToasts={1} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
