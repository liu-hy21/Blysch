import { z } from "zod";
import {
  isAllowedUsername,
  MEMORY_CATEGORIES,
  MEMORY_IMAGE_MAX,
  MOODS,
  WISH_CATEGORIES,
  WISH_REGIONS,
} from "@/lib/constants";
import { SPECIES } from "@/lib/pet-rules";

export const loginSchema = z.object({
  username: z.string().min(1, "请输入用户名"),
  password: z.string().min(4, "密码至少 4 位"),
});

export const setupPasswordSchema = z.object({
  username: z
    .string()
    .refine(isAllowedUsername, "只能是 liuhangyu 或 shaobingchan"),
  password: z.string().min(4, "密码至少 4 位"),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(4, "新密码至少 4 位"),
});

export const moodSchema = z.object({
  mood: z.enum(MOODS.map((m) => m.value) as [string, ...string[]]),
});

export const memorySchema = z.object({
  title: z.string().min(1, "请填写标题").max(40),
  content: z.string().max(2000).optional(),
  category: z.enum(MEMORY_CATEGORIES),
  date: z.string().min(8),
  placeId: z.string().nullable().optional(),
  images: z.array(z.string()).max(MEMORY_IMAGE_MAX).default([]),
});

export const hatchSchema = z.object({
  species: z.enum(SPECIES),
  name: z.string().min(2, "名字 2～8 字").max(8),
});

export const petNameSchema = z.object({
  name: z.string().min(2).max(8),
});

export const feedSchema = z.object({
  foodId: z.enum(["berry", "block", "cake", "apple"]),
});

export const placeSchema = z.object({
  name: z.string().min(1).max(40),
  city: z.string().max(40).optional(),
  note: z.string().max(500).optional(),
  images: z.array(z.string()).max(6).default([]),
});

export const wishFields = z.object({
  title: z.string().min(1).max(40),
  category: z.enum(WISH_CATEGORIES),
  region: z.enum(WISH_REGIONS).nullable().optional(),
  stars: z.number().int().min(1).max(5).default(3),
  whenText: z.string().max(40).optional().nullable(),
  note: z.string().max(500).optional(),
});

export const wishSchema = wishFields.superRefine((data, ctx) => {
  if (data.category === "旅行" && !data.region) {
    ctx.addIssue({
      code: "custom",
      message: "旅行需要选择国内或国外",
      path: ["region"],
    });
  }
});

export const daySchema = z.object({
  title: z.string().min(1).max(40),
  targetDate: z.string().min(8),
});

export const profileSchema = z.object({
  nickname: z.string().min(1).max(16).optional(),
  avatar: z.string().nullable().optional(),
  startDate: z.string().min(8).optional(),
});
