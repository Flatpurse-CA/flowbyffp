import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticle } from "@/lib/seo/articles";
import { ArticleView, articleMetadata, articleParams } from "@/components/seo/ArticlePage";

export const dynamicParams = false;

export function generateStaticParams() {
  return articleParams("question");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return articleMetadata("question", (await params).slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const article = getArticle("question", (await params).slug);
  if (!article) notFound();
  return <ArticleView article={article} />;
}
