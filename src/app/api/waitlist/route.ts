import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const REFERRAL_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ALLOWED_ROLES = new Set(["chore-poster", "adult-helper", "young-helper", "guardian", "business"]);
const PRODUCTION_ORIGINS = new Set(["https://chorezy.com", "https://www.chorezy.com"]);

function json(message: string, status = 200, data: Record<string, unknown> = {}) {
  return NextResponse.json({ message, ...data }, { status, headers: { "Cache-Control": "no-store" } });
}

function referralCode(email: string, salt: string) {
  const bytes = crypto.createHmac("sha256", salt).update(email).digest();
  // Keep the legacy CF-XXXXXX format while this writes to the existing table.
  let value = "CF-";
  for (let index = 0; index < 6; index += 1) {
    value += REFERRAL_CHARS[bytes[index] % REFERRAL_CHARS.length];
  }
  return value;
}

function validPostalCode(value: string) {
  return /^\d{5}(?:-\d{4})?$/.test(value);
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  if (origin && !PRODUCTION_ORIGINS.has(origin) && !(process.env.NODE_ENV !== "production" && isLocal)) {
    return json("Origin not allowed.", 403);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const referralSalt = process.env.REFERRAL_SALT;
  if (!supabaseUrl || !serviceRoleKey || !referralSalt) {
    console.error("Chorezy waitlist is missing required server configuration.");
    return json("The waitlist is temporarily unavailable. Please try again shortly.", 503);
  }

  let input: Record<string, unknown>;
  try {
    input = await request.json() as Record<string, unknown>;
  } catch {
    return json("The submitted form could not be read.", 400);
  }

  if (input.website) return json("You are on the Chorezy waitlist.");

  const email = String(input.email || "").trim().toLowerCase();
  const role = String(input.role || "").trim();
  const country = String(input.country || "").trim().toUpperCase();
  const postalCode = String(input.postalCode || "").trim().toUpperCase();
  const referral = String(input.referral || "direct").trim().toUpperCase();

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json("Enter a valid email address.", 400);
  }
  if (!ALLOWED_ROLES.has(role)) return json("Choose how you plan to use Chorezy.", 400);
  if (country !== "US" || !validPostalCode(postalCode)) {
    return json("Enter a valid U.S. ZIP code.", 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const generatedCode = referralCode(email, referralSalt);
  const { data: existing, error: existingError } = await supabase
    .from("chorezy_waitlist")
    .select("referral_code")
    .eq("email", email)
    .maybeSingle();

  if (existingError) {
    console.error("Chorezy waitlist lookup failed", { code: existingError.code });
    return json("We could not save your place right now. Please try again.", 503);
  }

  let referredBy: string | null = null;
  if (referral !== "DIRECT" && /^[A-Z0-9-]{3,32}$/.test(referral)) {
    const { data: referrer } = await supabase
      .from("chorezy_waitlist")
      .select("referral_code")
      .eq("referral_code", referral)
      .maybeSingle();
    if (referrer && referral !== existing?.referral_code && referral !== generatedCode) {
      referredBy = referral;
    }
  }

  let code = existing?.referral_code ?? generatedCode;
  let created = false;
  const { error } = existing ? { error: null } : await supabase.from("chorezy_waitlist").insert({
    email,
    role,
    zipcode: postalCode,
    country,
    referral_code: code,
    referred_by_code: referredBy,
    location_source: "manual",
    metadata: {
      brand: "Chorezy",
      market: "united_states",
      source_domain: "chorezy.com",
      submitted_at: new Date().toISOString(),
    },
  });

  if (error && error.code !== "23505") {
    console.error("Chorezy waitlist insert failed", { code: error.code });
    return json("We could not save your place right now. Please try again.", 503);
  }

  created = !existing && !error;
  if (error?.code === "23505") {
    const { data: racedEntry, error: racedEntryError } = await supabase
      .from("chorezy_waitlist")
      .select("referral_code")
      .eq("email", email)
      .maybeSingle();
    if (racedEntryError || !racedEntry) {
      console.error("Chorezy waitlist duplicate lookup failed", { code: racedEntryError?.code });
      return json("We could not load your referral link right now. Please try again.", 503);
    }
    code = racedEntry.referral_code;
  }

  const { count: referralCount, error: referralCountError } = await supabase
    .from("chorezy_waitlist")
    .select("id", { count: "exact", head: true })
    .eq("referred_by_code", code);

  if (referralCountError) {
    console.error("Chorezy referral count failed", { code: referralCountError.code });
  }

  return json("Your place is saved. We will email you when your area is ready.", 200, {
    referralCode: code,
    referralCount: referralCount ?? 0,
    rewardThreshold: 2,
    creditAmount: 5,
    created,
  });
}

export function GET() {
  return json("Method not allowed.", 405);
}
