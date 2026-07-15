"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/icons";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type LoginMode = "sign-in" | "sign-up" | "reset";
type AuthMessage = { type: "error" | "success"; text: string } | null;

function getAuthErrorMessage(message: string) {
  if (message.toLowerCase().includes("invalid login credentials")) {
    return "That email or password is not correct.";
  }

  if (message.toLowerCase().includes("failed to fetch")) {
    return "Could not reach Supabase Auth. Check your internet connection and Supabase environment variables, then try again.";
  }

  return message;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("sign-in");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<AuthMessage>(null);

  function switchMode(nextMode: LoginMode) {
    setMode(nextMode);
    setLoading(false);
    setResetSent(false);
    setMessage(null);
  }

  function getNextPath() {
    if (typeof window === "undefined") {
      return "/dashboard/calendar";
    }

    return new URLSearchParams(window.location.search).get("next") || "/dashboard/calendar";
  }

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const nextPath = getNextPath();
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      setMessage({ type: "error", text: getAuthErrorMessage(error.message) });
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  async function signUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const nextPath = getNextPath();
    const origin = window.location.origin;
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: getAuthErrorMessage(error.message) });
      return;
    }

    if (data.session) {
      router.push(nextPath);
      router.refresh();
      return;
    }

    setMessage({
      type: "success",
      text: "Account created. If email confirmation is enabled, check your inbox before signing in.",
    });
  }

  async function sendReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("reset-email") || "");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    setLoading(false);
    setResetSent(true);

    if (error) {
      setMessage({
        type: "error",
        text: "We could not send the reset email from Supabase. Check your Auth redirect settings, then try again.",
      });
    }
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
        <blockquote>&ldquo;My public booking page and dashboard finally feel like one calm system.&rdquo;<footer>&mdash; Maya, brand strategist</footer></blockquote>
      </section>

      <section className="login-panel" aria-label="Authentication">
        <div className="login-card">
          {mode === "sign-in" ? (
            <>
              <p className="eyebrow">Welcome Back</p>
              <h1>Sign in to Slotwise</h1>
              <p className="muted">Use your email and password to open your scheduling workspace.</p>
              {message && <p className={`auth-message ${message.type}`} role={message.type === "error" ? "alert" : "status"}>{message.text}</p>}
              <form className="login-form" onSubmit={signIn}>
                <label>
                  Email Address
                  <input name="email" type="email" autoComplete="email" spellCheck={false} placeholder="maya@studio.co" required />
                </label>
                <label>
                  Password
                  <span className="password-field">
                    <input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required minLength={8} />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </span>
                </label>
                <div className="login-row">
                  <label className="remember-row"><input name="remember" type="checkbox" />Remember me</label>
                  <button type="button" className="forgot-link" onClick={() => switchMode("reset")}>Forgot Password?</button>
                </div>
                <button className="full-login-button" disabled={loading} aria-live="polite">
                  {loading ? <><span className="button-spinner" />Signing In...</> : "Sign In"}
                </button>
              </form>
              <p className="auth-switch">New to Slotwise? <button type="button" className="text-button" onClick={() => switchMode("sign-up")}>Create an account</button></p>
            </>
          ) : mode === "sign-up" ? (
            <>
              <p className="eyebrow">Create Workspace</p>
              <h1>Create your Slotwise account</h1>
              <p className="muted">Start with email and password auth, then connect your scheduling workspace.</p>
              {message && <p className={`auth-message ${message.type}`} role={message.type === "error" ? "alert" : "status"}>{message.text}</p>}
              <form className="login-form" onSubmit={signUp}>
                <label>
                  Email Address
                  <input name="email" type="email" autoComplete="email" spellCheck={false} placeholder="you@company.com" required />
                </label>
                <label>
                  Password
                  <span className="password-field">
                    <input name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Create a secure password" required minLength={8} />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </span>
                </label>
                <button className="full-login-button" disabled={loading} aria-live="polite">
                  {loading ? <><span className="button-spinner" />Creating Account...</> : "Create Account"}
                </button>
              </form>
              <button className="text-button auth-back-button" onClick={() => switchMode("sign-in")}>Back to Sign In</button>
            </>
          ) : (
            <div className="sent-state">
              <p className="eyebrow">Password Reset</p>
              <h1>{resetSent ? "Check your inbox." : "Reset your password."}</h1>
              <p className="muted">{resetSent ? "If the email exists, a reset link has been sent. You can return to sign in when you are ready." : "Enter your account email and we will send password reset instructions."}</p>
              {message && <p className={`auth-message ${message.type}`} role={message.type === "error" ? "alert" : "status"}>{message.text}</p>}
              {!resetSent && (
                <form className="login-form" onSubmit={sendReset}>
                  <label>
                    Email Address
                    <input name="reset-email" type="email" autoComplete="email" spellCheck={false} placeholder="maya@studio.co" required />
                  </label>
                  <button className="full-login-button" disabled={loading} aria-live="polite">
                    {loading ? <><span className="button-spinner" />Sending Reset Link...</> : "Send Reset Link"}
                  </button>
                </form>
              )}
              <button className="text-button" onClick={() => switchMode("sign-in")}>Back to Sign In</button>
            </div>
          )}

          <footer className="login-footer">
            <span>&copy; 2026 Slotwise</span>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </footer>
        </div>
      </section>
    </main>
  );
}
