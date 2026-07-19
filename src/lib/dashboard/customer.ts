import { createClient } from "@/lib/supabase/server";

export type CustomerContext = {
  customerId: string; userId: string; fullName: string; email: string; phone: string | null;
  dateOfBirth: string | null;
};

export async function getCustomerContext(): Promise<CustomerContext | null> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data: customer } = await supabase
    .from("customers")
    .select("id, full_name, email, phone, date_of_birth")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!customer) return null;

  return {
    customerId: customer.id as string,
    userId: userData.user.id,
    fullName: customer.full_name as string,
    email: customer.email as string,
    phone: customer.phone as string | null,
    dateOfBirth: customer.date_of_birth as string | null,
  };
}

export async function requireCustomer() {
  const supabase = await createClient();
  const ctx = await getCustomerContext();
  if (!ctx) throw new Error("Not signed in as a customer");
  return { supabase, ...ctx };
}
