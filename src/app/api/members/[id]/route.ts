import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Language } from "@/generated/prisma";

// GET - Retrieve a member by numerical ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 1. Convert the incoming string id (e.g. "5") into an integer (5)
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Format d'identifiant invalide" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language") || "FR";

    const member = await prisma.member.findUnique({
      where: { id: numericId }, // Use parsed numerical integer value
      include: {
        translations: true,
        user: true,
        team: {
          include: {
            translations: true,
          },
        },
        publications: {
          include: {
            publication: {
              include: {
                translations: true,
                authors: {
                  include: {
                    author: true,
                  },
                  orderBy: {
                    order: "asc",
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Membre introuvable" },
        { status: 404 }
      );
    }

    // Format Data Outbound
    const frTranslation = member.translations.find((t: any) => t.language === "FR");
    const enTranslation = member.translations.find((t: any) => t.language === "EN");

    const teamFrTranslation = member.team?.translations.find((t: any) => t.language === "FR");
    const teamEnTranslation = member.team?.translations.find((t: any) => t.language === "EN");

    const formattedMember = {
      id: member.id,
      firstname: member.firstname,
      lastname: member.lastname,
      email: member.email,
      phone: member.phone,
      image: member.user?.image || member.image, 
      gender: member.gender,
      position: member.position,
      isTeamLeader: member.isTeamLeader,
      isMember: member.isMember,
      createdAt: member.createdAt,
      name: `${member.firstname} ${member.lastname}`.trim() || "Non défini",
      bio: member.translations[0]?.bio,
      institution: member.translations[0]?.institution,
      bio_fr: frTranslation?.bio,
      bio_en: enTranslation?.bio,
      institution_fr: frTranslation?.institution,
      institution_en: enTranslation?.institution,
      team: member.team?.slug,
      teamName: member.team?.translations[0]?.name || "Aucune équipe",
      teamName_fr: teamFrTranslation?.name,
      teamName_en: teamEnTranslation?.name,
      publications: member.publications.map((pub: any) => {
        const pubFrTranslation = pub.publication.translations.find((t: any) => t.language === "FR");
        const pubEnTranslation = pub.publication.translations.find((t: any) => t.language === "EN");

        return {
          id: pub.publication.id,
          title: pub.publication.translations[0]?.title || "Sans titre",
          title_fr: pubFrTranslation?.title,
          title_en: pubEnTranslation?.title,
          abstract: pub.publication.translations[0]?.abstract,
          abstract_fr: pubFrTranslation?.abstract,
          abstract_en: pubEnTranslation?.abstract,
          year: pub.publication.year,
          journal: pub.publication.journal,
          doi: pub.publication.doi,
          publishedAt: pub.publication.publishedAt,
          volume: pub.publication.volume,
          authors: pub.publication.authors.map((a: any) => ({
            firstname: a.author.firstname,
            lastname: a.author.lastname,
          })),
          url: pub.publication.url || null,
        };
      }),
    };

    return NextResponse.json(formattedMember);
  } catch (error) {
    console.error("Erreur lors de la récupération du membre:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT - Update a member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Format d'identifiant invalide" }, { status: 400 });
    }

    const body = await request.json();
    const {
      firstname,
      lastname,
      email,
      position,
      teamSlug,
      gender,
      phone,
      bio,
      institution,
      isTeamLeader,
      language = "FR",
    } = body;

    const existingMember = await prisma.member.findUnique({
      where: { id: numericId },
    });

    if (!existingMember) {
      return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });
    }

    if (email && email !== existingMember.email) {
      const emailExists = await prisma.member.findUnique({
        where: { email },
      });
      if (emailExists) {
        return NextResponse.json({ error: "Un membre avec cet email existe déjà" }, { status: 409 });
      }
    }

    let team = null;
    if (teamSlug) {
      team = await prisma.team.findUnique({
        where: { slug: teamSlug },
      });
      if (!team) {
        return NextResponse.json({ error: "Équipe introuvable" }, { status: 404 });
      }
    }

    const updatedMember = await prisma.member.update({
      where: { id: numericId },
      data: {
        ...(firstname && { firstname }),
        ...(lastname && { lastname }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(gender && { gender }),
        ...(position && { position }),
        ...(isTeamLeader !== undefined && { isTeamLeader }),
        ...(team && { teamId: team.id }),
        translations: {
          upsert: {
            where: {
              memberId_language: {
                memberId: numericId,
                language: language as Language,
              },
            },
            update: {
              ...(bio !== undefined && { bio }),
              ...(institution !== undefined && { institution }),
            },
            create: {
              language: language as Language,
              bio,
              institution,
            },
          },
        },
      },
      include: {
        translations: {
          where: { language: language as Language },
        },
        user: true,
        team: {
          include: {
            translations: {
              where: { language: language as Language },
            },
          },
        },
      },
    });

    const formattedMember = {
      id: updatedMember.id,
      firstname: updatedMember.firstname,
      lastname: updatedMember.lastname,
      email: updatedMember.email,
      phone: updatedMember.phone,
      image: (updatedMember as any).user?.image || updatedMember.image,
      gender: updatedMember.gender,
      position: updatedMember.position,
      isTeamLeader: updatedMember.isTeamLeader,
      createdAt: updatedMember.createdAt,
      name: `${updatedMember.firstname} ${updatedMember.lastname}`.trim(),
      bio: (updatedMember as any).translations[0]?.bio,
      institution: (updatedMember as any).translations[0]?.institution,
      team: (updatedMember as any).team?.slug,
      teamName: (updatedMember as any).team?.translations[0]?.name,
    };

    return NextResponse.json(formattedMember);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du membre:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Remove a member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Format d'identifiant invalide" }, { status: 400 });
    }

    const existingMember = await prisma.member.findUnique({
      where: { id: numericId },
    });

    if (!existingMember) {
      return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });
    }

    await prisma.member.delete({
      where: { id: numericId },
    });

    return NextResponse.json({ message: "Membre supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du membre:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}