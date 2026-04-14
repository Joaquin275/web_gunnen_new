import { giftCardsDb } from "@/lib/db-json";
import GiftCardsClient from "./GiftCardsClient";

export default function AdminGiftCardsPage() {
  const giftCards = giftCardsDb.findAll();
  return <GiftCardsClient initialGiftCards={giftCards} />;
}
