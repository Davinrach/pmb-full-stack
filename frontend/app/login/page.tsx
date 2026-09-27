"use client";

import { useEffect, Suspense } from "react";
import LoginModal from "@/components/LoginModal";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");

  useEffect(() => {
    if (roleParam === "admin") {
      router.replace("/loginadmin");
    }
  }, [roleParam, router]);

  return (
    <div className="min-h-screen bg-[#072520] flex items-center justify-center relative overflow-hidden">
      {/* Background Kampus Wallpaper Overlay */}
      <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30 bg-[url('/banner.png')]" />
      
      {/* Centered Modal */}
      <div className="relative z-10 w-full flex justify-center">
        <LoginModal
          isOpen={true}
          onClose={() => router.push("/")}
          isStandalonePage={true}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#072520] flex items-center justify-center text-white text-xs">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
