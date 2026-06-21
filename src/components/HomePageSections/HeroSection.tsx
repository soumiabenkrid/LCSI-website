"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { computerman, MatrixPoints } from "@/assets";
import { useParams } from "next/navigation";
import { ArrowRight, BookOpen, Users } from "lucide-react";

export default function HeroSection() {
  const t = useTranslations("HomePage");
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="relative overflow-hidden">
      <div className="md:flex lg:mt-8 2xl:container mx-auto gap-10 items-center">
        <div className="px-4 py-8 bg-transparent lg:z-20 lg:mt-14 w-3/5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-mainBlue/10 rounded-full mb-6">
            <span className="w-2 h-2 bg-mainBlue rounded-full animate-pulse" />
            <span className="text-sm font-medium text-mainBlue">
              Laboratoire de Recherche ESI
            </span>
          </div>
          
          <h1 className="font-integralCF font-bold text-2xl lg:text-[43px] lg:w-fit lg:leading-tight">
            {t("heroSection.lab_name")}
          </h1>
          
          <p className="font-poppins font-medium text-[14px] lg:text-[16px] text-darkgrayTxt mt-4 px-2 max-w-[600px] leading-relaxed">
            {t("heroSection.small_description")}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              href={`/${locale}/presentation`}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-mainBlue text-white rounded-xl hover:bg-mainBlue/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-mainBlue/20"
            >
              <BookOpen size={20} />
              <span className="font-medium">{t("heroSection.KnowMore")}</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href={`/${locale}/members`}
              className="group inline-flex items-center gap-2 px-6 py-3 border-2 border-mainBlue text-mainBlue rounded-xl hover:bg-mainBlue/5 transition-all duration-300"
            >
              <Users size={20} />
              <span className="font-medium">Nos Chercheurs</span>
            </Link>
          </div>
          
          {/* Stats */}
		  {/*
          <div className="flex gap-8 mt-10 pt-8 border-t border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-mainBlue">27+</div>
              <div className="text-sm text-darkgrayTxt font-medium">Chercheurs</div>
            </div>
        
			<div className="text-center">
              <div className="text-3xl font-bold text-mainBlue">200+</div>
              <div className="text-sm text-darkgrayTxt font-medium">Publications</div>
            </div>
            
			<div className="text-center">
              <div className="text-3xl font-bold text-mainBlue">5</div>
              <div className="text-sm text-darkgrayTxt font-medium">Équipes</div>
            </div>
          </div>
		   */}
		 </div>
       
        
        <div className="flex justify-end relative w-2/5">
          <div className="w-1/2 h-[350px] bg-gradient-to-br from-grayRectangle to-grayRectangle/70 lg:min-w-[370px] lg:h-[500px] rounded-bl-[60px]"></div>
          <Image
            src={computerman}
            alt="Computerman"
            className="w-full sm:max-w-[400px] h-[250px] object-cover lg:max-w-none lg:w-[800px] lg:h-[400px] drop-shadow-2xl"
            priority
          />
          <Image
            src={MatrixPoints}
            alt="Matrix Points"
            className="absolute right-[15px] bottom-[20px] w-[160px] h-[40px] lg:right-[110px] opacity-80"
            priority
          />
          
          {/* Floating decorative elements */}
          <div className="absolute top-10 right-20 w-16 h-16 bg-mainBlue/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-20 right-40 w-24 h-24 bg-blue-200/30 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
}
