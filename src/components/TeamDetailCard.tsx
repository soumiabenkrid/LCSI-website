"use client";

import Link from "next/link";
import Image from "next/image";

// Importations directes de tes images
import ACTUAL from "@/assets/ACTUAL.png"; 
import ATLAS from "@/assets/ATLAS.png";    
import MA from "@/assets/MA.png";       
import PRINT from "@/assets/PRINT.png";   
import IDEAS from "@/assets/IDEAS.png";    
import DDD from "@/assets/DDD.png"; 

interface TeamDetailCardProps {
  teamData: {
    id: number | string;
    slug: string;
    name: string;
    description: string;
    valueAdded?: string;
    keywords: string[];
    domains: string[];
    expertises: string[];
    members: number;
    projects: number;
    buttonText: string;
    image: string; // Reçu depuis le fichier parent
  };
}

export default function TeamDetailCard({ teamData }: TeamDetailCardProps) {
  // Correspondance stricte pour tes images locales
  const imageMap: Record<string, any> = {
    "actual": ACTUAL,
    "atlas": ATLAS,
    "print": PRINT,
    "ma": MA,
    "ideas": IDEAS,
  };

  // Nettoyage de la clé (ex: "ACTUAL.png" -> "actual")
  const rawImageName = teamData?.image ? String(teamData.image).toLowerCase() : "";
  const cleanImageKey = rawImageName.replace(".png", "").trim();

  // Association de l'image ou secours sur DDD
  const resolvedImage = imageMap[cleanImageKey] || DDD;

  const formatList = (items: any) => {
    if (!items) return "";
    if (Array.isArray(items)) return items.join(", ");
    return String(items);
  };

  return (
    <div className="w-full font-sans antialiased bg-white pb-12 mb-8 border-b border-gray-100 last:border-0 flex flex-col lg:flex-row gap-8 items-stretch">
      
      {/* GAUCHE : Bloc Image (prend 40% de l'espace sur grand écran) */}
      <div className="w-full lg:w-[40%] relative min-h-[250px] lg:min-h-full rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
        <Image
          src={resolvedImage} 
          alt={teamData.name}
          fill
          sizes="(max-w: 1024px) 100vw, 40vw"
          className="object-contain p-4" // object-contain respecte le format d'origine de ton logo sans le déformer
          priority
        />
      </div>

      {/* DROITE : Bloc Contenu (prend 60% de l'espace) */}
      <div className="w-full lg:w-[60%] flex flex-col justify-between">
        <div>
          {/* 1. Academic Top Branding Label */}
          <div className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-2">
            Laboratoire LCSI / Équipes de Recherche
          </div>

          {/* 2. Full Width Header Section */}
          <div className="relative pb-4 mb-6 w-full">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {teamData.name}
            </h2>
            <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-mainBlue rounded-full"></div>
          </div>

          {/* Description de l'équipe */}
          {teamData.description && (
            <p className="text-sm md:text-base text-gray-600 leading-relaxed font-normal mb-6">
              {teamData.description}
            </p>
          )}

          {/* 3. Mots-clés & Domaines Section */}
          {teamData.keywords && teamData.keywords.length > 0 && (
            <div className="w-full space-y-2 mb-6 block">
              <h3 className="text-xs uppercase tracking-wider font-bold text-mainBlue border-b border-gray-100 pb-1.5 w-full">
                Mots-clés & Domaines
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed font-normal">
                {formatList(teamData.keywords)}
              </p>
            </div>
          )}

          {/* 4. Nos Expertises Section */}
          {teamData.expertises && teamData.expertises.length > 0 && (
            <div className="w-full space-y-2 mb-6 block">
              <h3 className="text-xs uppercase tracking-wider font-bold text-mainBlue border-b border-gray-100 pb-1.5 w-full">
                Nos expertises
              </h3>
              <ul className="space-y-1.5 pl-1">
                {teamData.expertises.map((item: string, i: number) => (
                  <li key={i} className="flex items-start text-sm text-gray-600 font-medium">
                    <span className="text-mainBlue mr-2 select-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 5. Bottom Navigation & Metric Row Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-50 mt-4">
          {/* Counters */}
          <div className="flex gap-6 text-xs font-semibold text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="text-mainBlue">●</span> 
              <span>{teamData.members} Membres</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-mainBlue">●</span> 
              <span>{teamData.projects} Publications</span>
            </div>
          </div>

          {/* Dynamic Details Router Action Link Button */}
          <Link
            href={`/teams/${teamData.id}`}
            className="text-xs font-bold uppercase tracking-wider px-6 py-3 bg-mainBlue text-white rounded shadow-sm hover:bg-opacity-95 transition-all duration-200"
          >
            {teamData.buttonText || "Savoir Plus"}
          </Link>
        </div>
      </div>

    </div>
  );
}