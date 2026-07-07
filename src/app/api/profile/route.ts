import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { MemberPosition } from "@/generated/prisma";

// GET - Récupérer le profil de l'utilisateur connecté
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const member = await prisma.member.findFirst({
      where: { email: session.user.email },
      include: {
        translations: true,
        user: true,
        team: {
          include: {
            translations: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json({
        exists: false,
        email: session.user.email,
        image: session.user.image,
        name: session.user.name,
      });
    }

    const positionMap: Record<string, string> = {
      PROFESSOR: "Professeur",
      ASSOCIATE_PROFESSOR: "Maître de conférences",
      ASSISTANT_PROFESSOR: "Professeur assistant",
      LECTURER: "Chercheur",
      RESEARCHER: "Chercheur",
      PHD_STUDENT: "Doctorant",
      MASTER_STUDENT: "Doctorant",
      ENGINEER: "Ingénieur de recherche",
    };

    const frTranslation = member.translations.find((t: any) => t.language === "FR");
    const enTranslation = member.translations.find((t: any) => t.language === "EN");

    const teamFrTranslation = member.team?.translations.find((t: any) => t.language === "FR");
    const teamEnTranslation = member.team?.translations.find((t: any) => t.language === "EN");

    return NextResponse.json({
      exists: true,
      id: member.id,
      firstname: member.firstname,
      lastname: member.lastname,
      email: member.email,
      phone: member.phone,
      image: member.user?.image || member.image,
      gender: member.gender,
      position: member.position ? (positionMap[member.position] || member.position) : "",
      teamSlug: member.team?.slug,
      teamName_fr: teamFrTranslation?.name,
      teamName_en: teamEnTranslation?.name,
      isTeamLeader: member.isTeamLeader,
      bio_fr: frTranslation?.bio,
      bio_en: enTranslation?.bio,
      institution_fr: frTranslation?.institution,
      institution_en: enTranslation?.institution,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du profil:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération du profil" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour le profil// PUT - Mettre à jour le profil
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    console.log("📝 Données reçues pour mise à jour profil:", body);
    const {
      firstname,
      lastname,
      position,
      teamSlug,
      gender,
      phone,
      bio_fr,
      bio_en,
      institution_fr,
      institution_en,
      isTeamLeader,
    } = body;

    if (!firstname?.trim() || !lastname?.trim() || !position?.trim() || !teamSlug?.trim() || !gender) {
      return NextResponse.json(
        { error: "Les champs obligatoires sont requis" },
        { status: 400 }
      );
    }

    const team = await prisma.team.findFirst({
      where: { slug: teamSlug },
    });

    if (!team) {
      return NextResponse.json({ error: "Équipe non trouvée" }, { status: 400 });
    }

    const existingMember = await prisma.member.findFirst({
      where: { email: session.user.email },
      include: { translations: true, team: true },
    });

    if (!existingMember) {
      return NextResponse.json({ error: "Profil membre non trouvé" }, { status: 404 });
    }

    // 💡 NETTOYAGE DU TÉLÉPHONE : Convertir "" en null pour éviter les conflits Prisma P2002
    const formattedPhone = phone?.trim() ? phone.trim() : null;

    // 💡 VÉRIFICATION EXPLICITE DU TÉLÉPHONE DUPLIQUÉ
    if (formattedPhone) {
      const phoneDuplicate = await prisma.member.findFirst({
        where: {
          phone: formattedPhone,
          NOT: { id: existingMember.id } // Ignorer l'utilisateur lui-même
        }
      });

      if (phoneDuplicate) {
        return NextResponse.json(
          { error: "Ce numéro de téléphone est déjà utilisé par un autre membre." },
          { status: 400 }
        );
      }
    }

    const finalIsTeamLeader = Boolean(isTeamLeader);

    // 💡 SÉCURITÉ CONTRAINTE UNIQUE : Gestion de la passation de rôle de chef d'équipe
    if (finalIsTeamLeader) {
      const activeLeader = await prisma.member.findFirst({
        where: {
          teamId: team.id,
          isTeamLeader: true,
          NOT: { id: existingMember.id }
        }
      });

      if (activeLeader) {
        await prisma.member.update({
          where: { id: activeLeader.id },
          data: { isTeamLeader: false }
        });
      }
    }

    const positionMapping: Record<string, MemberPosition> = {
      Professeur: MemberPosition.PROFESSOR,
      "Maître de conférences": MemberPosition.ASSOCIATE_PROFESSOR,
      "Professeur assistant": MemberPosition.ASSISTANT_PROFESSOR,
      Chercheur: MemberPosition.RESEARCHER,
      Doctorant: MemberPosition.PHD_STUDENT,
      "Ingénieur de recherche": MemberPosition.ENGINEER,
    };

    const positionEnum = positionMapping[position];
    if (!positionEnum) {
      return NextResponse.json(
        { error: `Position "${position}" non reconnue.` },
        { status: 400 }
      );
    }

    // Exécution de la mise à jour principale du membre
    const updatedMember = await prisma.member.update({
      where: { id: existingMember.id },
      data: {
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        position: positionEnum,
        teamId: team.id,
        gender: gender as "MALE" | "FEMALE",
        phone: formattedPhone, // Utilisation de la valeur formatée (string ou null)
        isTeamLeader: finalIsTeamLeader,
      },
      include: {
        team: {
          select: {
            slug: true,
            translations: { select: { name: true, language: true } },
          },
        },
        translations: true,
      },
    });

    // Mises à jour des traductions (Upserts)
    await prisma.memberTranslation.upsert({
      where: { memberId_language: { memberId: existingMember.id, language: "FR" } },
      update: { bio: bio_fr?.trim() || null, institution: institution_fr?.trim() || null },
      create: { memberId: existingMember.id, language: "FR", bio: bio_fr?.trim() || null, institution: institution_fr?.trim() || null },
    });

    await prisma.memberTranslation.upsert({
      where: { memberId_language: { memberId: existingMember.id, language: "EN" } },
      update: { bio: bio_en?.trim() || null, institution: institution_en?.trim() || null },
      create: { memberId: existingMember.id, language: "EN", bio: bio_en?.trim() || null, institution: institution_en?.trim() || null },
    });

    const safelySerializedMember = JSON.parse(JSON.stringify(updatedMember));

    return NextResponse.json({
      message: "Profil mis à jour avec succès",
      member: safelySerializedMember,
    });

  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du profil:", error);

    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Une valeur unique (comme le téléphone) entre en conflit avec un membre existant." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour du profil", details: (error as Error)?.message },
      { status: 500 }
    );
  }
}