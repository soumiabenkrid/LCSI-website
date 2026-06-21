"use client";

import { useState, useEffect, use } from "react";
import {
  TeamExpertises,
  TeamDomains,
  TeamValueAdded,
  TeamHeader,
  TeamMembers,
  TeamContact,
} from "@/components/Team";

// Importation de ton fichier JSON étendu
import teamsExtendedData from "@/data/teams-details.json";

interface PageProps {
  params: Promise<{ id: string; locale: string }> | any;
}

export default function TeamDetailPage({ params }: PageProps) {
  // Gestion de la compatibilité Next 14 / Next 15 pour récupérer les params d'URL
  const resolvedParams = params && typeof params.then === "function" ? use(params) : params;
  const urlParam = resolvedParams?.id || resolvedParams?.slug;
  const currentLocale = resolvedParams?.locale || "fr";

  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      if (!urlParam) return;
      try {
        setLoading(true);

        // 1. Récupération des données globales de l'équipe (depuis ton API)
        const response = await fetch(`/api/teams?language=${String(currentLocale).toUpperCase()}`);
        if (response.ok) {
          const data = await response.json();
          const cleanUrlId = decodeURIComponent(urlParam).trim().toLowerCase();

          const currentTeam = data.teams?.find((t: any) => {
            const cleanId = String(t.id || "").trim().toLowerCase();
            const cleanSlug = String(t.slug || "").trim().toLowerCase();
            return cleanId === cleanUrlId || cleanSlug === cleanUrlId;
          });

          if (currentTeam) {
            setTeam(currentTeam);

            // 2. Récupération des membres rattachés à cette équipe
            const membersResponse = await fetch(`/api/teams/${currentTeam.id}/members`);
            if (membersResponse.ok) {
              const membersData = await membersResponse.json();
              setMembers(membersData.members || []);
            }
          }
        }
      } catch (error) {
        console.error("Erreur détails équipe :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamDetails();
  }, [urlParam, currentLocale]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainBlue"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-white text-center">
        <p className="text-xl font-bold text-gray-800">Équipe introuvable.</p>
      </div>
    );
  }

  // ==================== DETECTION DU JSON ULTRA-SÉCURISÉE ====================
  const idKeyUpper = String(team.id || "").trim().toUpperCase();    // Exemple: "ACTUAL"
  const slugKeyLower = String(team.slug || "").trim().toLowerCase(); // Exemple: "actual"
  const idKeyRaw = String(team.id || "").trim();

  // On cherche dans le JSON avec toutes les clés possibles pour être sûr de matcher
  const jsonExtendedInfo = 
    (teamsExtendedData as Record<string, any>)[idKeyUpper] || 
    (teamsExtendedData as Record<string, any>)[slugKeyLower] || 
    (teamsExtendedData as Record<string, any>)[idKeyRaw];

  // Extraction robuste de la description (on teste tous les formats de JSON possibles)
  const finalDescription = 
    jsonExtendedInfo?.description?.[currentLocale] || 
    jsonExtendedInfo?.[currentLocale]?.description ||
    jsonExtendedInfo?.[currentLocale] || // Au cas où le texte est direct sous la langue
    team.description || 
    team.description_fr || 
    "";

  // Extraction robuste des Mots-clés
  const rawKeywords = 
    jsonExtendedInfo?.keywords?.[currentLocale] || 
    jsonExtendedInfo?.[currentLocale]?.keywords || 
    team.keywords || 
    [];
  const formattedKeywordsString = Array.isArray(rawKeywords) ? rawKeywords.join(", ") : String(rawKeywords);

  // Extraction robuste des Expertises
  const rawExpertises = 
    jsonExtendedInfo?.expertises?.[currentLocale] || 
    jsonExtendedInfo?.[currentLocale]?.expertises || 
    team.expertises || 
    [];
  
  // Transformation pour le composant TeamExpertises
  const expertisesFormatted = Array.isArray(rawExpertises)
    ? rawExpertises.map((exp: string) => ({ title: exp, description: "" }))
    : [];
  // =========================================================================

  // Données nettoyées envoyées à TeamHeader
  const teamForDisplay = {
    id: team.id,
    name: team.name || team.name_fr || "Équipe sans nom",
    description: finalDescription, // Reçoit bien la description du JSON !
    image: team.image || "",
  };

  const domains = team.domains || [];
  const valueAdded = team.valueAdded ? team.valueAdded.split("\n").filter((v: string) => v.trim()) : [];
  
  const membersFormatted = members.map((member: any) => ({
    id: member.id,
    name: `${member.firstname || ""} ${member.lastname || ""}`.trim() || member.name || "Membre",
    position: member.position || "Chercheur",
    gender: member.gender || "MALE",
    image: member.image,
  }));

  const teamLeader = members.find((m: any) => m.isTeamLeader);

  return (
    <>
      <div className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col gap-10 w-full">
            
            {/* Header avec la description enrichie issue du JSON */}
            <div className="w-full">
              <TeamHeader team={teamForDisplay} keywords={formattedKeywordsString} />
            </div>

            {/* Sections dynamiques reliées au JSON */}
            <div className="w-full space-y-10">
              {expertisesFormatted.length > 0 && <TeamExpertises expertises={expertisesFormatted} />}
              {domains.length > 0 && <TeamDomains domains={domains} />}
              {valueAdded.length > 0 && <TeamValueAdded valueAdded={valueAdded} />}
            </div>

          </div>
        </div>
      </div>

      <TeamMembers members={membersFormatted} />
      
      <TeamContact
        fullName={teamLeader ? `${teamLeader.firstname} ${teamLeader.lastname}` : ""}
        email={teamLeader && typeof teamLeader.email === "string" ? teamLeader.email : ""}
      />
    </>
  );
}