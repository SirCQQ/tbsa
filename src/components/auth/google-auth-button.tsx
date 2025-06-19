"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

type GoogleAuthButtonProps = {
  callbackUrl?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  children?: React.ReactNode;
};

export function GoogleAuthButton({
  callbackUrl = "/dashboard",
  className,
  variant = "outline",
  size = "default",
  children = "Continue with Google",
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.google className="mr-2 h-4 w-4" />
      )}
      {children}
    </Button>
  );
}
