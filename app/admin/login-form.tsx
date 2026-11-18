"use client";

import { useFormStatus } from "react-dom";
import { signIn } from "./auth-actions";

function SignInButton() {
  const { pending } = useFormStatus();
  return <button className="admin-button" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>;
}

export function LoginForm({ invalidCredentials }: { invalidCredentials: boolean }) {
  return <section className="admin-panel admin-login" aria-labelledby="login-heading">
    <h2 id="login-heading">Admin sign-in</h2>
    <p>Sign in to manage the wedding details.</p>
    <form action={signIn} className="admin-fields">
      <label className="admin-field"><span>Username</span>
        <input name="username" autoComplete="username" required autoCapitalize="none" spellCheck={false} />
      </label>
      <label className="admin-field"><span>Password</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {invalidCredentials && <p className="admin-error" role="alert">Incorrect username or password.</p>}
      <SignInButton />
    </form>
  </section>;
}
