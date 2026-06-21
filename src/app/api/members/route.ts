import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Language, MemberPosition, UserRole } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const teams = searchParams.get("teams");
    const teamSlug = searchParams.get("team"); 
    const language = searchParams.get("language") || "FR";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (search) {
      where.OR = [
        {
          translations: {
            some: {
              language,
              name: { contains: search, mode: "insensitive" },
            },
          },
        },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (teams) {
      const teamList = teams.split(",");
      where.team = {
        slug: { in: teamList },
      };
    } else if (teamSlug) {
      where.team = {
        slug: teamSlug,
      };
    }

    const [membersResult, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip: offset,
        take: limit,
        include: {
          translations: true, 
          user: true, 
          team: {
            include: {
              translations: true,
            },
          },
        },
        orderBy: [{ isTeamLeader: "desc" }, { email: "asc" }],
      }),
      prisma.member.count({ where }),
    ]);

    const formattedMembers = membersResult.map((member: any) => {
      const frTranslation = member.translations.find((t: any) => t.language === "FR");
      const enTranslation = member.translations.find((t: any) => t.language === "EN");
      const currentTranslation = member.translations.find((t: any) => t.language === language) || frTranslation;

      const teamTranslations = member.team?.translations || [];
      const teamFr = teamTranslations.find((t: any) => t.language === "FR");
      const teamEn = teamTranslations.find((t: any) => t.language === "EN");

      return {
        id: member.id,
        firstname: member.firstname,
        lastname: member.lastname,
        email: member.email,
        phone: member.phone,
        image: member.user?.image || member.image, 
        gender: member.gender,
        position: member.position,
        isTeamLeader: member.isTeamLeader,
        createdAt: member.createdAt,
        name: `${member.firstname} ${member.lastname}`.trim() || "Non défini",
        bio: currentTranslation?.bio,
        institution: currentTranslation?.institution,
        bio_fr: frTranslation?.bio,
        bio_en: enTranslation?.bio,
        institution_fr: frTranslation?.institution,
        institution_en: enTranslation?.institution,
        department: teamFr?.name || "Aucune équipe",
        team: member.team?.slug,
        teamName: teamFr?.name || "Aucune équipe",
        teams: member.team ? [{
          slug: member.team.slug,
          name_fr: teamFr?.name || "",
          name_en: teamEn?.name || "",
        }] : [],
      };
    });

    return NextResponse.json({
      members: formattedMembers,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des membres:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer un nouveau membre (Résistant aux écarts d'interface utilisateur)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Données reçues pour créer un membre:", body);

    let {
      firstname,
      lastname,
      name, // Sert à intercepter "Nom complet" depuis l'UI
      email,
      position,
      role,
	  teamSlug,
      gender,
      phone,
      isTeamLeader,
      image,
      translations,
    } = body;

    // 1. Gestion adaptative du nom complet de l'UI
    if ((!firstname || !lastname) && name) {
      const parts = name.trim().split(" ");
      firstname = parts[0] || "Prénom";
      lastname = parts.slice(1).join(" ") || "Nom";
    }

    if (!email || !position || !gender || !firstname || !lastname) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants (Nom complet, email, position, genre)" },
        { status: 400 }
      );
    }

    // 2. Traduction robuste et normalisation du titre du poste (UI -> Enum Prisma)
    const normalizedPos = position.trim().toLowerCase();
    let prismaPosition: MemberPosition | undefined;

    if (normalizedPos.includes("professeur") || normalizedPos === "professor") {
      prismaPosition = MemberPosition.PROFESSOR;
    } else if (normalizedPos.includes("conférence") || normalizedPos.includes("associate")) {
      prismaPosition = MemberPosition.ASSOCIATE_PROFESSOR;
    } else if (normalizedPos.includes("assistant")) {
      prismaPosition = MemberPosition.ASSISTANT_PROFESSOR;
    } else if (normalizedPos.includes("chercheur") || normalizedPos.includes("researcher")) {
      prismaPosition = MemberPosition.RESEARCHER;
    } else if (normalizedPos.includes("doctorant") || normalizedPos.includes("phd")) {
      prismaPosition = MemberPosition.PHD_STUDENT;
    } else if (normalizedPos.includes("ingénieur") || normalizedPos.includes("engineer")) {
      prismaPosition = MemberPosition.ENGINEER;
    } else if (normalizedPos.includes("lecturer")) {
      prismaPosition = MemberPosition.LECTURER;
    } else if (normalizedPos.includes("master")) {
      prismaPosition = MemberPosition.MASTER_STUDENT;
    }

    if (!prismaPosition) {
      return NextResponse.json(
        { error: `La position "${position}" n'est pas reconnue par le système.` },
        { status: 400 }
      );
    }

    // 3. Normalisation linguistique du Genre (UI "Homme/Femme" -> Enum MALE/FEMALE)
    let prismaGender = gender;
    if (gender === "Homme" || gender?.toUpperCase() === "MALE") prismaGender = "MALE";
    if (gender === "Femme" || gender?.toUpperCase() === "FEMALE") prismaGender = "FEMALE";

    // Vérifier l'unicité de l'email
    const existingMember = await prisma.member.findUnique({
      where: { email },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Un membre avec cet email existe déjà" },
        { status: 409 }
      );
    }

    // Trouver l'équipe par son identifiant unique string (Slug / UUID)
    let team = null;
    if (teamSlug) {
      team = await prisma.team.findUnique({
        where: { slug: teamSlug },
      });
      if (!team) {
        return NextResponse.json(
          { error: `Équipe avec le slug "${teamSlug}" introuvable` },
          { status: 404 }
        );
      }
    }

    // Associer un compte utilisateur auth existant si disponible
    const user = await prisma.user.findUnique({
      where: { email },
    });

    const translationsData = [
      {
        language: "FR" as Language,
        bio: translations?.FR?.bio || "",
        institution: translations?.FR?.institution || "",
      },
      {
        language: "EN" as Language,
        bio: translations?.EN?.bio || "",
        institution: translations?.EN?.institution || "",
      },
    ];

    // Création de l'enregistrement en DB
    const newMember = await prisma.member.create({
      data: {
        firstname,
        lastname,
        email,
        phone,
        gender: prismaGender,
        position: prismaPosition,
        image,
        isTeamLeader: isTeamLeader || false,
        teamId: team?.id || null, 
        userId: user?.id || null, 
        translations: {
          create: translationsData,
        },
      },
      include: {
        translations: true,
        team: {
          include: {
            translations: {
              where: { language: "FR" },
            },
          },
        },
      },
    });

    // Optionnel: Mettre à jour le rôle système du compte Auth relié
  /*  if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "MEMBER" },
      });
    }
	*/
	
	// Mettre à jour le rôle système du compte Auth relié de manière sécurisée
	if (user) {
	  let finalRole: UserRole = UserRole.MEMBER;
	  let prismaRole: "ADMIN" | "MEMBER" | "AUTHOR" = "MEMBER";

	  // 1. If they are already an ADMIN, don't demote them!
	  if (user.role === "ADMIN") {
		finalRole = UserRole.ADMIN;
	  } 
	  // 2. Check if the UI explicitly requested the AUTHOR role
	  else if (body.role === "AUTHOR" || body.role === UserRole.AUTHOR) {
		finalRole = UserRole.AUTHOR;
	  }
	  // 3. Optional: Map specific academic positions to AUTHOR automatically
	  else if (prismaPosition === MemberPosition.PROFESSOR || prismaPosition === MemberPosition.RESEARCHER) {
		finalRole = UserRole.AUTHOR;
	  }

	  await prisma.user.update({
		where: { id: user.id },
		data: { role: finalRole },
	  });
	}

    const formattedMember = {
      id: newMember.id,
      firstname: newMember.firstname,
      lastname: newMember.lastname,
      email: newMember.email,
      phone: newMember.phone,
      image: newMember.image,
      gender: newMember.gender,
      position: newMember.position,
      isTeamLeader: newMember.isTeamLeader,
      createdAt: newMember.createdAt,
      bio: newMember.translations[0]?.bio || "",
      institution: newMember.translations[0]?.institution || "",
      team: newMember.team?.slug || null,
      teamName: newMember.team?.translations[0]?.name || "Aucune équipe",
    };

    return NextResponse.json(formattedMember, { status: 201 });
  } catch (error) {
    console.error("Erreur complète lors de la création du membre:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}