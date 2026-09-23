import React, { useEffect, useState } from "react";
import { Download, Share, X, Smartphone, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    // Detect if already installed or in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Android/Chrome/Desktop beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Auto-show unobtrusive banner after short delay if not dismissed previously
      const dismissed = sessionStorage.getItem("pwa-prompt-dismissed");
      if (!dismissed) {
        setIsBannerVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // App installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsBannerVisible(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    // iOS detection (Safari doesn't support beforeinstallprompt)
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    if (isIos && !isStandalone) {
      const dismissed = sessionStorage.getItem("pwa-ios-dismissed");
      if (!dismissed) {
        // Will show via iOS info button
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If iOS, open helper sheet
      const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
      if (isIos) {
        setShowIosPrompt(true);
      }
      return;
    }
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsInstalled(true);
      setIsBannerVisible(false);
    }
    setDeferredPrompt(null);
  };

  const dismissBanner = () => {
    setIsBannerVisible(false);
    sessionStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Header action button */}
      {(deferredPrompt || /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())) && (
        <button
          id="btn-pwa-install-header"
          onClick={() => {
            if (deferredPrompt) {
              handleInstallClick();
            } else {
              setShowIosPrompt(true);
            }
          }}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium transition-all shadow-xs"
          title="Install Grand Horizon App on your device"
        >
          <Download className="w-3.5 h-3.5 text-indigo-600" />
          <span>Install App</span>
        </button>
      )}

      {/* Floating Bottom Install Banner */}
      {isBannerVisible && deferredPrompt && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold tracking-wide uppercase text-indigo-300">
                  PWA Ready
                </h4>
                <button
                  onClick={dismissBanner}
                  className="text-slate-400 hover:text-white p-1"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-200 mt-0.5 leading-relaxed font-medium">
                Install <strong>Grand Horizon Hotel PMS</strong> on your desktop or mobile home screen for lightning-fast offline access.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  id="btn-confirm-pwa-install"
                  onClick={handleInstallClick}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install Now
                </button>
                <button
                  onClick={dismissBanner}
                  className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Installation Guide Modal */}
      {showIosPrompt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm">Install on iOS / Safari</h3>
              </div>
              <button
                onClick={() => setShowIosPrompt(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Apple Safari lets you install Grand Horizon Hotel PMS directly without going through the App Store:
            </p>

            <div className="mt-3.5 space-y-2 text-xs text-slate-700">
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <div>
                  Tap the <strong className="inline-flex items-center gap-1"><Share className="w-3 h-3 text-indigo-600 inline" /> Share</strong> button in Safari's bottom toolbar.
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <div>
                  Scroll down and tap <strong>Add to Home Screen</strong>.
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <div>
                  Confirm by tapping <strong>Add</strong> in the top-right corner.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosPrompt(false)}
              className="mt-4 w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
