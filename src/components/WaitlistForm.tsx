import { FormEvent, useMemo, useState } from "react";
import { Icon } from "./Icons";

type Country = "US" | "CA";
type FormStatus = "idle" | "submitting" | "success" | "error";

type FormValues = {
  email: string;
  role: string;
  country: Country;
  postalCode: string;
  website: string;
};

const initialValues: FormValues = {
  email: "",
  role: "",
  country: "US",
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

function isValidPostalCode(country: Country, value: string) {
  const normalized = value.trim().toUpperCase();
  return country === "US"
    ? /^\d{5}(?:-\d{4})?$/.test(normalized)
    : /^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/.test(normalized);
}

export function WaitlistForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  const postalLabel = useMemo(
    () => (values.country === "US" ? "ZIP code" : "Postal code"),
    [values.country],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!values.role) {
      setStatus("error");
      setMessage("Choose how you plan to use Chorezy.");
      return;
    }

    if (!isValidPostalCode(values.country, values.postalCode)) {
      setStatus("error");
      setMessage(
        values.country === "US"
          ? "Enter a valid U.S. ZIP code."
          : "Enter a valid Canadian postal code.",
      );
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
          autoComplete="email"
          id="waitlist-email"
          name="email"
          onChange={(event) => setValues({ ...values, email: event.target.value })}
          placeholder="you@example.com"
          required
          type="email"
          value={values.email}
        />
      </div>

      <div className="field field--wide">
        <label htmlFor="waitlist-role">How would you use Chorezy?</label>
        <select
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

      <div className="field">
        <label htmlFor="waitlist-country">Country</label>
        <select
          id="waitlist-country"
          name="country"
          onChange={(event) => setValues({ ...values, country: event.target.value as Country, postalCode: "" })}
          value={values.country}
        >
          <option value="US">United States</option>
          <option value="CA">Canada</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="waitlist-postal">{postalLabel}</label>
        <input
          autoComplete="postal-code"
          id="waitlist-postal"
          inputMode={values.country === "US" ? "numeric" : "text"}
          name="postalCode"
          onChange={(event) => setValues({ ...values, postalCode: event.target.value })}
          placeholder={values.country === "US" ? "10001" : "M5V 2T6"}
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
        <p className="form-message" role="alert">{message}</p>
      )}

      <button className="button button--primary field--wide" disabled={status === "submitting"} type="submit">
        {status === "submitting" ? "Saving your place..." : "Join the North America waitlist"}
        {status !== "submitting" && <Icon name="arrow" />}
      </button>

      <p className="form-note field--wide">
        U.S. and Canadian locations only. By joining, you agree to receive launch updates. Unsubscribe anytime.
      </p>
    </form>
  );
}
