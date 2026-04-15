"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((res) => res.json())
      .then(setUser);
  }, []);

  if (!user) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-xl shadow max-w-md">

        <h1 className="text-xl font-bold mb-4">
          Detail User
        </h1>

        <div className="space-y-3">

          <div>
            <p className="text-gray-500 text-sm">Nama</p>
            <p className="font-semibold">{user.name}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Email</p>
            <p className="font-semibold">{user.email}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">NPM</p>
            <p className="font-semibold text-blue-600">
              {user.npm || "-"}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Role</p>
            <p className="font-semibold">{user.role}</p>
          </div>

        </div>

      </div>
    </div>
  );
}