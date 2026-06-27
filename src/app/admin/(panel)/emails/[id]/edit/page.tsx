import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import EmailForm from "../../EmailForm";

export default async function EditEmailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data } = await admin
    .from("email_sequences")
    .select("id, name, subject, body, delay_days, is_active")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return <EmailForm initial={data} />;
}
