import Hero from "@/components/home/Hero";
import Experience from "@/components/home/Experience";
import FreshQuality from "@/components/home/FreshQuality";
import MenusPreview from "@/components/home/MenusPreview";
import PressPreview from "@/components/home/PressPreview";
import GiftCardBanner from "@/components/home/GiftCardBanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Experience />
      <FreshQuality />
      <MenusPreview />
      <PressPreview />
      <GiftCardBanner />
    </>
  );
}
