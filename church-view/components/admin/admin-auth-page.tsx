import { AdminLoginForm } from "./admin-login-form";
import { ChurchLogo } from "@/components/brand/church-logo";

type AuthStep = "register" | "verify" | "password" | "login";

export function AdminAuthPage({
  step,
  title,
  description,
}: {
  step: AuthStep;
  title: string;
  description: string;
}) {
  const isLogin = step === "login";
  const isRegistrationFlow = !isLogin;

  const welcomeText = isLogin
    ? "WELCOME\n BACK!"
    : step === "register"
    ? "WELCOME\n ABOARD!"
    : step === "verify"
    ? "CHECK\n INBOX!"
    : "SECURE\n ACCOUNT!";

  const subtitle = isLogin
    ? "Sign in to continue to your church administration workspace."
    : description;

  return (
    <main className="auth-wrapper">
      <div className={`container ${isRegistrationFlow ? "registration-layout" : "login-layout"}`}>
        <div className={`slide-panel side-b ${isRegistrationFlow ? "register-panel" : "login-panel"}`}>
          <div className="slide-panel-inner">
            <div className="church-tag">
              <ChurchLogo className="size-6 object-contain" priority />
              <span>Church Portal</span>
            </div>

            <h1 className="welcome-text">
              <pre>{step === "register" ? "WELCOME!" : welcomeText}</pre>
            </h1>

            <div className="slide-divider" aria-hidden="true" />
            <p className="welcome-subtext">{subtitle}</p>
          </div>
        </div>

        <div className={`form-section side-a ${isRegistrationFlow ? "register-section" : "login-section"}`}>
          <div className="form-box">
            <h2>{isLogin ? "Login" : step === "register" ? "Register" : title}</h2>
            <AdminLoginForm initialStep={step} />
          </div>
        </div>
      </div>
    </main>
  );
}
