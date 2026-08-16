export const ALLOWED_USERNAMES = ["liuhangyu", "shaobingchan"] as const;
export type AllowedUsername = (typeof ALLOWED_USERNAMES)[number];

export function isAllowedUsername(name: string): name is AllowedUsername {
  return (ALLOWED_USERNAMES as readonly string[]).includes(name);
}

export const MOODS = [
  { value: "happy", label: "开心" },
  { value: "miss", label: "想你" },
  { value: "quiet", label: "想安静" },
  { value: "working", label: "干活中" },
] as const;

export const MOOD_MAP = Object.fromEntries(MOODS.map((m) => [m.value, m]));

export const MEMORY_CATEGORIES = [
  "旅行",
  "好吃",
  "好玩",
  "知识",
  "其他",
] as const;

export const WISH_CATEGORIES = [
  "旅行",
  "美食",
  "体验",
  "纪念日",
  "购物",
  "其他",
] as const;

export const WISH_EFFORTS = [
  { value: 1, label: "普通", color: "#ffffff" },
  { value: 2, label: "稀有", color: "#3d7edb" },
  { value: 3, label: "史诗", color: "#8b4dc4" },
  { value: 4, label: "传说", color: "#c4a06a" },
  { value: 5, label: "金色传说", color: "#e4c36a" },
] as const;

export const SESSION_COOKIE = "blysch_session";
