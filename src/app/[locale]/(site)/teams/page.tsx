"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import TeamDetailCard from "@/components/TeamDetailCard";

interface Team {
  id: string | number;
  slug: string;
  image: string;
  name_fr: string;
  name_en: string;
  description_fr: string | null;
  description_en: string | null;
  memberCount: number;
  publicationsCount?: number;
  projectCount?: number;
}

export default function TeamsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<string>("fr");
  const t = useTranslations("TeamsPage");

  useEffect(() => {
    // Résolution de la langue locale
    params.then((resolvedParams) => {
      setLocale(resolvedParams.locale);
    });

    const fetchTeams = async () => {
      try {
        const response = await fetch("/api/teams");
        const data = await response.json();
        setTeams(data.teams || []);
      } catch (error) {
        console.error("Erreur lors du chargement des équipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [params]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainBlue"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Conteneur principal de la liste des équipes */}
      <div className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Grille sur une seule colonne pour aligner tes cartes horizontales */}
          <div className="flex flex-col gap-12 lg:gap-16">
            {teams.map((team, index) => {
              // Sélection des textes selon la langue active
              const currentName = locale === "fr" ? team.name_fr : team.name_en;
              const currentDescription = locale === "fr"
                ? team.description_fr || ""
                : team.description_en || team.description_fr || "";

              // Préparation des données propres attendues par TeamDetailCard
              const teamData = {
                id: team.id,
                name: currentName,
                description: currentDescription,
                members: team.memberCount,
                // On s'assure de récupérer le bon compteur de l'API (publicationsCount ou projectCount)
                projects: team.publicationsCount || team.projectCount || 0,
                buttonText: t("buttonText"),
                image: team.image, // Transmet directement la clé brute ("ACTUAL.png" ou "ATLAS")
              };

              return (
                <div
                  key={team.id}
                  className="animate-fadeIn"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "both",
                  }}
                >
                  {/* On appelle le composant directement, c'est lui qui fait tout le design */}
                  <TeamDetailCard teamData={teamData} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}