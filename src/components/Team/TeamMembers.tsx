"use client";

import MemberComp from "@/components/MemberComp";
import { useTranslations } from "next-intl";
import Link from "next/dist/client/link";

interface Member {
  id: string;
  name: string;
  position: string;
  gender: "MALE" | "FEMALE";
  image?: string;
}

interface TeamMembersProps {
  members: Member[];
}

export default function TeamMembers({ members }: TeamMembersProps) {
  const t = useTranslations();

  return (
    <div className="w-full mt-12 space-y-6">
      {/* En-tête unifié */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-sm md:text-base uppercase tracking-wider font-extrabold text-mainBlue border-b border-gray-100 pb-2">
          {t("TeamsPage.members", { defaultValue: "Membres de l'équipe" })}
        </h3>
      </div>

      {/* FIX : Suppression de flex, overflow-x-scroll et w-screen. 
          Affichage direct en grille propre de 1 colonne sur mobile à 4 colonnes sur desktop. */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 justify-start">
        {members && members.length > 0 ? (
          members.map((member) => (
            <div key={member.id} className="w-full">
              <Link href={`/members/${member.id}`} className="block hover:opacity-95 transition-opacity">
                <MemberComp member={member} />
              </Link>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 italic col-span-full py-4">
            Aucun membre trouvé pour cette équipe.
          </p>
        )}
      </div>
    </div>
  );
}