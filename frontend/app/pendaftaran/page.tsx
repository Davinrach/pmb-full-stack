"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";

function PendaftaranRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
        <RefreshCw className="w-5 h-5 animate-spin text-[#0d3830]" />
        <span>Mengalihkan ke Dashboard PMB...</span>
      </div>
    </div>
  );
}

export default function PendaftaranPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
          <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
            <RefreshCw className="w-5 h-5 animate-spin text-[#0d3830]" />
            <span>Memuat...</span>
          </div>
        </div>
      }
    >
      <PendaftaranRedirect />
    </Suspense>
  );
}
