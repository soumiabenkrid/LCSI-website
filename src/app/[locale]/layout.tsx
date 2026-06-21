import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import ProfileCheckWrapper from "@/components/ProfileCheckWrapper";
import localFont from "next/font/local";

const poppins = Poppins({
  weight: ['300', '400', '500', '700'], 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

const integralCF = localFont({
  src: [
    {
      path: "../../../public/fonts/Fontspring-DEMO-integralcf-regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Fontspring-DEMO-integralcf-medium.otf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-integralCF",
});

export const metadata: Metadata = {
  title: "LCSI Lab",
  description: "Innovation et Recherche",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className={`${poppins.variable} ${integralCF.variable} font-poppins antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <ProfileCheckWrapper>
            <NextIntlClientProvider>{children}</NextIntlClientProvider>
          </ProfileCheckWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}