import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

const ADMIN_EMAIL = "koujikouji12@gmail.com";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.email !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("last_login_at", { ascending: false });

  return <AdminClient users={users ?? []} />;
}
