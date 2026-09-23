import React from "react";
import { useHotel } from "../context/HotelContext";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useHotel();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-5 sm:bottom-5 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let colorClass = "bg-slate-900/95 text-white border-slate-700/80";
        let iconColor = "text-emerald-400";

        if (toast.type === "error") {
          Icon = XCircle;
          iconColor = "text-rose-400";
        } else if (toast.type === "warning") {
          Icon = AlertCircle;
          iconColor = "text-amber-400";
        } else if (toast.type === "info") {
          Icon = Info;
          iconColor = "text-blue-400";
        }

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${colorClass}`}
          >
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
              <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-slate-400 hover:text-white p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg transition-colors shrink-0"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
