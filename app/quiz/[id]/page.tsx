"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function QuizPage({ params }: any) {
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<any>({});
  const [score, setScore] = useState<number | null>(null);

  const userId = "USER_ID_DUMMY"; // nanti ambil dari auth

  useEffect(() => {
    axios.get(`/api/quiz/${params.id}`).then((res) => {
      setQuiz(res.data);
    });
  }, [params.id]);

  const handleSelect = (questionId: string, option: string) => {
    setAnswers({
      ...answers,
      [questionId]: option,
    });
  };

  const handleSubmit = async () => {
    const res = await axios.post("/api/quiz/submit", {
      userId,
      quizId: quiz.id,
      answers,
    });

    setScore(res.data.score);
  };

  if (!quiz) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto py-10">

      <h1 className="text-2xl font-bold mb-6">{quiz.title}</h1>

      {quiz.questions.map((q: any, index: number) => (
        <div key={q.id} className="mb-6 p-4 border rounded-xl">
          <p className="font-semibold">
            {index + 1}. {q.question}
          </p>

          <div className="mt-3 space-y-2">
            {q.options.map((opt: string, i: number) => (
              <button
                key={i}
                onClick={() => handleSelect(q.id, opt)}
                className={`block w-full text-left px-4 py-2 border rounded-lg ${
                  answers[q.id] === opt
                    ? "bg-blue-600 text-white"
                    : ""
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="bg-black text-white px-6 py-3 rounded-lg"
      >
        Submit Quiz
      </button>

      {score !== null && (
        <div className="mt-6 text-xl font-bold">
          Your Score: {score} / {quiz.questions.length}
        </div>
      )}
    </div>
  );
}