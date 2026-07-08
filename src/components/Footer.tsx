import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import logo from "@/assets/logo.png";

export default function Footer() {
  const t = useTranslations("HomePage");
  const tFooter = useTranslations("Footer");

  return (
    <>
      <br />
      <br />
      <footer className="bg-[#E6F0FF] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo et description */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center mb-4">
                <Image
                  src={logo}
                  alt="LCSI LAB"
                  width={80}
                  height={80}
                  className="mr-3"
                  loading="lazy"
                />
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t("heroSection.small_description")}
              </p>
            </div>

            {/* Info Section */}
            <div className="col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {tFooter("info.title")}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {tFooter("info.address")}
                  </p>
                  <p className="text-sm text-gray-600">
                    BP 68M, Oued Smar,
                    <br />
                    16309 Alger, Algérie
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {tFooter("info.fax")}
                  </p>
                  <p className="text-sm text-gray-600">+213(0) 23 93 91 34​</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {tFooter("info.tel")}
                  </p>
                  <p className="text-sm text-gray-600">+213 (0) 23 93 91 32</p>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {tFooter("contact.title")}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {tFooter("contact.director")}
                  </p>
                  <Link
                    href="mailto:h_haddadou@esi.dz"
                    className="text-sm text-mainBlue"
                  >
                    h_haddadou@esi.dz
                  </Link>
                </div>
              </div>
            </div>

            {/* Explorer plus Section */}
            <div className="col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {tFooter("explore.title")}
              </h3>
              <div className="space-y-2">
                <Link
                  href="/presentation"
                  className="block text-sm text-gray-600 hover:text-mainBlue transition-colors"
                >
                  {tFooter("explore.presentation")}
                </Link>
                <Link
                  href="/teams"
                  className="block text-sm text-gray-600 hover:text-mainBlue transition-colors"
                >
                  {tFooter("explore.teams")}
                </Link>
                <Link
                  href="/publications"
                  className="block text-sm text-gray-600 hover:text-mainBlue transition-colors"
                >
                  {tFooter("explore.publications")}
                </Link>
                <Link
                  href="/members"
                  className="block text-sm text-gray-600 hover:text-mainBlue transition-colors"
                >
                  {tFooter("explore.members")}
                </Link>
                <Link
                  href="/news"
                  className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {tFooter("explore.news")}
                </Link>
                
                {/* Link to the Old Website added here */}
                <a
                  href="/OldWebsite/index.htm" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-gray-600 hover:text-mainBlue transition-colors font-medium border-t border-gray-200/60 pt-2 mt-2"
                >
                  {tFooter("explore.oldVersion")} 
                </a>
              </div>
            </div>
          </div>

          {/* Ligne de séparation et copyright */}
          <div className="border-t border-gray-200 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} LCSI LAB.{" "}
                {tFooter("legal.copyright")}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}