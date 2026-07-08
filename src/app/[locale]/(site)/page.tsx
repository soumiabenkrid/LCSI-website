import {
  HeroSection,
  TeamsSection,
  ActualiteSection,
  //PublicationsSection,
  MembersSection,
} from "@/components/HomePageSections";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      {/*<TeamsSection />
      <PublicationsSection />
      <MembersSection />*/}
      <ActualiteSection />
    </>
  );
}
