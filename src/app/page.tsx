import { Contact } from "@/components/home/Contact";
import { HearthBand } from "@/components/home/HearthBand";
import { Hero } from "@/components/home/Hero";
import { HowIBuild } from "@/components/home/HowIBuild";
import { MoreProjects } from "@/components/home/MoreProjects";
import { SelectedWork } from "@/components/home/SelectedWork";
import { StackSection } from "@/components/home/StackSection";
import { PageShell } from "@/components/layout/PageShell";

export default function Home() {
  return (
    <PageShell current="home">
      <Hero />
      <SelectedWork />
      <HearthBand />
      <MoreProjects />
      <HowIBuild />
      <StackSection />
      <Contact />
    </PageShell>
  );
}
