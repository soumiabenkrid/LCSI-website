import { prisma } from "@/lib/prisma";

/**
 * Vérifie si un utilisateur est auteur d'une publication
 */
export async function isUserAuthorOfPublication(
  userEmail: string,
  publicationId: number // 💡 Changed from string to number
): Promise<boolean> {
  try {
    // Trouver le membre correspondant à l'email
    const member = await prisma.member.findFirst({
      where: { email: userEmail },
    });

    if (!member) {
      return false;
    }

    // Vérifier si le membre est auteur de cette publication
    const authorRelation = await prisma.publicationAuthor.findFirst({
      where: {
        publicationId: publicationId, // 💡 Prisma will now accept this safely as a number
        authorId: member.id,
      },
    });

    return !!authorRelation;
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de l'auteur de la publication:",
      error
    );
    return false;
  }
}

/**
 * Vérifie si un utilisateur peut modifier/supprimer une publication
 * Admin : peut tout faire
 * Member : peut modifier/supprimer seulement ses publications
 */
export async function canUserModifyPublication(
  userEmail: string,
  userRole: string,
  publicationId: number // 💡 Changed from string to number
): Promise<boolean> {
  // Admin peut tout faire
  if (userRole === "ADMIN") {
    return true;
  }

  // Member : vérifier s'il est auteur
  if (userRole === "MEMBER" || userRole === "AUTHOR") { // Added AUTHOR just in case your app uses it
    return await isUserAuthorOfPublication(userEmail, publicationId);
  }

  return false;
}