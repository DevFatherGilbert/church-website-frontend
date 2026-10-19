"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authRequest } from "@/lib/api/church-api";
import { ChurchLogo } from "@/components/brand/church-logo";
import { useChurchBrand } from "@/components/brand/church-brand-provider";

type Step = "email" | "code" | "password" | "done";
type ForgotPasswordResult = { requestId: string; destination?: string };
type VerifyResult = { resetToken: string };

export function ForgotPasswordForm({ admin = false }: { admin?: boolean }) {
  const { churchName, logoUrl, logoAlt } = useChurchBrand();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [destination, setDestination] = useState("");
  const [requestId, setRequestId] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const authPrefix = admin ? "/admin" : "";
  const loginUrl = `${authPrefix}/login`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const values = new FormData(event.currentTarget);

    try {
      if (step === "email") {
        const enteredEmail = String(values.get("email") ?? "").trim();
        const result = await authRequest<ForgotPasswordResult>("/auth/forgot-password", { email: enteredEmail });
        setEmail(enteredEmail);
        setDestination(result.destination || enteredEmail);
        setRequestId(result.requestId);
        setStep("code");
      } else if (step === "code") {
        const result = await authRequest<VerifyResult>("/auth/forgot-password/verify-otp", {
          requestId,
          otp: String(values.get("otp") ?? "").trim(),
        });
        setResetToken(result.resetToken);
        setStep("password");
      } else if (step === "password") {
        const nextPassword = String(values.get("password") ?? "");
        const nextConfirmPassword = String(values.get("confirmPassword") ?? "");
        if (nextPassword !== nextConfirmPassword) throw new Error("Your passwords do not match.");
        await authRequest("/auth/reset-password", {
          resetToken,
          newPassword: nextPassword,
          confirmPassword: nextConfirmPassword,
        });
        setStep("done");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn’t complete the password reset. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function useDifferentEmail() {
    setStep("email");
    setRequestId("");
    setResetToken("");
    setOtp("");
    setError("");
  }

  return (
    <main className="auth-wrapper">
      <div className="container login-layout">
        <div className="slide-panel side-b login-panel">
          <div className="slide-panel-inner">
            <div className="church-tag flex items-center gap-2">
              <ChurchLogo
                alt={logoAlt || churchName}
                className="size-6 object-contain"
                priority
                src={logoUrl}
              />
              <span className="font-bold">{churchName || "Church Portal"}</span>
            </div>
            <h1 className="welcome-text"><pre>ACCOUNT<br />RECOVERY</pre></h1>
            <div className="slide-divider" aria-hidden="true" />
            <p className="welcome-subtext">{step === "done" ? "Your account is secure again." : "We’ll help you get back into your account."}</p>
          </div>
        </div>

        <section className="form-section side-a login-section">
          <div className="form-box">
            <h2>{step === "email" ? "Forgot password?" : step === "code" ? "Check your email" : step === "password" ? "Choose a new password" : "Password updated"}</h2>

            {step === "done" ? (
              <>
                <p className="notice" role="status">Your password has been updated. You can now sign in with your new password.</p>
                <p className="signup-link"><Link href={loginUrl}>Return to sign in</Link></p>
              </>
            ) : (
              <>
                {step === "code" && (
                  <p className="mb-5 break-words text-sm leading-6 text-muted" role="status">
                    We sent a password reset code to <strong className="break-all text-text">{destination}</strong>. Check that inbox for the six-digit code.
                  </p>
                )}

                {step === "password" && (
                  <p className="mb-5 break-words text-sm leading-6 text-muted">
                    Set a new password for <strong className="break-all text-text">{destination || email}</strong>.
                  </p>
                )}

                <form onSubmit={submit}>
                  {step === "email" && (
                    <div className="input-group">
                      <i className="fas fa-envelope icon" aria-hidden="true" />
                      <input autoComplete="email" id="recoveryEmail" name="email" onChange={(event) => setEmail(event.target.value)} placeholder=" " required type="email" value={email} />
                      <label htmlFor="recoveryEmail">Email address</label>
                    </div>
                  )}

                  {step === "code" && (
                    <div className="input-group">
                      <input autoComplete="one-time-code" autoFocus id="recoveryCode" inputMode="numeric" maxLength={6} minLength={6} name="otp" onChange={(event) => setOtp(event.target.value)} pattern="[0-9]{6}" placeholder=" " required type="text" value={otp} />
                      <label htmlFor="recoveryCode">Six-digit code</label>
                    </div>
                  )}

                  {step === "password" && (
                    <>
                      <div className="input-group">
                        <i className="fas fa-lock icon" aria-hidden="true" />
                        <input autoComplete="new-password" id="recoveryPassword" maxLength={128} minLength={8} name="password" onChange={(event) => setPassword(event.target.value)} placeholder=" " required type="password" value={password} />
                        <label htmlFor="recoveryPassword">New password</label>
                      </div>
                      <div className="input-group">
                        <i className="fas fa-lock icon" aria-hidden="true" />
                        <input autoComplete="new-password" id="recoveryConfirmPassword" maxLength={128} minLength={8} name="confirmPassword" onChange={(event) => setConfirmPassword(event.target.value)} placeholder=" " required type="password" value={confirmPassword} />
                        <label htmlFor="recoveryConfirmPassword">Confirm new password</label>
                      </div>
                      <p className="-mt-4 mb-5 text-xs text-muted">Use at least 8 characters.</p>
                    </>
                  )}

                  {error && <p className="error" role="alert">{error}</p>}

                  <button className="glow-button" disabled={busy} type="submit">
                    {busy ? "Please wait…" : step === "email" ? "Send reset code" : step === "code" ? "Verify code" : "Update password"}
                  </button>
                </form>

                {step !== "email" && (
                  <button className="mt-4 block w-full text-center text-sm text-muted underline-offset-4 hover:text-text hover:underline" onClick={useDifferentEmail} type="button">
                    Use a different email address
                  </button>
                )}
                {step === "email" && <p className="signup-link"><Link href={loginUrl}>Back to sign in</Link></p>}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
