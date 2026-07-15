"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BrandMark } from "@/components/icons";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type LoginMode = "sign-in" | "sign-up" | "reset";
type AuthMessage = { type: "error" | "success"; text: string } | null;
type Credentials = { email: string; password: string } | { error: string };

const AUTH_REQUEST_TIMEOUT_MS = 15000;

function getAuthErrorMessage(message: string) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("invalid login credentials")) {
    return "That email or password is not correct.";
  }

  if (lowerMessage.includes("failed to fetch")) {
    return "Could not reach Supabase Auth. Check your internet connection and Supabase environment variables, then try again.";
  }

  if (lowerMessage.includes("email not confirmed")) {
    return "Please confirm your email address first, then sign in again.";
  }

  if (lowerMessage.includes("provider is not enabled")) {
    return "Google sign-in is not enabled in Supabase yet. Enable the Google provider in Supabase Auth, then try again.";
  }

  if (lowerMessage.includes("timed out")) {
    return "Supabase Auth did not respond. Check your connection and Supabase Auth settings, then try again.";
  }

  return message;
}

function getCaughtAuthErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return getAuthErrorMessage(error.message);
  }

  return "Something went wrong while contacting Supabase Auth. Please try again.";
}

async function withAuthTimeout<T>(request: Promise<T>) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Auth request timed out")), AUTH_REQUEST_TIMEOUT_MS);
  });

  try {
    return await Promise.race([request, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function getEmailAndPassword(form: HTMLFormElement): Credentials {
  const formData = new FormData(form);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email) {
    return { error: "Enter your email address." };
  }

  if (!password) {
    return { error: "Enter your password." };
  }

  if (password.length < 8) {
    return { error: "Use at least 8 characters for your password." };
  }

  return { email, password };
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<LoginMode>("sign-in");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<AuthMessage>(null);
  const [hideUrlError, setHideUrlError] = useState(false);
  const urlError = hideUrlError ? null : searchParams.get("error");
  const displayedMessage = message ?? (urlError ? { type: "error" as const, text: getAuthErrorMessage(urlError) } : null);

  function switchMode(nextMode: LoginMode) {
    setMode(nextMode);
    setLoading(false);
    setResetSent(false);
    setMessage(null);
    setHideUrlError(true);
  }

  function getNextPath() {
    return new URLSearchParams(window.location.search).get("next") || "/dashboard/calendar";
  }

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setHideUrlError(true);

    const credentials = getEmailAndPassword(event.currentTarget);
    if ("error" in credentials) {
      setLoading(false);
      setMessage({ type: "error", text: credentials.error });
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await withAuthTimeout(
        supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        }),
      );

      if (error) {
        throw new Error(error.message);
      }

      router.push(getNextPath());
      router.refresh();
    } catch (error) {
      setLoading(false);
      setMessage({ type: "error", text: getCaughtAuthErrorMessage(error) });
    }
  }

  async function continueWithGoogle() {
    setLoading(true);
    setMessage(null);
    setHideUrlError(true);

    try {
      const origin = window.location.origin;
      const supabase = createSupabaseBrowserClient();
      const { error } = await withAuthTimeout(
        supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(getNextPath())}`,
            queryParams: {
              prompt: "select_account",
            },
          },
        }),
      );

      if (error) {
        throw new Error(error.message);
      }

      setLoading(false);
      setMessage({
        type: "error",
        text: "Google sign-in did not open. Check that Google is enabled in Supabase Auth and try again.",
      });
    } catch (error) {
      setLoading(false);
      setMessage({ type: "error", text: getCaughtAuthErrorMessage(error) });
    }
  }

  async function signUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setHideUrlError(true);

    const credentials = getEmailAndPassword(event.currentTarget);
    if ("error" in credentials) {
      setLoading(false);
      setMessage({ type: "error", text: credentials.error });
      return;
    }

    try {
      const origin = window.location.origin;
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await withAuthTimeout(
        supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(getNextPath())}`,
          },
        }),
      );

      if (error) {
        throw new Error(error.message);
      }

      if (data.session) {
        router.push(getNextPath());
        router.refresh();
        return;
      }

      setLoading(false);
      setMessage({
        type: "success",
        text: "Account created. Check your email to confirm your account, then come back and sign in.",
      });
    } catch (error) {
      setLoading(false);
      setMessage({ type: "error", text: getCaughtAuthErrorMessage(error) });
    }
  }

  async function sendReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setHideUrlError(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("reset-email") || "").trim();

    if (!email) {
      setLoading(false);
      setMessage({ type: "error", text: "Enter your email address." });
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await withAuthTimeout(
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        }),
      );

      if (error) {
        throw new Error(error.message);
      }

      setLoading(false);
      setResetSent(true);
    } catch (error) {
      setLoading(false);
      setResetSent(false);
      setMessage({ type: "error", text: getCaughtAuthErrorMessage(error) });
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
              {displayedMessage && <p className={`auth-message ${displayedMessage.type}`} role={displayedMessage.type === "error" ? "alert" : "status"}>{displayedMessage.text}</p>}
              <button className="google-auth-button" type="button" onClick={continueWithGoogle} disabled={loading}>
                <span aria-hidden="true">G</span>
                Continue with Google
              </button>
              <div className="auth-divider"><span>or use email</span></div>
              <form className="login-form" onSubmit={signIn} noValidate>
                <label>
                  Email Address
                  <input name="email" type="email" autoComplete="email" spellCheck={false} placeholder="maya@studio.co" />
                </label>
                <label>
                  Password
                  <span className="password-field">
                    <input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" />
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
              {displayedMessage && <p className={`auth-message ${displayedMessage.type}`} role={displayedMessage.type === "error" ? "alert" : "status"}>{displayedMessage.text}</p>}
              <button className="google-auth-button" type="button" onClick={continueWithGoogle} disabled={loading}>
                <span aria-hidden="true">G</span>
                Sign up with Google
              </button>
              <div className="auth-divider"><span>or create with email</span></div>
              <form className="login-form" onSubmit={signUp} noValidate>
                <label>
                  Email Address
                  <input name="email" type="email" autoComplete="email" spellCheck={false} placeholder="you@company.com" />
                </label>
                <label>
                  Password
                  <span className="password-field">
                    <input name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Create a secure password" />
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
              {displayedMessage && <p className={`auth-message ${displayedMessage.type}`} role={displayedMessage.type === "error" ? "alert" : "status"}>{displayedMessage.text}</p>}
              {!resetSent && (
                <form className="login-form" onSubmit={sendReset} noValidate>
                  <label>
                    Email Address
                    <input name="reset-email" type="email" autoComplete="email" spellCheck={false} placeholder="maya@studio.co" />
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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
