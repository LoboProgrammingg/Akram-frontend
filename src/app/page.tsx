"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";

export default function HomePage() {
  const router = useRouter();
  const { loadFromStorage, token } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse-soft">
        <div className="text-2xl font-bold gradient-text">Carregando...</div>
      </div>
    </div>
  );
}
