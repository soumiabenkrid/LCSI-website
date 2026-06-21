import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/contents/[slug] -> Récupération unitaire (Hybride ID ou Slug)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Identifiant/Slug manquant" }, { status: 400 });
    }

    // Détection : Si le paramètre n'est fait QUE de chiffres (ex: "6"), c'est un ID numérique.
    const isNumeric = /^\d+$/.test(slug);
    const uniqueQuery = isNumeric 
      ? { id: parseInt(slug, 10) } 
      : { slug: slug };

    const content = await prisma.content.findUnique({
      where: uniqueQuery,
      include: { translations: true },
    });

    if (!content) {
      return NextResponse.json({ error: "Contenu introuvable" }, { status: 404 });
    }

    return NextResponse.json({ content }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Erreur unitaire GET:", error?.message || error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/contents/[slug] -> Suppression unitaire (Hybride ID ou Slug)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Identifiant/Slug manquant" }, { status: 400 });
    }

    // Même détection magique pour la suppression !
    const isNumeric = /^\d+$/.test(slug);
    const uniqueQuery = isNumeric 
      ? { id: parseInt(slug, 10) } 
      : { slug: slug };

    await prisma.content.delete({
      where: uniqueQuery,
    });

    return NextResponse.json({ message: "Supprimé avec succès" }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Erreur DELETE:", error?.message || error);
    return NextResponse.json({ error: "Internal Server Error", details: error?.message }, { status: 500 });
  }
}