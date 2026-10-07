import { Ambient } from "@/components/sections/ambient/ambient";
import { Chip } from "@/components/sections/chip/chip";
import { Finale } from "@/components/sections/finale/finale";
import { Intro } from "@/components/sections/intro/intro";
import { Machine } from "@/components/sections/machine/machine";
import { Network } from "@/components/sections/network/network";
import { Personal } from "@/components/sections/personal/personal";

export default function Home() {
  return (
    <main>
      <Intro />
      <Machine />
      <Chip />
      <Personal />
      <Network />
      <Ambient />
      <Finale />
    </main>
  );
}
