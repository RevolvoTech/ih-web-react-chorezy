import { FormEvent, useRef, useState } from "react";
import { Icon, RoleIcon } from "./Icons";

type FormStatus = "idle" | "submitting" | "success" | "error";
type ErrorField = "email" | "role" | "postalCode" | null;

type FormValues = {
  email: string;
  role: string;
  postalCode: string;
  website: string;
};

type SuccessData = {
  referralCode: string;
  referralCount: number;
  rewardThreshold: number;
  creditAmount: number;
};

const initialValues: FormValues = {
  email: "",
  role: "",
  postalCode: "",
  website: "",
};

const roleOptions = [
  ["chore-poster", "I need help with chores", "Need help"],
  ["adult-helper", "I want to earn as an Adult Helper", "Adult Helper"],
  ["young-helper", "I want to earn as a Young Helper", "Young Helper"],
  ["guardian", "I am a parent or guardian", "Guardian"],
  ["business", "I represent a local business", "Business"],
] as const;

function isValidPostalCode(value: string) {
  return /^\d{5}(?:-\d{4})?$/.test(value.trim());
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

type WaitlistFormProps = {
  idPrefix?: string;
  variant?: "default" | "hero";
};

export function WaitlistForm({ idPrefix = "waitlist", variant = "default" }: WaitlistFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [errorField, setErrorField] = useState<ErrorField>(null);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copy referral link");
  const successRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLInputElement>(null);
  const postalRef = useRef<HTMLInputElement>(null);
  const isHero = variant === "hero";
  const emailId = `${idPrefix}-email`;
  const roleId = `${idPrefix}-role`;
  const postalId = `${idPrefix}-postal`;
  const emailHelpId = `${idPrefix}-email-help`;
  const roleHelpId = `${idPrefix}-role-help`;
  const postalHelpId = `${idPrefix}-postal-help`;
  const websiteId = `${idPrefix}-website`;
  const errorId = `${idPrefix}-error`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorField(null);

    if (!isValidEmail(values.email)) {
      setStatus("error");
      setErrorField("email");
      setMessage("Enter a valid email address.");
      emailRef.current?.focus();
      return;
    }

    if (!values.role) {
      setStatus("error");
      setErrorField("role");
      setMessage("Choose how you plan to use Chorezy.");
      roleRef.current?.focus();
      return;
    }

    if (!isValidPostalCode(values.postalCode)) {
      setStatus("error");
      setErrorField("postalCode");
      setMessage("Enter a valid U.S. ZIP code.");
      postalRef.current?.focus();
      return;
    }

    setStatus("submitting");

    try {
      const referral = new URLSearchParams(window.location.search).get("ref") ?? "direct";
      const response = await fetch("/api/waitlist/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          country: "US",
          email: values.email.trim(),
          postalCode: values.postalCode.trim().toUpperCase(),
          referral,
        }),
      });
      const payload = (await response.json()) as {
        message?: string;
        referralCode?: string;
        referralCount?: number;
        rewardThreshold?: number;
        creditAmount?: number;
        created?: boolean;
      };

      if (!response.ok) {
        throw new Error(payload.message || "We could not save your place right now.");
      }

      setStatus("success");
      setErrorField(null);
      setMessage(payload.message || "You are on the Chorezy waitlist.");
      setSuccessData({
        referralCode: payload.referralCode || "",
        referralCount: payload.referralCount ?? 0,
        rewardThreshold: payload.rewardThreshold ?? 2,
        creditAmount: payload.creditAmount ?? 5,
      });
      window.dispatchEvent(new CustomEvent("chorezy:waitlist-joined", {
        detail: { created: payload.created === true },
      }));
      setValues(initialValues);
      window.setTimeout(() => successRef.current?.focus(), 0);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not save your place right now. Please try again.",
      );
    }
  }

  const referralUrl = successData?.referralCode
    ? `${typeof window === "undefined" ? "https://chorezy.com" : window.location.origin}/?ref=${encodeURIComponent(successData.referralCode)}`
    : "";

  async function copyReferralLink() {
    if (!referralUrl) return;
    await navigator.clipboard.writeText(referralUrl);
    setCopyLabel("Link copied");
    window.setTimeout(() => setCopyLabel("Copy referral link"), 2200);
  }

  async function shareReferralLink() {
    if (!referralUrl || !navigator.share) return;
    await navigator.share({
      title: "Join me on Chorezy",
      text: "Join the Chorezy U.S. launch waitlist with my referral link.",
      url: referralUrl,
    });
  }

  if (status === "success" && successData) {
    const completedReferrals = Math.min(successData.referralCount, successData.rewardThreshold);
    const progress = `${completedReferrals} / ${successData.rewardThreshold}`;
    return (
      <div className={`waitlist-success${isHero ? " waitlist-success--hero" : ""}`} ref={successRef} role="status" tabIndex={-1}>
        <span className="waitlist-success__icon"><Icon name="check" size={26} /></span>
        <p className="eyebrow">You&apos;re on the list</p>
        <h3>Refer two friends. Get ${successData.creditAmount} at launch.</h3>
        <p>{message} When two friends join through your link, we&apos;ll add ${successData.creditAmount} in Chorezy credit when you create your account at launch.</p>
        <div className="referral-progress" aria-label={`${progress} friends joined`}>
          <div><strong>{progress}</strong><span>friends joined</span></div>
          <div className="referral-progress__track" aria-hidden="true"><span style={{ width: `${(completedReferrals / successData.rewardThreshold) * 100}%` }} /></div>
        </div>
        <div className="referral-link">
          <span>Your personal link</span>
          <code>{referralUrl}</code>
        </div>
        <div className="referral-actions">
          <button className="button button--primary" type="button" onClick={() => void copyReferralLink()}>
            {copyLabel}<Icon name="link" />
          </button>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button className="button button--secondary" type="button" onClick={() => void shareReferralLink()}>
              Share link
            </button>
          )}
        </div>
        <p className="referral-note">Launch credit eligibility is confirmed when referred friends join and you create your Chorezy account.</p>
        <button className="waitlist-success__reset" type="button" onClick={() => { setStatus("idle"); setSuccessData(null); }}>
          Add another person
        </button>
      </div>
    );
  }

  return (
    <form className={`waitlist-form${isHero ? " waitlist-form--hero" : ""}`} onSubmit={handleSubmit} noValidate>
      <div className={`field${isHero ? "" : " field--wide"}`}>
        <label htmlFor={emailId}>Email address</label>
        <input
          aria-describedby={`${emailHelpId}${errorField === "email" ? ` ${errorId}` : ""}`}
          aria-invalid={errorField === "email"}
          autoComplete="email"
          id={emailId}
          name="email"
          onChange={(event) => setValues({ ...values, email: event.target.value })}
          placeholder="name@example.com"
          required
          ref={emailRef}
          spellCheck={false}
          type="email"
          value={values.email}
        />
        <p className="field-help" id={emailHelpId}>
          {isHero
            ? "One launch email. No newsletters."
            : "We'll send one email when Chorezy launches in your area—no newsletters."}
        </p>
      </div>

      <div className={`field${isHero ? "" : " field--wide"}`}>
        <label htmlFor={postalId}>ZIP code</label>
        <input
          aria-describedby={`${postalHelpId}${errorField === "postalCode" ? ` ${errorId}` : ""}`}
          aria-invalid={errorField === "postalCode"}
          autoComplete="postal-code"
          id={postalId}
          inputMode="numeric"
          name="postalCode"
          onChange={(event) => setValues({ ...values, postalCode: event.target.value })}
          placeholder="10001"
          ref={postalRef}
          required
          value={values.postalCode}
        />
        <p className="field-help" id={postalHelpId}>
          {isHero
            ? "Helps us see when enough local users are ready."
            : "We use your ZIP to see where enough households and helpers are ready to launch together."}
        </p>
      </div>

      <fieldset
        aria-describedby={`${roleHelpId}${errorField === "role" ? ` ${errorId}` : ""}`}
        className="field field--wide role-field"
        id={roleId}
      >
        <legend>How would you use Chorezy?</legend>
        <p className={`field-help${isHero ? " visually-hidden" : ""}`} id={roleHelpId}>Choose the role that fits you best.</p>
        <div className="role-options">
          {roleOptions.map(([value, label, shortLabel], index) => (
            <label className={`role-option role-option--${value}`} key={value}>
              <input
                aria-label={label}
                checked={values.role === value}
                className="role-option__input"
                name="role"
                onChange={(event) => setValues({ ...values, role: event.target.value })}
                ref={index === 0 ? roleRef : undefined}
                required={index === 0}
                type="radio"
                value={value}
              />
              <span className="role-option__surface">
                <span className="role-option__icon" aria-hidden="true"><RoleIcon name={value} size={20} /></span>
                <span>{isHero ? shortLabel : label}</span>
                <span className="role-option__check" aria-hidden="true"><Icon name="check" size={14} /></span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="honeypot" aria-hidden="true" inert>
        <input
          aria-hidden="true"
          autoComplete="off"
          id={websiteId}
          name="website"
          onChange={(event) => setValues({ ...values, website: event.target.value })}
          tabIndex={-1}
          value={values.website}
        />
      </div>

      {message && (
        <p className="form-message" id={errorId} role="alert">{message}</p>
      )}

      <button className="button button--primary field--wide" disabled={status === "submitting"} type="submit">
        {status === "submitting" ? "Saving your place…" : "Join the U.S. waitlist"}
        {status !== "submitting" && <Icon name="arrow" />}
      </button>

      <p className="form-note field--wide">
        U.S. ZIP codes only · One launch email · No newsletter.
      </p>
    </form>
  );
}
