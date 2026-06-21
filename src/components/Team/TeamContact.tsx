"use client";

import { User, Home } from "lucide-react";
import { useTranslations } from "next-intl";

interface TeamLeader {
  fullName: string;
  email: string;
}

export default function TeamContact(tl: TeamLeader) {
  const t = useTranslations('TeamContact');

  return (
    <div className="w-full mt-12 mb-16 space-y-6">
      {/* Unified Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-sm md:text-base uppercase tracking-wider font-extrabold text-mainBlue border-b border-gray-100 pb-2">
          {t("title", { defaultValue: "Contact & Localisation" })}
        </h3>
      </div>

      {/* Grid container styled exactly like the members section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* Card 1: Team Leader (Matches Member card design) */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-mainBlue/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-mainBlue" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-0.5">
              {t("teamLeader")}
            </span>
            <h4 className="font-bold text-gray-900 text-base truncate">
              {tl.fullName || "Non spécifié"}
            </h4>
            {tl.email && (
              <a href={`mailto:${tl.email}`} className="text-xs text-mainBlue hover:underline block truncate mt-0.5 font-medium">
                {tl.email}
              </a>
            )}
          </div>
        </div>

        {/* Card 2: Laboratory / Team Location (Matches Member card design) */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-mainBlue/10 flex items-center justify-center flex-shrink-0">
            <Home className="w-5 h-5 text-mainBlue" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-0.5">
              {t("teamEmail")}
            </span>
            <a href="mailto:lcsi@esi.dz" className="font-bold text-gray-900 text-base block hover:text-mainBlue transition-colors">
              lcsi@esi.dz
            </a>
            <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
              {t("info")}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}