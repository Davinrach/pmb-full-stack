"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authStorage } from "@/lib/api";

export default function AdminPageRedirect() {
  const router = useRouter();
  useEffect(() => {
    const user = authStorage.getUser();
    const token = authStorage.getToken();
    if (token && user && (user.role === "admin_pmb" || user.role === "super_admin")) {
      router.replace("/admincms");
    } else {
      router.replace("/loginadmin");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-xs text-slate-500 font-bold">
      Mengarahkan ke Portal Admin...
    </div>
  );
}
