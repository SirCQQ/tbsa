"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import type { Session } from "next-auth";

type AuthSessionProviderProps = {
  children: ReactNode;
  session?: Session | null;
};

export function AuthSessionProvider({
  children,
  session,
}: AuthSessionProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
