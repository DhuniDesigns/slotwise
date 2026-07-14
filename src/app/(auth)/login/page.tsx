"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/icons";

type LoginMode = "sign-in" | "reset";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("sign-in");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 420));
    router.push("/dashboard");
  }

  async function sendReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 420));
    setLoading(false);
    setResetSent(true);
  }

  return (
    <main className="login-page">
      <section className="login-aside">
        <Link className="brand" href="/"><BrandMark />Slotwise</Link>
        <div>
          <p className="eyebrow light">Secure Workspace</p>
          <h1>Sign in to manage every booking.</h1>
          <p>One connected place for availability, appointment types, confirmations, and the public booking page your clients use.</p>
        </div>
        <blockquote>“My public booking page and dashboard finally feel like one calm system.”<footer>— Maya, brand strategist</footer></blockquote>
      </section>

      <section className="login-panel" aria-label="Authentication">
        <div className="login-card">
          {mode === "sign-in" ? (
            <>
              <p className="eyebrow">Welcome Back</p>
              <h1>Sign in to Slotwise</h1>
              <p className="muted">Use your email and password to open your scheduling workspace.</p>
              <form className="login-form" onSubmit={signIn}>
                <label>
                  Email Address
                  <input name="email" type="email" autoComplete="email" spellCheck={false} placeholder="maya@studio.co…" required />
                </label>
                <label>
                  Password
                  <span className="password-field">
                    <input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password…" required minLength={8} />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </span>
                </label>
                <div className="login-row">
                  <label className="remember-row"><input name="remember" type="checkbox" />Remember me</label>
                  <button type="button" className="forgot-link" onClick={() => { setMode("reset"); setResetSent(false); }}>Forgot Password?</button>
                </div>
                <button className="full-login-button" disabled={loading} aria-live="polite">
                  {loading ? <><span className="button-spinner" />Signing In…</> : "Sign In"}
                </button>
              </form>
            </>
          ) : (
            <div className="sent-state">
              <p className="eyebrow">Password Reset</p>
              <h1>{resetSent ? "Check your inbox." : "Reset your password."}</h1>
              <p className="muted">{resetSent ? "If the email exists, a reset link has been sent. You can return to sign in when you’re ready." : "Enter your account email and we’ll send password reset instructions."}</p>
              {!resetSent && (
                <form className="login-form" onSubmit={sendReset}>
                  <label>
                    Email Address
                    <input name="reset-email" type="email" autoComplete="email" spellCheck={false} placeholder="maya@studio.co…" required />
                  </label>
                  <button className="full-login-button" disabled={loading} aria-live="polite">
                    {loading ? <><span className="button-spinner" />Sending Reset Link…</> : "Send Reset Link"}
                  </button>
                </form>
              )}
              <button className="text-button" onClick={() => { setMode("sign-in"); setResetSent(false); setLoading(false); }}>← Back to Sign In</button>
            </div>
          )}

          <footer className="login-footer">
            <span>© 2026 Slotwise</span>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </footer>
        </div>
      </section>
    </main>
  );
}
