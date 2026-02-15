"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Upload,
  Phone,
  Bell,
  Brain,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Users,
  UploadCloud,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Produtos", icon: Package },
  { href: "/dashboard/upload", label: "Upload Produtos", icon: Upload },
  { href: "/dashboard/clients", label: "Clientes", icon: Users },
  { href: "/dashboard/client-upload", label: "Upload Clientes", icon: UploadCloud },
  { href: "/dashboard/phone-numbers", label: "Telefones", icon: Phone },
  { href: "/dashboard/notifications", label: "Notificações", icon: Bell },
  { href: "/dashboard/ai", label: "IA / RAG", icon: Brain },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, loadFromStorage, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
  }, [loadFromStorage]);

  useEffect(() => {
    if (mounted && !token) {
      router.push("/login");
    }
  }, [mounted, token, router]);

  if (!mounted || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-soft text-lg gradient-text font-bold">
          Carregando...
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-sidebar-background">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
            <Package className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold gradient-text">Akram</span>
            <p className="text-[10px] text-muted-foreground -mt-0.5">Monitor</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-3 py-2">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <item.icon
                  className={`w-[18px] h-[18px] transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/20">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground truncate capitalize">
                {user?.role}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-muted-foreground hover:text-red-400 hover:bg-red-500/10 cursor-pointer rounded-xl"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-sidebar-background border-r border-border flex flex-col animate-slide-in-left shadow-2xl">
            <div className="h-16 flex items-center justify-between px-6 border-b border-border">
              <span className="text-lg font-bold gradient-text">Akram</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <item.icon className="w-[18px] h-[18px]" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex items-center gap-2">
              <h2 className="text-sm font-semibold">
                {navItems.find((i) => i.href === pathname)?.label || "Dashboard"}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
              <span className="text-[11px] font-medium text-emerald-500">Online</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
