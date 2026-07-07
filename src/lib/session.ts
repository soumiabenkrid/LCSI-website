import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { AuthSession, AuthUser } from "@/types/auth";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);
const SESSION_COOKIE_NAME = "auth-session";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Creates a new session for the given user ID
 */
export async function createSession(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });

  return token;
}

/**
 * Gets the current session from cookies and validates it
 */
export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    if (!userId) {
      return null;
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      user: {
        id: user.id.toString(), // 💡 Convert the number back to a string for the session object
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role as "ADMIN" | "MEMBER",
      },
    };
  } catch {
    return null;
  }
}

/**
 * Deletes the current session (logout)
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Gets the current authenticated user or null
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  return session?.user || null;
}
