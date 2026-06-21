"use client";

import { users, file } from "@/assets"; 
import Image from "next/image";
import Link from "next/link";

// 1. Direct, precise imports matching your file system
import ACTUAL from "@/assets/ACTUAL.png"; 
import ATLAS from "@/assets/ATLAS.png";    
import MA from "@/assets/MA.png";       
import PRINT from "@/assets/PRINT.png";   
import IDEAS from "@/assets/IDEAS.png";      
import DDD from "@/assets/DDD.png"; 

export default function TeamComp({
  teamData,
}: {
  teamData: {
    id: string;
    name: string;
    description: string;
    members: number;
    projects: number;
    buttonText: string;
    image: string;
  };
}) {
  
  // 2. Map database strings to the imported objects
  const imageMap: Record<string, any> = {
    "actual": ACTUAL,
    "atlas": ATLAS,
    "print": PRINT,
    "ma": MA,
    "ideas": IDEAS,
  };

  // 3. Normalize the incoming database string
  const rawImageName = teamData?.image ? String(teamData.image).toLowerCase() : "";
  const cleanImageKey = rawImageName.replace(".png", "").trim();
  const resolvedImage = imageMap[cleanImageKey] || DDD;

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col rounded-[15px] bg-white border border-gray-100 shadow-sm shrink-0 h-[500px] select-none lg:cursor-grab xl:cursor-auto overflow-hidden">
      
      {/* Image container handles logos cleanly without stretching */}
      <div className="w-[321.27px] h-[194.87px] bg-gray-50 flex items-center justify-center p-4 rounded-t-[15px]">
        <Image
          src={resolvedImage} // 4. Passing resolved dynamic image asset
          alt={teamData.name}
          width={321.27}
          height={194.87}
          className="w-full h-full object-contain mix-blend-multiply select-none"
          onDragStart={handleDragStart}
          onMouseDown={handleMouseDown}
          draggable={false}
          priority
        />
      </div>

      <div className="pl-6 pr-6 flex flex-col justify-between gap-4 flex-1 py-6 max-w-[321.27px]">
        <div className="flex flex-col gap-4">
          <div className="flex gap-5 w-fit">
            <div className="flex gap-2 items-center">
              <Image
                src={users}
                alt="Users"
                width={20}
                height={20}
              />
              <span className="text-[14px] font-semibold text-darkgrayTxt">
                {teamData.members}
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <Image
                src={file}
                alt="File"
                width={20}
                height={20}
                className="w-5 h-5"
              />
              <span className="text-[14px] font-semibold text-darkgrayTxt">
                {teamData.projects}
              </span>
            </div>
          </div>
          <div className="w-fit flex flex-col gap-1.5">
            <h2 className="font-bold text-black text-[17px] line-clamp-1">
              {teamData.name}
            </h2>
            <p className="text-[14px] text-[#676767] font-medium line-clamp-4">
              {teamData.description}
            </p>
          </div>
        </div>
        <Link
          href={`/teams/${teamData.id}`}
          className="inline-block text-[12px] px-3 py-1.5 text-mainBlue border border-mainBlue rounded-md w-fit font-semibold hover:bg-blue-50 transition-colors duration-200"
        >
          {teamData.buttonText}
        </Link>
      </div>
    </div>
  );
}