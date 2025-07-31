"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const TOKEN = "token";
const PASS = process.env.AUTH_PASS;
const MAIL = process.env.AUTH_MAIL;

async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

export async function login({ email, password }: any) {
  if (email === MAIL && password === PASS) {
    const value = btoa(`${password}:${password}`);
    await setAuthCookie(value);
    return { success: true };
  }

  return { success: false };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/auth");
}
