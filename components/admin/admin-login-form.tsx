"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { authRequest } from "@/lib/api/church-api";

type AuthStep = "register" | "verify" | "password" | "login";
type RegistrationResult = { requestId: string; destination?: string };

const pendingKey = "church-admin-registration";
const completionKey = "church-admin-registration-complete";

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  minLength,
  maxLength,
  visible,
  onToggle,
  onValueChange,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  minLength: number;
  maxLength: number;
  visible: boolean;
  onToggle: () => void;
  onValueChange?: (value: string) => void;
}) {
  const [val, setVal] = useState("");
  return (
    <div className="input-group">
      <i className="fas fa-lock icon" aria-hidden="true" />
      <input
        autoComplete={autoComplete}
        className={val ? "has-value" : ""}
        id={id}
        maxLength={maxLength}
        minLength={minLength}
        name={name}
        onChange={(e) => {
          setVal(e.target.value);
          onValueChange?.(e.target.value);
        }}
        placeholder=" "
        required
        type={visible ? "text" : "password"}
        value={val}
      />
      <label htmlFor={id}>{label}</label>
      <button
        aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
        aria-pressed={visible}
        className="password-toggle"
        onClick={onToggle}
        type="button"
      >
        {visible ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
      </button>
    </div>
  );
}

export function AdminLoginForm({ initialStep = "login", basePath = "" }: { initialStep?: AuthStep; basePath?: string }) {
  const router = useRouter();
  const step = initialStep;
  const [requestId, setRequestId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const authPrefix = basePath;
  const loginUrl = `${authPrefix}/login`;
  const forgotPasswordUrl = `${authPrefix}/forgot-password`;
  const signupUrl = `${authPrefix}/signup`;
  const verifyUrl = `${authPrefix}/verify-email`;
  const setupPasswordUrl = `${authPrefix}/setup-password`;

  useEffect(() => {
    const raw = window.sessionStorage.getItem(pendingKey);
    if (initialStep === "login") {
      const completionNotice = window.sessionStorage.getItem(completionKey);
      if (completionNotice) {
        window.sessionStorage.removeItem(completionKey);
        setTimeout(() => setNotice(completionNotice), 0);
      }
    }
    if (!raw) {
      if (initialStep === "verify" || initialStep === "password") router.replace(signupUrl);
      return;
    }
    try {
      const pending = JSON.parse(raw) as { requestId?: string; email?: string; verified?: boolean };
      if (pending.requestId) {
        setTimeout(() => setRequestId(pending.requestId || ""), 0);
        setTimeout(() => setEmail(pending.email ?? ""), 0);
        if (initialStep === "register") router.replace(pending.verified ? setupPasswordUrl : verifyUrl);
        if (initialStep === "verify" && pending.verified) router.replace(setupPasswordUrl);
        if (initialStep === "password" && !pending.verified) router.replace(verifyUrl);
      }
    } catch {
      window.sessionStorage.removeItem(pendingKey);
      if (initialStep === "verify" || initialStep === "password") router.replace(signupUrl);
    }
  }, [initialStep, router, setupPasswordUrl, signupUrl, verifyUrl]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const values = new FormData(event.currentTarget);

    try {
      if (step === "register") {
        const nextEmail = String(values.get("email") ?? "").trim();
        const result = await authRequest<RegistrationResult>("/auth/register", {
          fullName: String(values.get("fullName") ?? "").trim(),
          email: nextEmail,
          acceptTerms: values.get("acceptTerms") === "on",
        });
        setEmail(nextEmail);
        setRequestId(result.requestId);
        window.sessionStorage.setItem(pendingKey, JSON.stringify({ requestId: result.requestId, email: nextEmail }));
        setNotice(`We sent a six-digit verification code to ${result.destination ?? nextEmail}.`);
        router.push(verifyUrl);
      } else if (step === "verify") {
        await authRequest("/auth/verify-otp", {
          requestId,
          otp: String(values.get("otp") ?? "").trim(),
        });
        window.sessionStorage.setItem(pendingKey, JSON.stringify({ requestId, email, verified: true }));
        router.push(setupPasswordUrl);
      } else if (step === "password") {
        const pass = String(values.get("password") ?? "");
        const confirmPass = String(values.get("confirmPassword") ?? "");
        if (pass !== confirmPass) throw new Error("Your passwords do not match.");
        await authRequest("/auth/setup-password", { password: pass, confirmPassword: confirmPass });
        window.sessionStorage.removeItem(pendingKey);
        window.sessionStorage.setItem(completionKey, "Your account is ready. Sign in with your new password.");
        router.replace(loginUrl);
      } else {
        const session = await authRequest<{ user?: { role?: string; status?: string } }>("/auth/login", {
          email: String(values.get("email") ?? "").trim(),
          password: String(values.get("password") ?? ""),
        });
        if (session.user?.role !== "admin" || session.user.status !== "active") {
          throw new Error("This account does not have administrator access.");
        }
        const requestedPath = new URLSearchParams(window.location.search).get("next");
        const publicRoutes = ["/admin/login", "/admin/signup", "/admin/verify-email", "/admin/setup-password"];
        const destination = requestedPath?.startsWith("/admin/") && !publicRoutes.some((route) => requestedPath === route || requestedPath.startsWith(`${route}/`))
          ? requestedPath
          : "/admin";
        router.replace(destination);
        router.refresh();
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resendCode() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await authRequest<RegistrationResult>("/auth/resend-otp", { requestId });
      setNotice(`A new verification code was sent to ${result.destination ?? email}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn’t resend the code.");
    } finally {
      setBusy(false);
    }
  }

  const isSignup = step !== "login";
  const steps = ["Your details", "Verify email", "Set password"];
  const activeStep = step === "register" ? 0 : step === "verify" ? 1 : 2;

  return (
    <div>
      {isSignup && (
        <ol aria-label="Account setup progress" className="mb-7 grid grid-cols-3 gap-2">
          {steps.map((label, index) => (
            <li
              className={`border-t-2 pt-2 text-[11px] font-semibold leading-4 sm:text-xs ${
                index <= activeStep ? "border-primary text-primary" : "border-border text-muted"
              }`}
              key={label}
            >
              <span className="mr-1.5">0{index + 1}</span>
              {label}
            </li>
          ))}
        </ol>
      )}

      {step === "login" && (
        <form id="loginForm" method="POST" action="" onSubmit={submit}>
          <div className="input-group">
            <i className="fas fa-user icon" aria-hidden="true" />
            <input
              autoComplete="username"
              className={`input_email ${email ? "has-value" : ""}`}
              id="loginEmail"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              required
              type="email"
              value={email}
            />
            <label htmlFor="loginEmail">Email</label>
          </div>

          <div className="input-group">
            <i className="fas fa-lock icon" aria-hidden="true" />
            <input
              autoComplete="current-password"
              className={password ? "has-value" : ""}
              id="loginPassword"
              maxLength={128}
              minLength={6}
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              required
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <label htmlFor="loginPassword">Password</label>
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              type="button"
            >
              {showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
            </button>
          </div>

          <p className="-mt-4 mb-5 text-right text-sm">
            <Link className="font-semibold text-primary underline-offset-4 hover:underline" href={forgotPasswordUrl}>
              Forgot password?
            </Link>
          </p>

          {error && <p className="error" role="alert">{error}</p>}
          {notice && <p className="notice" role="status">{notice}</p>}

          <button className="glow-button" disabled={busy} type="submit">
            {busy ? "Signing in…" : "Login"}
          </button>

          <p className="signup-link">
            Don&apos;t have an account?{" "}
            <Link href={signupUrl}>Sign Up</Link>
          </p>
        </form>
      )}

      {step === "register" && (
        <form id="registerForm" method="POST" action="" onSubmit={submit}>
          <div className="input-group">
            <i className="fas fa-user icon" aria-hidden="true" />
            <input
              autoComplete="name"
              className={fullName ? "has-value" : ""}
              id="fullName"
              maxLength={140}
              minLength={2}
              name="fullName"
              onChange={(e) => setFullName(e.target.value)}
              placeholder=" "
              required
              type="text"
              value={fullName}
            />
            <label htmlFor="fullName">Full Name</label>
          </div>

          <div className="input-group">
            <i className="fas fa-envelope icon" aria-hidden="true" />
            <input
              autoComplete="email"
              className={`input_email ${email ? "has-value" : ""}`}
              id="signupEmail"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              required
              type="email"
              value={email}
            />
            <label htmlFor="signupEmail">Email Address</label>
          </div>

          <label className="mb-4 flex items-start gap-3 text-sm leading-6 text-muted cursor-pointer">
            <input className="mt-1 size-4 accent-amber-600 rounded" name="acceptTerms" required type="checkbox" />
            <span>I agree to the terms of use and privacy policy.</span>
          </label>

          {error && <p className="error" role="alert">{error}</p>}
          {notice && <p className="notice" role="status">{notice}</p>}

          <button className="glow-button" disabled={busy} type="submit">
            {busy ? "Creating account…" : "Create Account"}
          </button>

          <p className="signup-link">
            Already have an account?{" "}
            <Link href={loginUrl}>Sign In</Link>
          </p>
        </form>
      )}

      {step === "verify" && (
        <form id="verifyForm" method="POST" action="" onSubmit={submit}>
          <p className="mb-4 text-sm leading-6 text-muted">
            Enter the six-digit code sent to <span className="font-semibold text-text">{email}</span>.
          </p>

          <div className="input-group">
            <input
              autoComplete="one-time-code"
              autoFocus
              className={`text-center text-xl tracking-[.35em] ${otp ? "has-value" : ""}`}
              id="otp"
              inputMode="numeric"
              maxLength={6}
              minLength={6}
              name="otp"
              onChange={(e) => setOtp(e.target.value)}
              pattern="[0-9]{6}"
              placeholder=" "
              required
              type="text"
              value={otp}
            />
            <label htmlFor="otp">Verification Code</label>
          </div>

          <div className="mb-4">
            <button
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline disabled:opacity-50"
              disabled={busy}
              onClick={resendCode}
              type="button"
            >
              Send a new code
            </button>
          </div>

          {error && <p className="error" role="alert">{error}</p>}
          {notice && <p className="notice" role="status">{notice}</p>}

          <button className="glow-button" disabled={busy || !requestId} type="submit">
            {busy ? "Verifying…" : "Verify Email"}
          </button>

          <button
            className="mt-4 block w-full text-center text-sm text-muted underline-offset-4 hover:text-text hover:underline"
            onClick={() => {
              window.sessionStorage.removeItem(pendingKey);
              router.replace(signupUrl);
            }}
            type="button"
          >
            Use a different email address
          </button>
        </form>
      )}

      {step === "password" && (
        <form id="passwordForm" method="POST" action="" onSubmit={submit}>
          <p className="mb-4 text-sm leading-6 text-muted">
            Set a password for <span className="font-semibold text-text">{email}</span>. Use at least 8 characters.
          </p>

          <PasswordField
            autoComplete="new-password"
            id="newPassword"
            label="Password"
            maxLength={128}
            minLength={8}
            name="password"
            onToggle={() => setShowPassword((visible) => !visible)}
            onValueChange={setPassword}
            visible={showPassword}
          />

          <p className="-mt-4 mb-5 text-xs text-muted">Use at least 8 characters.</p>

          <PasswordField
            autoComplete="new-password"
            id="confirmPassword"
            label="Confirm Password"
            maxLength={128}
            minLength={8}
            name="confirmPassword"
            onToggle={() => setShowConfirmPassword((visible) => !visible)}
            onValueChange={setConfirmPassword}
            visible={showConfirmPassword}
          />
          {confirmPassword && password !== confirmPassword && <p className="error" role="alert">Passwords do not match.</p>}

          {error && <p className="error" role="alert">{error}</p>}
          {notice && <p className="notice" role="status">{notice}</p>}

          <button className="glow-button" disabled={busy} type="submit">
            {busy ? "Saving…" : "Set Password"}
          </button>
        </form>
      )}
    </div>
  );
}
