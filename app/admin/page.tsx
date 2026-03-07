import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

const ADMIN_EMAIL = "koujiikouji12@gmail.com";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.email !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("last_login_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">ユーザー管理</h1>
      <p className="mb-4 text-gray-400">登録ユーザー数: {users?.length ?? 0}人</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="border border-gray-700 p-3 text-left">名前</th>
              <th className="border border-gray-700 p-3 text-left">メール</th>
              <th className="border border-gray-700 p-3 text-left">初回ログイン</th>
              <th className="border border-gray-700 p-3 text-left">最終ログイン</th>
              <th className="border border-gray-700 p-3 text-left">ログイン回数</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="hover:bg-gray-800">
                <td className="border border-gray-700 p-3">{user.name}</td>
                <td className="border border-gray-700 p-3">{user.email}</td>
                <td className="border border-gray-700 p-3">
                  {new Date(user.first_login_at).toLocaleDateString("ja-JP")}
                </td>
                <td className="border border-gray-700 p-3">
                  {new Date(user.last_login_at).toLocaleDateString("ja-JP")}
                </td>
                <td className="border border-gray-700 p-3">{user.login_count}回</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
