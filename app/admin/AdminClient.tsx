"use client";

interface User {
  id: string;
  email: string;
  name: string;
  first_login_at: string;
  last_login_at: string;
  login_count: number;
}

function downloadCSV(users: User[]) {
  const header = "名前,メール,初回ログイン,最終ログイン,ログイン回数";
  const rows = users.map((u) =>
    [
      u.name,
      u.email,
      new Date(u.first_login_at).toLocaleDateString("ja-JP"),
      new Date(u.last_login_at).toLocaleDateString("ja-JP"),
      u.login_count,
    ].join(",")
  );
  const csv = "\uFEFF" + [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminClient({ users }: { users: User[] }) {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ユーザー管理</h1>
        <button
          onClick={() => downloadCSV(users)}
          className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          CSVダウンロード
        </button>
      </div>
      <p className="mb-4 text-gray-400">登録ユーザー数: {users.length}人</p>
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
            {users.map((user) => (
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
