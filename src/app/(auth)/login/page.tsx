"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  return <main className="login-page"><section className="login-aside"><div className="brand"><BrandMark />Slotwise</div><div><p className="eyebrow light">Scheduling, simplified</p><h1>Make space for the work that matters.</h1><p>Thoughtful scheduling for independent professionals and the people they serve.</p></div><blockquote>“I reclaimed hours every week, and my clients finally have a booking experience that feels like me.”<footer>— Nia, creative consultant</footer></blockquote></section><section className="login-panel"><div className="login-card">{!sent ? <><p className="eyebrow">Welcome back</p><h1>Sign in to Slotwise</h1><p className="muted">Enter your email and we’ll send you a secure sign-in link.</p><form className="stack" onSubmit={(event) => { event.preventDefault(); setSent(true); }}><label>Email address<input type="email" autoComplete="email" placeholder="you@studio.com" required /></label><button>Email me a sign-in link</button></form><div className="demo-divider"><span>or explore the demo</span></div><button className="secondary full-login-button" onClick={() => router.push("/dashboard")}>Open Maya’s workspace →</button></> : <div className="sent-state"><span className="success-mark">✓</span><p className="eyebrow">Check your inbox</p><h1>Your sign-in link is on its way.</h1><p className="muted">For this local demo, continue straight to Maya’s workspace.</p><button onClick={() => router.push("/dashboard")}>Continue to dashboard</button><button className="text-button" onClick={() => setSent(false)}>Use a different email</button></div>}<p className="login-legal">By continuing, you agree to the Terms of Service and Privacy Policy.</p></div></section></main>;
}
