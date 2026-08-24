import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CloudRain } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setAuth(data.user, data.token);
      navigate("/onboarding/location");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[100dvh] flex-col justify-center px-6 py-12">
      <div className="mb-8 flex items-center gap-2 text-sm font-semibold text-sky-800">
        <CloudRain size={21} fill="currentColor" className="text-sky-500" /> MAUSAM
      </div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Welcome back</h1>
      <p className="mb-6 text-sm text-slate-500">Log in to continue to your weather day.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none"
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link to="/signup" className="font-semibold text-sky-600">
          Sign up
        </Link>
      </p>
    </main>
  );
}
