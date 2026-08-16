import "dotenv/config";
import mariadb from "mariadb";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const parsed = new URL(url.replace(/^mysql:\/\//, "http://"));
const database = parsed.pathname.replace(/^\//, "").split("?")[0];

const conn = await mariadb.createConnection({
  host: parsed.hostname,
  port: Number(parsed.port || 3306),
  user: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
});

await conn.query(
  `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
);
await conn.end();
console.log(`database ready: ${database}`);
