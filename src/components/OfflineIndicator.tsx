import React, { useEffect, useState } from "react";
import { WifiOff, CheckCircle2 } from "lucide-react";

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" && typeof navigator.onLine === "boolean"
      ? navigator.onLine
      : true
  );
  const [showReconnectedBanner, setShowReconnectedBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedBanner(true);
      const timer = setTimeout(() => {
        setShowReconnectedBanner(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedBanner(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showReconnectedBanner) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      {!isOnline ? (
        <div className="bg-amber-600 text-white px-4 py-1.5 rounded-full shadow-lg border border-amber-500/50 flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-auto">
          <WifiOff className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
          <span>Offline Mode Active — Using cached hotel operational records</span>
        </div>
      ) : (
        <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-full shadow-lg border border-emerald-500/50 flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-auto">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
          <span>Back online — Hotel records synchronized</span>
        </div>
      )}
    </div>
  );
};
