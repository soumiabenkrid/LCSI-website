import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ContentType } from "@/generated/prisma";

// GET /api/contents -> Liste globale
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawType = searchParams.get("type");
    const validTypes = Object.values(ContentType) as string[];
    const type = validTypes.includes(rawType || "") ? (rawType as ContentType) : null;

    const parsedPage = parseInt(searchParams.get("page") || "1", 10);
    const parsedLimit = parseInt(searchParams.get("limit") || "10", 10);
    const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const limit = isNaN(parsedLimit) || parsedLimit < 1 ? 10 : parsedLimit;
    const skip = (page - 1) * limit;

    const contents = await prisma.content.findMany({
      where: type ? { type } : undefined,
      include: { translations: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    });

    return NextResponse.json({ contents }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Erreur GET global contents:", error?.message || error);
    return NextResponse.json({ error: "Failed to fetch contents" }, { status: 500 });
  }
}

// POST /api/contents -> Création
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { memberProfile: true },
    });

    if (!user?.memberProfile) {
      return NextResponse.json({ error: "Profil membre non trouvé." }, { status: 403 });
    }

    const body = await request.json();
    const { slug, type: rawType, image, publishedAt, eventDate, translations } = body;

    if (!slug || !rawType || !translations) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const formattedType = String(rawType).toUpperCase().trim();

    const existingContent = await prisma.content.findUnique({ where: { slug } });
    if (existingContent) {
      return NextResponse.json({ error: "Ce slug existe déjà" }, { status: 400 });
    }

    const newContent = await prisma.content.create({
      data: {
        slug,
        type: formattedType as ContentType,
        image,
        publishedAt: (publishedAt && typeof publishedAt === "string" && publishedAt.trim() !== "") ? new Date(publishedAt) : null,
        eventDate: (eventDate && typeof eventDate === "string" && eventDate.trim() !== "") ? new Date(eventDate) : null,
        createdById: user.memberProfile.id, 
        translations: {
          create: translations.map((t: any) => ({
            language: t.language,
            title: t.title,
            description: t.description,
            categoryLabel: t.categoryLabel,
            categoryColor: t.categoryColor,
          })),
        },
      },
      include: { translations: true },
    });

    return NextResponse.json({ content: newContent, message: "Créé avec succès" }, { status: 201 });
  } catch (error: any) {
    console.error("❌ Erreur POST route.ts:", error?.message || error);
    return NextResponse.json({ error: "Failed to create content" }, { status: 500 });
  }
}