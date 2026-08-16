"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LoginClient() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "setup">("login");
  const [username, setUsername] = useState("liuhangyu");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const url = mode === "setup" ? "/api/auth/setup-password" : "/api/auth/login";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setBusy(false);
    if (res.status === 409 && data.needsSetup) {
      setMode("setup");
      setError("第一次来，先给这个账号设一个密码。");
      return;
    }
    if (!res.ok) {
      setError(data.error ?? "失败了");
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="phone-shell mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center px-8">
      <p className="text-[11px] text-gold-deep">★ BLYSCH ★</p>
      <h1 className="mt-2 text-3xl">Blysch</h1>
      <p className="mt-2 text-sm text-ink-soft">只给两个人用的私密本子。</p>
      <form onSubmit={onSubmit} className="mt-10 space-y-4">
        <label className="block text-sm">
          用户名
          <select
            name="username"
            autoComplete="username"
            className="mt-1 min-h-11 w-full pixel-field px-3"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          >
            <option value="liuhangyu">liuhangyu</option>
            <option value="shaobingchan">shaobingchan</option>
          </select>
        </label>
        <label className="block text-sm">
          {mode === "setup" ? "设置密码" : "密码"}
          <input
            name="password"
            type="password"
            className="mt-1 min-h-11 w-full pixel-field px-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "setup" ? "new-password" : "current-password"}
          />
        </label>
        {error && (
          <p className="text-sm text-rose" role="alert" aria-live="polite">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "请稍候…" : mode === "setup" ? "保存并进入" : "进入"}
        </Button>
        <button
          type="button"
          className="min-h-11 w-full text-sm text-ink-soft"
          onClick={() => {
            setMode(mode === "login" ? "setup" : "login");
            setError("");
          }}
        >
          {mode === "login" ? "第一次使用，去设密码" : "已经设过，去登录"}
        </button>
      </form>
    </div>
  );
}
