// components/auth/logout-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useToast } from "@/hooks/use-toast";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setPermissions } = useAuthStore();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const supabase = createClientComponentClient();

      await supabase.auth.signOut();

      // Clear auth store
      setUser(null);
      setPermissions(null);

      toast({
        title: "Logged out successfully",
      });

      router.push("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleLogout} disabled={isLoading}>
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}
