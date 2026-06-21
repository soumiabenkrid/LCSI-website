"use client";

import { useTranslations } from "next-intl";

interface TeamValueAddedProps {
  valueAdded: string[];
}

export default function TeamValueAdded({ valueAdded }: TeamValueAddedProps) {
  const t = useTranslations();

  return (
    <div className="w-full mt-8 space-y-4">
      {/* UNIFIED HEADER: Formatted exactly like Mots-clés, Expertises, and Domaines */}
      <div className="w-full">
        <h3 className="text-sm md:text-base uppercase tracking-wider font-extrabold text-mainBlue border-b border-gray-100 pb-2">
          {t("TeamDetail.valueAdded", {
            defaultValue: "Notre valeur ajoutée",
          })}
        </h3>
      </div>

      {/* CLEAN LIST: Consistent text size, brand blue bullet, and layout alignment */}
      <ul className="space-y-3 pl-1 mt-3">
        {valueAdded && valueAdded.length > 0 ? (
          valueAdded.map((value, index) => (
            <li key={index} className="flex items-start text-base md:text-lg leading-relaxed">
              <span className="text-mainBlue mr-3 font-bold select-none">•</span>
              <span className="font-normal text-gray-700">
                {value}
              </span>
            </li>
          ))
        ) : (
          <p className="text-sm text-gray-400 italic pl-1">Aucune valeur ajoutée spécifiée.</p>
        )}
      </ul>
    </div>
  );
}