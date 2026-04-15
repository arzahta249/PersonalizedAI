"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CreateCoursePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!title || !description || !level || !category) {
      toast.error("Semua field wajib diisi.");
      return;
    }

    try {
      const res = await fetch("/api/dosen/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // ✅ penting
        },
        body: JSON.stringify({
          title,
          description,
          level,
          category,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Gagal membuat course.");
        return;
      }

      toast.success("Course berhasil dibuat.");
      router.push("/dashboard/dosen/courses");
    } catch (error) {
      console.error(error);
      toast.error("Terjadi error saat membuat course.");
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-bold mb-4">Tambah Course</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* TITLE */}
        <input
          type="text"
          placeholder="Title"
          className="w-full border p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* DESCRIPTION */}
        <textarea
          placeholder="Description"
          className="w-full border p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* LEVEL */}
        <select
          className="w-full border p-2"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="">Pilih Level</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>

        {/* CATEGORY */}
        <input
          type="text"
          placeholder="Category (Web, AI, Mobile)"
          className="w-full border p-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Create Course
        </button>
      </form>
    </div>
  );
}
