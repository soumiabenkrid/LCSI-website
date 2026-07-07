import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, validateEsiEmail } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { Gender, MemberPosition, UserRole } from "@/generated/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          error:
            "Inscription publique désactivée. Seuls les administrateurs peuvent créer des comptes.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    console.log("Données d'inscription reçues:", body);
    
    const { email, password, name, role, gender, position } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate ESI email
    if (!validateEsiEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Seuls les emails @esi.dz sont autorisés" },
        { status: 400 },
      );
    }

    // 1. FIX: Check if user already exists in the User authentication table
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte utilisateur existe déjà avec cet email" },
        { status: 409 },
      );
    }

    // 2. FIX: Check if a profile already exists in the Member directory table (Prevents P2002!)
    const existingMember = await prisma.member.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Un membre de l'annuaire est déjà enregistré avec cet email" },
        { status: 409 },
      );
    }

    // 3. FIX: Safely parse French or custom variations from UI dropdowns to precise backend Enums
    let selectedRole: UserRole = UserRole.MEMBER;
    if (role === "ADMIN" || role?.toUpperCase() === "ADMIN") {
      selectedRole = UserRole.ADMIN;
    } else if (role === "AUTHOR" || role?.toUpperCase() === "AUTHOR") {
      selectedRole = UserRole.AUTHOR;
    }

    let selectedGender: Gender = Gender.MALE;
    if (gender === "Femme" || gender === "FEMALE" || gender?.toUpperCase() === "FEMALE") {
      selectedGender = Gender.FEMALE;
    }

    // Map localized string variants smoothly to positions
    let selectedPosition: MemberPosition = MemberPosition.ASSOCIATE_PROFESSOR;
    if (position) {
      const normalizedPos = position.trim().toLowerCase();
      if (normalizedPos.includes("professeur") || normalizedPos === "professor") {
        selectedPosition = MemberPosition.PROFESSOR;
      } else if (normalizedPos.includes("conférence") || normalizedPos.includes("associate")) {
        selectedPosition = MemberPosition.ASSOCIATE_PROFESSOR;
      } else if (normalizedPos.includes("assistant")) {
        selectedPosition = MemberPosition.ASSISTANT_PROFESSOR;
      } else if (normalizedPos.includes("chercheur") || normalizedPos.includes("researcher")) {
        selectedPosition = MemberPosition.RESEARCHER;
      } else if (normalizedPos.includes("doctorant") || normalizedPos.includes("phd")) {
        selectedPosition = MemberPosition.PHD_STUDENT;
      } else if (normalizedPos.includes("ingénieur") || normalizedPos.includes("engineer")) {
        selectedPosition = MemberPosition.ENGINEER;
      } else if (normalizedPos.includes("lecturer")) {
        selectedPosition = MemberPosition.LECTURER;
      } else if (normalizedPos.includes("master")) {
        selectedPosition = MemberPosition.MASTER_STUDENT;
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    const normalizedName = (name || "").trim();
    const nameParts = normalizedName.split(/\s+/).filter(Boolean);
    const firstname = nameParts[0] || "Prénom";
    const lastname = nameParts.slice(1).join(" ") || "Nom";

    // Create user and matching member profile in one atomic transaction
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: normalizedName || null,
          role: selectedRole,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      await tx.member.create({
        data: {
          email: createdUser.email,
          firstname,
          lastname,
          gender: selectedGender,
          position: selectedPosition,
          userId: createdUser.id,
          isMember: true, // Auto-mark as true since they are created directly by an Admin
        },
      });

      return createdUser;
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    // 🔽 PASTE IT RIGHT HERE 🔽
    console.error("❌ REGISTRATION DATABASE CRASH DETECTED:");
    console.error("Error Code:", error?.code); 
    console.error("Duplicate Target Field:", error?.meta?.target); 
    console.error("Full Error Object:", JSON.stringify(error, null, 2));

    return NextResponse.json({ 
      error: "Erreur serveur", 
      details: error?.message || "Erreur de contrainte de clé unique",
      targetField: error?.meta?.target || "Inconnu"
    }, { status: 500 });
  } // This is the final bracket of your POST function
}