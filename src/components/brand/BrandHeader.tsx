"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const BrandHeader = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border h-16">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/brand" className="flex items-center gap-2 group">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Brand Dashboard</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">{user?.email}</div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/brand")}>
            <User className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default BrandHeader;
