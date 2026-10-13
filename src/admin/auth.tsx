"use client";

import {
  createClient,
  type Session,
  type SupabaseClient,
} from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { createAdminApi, withTimeout, type AdminApi } from "./api";
import { AdminButton, Notice } from "./ui";
import Image from "next/image";
import Link from "next/link";

const AuthContext = createContext<{
  api: AdminApi;
  email: string;
  signOut: () => Promise<void>;
} | null>(null);
export function useAdmin() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("Staff authorization is required.");
  return value;
}
let client: SupabaseClient | null = null;
function getStaffClient() {
  const url = process.env.NEXT_PUBLIC_STAFF_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_STAFF_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (key.startsWith("sb_secret_"))
    throw new Error("Staff login requires a public Supabase key.");
  try {
    const payload = JSON.parse(atob(key.split(".")[1] || ""));
    if (payload.role === "service_role")
      throw new Error("Do not use a service-role key for staff login.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("service-role"))
      throw error;
  }
  client ??= createClient(url, key, {
    auth: {
      storageKey: "chorezy-staff-session",
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}

export function AdminAuth({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<{
    session: Session | null;
    state: "loading" | "signedOut" | "authorized" | "denied" | "unconfigured";
    error: string;
  }>({ session: null, state: "loading", error: "" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [retry, setRetry] = useState(0);
  const authGeneration = useRef({ value: 0 });
  const accessSuppressed = useRef(false);
  useEffect(() => {
    let mounted = true;
    const generation = authGeneration.current;
    let staff: SupabaseClient | null;
    try {
      staff = getStaffClient();
    } catch (error) {
      queueMicrotask(() => {
        if (mounted)
          setAuth({
            session: null,
            state: "unconfigured",
            error:
              error instanceof Error
                ? error.message
                : "Staff authentication configuration is invalid.",
          });
      });
      return;
    }
    if (!staff) {
      queueMicrotask(() => {
        if (mounted)
          setAuth({
            session: null,
            state: "unconfigured",
            error: "Staff login has not been configured for this website.",
          });
      });
      return;
    }
    const verify = async (session: Session | null) => {
      const check = ++generation.value;
      if (!mounted || accessSuppressed.current) return;
      setAuth({
        session: null,
        state: session ? "loading" : "signedOut",
        error: "",
      });
      if (!session) return;
      // Verify through the existing staff authority, not a browser email allowlist.
      let result;
      try {
        result = await withTimeout(
          staff.rpc("is_admin"),
          "Staff access check timed out. Retry when the identity provider is available.",
        );
      } catch (error) {
        if (mounted && generation.value === check)
          setAuth({
            session: null,
            state: "denied",
            error:
              error instanceof Error
                ? error.message
                : "Staff access could not be verified.",
          });
        return;
      }
      const { data, error } = result;
      if (!mounted || generation.value !== check) return;
      setAuth(
        error
          ? {
              session: null,
              state: "denied",
              error: "Staff access could not be verified. Retry or sign out.",
            }
          : data === true
            ? { session, state: "authorized", error: "" }
            : {
                session: null,
                state: "denied",
                error: "This account does not have Chorezy staff access.",
              },
      );
    };
    void withTimeout(
      staff.auth.getSession(),
      "Session restoration timed out. Sign in again.",
    )
      .then(({ data, error }) => {
        if (error && mounted)
          setAuth({
            session: null,
            state: "signedOut",
            error: "Your session could not be restored. Sign in again.",
          });
        else void verify(data.session);
      })
      .catch((error) => {
        if (mounted)
          setAuth({
            session: null,
            state: "signedOut",
            error:
              error instanceof Error
                ? error.message
                : "Session restoration failed.",
          });
      });
    const { data: subscription } = staff.auth.onAuthStateChange(
      (_event, session) => {
        // Avoid awaiting RPC inside the Supabase auth lock.
        setTimeout(() => {
          void verify(session);
        }, 0);
      },
    );
    const revoked = () => {
      generation.value++;
      accessSuppressed.current = true;
      setAuth({
        session: null,
        state: "denied",
        error:
          "The Chorezy API denied access. Your session or staff permission may have changed.",
      });
    };
    window.addEventListener("chorezy-admin-access-revoked", revoked);
    return () => {
      mounted = false;
      generation.value++;
      subscription.subscription.unsubscribe();
      window.removeEventListener("chorezy-admin-access-revoked", revoked);
    };
  }, [retry]);
  const api = useMemo(
    () =>
      createAdminApi(
        process.env.NEXT_PUBLIC_CHOREZY_ADMIN_API_URL ||
          "https://api.chorezy.com",
        async () => {
          const staff = getStaffClient();
          if (!staff) return null;
          const { data, error } = await staff.auth.getSession();
          return error ? null : data.session?.access_token || null;
        },
      ),
    [],
  );
  const signOut = async () => {
    authGeneration.current.value++;
    accessSuppressed.current = true;
    setAuth({ session: null, state: "signedOut", error: "" });
    try {
      const staff = getStaffClient();
      if (staff)
        await withTimeout(
          staff.auth.signOut({ scope: "local" }),
          "Sign-out could not be confirmed.",
        );
    } catch {
      setLoginError(
        "Sign-out could not be confirmed. Close this browser session on a shared device.",
      );
    }
  };
  async function login(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    accessSuppressed.current = false;
    setLoginError("");
    try {
      const staff = getStaffClient();
      if (!staff) throw new Error("Staff login is unavailable.");
      const { error } = await withTimeout(
        staff.auth.signInWithPassword({
          email: email.trim(),
          password,
        }),
        "Sign-in timed out. Please try again.",
      );
      if (error)
        throw new Error(
          "Sign-in failed. Check your email and password, then try again.",
        );
      setPassword("");
    } catch (error) {
      accessSuppressed.current = true;
      authGeneration.current.value++;
      setAuth({ session: null, state: "signedOut", error: "" });
      setLoginError(error instanceof Error ? error.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }
  if (auth.state === "authorized" && auth.session)
    return (
      <AuthContext.Provider
        value={{
          api,
          email: auth.session.user.email || "Staff member",
          signOut,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  return (
    <div className="admin-auth">
      <div className="admin-auth-card">
        <Image
          src="/brand/logo-color.png"
          width={44}
          height={44}
          alt="Chorezy"
        />
        <p className="admin-eyebrow">Staff workspace</p>
        <h1>Chorezy admin</h1>
        <p>Sign in with your authorized staff account.</p>
        {auth.state === "loading" ? (
          <Notice>Checking staff access…</Notice>
        ) : auth.state === "unconfigured" ? (
          <Notice error>{auth.error}</Notice>
        ) : auth.state === "denied" ? (
          <>
            <Notice error>{auth.error}</Notice>
            <div className="admin-actions">
              <AdminButton
                onClick={() => {
                  accessSuppressed.current = false;
                  setRetry((value) => value + 1);
                }}
              >
                Retry access check
              </AdminButton>
              <AdminButton variant="secondary" onClick={() => void signOut()}>
                Sign out
              </AdminButton>
            </div>
          </>
        ) : (
          <form onSubmit={login} aria-busy={busy}>
            <label>
              Email
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={busy}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={busy}
              />
            </label>
            {(loginError || auth.error) && (
              <Notice error>{loginError || auth.error}</Notice>
            )}
            <AdminButton type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </AdminButton>
          </form>
        )}
        <Link className="admin-muted-link" href="/">
          Return to Chorezy
        </Link>
      </div>
    </div>
  );
}
