"use client";

import { useTranslations } from "next-intl";

interface TeamDomainsProps {
  domains: string[];
}

export default function TeamDomains({ domains }: TeamDomainsProps) {
  const t = useTranslations();

  return (
    <div className="w-full mt-8 space-y-4">
      {/* UNIFIED HEADER: Styled exactly like Mots-clés & Nos expertises */}
      <div className="w-full">
        <h3 className="text-sm md:text-base uppercase tracking-wider font-extrabold text-mainBlue border-b border-gray-100 pb-2">
          {t("TeamDetail.domainsApplication", {
            defaultValue: "Nos domaines d'application",
          })}
        </h3>
      </div>

      {/* CLEAN LIST: No more weird translation offsets */}
      <ul className="space-y-3 pl-1 mt-3">
        {domains && domains.length > 0 ? (
          domains.map((domain, index) => (
            <li key={index} className="flex items-start text-base md:text-lg leading-relaxed">
              <span className="text-mainBlue mr-3 font-bold select-none">•</span>
              <span className="font-bold text-gray-900 capitalize">
                {domain}
              </span>
            </li>
          ))
        ) : (
          <p className="text-sm text-gray-400 italic pl-1">Aucun domaine spécifié.</p>
        )}
      </ul>
    </div>
  );
}