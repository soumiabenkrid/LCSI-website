import { Mail, Printer, MapPin, Phone } from "lucide-react";
export default function ContactComp() {
  const contact = [
    {
      icon: <Mail className="w-4 h-4 text-mainBlue" />,
      text: "lcsi@esi.dz",
    },
    {
      icon: <Phone className="w-4 h-4 text-mainBlue" />,
      text: "+213 (0) 23 93 91 32",
    },
    {
      icon: <Printer className="w-4 h-4 text-mainBlue" />,
      text: "+213(0) 23 93 91 34​",
    },
    {
      icon: <MapPin className="w-4 h-4 text-mainBlue" />,
      text: "BP 68M, Oued Smar, 16309 Alger, Algérie",
    },
  ];

  return (
    <div className={`w-full lg:border-b-[2px] lg:border-grayBorder lg:bg-white  `}>
      <div className="flex lg:justify-end lg:items-center gap-3 lg:flex-wrap flex-col lg:flex-row lg:py-2 lg:px-4 py-4 container mx-auto">
        {contact.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-[6px] lg:border-r-[2px] lg:pr-2 lg:border-grayBorder lg:last:border-r-0"
          >
            <div className="">{item.icon}</div>
            <span className="text-[#7C7C7C] lg:text-[13px] text-[12px]">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
