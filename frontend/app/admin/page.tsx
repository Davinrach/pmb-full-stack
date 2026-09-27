"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPageRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admincms");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-xs text-slate-500 font-bold">
      Mengarahkan ke Dashboard Admin CMS (/admincms)...
    </div>
  );
}
