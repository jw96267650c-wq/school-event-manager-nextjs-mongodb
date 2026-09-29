import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "./mongodb";

const COOKIE_NAME = "school_event_admin";

export function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
}

export async function verifyAdmin(username, password) {
  const db = await getDb();
  if (!db) {
    return false;
  }

  const user = await db.collection("users").findOne({
    username,
    role: "admin",
  });

  if (!user) {
    return false;
  }

  const passwordHash = hashPassword(password);

  return user.passwordHash === passwordHash;
}

export async function loginAdmin(username, password) {
  const valid = await verifyAdmin(username, password);

  if (!valid) {
    return false;
  }

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return true;
}

export async function logoutAdmin() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
}

export async function isAdmin() {
  const cookieStore = await cookies();

  return cookieStore.get(COOKIE_NAME)?.value === "1";
}

export async function requireAdmin() {
  const admin = await isAdmin();

  if (!admin) {
    throw new Error("UNAUTHORIZED");
  }

  return true;
}

export { COOKIE_NAME };