"use client";

interface TeamHeaderProps {
  team: {
    name: string;
    description?: string; // On accepte la description du JSON ici !
  };
  keywords: string;
}

export default function TeamHeader({ team, keywords }: TeamHeaderProps) {
  return (
    <div className="w-full max-w-5xl mx-auto font-sans antialiased">
      
      {/* Academic Top Category Indicator */}
      <div className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-3">
        Laboratoire LCSI / Équipes de Recherche
      </div>

      {/* Main Title Section with Blue Accent Line */}
      <div className="relative pb-5 mb-6">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
          {team.name}
        </h1>
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-mainBlue rounded-full"></div>
      </div>

      {/* AJOUT : Nouvelle Section pour la description détaillée du JSON */}
      {team.description && (
        <div className="w-full mb-8">
          <p className="text-base md:text-lg text-gray-700 leading-relaxed font-normal">
            {team.description}
          </p>
        </div>
      )}

      {/* INCREASED SIZE: Mots-clés & Domaines Section */}
      <div className="w-full mt-6 space-y-3">
        <h3 className="text-sm md:text-base uppercase tracking-wider font-extrabold text-mainBlue border-b border-gray-100 pb-2">
          Mots-clés & Domaines
        </h3>
        
        <p className="text-base md:text-lg text-gray-600 leading-relaxed font-normal pl-1">
          {keywords || "Les activités de recherche de cette équipe se concentrent sur les domaines d'application mentionnés ci-dessus."}
        </p>
      </div>

    </div>
  );
}