"use client";

import { useTranslations } from "next-intl";

interface Expertise {
  title: string;
  description: string;
}

interface TeamExpertisesProps {
  expertises: Expertise[];
}

export default function TeamExpertises({ expertises }: TeamExpertisesProps) {
  const t = useTranslations();

  return (
    <div className="w-full mt-8 space-y-4">
      
      {/* MATCHING STYLE: Title formatted exactly like Mots-clés section */}
      <div className="w-full">
        <h3 className="text-sm md:text-base uppercase tracking-wider font-extrabold text-mainBlue border-b border-gray-100 pb-2">
          {t("TeamDetail.expertises", { defaultValue: "Nos expertises" })}
        </h3>
      </div>

      {/* Clean list view */}
      <ul className="space-y-3 pl-1 mt-3">
        {expertises && expertises.length > 0 ? (
          expertises.map((expertise, index) => (
            <li key={index} className="flex items-start text-base md:text-lg leading-relaxed">
              <span className="text-mainBlue mr-3 font-bold select-none">•</span>
              <div>
                <span className="font-bold text-gray-900 mr-1.5 capitalize">
                  {expertise.title}
                </span>
                {expertise.description && (
                  <span className="text-gray-600 font-normal">
                    - {expertise.description}
                  </span>
                )}
              </div>
            </li>
          ))
        ) : (
          <p className="text-sm text-gray-400 italic pl-1">Aucune expertise spécifiée.</p>
        )}
      </ul>

    </div>
  );
}