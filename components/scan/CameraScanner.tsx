"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onScan: (code: string) => void;
  active: boolean;
};

type Phase = "idle" | "starting" | "live" | "denied" | "error";

export function CameraScanner({ onScan, active }: Props) {
  const readerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const regionId = "qr-reader";
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!active && readerRef.current) {
      const reader = readerRef.current;
      readerRef.current = null;
      reader
        .stop()
        .then(() => reader.clear())
        .catch(() => {});
      setPhase("idle");
    }
  }, [active]);

  useEffect(() => {
    return () => {
      if (!readerRef.current) return;
      const reader = readerRef.current;
      readerRef.current = null;
      reader.stop().then(() => reader.clear()).catch(() => {});
    };
  }, []);

  async function startCamera() {
    if (phase === "starting" || phase === "live") return;
    setPhase("starting");
    setMessage("");

    if (!window.isSecureContext) {
      setPhase("error");
      setMessage("Camera requires HTTPS or localhost.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setPhase("error");
      setMessage("This browser does not support camera access.");
      return;
    }

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const reader = new Html5Qrcode(regionId, { verbose: false });
      readerRef.current = reader;

      await reader.start(
        // html5-qrcode only accepts a string or { exact }; a plain string prefers
        // the rear camera but falls back to any camera (e.g. laptop webcams).
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.72);
            return { width: size, height: size };
          },
          aspectRatio: 1,
        },
        (decoded) => {
          onScan(decoded);
        },
        () => {},
      );
      setPhase("live");
    } catch (err) {
      readerRef.current = null;
      const name = err instanceof Error ? err.name : "";
      const text = err instanceof Error ? err.message : String(err);
      if (name === "NotAllowedError" || name === "PermissionDeniedError" || /permission/i.test(text)) {
        setPhase("denied");
        setMessage("Camera access was blocked. Allow camera in your browser or device settings, then try again.");
      } else if (name === "NotFoundError") {
        setPhase("error");
        setMessage("No camera found on this device.");
      } else {
        setPhase("error");
        setMessage(text || "Could not start the camera.");
      }
    }
  }

  async function stopCamera() {
    if (!readerRef.current) {
      setPhase("idle");
      return;
    }
    const reader = readerRef.current;
    readerRef.current = null;
    try {
      await reader.stop();
      reader.clear();
    } catch {
      /* ignore */
    }
    setPhase("idle");
  }

  return (
    <div className="scan-panel">
      <div className="scan-viewport scan-viewport--inset" id={regionId} />

      {phase !== "live" ? (
        <div className="scan-panel-body">
          {phase === "denied" ? (
            <div className="scan-alert scan-alert--danger">
              <ShieldAlert size={20} className="shrink-0" />
              <div>
                <strong>Camera blocked</strong>
                <p>{message}</p>
                <p className="scan-alert-hint">
                  iOS: Settings → Safari → Camera → Allow. Android: tap the lock icon → Permissions → Camera.
                </p>
              </div>
            </div>
          ) : phase === "error" ? (
            <p className="scan-panel-message scan-panel-message--error">{message}</p>
          ) : (
            <p className="scan-panel-message">
              Tap below to start the camera, then point at a shelf label.
            </p>
          )}
          <Button
            type="button"
            className="h-12 w-full rounded-2xl bg-[#0f766e] text-[15px] hover:bg-[#0d655e]"
            onClick={() => void startCamera()}
            disabled={phase === "starting"}
          >
            <Camera size={18} />
            {phase === "starting" ? "Starting camera…" : "Start camera"}
          </Button>
        </div>
      ) : (
        <div className="scan-panel-body">
          <Button
            type="button"
            variant="secondary"
            className="h-12 w-full rounded-2xl bg-white text-[15px] shadow-[0_1px_4px_rgba(26,31,30,0.06)]"
            onClick={() => void stopCamera()}
          >
            Stop camera
          </Button>
        </div>
      )}
    </div>
  );
}
