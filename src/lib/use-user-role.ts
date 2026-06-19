"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type UserRole = "admin" | "student" | null;

export function useUserRole() {
  const [role, setRole] = useState<UserRole>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const loadRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      if (!user) {
        setRole(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!active) {
        return;
      }

      if (profile?.role === "admin" || profile?.role === "student") {
        setRole(profile.role);
      } else {
        setRole(null);
      }
    };

    void loadRole();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadRole();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { role, isAdmin: role === "admin" };
}
