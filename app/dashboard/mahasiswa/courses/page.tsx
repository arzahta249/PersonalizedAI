// app/dashboard/mahasiswa/courses/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Book, ArrowRight } from "lucide-react";

export default function CourseList() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch("/api/courses") // Kamu butuh API yang me-return semua course
      .then(res => res.json())
      .then(data => setCourses(data));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Mata Kuliah Kamu 📚</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course: any) => (
          <div key={course.id} className="bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Book size={24} />
            </div>
            <h3 className="font-bold text-lg">{course.title}</h3>
            <p className="text-slate-500 text-sm mt-1 mb-6 line-clamp-2">{course.description}</p>
            <Link href={`/dashboard/mahasiswa/courses/${course.id}`} className="flex items-center justify-center w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm gap-2 hover:bg-blue-600 transition-colors">
              Buka Kursus <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}