import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(url) });

const USERS = [
  { username: "liuhangyu", nickname: "航羽" },
  { username: "shaobingchan", nickname: "烧饼" },
] as const;

async function main() {
  let couple = await prisma.couple.findFirst();
  if (!couple) {
    couple = await prisma.couple.create({ data: { name: "我们" } });
  }

  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: { nickname: u.nickname },
      create: {
        username: u.username,
        nickname: u.nickname,
        passwordHash: null,
      },
    });
    await prisma.coupleMember.upsert({
      where: {
        userId_coupleId: { userId: user.id, coupleId: couple.id },
      },
      update: {},
      create: { userId: user.id, coupleId: couple.id },
    });
  }

  console.log("seed ready: liuhangyu / shaobingchan (passwords unset)");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
