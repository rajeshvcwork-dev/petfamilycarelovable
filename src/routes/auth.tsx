import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { toast } from "sonner";
import { PawPrint, Mail, Lock, User, Phone, Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — PetCareBuddy" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { login, register, loginGoogle, state } = useApp();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");

  // already logged in -> dashboard
  if (state.currentUserId) {
    navigate({ to: "/dashboard" });
    return null;
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      const ok = login(email, password);
      if (!ok) return toast.error("Invalid credentials. Try demouser / demouser");
      toast.success("Welcome back");
      const isAdmin = email.trim().toLowerCase() === "admin";
      navigate({ to: isAdmin ? "/admin" : "/dashboard" });
    } else if (mode === "register") {
      if (!fullName || !email || !mobile || !password) return toast.error("Fill all fields");
      register({ fullName, email, mobile, password });
      toast.success("Account created — welcome to PetCareBuddy");
      navigate({ to: "/dashboard" });
    } else {
      toast.success("Reset link sent (demo) — check your email");
      setMode("login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto h-14 w-14 rounded-3xl gradient-teal grid place-items-center text-white shadow-pop">
            <PawPrint className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">PetCareBuddy</h1>
          <p className="text-[13px] text-muted-foreground">Your Intelligent Pet Healthcare Companion</p>
        </div>

        <div className="glass-card rounded-3xl p-5">
          <div className="flex gap-1 p-1 rounded-2xl bg-muted/60 mb-4 text-[13px] font-semibold">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-xl transition-all ${mode === m ? "bg-card shadow-soft text-foreground" : "text-muted-foreground"}`}
              >
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "register" && (
              <>
                <Field icon={User} placeholder="Full name" value={fullName} onChange={setFullName} />
                <Field icon={Phone} placeholder="Mobile number" value={mobile} onChange={setMobile} type="tel" />
              </>
            )}
            <Field icon={Mail} placeholder={mode === "login" ? "Email or username" : "Email address"} value={email} onChange={setEmail} type="text" />
            {mode !== "forgot" && (
              <Field icon={Lock} placeholder="Password" value={password} onChange={setPassword} type="password" />
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <button type="button" onClick={() => setMode("forgot")} className="text-[12px] text-primary font-semibold">Forgot password?</button>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-2xl gradient-teal text-white font-semibold shadow-soft active:scale-[0.99] transition"
            >
              {mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send reset link"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-[11px] text-muted-foreground">
            <div className="h-px bg-border flex-1" />
            OR CONTINUE WITH
            <div className="h-px bg-border flex-1" />
          </div>

          <button
            onClick={() => { loginGoogle(); toast.success("Signed in with Google"); navigate({ to: "/dashboard" }); }}
            className="w-full h-11 rounded-2xl border border-border bg-card font-semibold text-sm flex items-center justify-center gap-2 hover:bg-muted"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="mt-5 rounded-2xl bg-primary/8 border border-primary/20 p-3 text-[12px]">
            <div className="flex items-center gap-1.5 font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Demo account
            </div>
            <div className="mt-1 text-muted-foreground">
              Username <span className="font-mono font-semibold text-foreground">demouser</span> · Password <span className="font-mono font-semibold text-foreground">demouser</span><br />
              Admin: <span className="font-mono font-semibold text-foreground">admin</span> / <span className="font-mono font-semibold text-foreground">admin</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-5">
          By continuing you agree to our{" "}
          <a href="/legal/terms" className="text-primary font-semibold">Terms</a> and{" "}
          <a href="/legal/privacy" className="text-primary font-semibold">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, ...p }: { icon: React.ComponentType<{ className?: string }>; placeholder: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="flex items-center gap-3 h-11 rounded-2xl border border-border bg-card px-3 focus-within:ring-2 focus-within:ring-primary/40">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <input
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        placeholder={p.placeholder}
        value={p.value}
        onChange={(e) => p.onChange(e.target.value)}
        type={p.type || "text"}
        autoComplete="off"
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.6 35 27 36 24 36c-5.3 0-9.7-3.6-11.3-8.4l-6.6 5.1C9.4 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.5 5.5C41 35 44 30 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
