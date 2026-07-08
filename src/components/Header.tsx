"use client";

import ContactComp from "./ContactComp";
import Image from "next/image";
import { logo } from "@/assets";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import { Menu, LogIn, LayoutDashboard } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { usePathname, useParams } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const t = useTranslations("Header");
  const { user, isLoading } = useAuth();
  const params = useParams();
  const locale = params.locale as string;
 //   { key: "publications", href: "/publications" },
  const navItems = [
    { key: "presentation", href: "/presentation" },
    { key: "teams", href: "/teams" },
 
    { key: "members", href: "/members" },
    { key: "news", href: "/news" },
  ];
  const page = usePathname().split("/")[2];

  return (
    <Sheet>
      <div className="hidden lg:block">
        <ContactComp />
      </div>
      <header className="bg-white border-b-[2px] border-grayBorder w-full">
        {/* lcsi logo */}
        <div className="container mx-auto px-4 py-4 flex justify-between items-center w-full">
          <Link href={"/"} className="pl-5">
            <Image src={logo} alt="Logo" width={75} height={50} />
          </Link>
          {/* Navigation bar -- Desktop */}
          <div className="hidden lg:block ">
            <div className="flex gap-3 items-center">
              {/* Navigation items */}
              <nav className="container mx-auto px-4 py-2">
                <ul className="flex gap-8 justify-end items-center">
                  {navItems.map((item) => (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        className={`${
                          page == item.key ? "text-mainBlue" : "text-black"
                        } hover:text-mainBlue transition-colors duration-200 font-medium`}
                      >
                        {t(`nav.${item.key}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              {/* lang switcher */}
              <LanguageSwitcher />

              {/* Auth Buttons */}
              <div className="flex items-center gap-2 ml-4">
                {isLoading ? (
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                ) : user ? (
                  <Link
                    href="/dash"
                    className="flex items-center gap-2 px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <LayoutDashboard size={18} />
                    )}
                    <span className="font-medium text-sm">Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="flex items-center gap-2 px-4 py-2 text-mainBlue border border-mainBlue rounded-lg hover:bg-mainBlue/5 transition-all duration-200"
                  >
                    <LogIn size={18} />
                    <span className="font-medium text-sm">Connexion</span>
                  </Link>
                )}
              </div>
            </div>
            {/* Navigation sidbar -- phone / tablet screeen */}
          </div>
          <div className="lg:hidden">
            <SheetTrigger className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-200">
              <Menu className="w-6 h-6 text-mainBlue" />
            </SheetTrigger>
          </div>
          <SheetTitle className="sr-only"></SheetTitle>
          <SheetContent
            side="right"
            className="min-w-1/2 w-64 bg-white border-l-2 border-grayBorder"
          >
            <div className="flex flex-col gap-3 p-4 mt-12">
              {/* Auth Buttons - Mobile */}
              <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-grayBorder">
                {isLoading ? (
                  <div className="w-full h-10 rounded-lg bg-gray-200 animate-pulse" />
                ) : user ? (
                  <Link
                    href="/dash"
                    className="flex items-center gap-3 px-4 py-3 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-all duration-200"
                  >
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <LayoutDashboard size={20} />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">Dashboard</span>
                      <span className="text-xs text-white/70">
                        {user.email}
                      </span>
                    </div>
                  </Link>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="flex items-center justify-center gap-2 px-4 py-3 text-mainBlue border border-mainBlue rounded-lg hover:bg-mainBlue/5 transition-all duration-200"
                  >
                    <LogIn size={18} />
                    <span className="font-medium">Connexion</span>
                  </Link>
                )}
              </div>

              {/* Navigation items */}
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="text-black w-fit hover:text-mainBlue transition-colors duration-200 font-medium relative"
                  >
                    <span
                      className={`absolute ${
                        page == item.key ? "w-1/2" : "w-0 "
                      } h-1 bg-mainBlue -bottom-[4px] transition-all duration-200 `}
                    ></span>
                    {t(`nav.${item.key}`)}
                  </Link>
                ))}
              </nav>
              <div className="mt-7">
                {/* Contact info */}
                <h2 className="text-darkgrayTxt font-semibold">Contact</h2>
                <ContactComp />
                {/* lang switcher */}
                <h2 className="text-darkgrayTxt font-semibold mb-2">
                  {t("nav.language")}
                </h2>
                <LanguageSwitcher />
              </div>
            </div>
            <SheetFooter></SheetFooter>
          </SheetContent>
        </div>
      </header>
    </Sheet>
  );
}
