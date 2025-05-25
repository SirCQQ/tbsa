"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useAuthFeedback } from "@/hooks/use-auth-feedback";

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const { showConnectionStatus } = useAuthFeedback();

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setIsReconnecting(false);
      showConnectionStatus(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsReconnecting(false);
      showConnectionStatus(false);
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [showConnectionStatus]);

  // Auto-retry connection when offline
  useEffect(() => {
    if (!isOnline && !isReconnecting) {
      const retryInterval = setInterval(() => {
        setIsReconnecting(true);

        // Simple connectivity check
        fetch("/api/health", { method: "HEAD" })
          .then(() => {
            setIsOnline(true);
            setIsReconnecting(false);
            showConnectionStatus(true);
          })
          .catch(() => {
            setIsReconnecting(false);
          });
      }, 5000);

      return () => clearInterval(retryInterval);
    }
  }, [isOnline, isReconnecting, showConnectionStatus]);

  if (isOnline) {
    return (
      <Badge variant="outline" className="text-green-600 border-green-200">
        <Wifi className="h-3 w-3 mr-1" />
        Online
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="animate-pulse">
      {isReconnecting ? (
        <>
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          Reconectare...
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3 mr-1" />
          Offline
        </>
      )}
    </Badge>
  );
}
