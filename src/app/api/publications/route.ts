import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Language } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const teams = searchParams.get("teams");
    const teamSlug = searchParams.get("team") || undefined; // Filtre par équipe (alias)
    const year = searchParams.get("year")
      ? parseInt(searchParams.get("year")!)
      : undefined;
    const language = searchParams.get("language") || "FR";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Construction de la requête
    const where: any = {};

    // Filtre par recherche (titre, auteurs, journal)
    if (search) {
      where.OR = [
        {
          translations: {
            some: {
              language: language as Language,
              title: { contains: search, mode: "insensitive" },
            },
          },
        },
        { journal: { contains: search, mode: "insensitive" } },
        {
          authors: {
            some: {
              author: {
                translations: {
                  some: {
                    language: language as Language,
                    name: { contains: search, mode: "insensitive" },
                  },
                },
              },
            },
          },
        },
      ];
    }

    if (teams) {
      const teamList = teams.split(",");
      where.team = {
        slug: { in: teamList },
      };
    } else if (teamSlug) {
      where.team = { slug: teamSlug };
    }

    // Filtre par année
    if (year) {
      where.year = year;
    }

    const [publicationsResult, total] = await Promise.all([
      prisma.publication.findMany({
        where,
        skip: offset,
        take: limit,
        include: {
          translations: true, // Récupérer toutes les traductions (FR et EN)
          team: {
            include: {
              translations: true, // Récupérer toutes les traductions de l'équipe
            },
          },
          authors: {
            include: {
              author: true,
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: [{ year: "desc" }, { publishedAt: "desc" }],
      }),
      prisma.publication.count({ where }),
    ]);

    // Formatter les données pour le frontend avec le format bilingue
    const formattedPublications = publicationsResult.map((publication: any) => {
      const translationFR = publication.translations.find(
        (t: any) => t.language === "FR"
      );
      const translationEN = publication.translations.find(
        (t: any) => t.language === "EN"
      );
      const teamTranslationFR = publication.team?.translations.find(
        (t: any) => t.language === "FR"
      );
      const teamTranslationEN = publication.team?.translations.find(
        (t: any) => t.language === "EN"
      );

      return {
        id: publication.id,
        title_fr: translationFR?.title,
        title_en: translationEN?.title,
        abstract_fr: translationFR?.abstract,
        abstract_en: translationEN?.abstract,
        keywords_fr: translationFR?.keywords || [],
        keywords_en: translationEN?.keywords || [],
        journal: publication.journal,
        volume: publication.volume,
        issue: publication.issue,
        pages: publication.pages,
        doi: publication.doi,
        url: publication.url,
        year: publication.year,
        publishedAt: publication.publishedAt,
        createdAt: publication.createdAt,
        team: publication.team?.slug,
        teamName_fr: teamTranslationFR?.name,
        teamName_en: teamTranslationEN?.name,
        authors: publication.authors.map((authorRel: any) => ({
          id: authorRel.author.id,
          firstname: authorRel.author.firstname,
          lastname: authorRel.author.lastname,
          email: authorRel.author.email,
          order: authorRel.order,
        })),
      };
    });

    return NextResponse.json({
      publications: formattedPublications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  }    catch (error: any) {
  // Add this block to inspect the unique constraint failure
  if (error.code === 'P2002') {
    console.error("❌ Unique constraint failed on fields:", error.meta?.target);
  } else {
    console.error("Erreur lors de la création de la publication:", error);
  }
  console.error("❌ FULL PRISMA ERROR DETAILED:", JSON.stringify(error, null, 2));
  return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
}

}

// POST - Créer une nouvelle publication
export async function POST(request: NextRequest) {
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

    // Validation des données
    if (
      !translations?.FR?.title ||
      !translations?.EN?.title ||
      !journal ||
      !year
    ) {
      return NextResponse.json(
        {
          error: "Champs obligatoires manquants (titre FR/EN, journal, année)",
        },
        { status: 400 }
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

    // Créer la nouvelle publication
    const newPublication = await prisma.publication.create({
      data: {
        journal,
        volume,
        issue,
        pages,
        doi,
        url,
        year: parseInt(year),
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        teamId: team?.id,
        translations: {
          create: [
            {
              language: Language.FR,
              title: translations.FR.title,
              abstract: translations.FR.abstract || null,
              keywords: translations.FR.keywords || [],
            },
            {
              language: Language.EN,
              title: translations.EN.title,
              abstract: translations.EN.abstract || null,
              keywords: translations.EN.keywords || [],
            },
          ],
        },
        authors: {
          create:
            authors?.map((author: any) => ({
              authorId: author.memberId,
              order: author.order || 1,
            })) || [],
        },
      },
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
    const translationFR = (newPublication as any).translations.find(
      (t: any) => t.language === "FR"
    );
    const translationEN = (newPublication as any).translations.find(
      (t: any) => t.language === "EN"
    );
    const teamTranslationFR = (newPublication as any).team?.translations.find(
      (t: any) => t.language === "FR"
    );
    const teamTranslationEN = (newPublication as any).team?.translations.find(
      (t: any) => t.language === "EN"
    );

    // Formatter la réponse
    const formattedPublication = {
      id: newPublication.id,
      title_fr: translationFR?.title,
      title_en: translationEN?.title,
      abstract_fr: translationFR?.abstract,
      abstract_en: translationEN?.abstract,
      keywords_fr: translationFR?.keywords || [],
      keywords_en: translationEN?.keywords || [],
      journal: newPublication.journal,
      volume: newPublication.volume,
      issue: newPublication.issue,
      pages: newPublication.pages,
      doi: newPublication.doi,
      url: newPublication.url,
      year: newPublication.year,
      publishedAt: newPublication.publishedAt,
      createdAt: newPublication.createdAt,
      team: (newPublication as any).team?.slug,
      teamName_fr: teamTranslationFR?.name,
      teamName_en: teamTranslationEN?.name,
      authors: (newPublication as any).authors.map((authorRel: any) => ({
        id: authorRel.author.id,
        firstname: authorRel.author.firstname,
        lastname: authorRel.author.lastname,
        email: authorRel.author.email,
        order: authorRel.order,
      })),
    };

    return NextResponse.json(formattedPublication, { status: 201 });
  } catch (error: any) {
  // Add this block to inspect the unique constraint failure
  if (error.code === 'P2002') {
    console.error("❌ Unique constraint failed on fields:", error.meta?.target);
  } else {
    console.error("Erreur lors de la création de la publication:", error);
  }
  console.error("❌ FULL PRISMA ERROR DETAILED:", JSON.stringify(error, null, 2));
  return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
}
