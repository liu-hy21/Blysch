"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PixelDatePicker } from "@/components/ui/pixel-date-picker";
import { SHOW_TOGETHER_UI } from "@/lib/constants";
import { BackBar } from "../back-bar";
import { uploadImage } from "@/components/app/image-picker";
import { LogoutButton } from "../logout-button";

export function ProfileClient({
  nickname,
  avatar,
  startDate,
}: {
  nickname: string;
  avatar: string | null;
  startDate: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(nickname);
  const [pic, setPic] = useState(avatar);
  const [start, setStart] = useState(startDate);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function save() {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: name, avatar: pic, startDate: start }),
    });
    setMsg(res.ok ? "已保存" : "保存失败");
    router.refresh();
  }

  async function changePassword() {
    const res = await fetch("/api/auth/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const data = await res.json();
    setMsg(res.ok ? "密码已更新" : data.error ?? "失败");
    if (res.ok) {
      setOldPassword("");
      setNewPassword("");
    }
  }

  return (
    <div className="px-5 pb-8 pt-6">
      <BackBar title="我" />
      <button
        type="button"
        aria-label="更换头像"
        className="mx-auto block h-20 w-20 overflow-hidden border-2 border-ink bg-card shadow-[3px_3px_0_var(--ink)]"
        onClick={() => fileRef.current?.click()}
      >
        {pic ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pic} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-ink-soft">头像</span>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setPic(await uploadImage(file));
        }}
      />
      <label className="mt-6 block text-sm">
        昵称
        <input
          className="pixel-field mt-1 min-h-11 w-full px-3"
          name="nickname"
          autoComplete="nickname"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      {SHOW_TOGETHER_UI ? (
        <div className="mt-3">
          <PixelDatePicker label="在一起起始日" value={start} onChange={setStart} />
        </div>
      ) : null}
      <Button className="mt-4 w-full" onClick={save}>
        保存资料
      </Button>
      <h2 className="mt-8">改自己的密码</h2>
      <input
        type="password"
        name="current-password"
        autoComplete="current-password"
        className="pixel-field mt-3 min-h-11 w-full px-3"
        placeholder="当前密码…"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
      />
      <input
        type="password"
        name="new-password"
        autoComplete="new-password"
        className="pixel-field mt-3 min-h-11 w-full px-3"
        placeholder="新密码…"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <Button variant="ghost" className="mt-4 w-full" onClick={changePassword}>
        更新密码
      </Button>
      {msg && (
        <p className="mt-3 text-sm text-gold-deep" role="status" aria-live="polite">
          {msg}
        </p>
      )}
      <div className="mt-8 flex justify-end">
        <LogoutButton />
      </div>
    </div>
  );
}
