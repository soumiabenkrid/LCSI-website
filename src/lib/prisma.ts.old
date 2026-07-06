// src/lib/prisma.ts
import { PrismaClient } from "@/generated/prisma";

// Type for our cached prisma instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// ⭐ Helper to create Prisma client only when needed
function createPrismaClient() {
  // Check if we're in build mode
  if (process.env.NODE_ENV === 'production' && 
      (process.env.IS_BUILD_TIME === 'true' || !process.env.DATABASE_URL)) {
    // Return a mock client during build
    return {
      $connect: () => Promise.resolve(),
      $disconnect: () => Promise.resolve(),
      // Add your model mocks here based on what your API routes use
      publication: {
        findMany: () => Promise.resolve([]),
        findUnique: () => Promise.resolve(null),
        // Add other methods used in your /api/publications/years route
      },
      // Add other models as needed
    } as unknown as PrismaClient;
  }
  
  // Real Prisma client for runtime
  return new PrismaClient();
}

// ⭐ Lazy initialization
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
