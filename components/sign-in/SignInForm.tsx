"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { get, post } from "@/lib/api";
import { getRememberDevice, getLastUsername, saveLastUsername, setRememberDevice } from "@/lib/remember";
import { useToast } from "@/components/ToastProvider";

export function SignInForm() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const errorRef = useRef<HTMLDivElement>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [apiDown, setApiDown] = useState(false);
  const [username, setUsername] = useState(getLastUsername);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [remember, setRemember] = useState(getRememberDevice);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!cancelled) setApiDown(true);
    }, 6000);

    get<{ needs_setup?: boolean }>("/api/auth/status")
      .then((data) => {
        if (!cancelled) {
          setNeedsSetup(Boolean(data.needs_setup));
          setApiDown(false);
        }
      })
      .catch(() => {
        if (!cancelled) setApiDown(true);
      })
      .finally(() => {
        window.clearTimeout(timer);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [error]);

  function loginErrorMessage(err: unknown): string {
    if (err instanceof Error) {
      const status = (err as { status?: number }).status;
      if (err.message && !["Unauthorized", "Request failed"].includes(err.message)) {
        return err.message;
      }
      if (status === 401) return "Invalid username or password. Check both fields and try again.";
      if (status === 429) return "Too many failed sign-in attempts. Wait a few minutes and try again.";
      if (status === 503) {
        return "Scan API is not running. Run .\\dev.ps1 from the Warehouse_scan folder.";
      }
      if (err.message === "Failed to fetch") {
        return "Cannot reach the scan API. Run .\\dev.ps1 (starts UI + API together).";
      }
    }
    return "Could not sign in. Check your username and password.";
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const user = username.trim();
    try {
      if (needsSetup) {
        if (password !== confirmPassword) {
          setError("The two passwords do not match.");
          setBusy(false);
          return;
        }
        await post("/api/auth/setup", {
          username: user,
          password,
          confirm_password: confirmPassword,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          remember_device: remember,
        });
      } else {
        await post("/api/auth/login", { username: user, password, remember_device: remember });
      }
      saveLastUsername(user);
      setRememberDevice(remember, user);
      showToast(needsSetup ? "Account created" : "Signed in");
      const next = searchParams.get("next");
      const target = next && next.startsWith("/") ? next : "/home";
      window.location.assign(target);
    } catch (err) {
      const message = loginErrorMessage(err);
      setError(message);
      setPassword("");
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {error ? (
          <div ref={errorRef} className="auth-error" role="alert" aria-live="assertive">
            {error}
          </div>
        ) : null}
        {apiDown && !error ? (
          <div className="auth-error" role="alert">
            Scan API is not running. Open PowerShell in <code>Warehouse_scan</code> and run{" "}
            <code>.\dev.ps1</code>
          </div>
        ) : null}
        <div className="auth-card-head">
          <h1 className="auth-title">
            Warehouse <em>Scan</em>
          </h1>
          {needsSetup ? <p>Create your owner account.</p> : null}
        </div>

        <form onSubmit={onSubmit} className="auth-form" method="post" action="/sign-in">
          {needsSetup ? (
            <>
              <label className="input-field">
                <span>First name</span>
                <input
                  type="text"
                  placeholder="First name"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                />
              </label>
              <label className="input-field">
                <span>Last name</span>
                <input
                  type="text"
                  placeholder="Last name"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                />
              </label>
            </>
          ) : null}

          <label className="input-field">
            <span>Username</span>
            <input
              type="text"
              placeholder={needsSetup ? "Owner username" : "admin"}
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError(null);
              }}
              required
            />
          </label>

          {needsSetup ? (
            <label className="input-field">
              <span>Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                required
              />
            </label>
          ) : null}

          <label className="input-field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Your password"
              autoComplete={needsSetup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              required
            />
          </label>

          {needsSetup ? (
            <label className="input-field">
              <span>Confirm password</span>
              <input
                type="password"
                placeholder="Re-enter password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                required
              />
            </label>
          ) : null}

          <label className="remember-field">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Remember this device</span>
          </label>

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Signing in…" : needsSetup ? "Create account" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
