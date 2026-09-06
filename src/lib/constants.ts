export const ALLOWED_USERNAMES = ["liuhangyu", "shaobingchan"] as const;
export type AllowedUsername = (typeof ALLOWED_USERNAMES)[number];

export function isAllowedUsername(name: string): name is AllowedUsername {
  return (ALLOWED_USERNAMES as readonly string[]).includes(name);
}

export const MOODS = [
  { value: "happy", label: "开心" },
  { value: "miss", label: "想你" },
  { value: "quiet", label: "睡觉" },
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

/** 一条回忆最多上传的照片数 */
export const MEMORY_IMAGE_MAX = 20;
/** 时间轴卡片上预览的照片数 */
export const MEMORY_IMAGE_PREVIEW = 6;
/** 时间轴一页条数 */
export const MEMORY_PAGE_SIZE = 5;

export const WISH_CATEGORIES = ["旅行", "体验", "知识"] as const;
export const WISH_REGIONS = ["国内", "国外"] as const;

export const WISH_EFFORTS = [
  { value: 1, label: "普通", color: "#ffffff" },
  { value: 2, label: "稀有", color: "#3d7edb" },
  { value: 3, label: "史诗", color: "#8b4dc4" },
  { value: 4, label: "传说", color: "#c4a06a" },
  { value: 5, label: "金色传说", color: "#e4c36a" },
] as const;

export const SESSION_COOKIE = "blysch_session";

/** 首页「在一起」只有起始日为这一天时才揭晓真实天数 */
export const HOME_REVEAL_START = "2026-08-15";

/** 先关掉「在一起」相关展示，逻辑仍保留 */
export const SHOW_TOGETHER_UI = false;
