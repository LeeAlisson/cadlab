"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, LogOut, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast("Logout realizado", {
      description: "Até logo!",
    });
    router.push("/login");
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="cursor-pointer">
              <h1 className="text-3xl font-bold text-foreground">CadLab</h1>
              <p className="text-muted-foreground mt-1">
                Sistema de Gerenciamento de Laboratórios
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {user.name}
              </span>
            </div>
            <nav className="flex gap-2">
              <Link href="/manage">
                <Button variant="outline">
                  <Building2 className="mr-2 h-4 w-4" />
                  Gerenciar
                </Button>
              </Link>
              <Link href="/schedule">
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
