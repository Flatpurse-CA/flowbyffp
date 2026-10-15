import type { Metadata } from "next";
import Hub from "@/components/seo/Hub";
import { QUESTIONS } from "@/lib/seo/articles";
import { SITE_URL } from "@/lib/seo/facts";

export const metadata: Metadata = {
  title: { absolute: "Salon & Barbershop Owner Questions, Answered | FlatPurse Flow" },
  description: "Straight answers for Canadian salon and barbershop owners: software costs, no-shows, GST, commissions, Tap to Pay and win-backs.",
  alternates: { canonical: `${SITE_URL}/questions` },
};

export default function QuestionsHub() {
  return (
    <Hub
      href="/questions"
      title="Questions"
      intro="Straight answers to the questions Canadian salon and barbershop owners ask us most."
      groups={[{ links: QUESTIONS.map(q => ({ href: `/questions/${q.slug}`, label: q.title })) }]}
    />
  );
}
