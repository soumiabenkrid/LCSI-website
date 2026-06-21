import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Language } from "@/generated/prisma";
import { canUserModifyPublication } from "@/lib/publicationPermissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // or standard context
) {
  try {
    const { id } = await params;

    const publication = await prisma.publication.findUnique({
      where: {
        id: Number(id), // 💡 CRITICAL: Ensure this is wrapped in Number()
      },
      include: {
        translations: true,
        authors: true,
      },
    });

    if (!publication) {
      return NextResponse.json({ error: "Publication non trouvée" }, { status: 404 });
    }

    return NextResponse.json(publication);
  } catch (error) {
    console.error("❌ GET PUBLICATION ERROR:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT - Mettre à jour une publication
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const {
      translations, // { FR: {...}, EN: {...} }
      journal,
      volume,
      issue,
      pages,
      doi,
      url,
      year,
      publishedAt,
      teamSlug,
      authors, // Array of { memberId: string, order: number }
    } = body;

    // Vérifier que la publication existe
    const existingPublication = await prisma.publication.findUnique({
      where: { id },
    });

    if (!existingPublication) {
      return NextResponse.json(
        { error: "Publication introuvable" },
        { status: 404 }
      );
    }

    // Vérifier les permissions : Admin ou auteur de la publication
    const userEmail = session.user?.email || "";
    const userRole = (session.user as any)?.role || "MEMBER";

    const canModify = await canUserModifyPublication(userEmail, userRole, id);
    if (!canModify) {
      return NextResponse.json(
        {
          error: "Vous n'avez pas la permission de modifier cette publication",
        },
        { status: 403 }
      );
    }

    // Trouver l'équipe si spécifiée
    let team = null;
    if (teamSlug) {
      team = await prisma.team.findUnique({
        where: { slug: teamSlug },
      });
      if (!team) {
        return NextResponse.json(
          { error: "Équipe introuvable" },
          { status: 404 }
        );
      }
    }

    // Valider les auteurs
    if (authors && authors.length > 0) {
      const authorIds = authors.map((a: any) => a.memberId);
      const existingAuthors = await prisma.member.findMany({
        where: { id: { in: authorIds } },
      });

      if (existingAuthors.length !== authorIds.length) {
        return NextResponse.json(
          { error: "Un ou plusieurs auteurs sont introuvables" },
          { status: 404 }
        );
      }
    }

    // Mettre à jour la publication
    const updatedPublication = await prisma.publication.update({
      where: { id },
      data: {
        ...(journal && { journal }),
        ...(volume !== undefined && { volume }),
        ...(issue !== undefined && { issue }),
        ...(pages !== undefined && { pages }),
        ...(doi !== undefined && { doi }),
        ...(url !== undefined && { url }),
        ...(year && { year: parseInt(year) }),
        ...(publishedAt && { publishedAt: new Date(publishedAt) }),
        ...(team && { teamId: team.id }),
        ...(authors && {
          authors: {
            deleteMany: {}, // Supprimer tous les auteurs existants
            create: authors.map((author: any) => ({
              authorId: author.memberId,
              order: author.order || 1,
            })),
          },
        }),
      },
    });

    // Mettre à jour les traductions FR et EN séparément
    if (translations?.FR) {
      await prisma.publicationTranslation.upsert({
        where: {
          publicationId_language: {
            publicationId: id,
            language: Language.FR,
          },
        },
        update: {
          title: translations.FR.title,
          abstract: translations.FR.abstract || null,
          keywords: translations.FR.keywords || [],
        },
        create: {
          publicationId: id,
          language: Language.FR,
          title: translations.FR.title,
          abstract: translations.FR.abstract || null,
          keywords: translations.FR.keywords || [],
        },
      });
    }

    if (translations?.EN) {
      await prisma.publicationTranslation.upsert({
        where: {
          publicationId_language: {
            publicationId: id,
            language: Language.EN,
          },
        },
        update: {
          title: translations.EN.title,
          abstract: translations.EN.abstract || null,
          keywords: translations.EN.keywords || [],
        },
        create: {
          publicationId: id,
          language: Language.EN,
          title: translations.EN.title,
          abstract: translations.EN.abstract || null,
          keywords: translations.EN.keywords || [],
        },
      });
    }

    // Récupérer la publication mise à jour avec toutes ses relations
    const finalPublication = await prisma.publication.findUnique({
      where: { id },
      include: {
        translations: true,
        team: {
          include: {
            translations: true,
          },
        },
        authors: {
          include: {
            author: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    // Trouver les traductions FR et EN
    const translationFR = (finalPublication as any).translations.find(
      (t: any) => t.language === "FR"
    );
    const translationEN = (finalPublication as any).translations.find(
      (t: any) => t.language === "EN"
    );
    const teamTranslationFR = (finalPublication as any).team?.translations.find(
      (t: any) => t.language === "FR"
    );
    const teamTranslationEN = (finalPublication as any).team?.translations.find(
      (t: any) => t.language === "EN"
    );

    // Formatter la réponse
    const formattedPublication = {
      id: finalPublication!.id,
      title_fr: translationFR?.title,
      title_en: translationEN?.title,
      abstract_fr: translationFR?.abstract,
      abstract_en: translationEN?.abstract,
      keywords_fr: translationFR?.keywords || [],
      keywords_en: translationEN?.keywords || [],
      journal: finalPublication!.journal,
      volume: finalPublication!.volume,
      issue: finalPublication!.issue,
      pages: finalPublication!.pages,
      doi: finalPublication!.doi,
      url: finalPublication!.url,
      year: finalPublication!.year,
      publishedAt: finalPublication!.publishedAt,
      createdAt: finalPublication!.createdAt,
      team: (finalPublication as any).team?.slug,
      teamName_fr: teamTranslationFR?.name,
      teamName_en: teamTranslationEN?.name,
      authors: (finalPublication as any).authors.map((authorRel: any) => ({
        id: authorRel.author.id,
        firstname: authorRel.author.firstname,
        lastname: authorRel.author.lastname,
        email: authorRel.author.email,
        order: authorRel.order,
      })),
    };

    return NextResponse.json(formattedPublication);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la publication:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer une publication
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que la publication existe
    const existingPublication = await prisma.publication.findUnique({
      where: { id },
    });

    if (!existingPublication) {
      return NextResponse.json(
        { error: "Publication introuvable" },
        { status: 404 }
      );
    }

    // Vérifier les permissions : Admin ou auteur de la publication
    const userEmail = session.user?.email || "";
    const userRole = (session.user as any)?.role || "MEMBER";

    const canDelete = await canUserModifyPublication(userEmail, userRole, id);
    if (!canDelete) {
      return NextResponse.json(
        {
          error: "Vous n'avez pas la permission de supprimer cette publication",
        },
        { status: 403 }
      );
    }

    // Supprimer la publication (les traductions et auteurs seront supprimés automatiquement avec onDelete: Cascade)
    await prisma.publication.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Publication supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la publication:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
