import { FormEvent, useState } from "react";
import { Icon } from "./Icons";

type FormStatus = "idle" | "submitting" | "success" | "error";
type ErrorField = "email" | "role" | "postalCode" | null;

type FormValues = {
  email: string;
  role: string;
  postalCode: string;
  website: string;
};

const initialValues: FormValues = {
  email: "",
  role: "",
  postalCode: "",
  website: "",
};

const roleOptions = [
  ["chore-poster", "I need help with chores"],
  ["adult-helper", "I want to earn as an Adult Helper"],
  ["young-helper", "I want to earn as a Young Helper"],
  ["guardian", "I am a parent or guardian"],
  ["business", "I represent a local business"],
] as const;

function isValidPostalCode(value: string) {
  return /^\d{5}(?:-\d{4})?$/.test(value.trim());
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function WaitlistForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [errorField, setErrorField] = useState<ErrorField>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorField(null);

    if (!isValidEmail(values.email)) {
      setStatus("error");
      setErrorField("email");
      setMessage("Enter a valid email address.");
      document.getElementById("waitlist-email")?.focus();
      return;
    }

    if (!values.role) {
      setStatus("error");
      setErrorField("role");
      setMessage("Choose how you plan to use Chorezy.");
      document.getElementById("waitlist-role")?.focus();
      return;
    }

    if (!isValidPostalCode(values.postalCode)) {
      setStatus("error");
      setErrorField("postalCode");
      setMessage("Enter a valid U.S. ZIP code.");
      document.getElementById("waitlist-postal")?.focus();
      return;
    }

    setStatus("submitting");

    try {
      const referral = new URLSearchParams(window.location.search).get("ref") ?? "direct";
      const response = await fetch("/api/waitlist", {
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
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "We could not save your place right now.");
      }

      setStatus("success");
      setErrorField(null);
      setMessage(payload.message || "You are on the Chorezy waitlist.");
      setValues(initialValues);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not save your place right now. Please try again.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="waitlist-success" role="status" tabIndex={-1}>
        <span className="waitlist-success__icon"><Icon name="check" size={26} /></span>
        <p className="eyebrow">You are in</p>
        <h3>We will let you know when Chorezy reaches your area.</h3>
        <p>{message}</p>
        <button className="button button--secondary" type="button" onClick={() => setStatus("idle")}>
          Add another person
        </button>
      </div>
    );
  }

  return (
    <form className="waitlist-form" onSubmit={handleSubmit} noValidate>
      <div className="field field--wide">
        <label htmlFor="waitlist-email">Email address</label>
        <input
          aria-describedby={errorField === "email" ? "waitlist-error" : undefined}
          aria-invalid={errorField === "email"}
          autoComplete="email"
          id="waitlist-email"
          name="email"
          onChange={(event) => setValues({ ...values, email: event.target.value })}
          placeholder="name@example.com"
          required
          spellCheck={false}
          type="email"
          value={values.email}
        />
      </div>

      <div className="field field--wide">
        <label htmlFor="waitlist-role">How would you use Chorezy?</label>
        <select
          aria-describedby={errorField === "role" ? "waitlist-error" : undefined}
          aria-invalid={errorField === "role"}
          id="waitlist-role"
          name="role"
          onChange={(event) => setValues({ ...values, role: event.target.value })}
          required
          value={values.role}
        >
          <option value="">Select one</option>
          {roleOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="field field--wide">
        <label htmlFor="waitlist-postal">ZIP code</label>
        <input
          aria-describedby={errorField === "postalCode" ? "waitlist-error" : undefined}
          aria-invalid={errorField === "postalCode"}
          autoComplete="postal-code"
          id="waitlist-postal"
          inputMode="numeric"
          name="postalCode"
          onChange={(event) => setValues({ ...values, postalCode: event.target.value })}
          placeholder="10001"
          required
          value={values.postalCode}
        />
      </div>

      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          autoComplete="off"
          id="website"
          name="website"
          onChange={(event) => setValues({ ...values, website: event.target.value })}
          tabIndex={-1}
          value={values.website}
        />
      </div>

      {message && (
        <p className="form-message" id="waitlist-error" role="alert">{message}</p>
      )}

      <button className="button button--primary field--wide" disabled={status === "submitting"} type="submit">
        {status === "submitting" ? "Saving your place…" : "Join the U.S. waitlist"}
        {status !== "submitting" && <Icon name="arrow" />}
      </button>

      <p className="form-note field--wide">
        United States locations only. By joining, you agree to receive launch updates. Unsubscribe anytime.
      </p>
    </form>
  );
}
