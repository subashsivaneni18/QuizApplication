"use client";
import React from "react";
import Navbar from "../components/Navbar";
import QuizCard from "../components/QuizCard";
import useSWR from "swr";
import fetcher from "@/libs/fetcher";
import { Quiz } from "@prisma/client";
import { redirect, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export const dynamic = "force-dynamic";
const QuizsPage = () => {
  const { data } = useSWR<Quiz[]>(`/api/Quizs`, fetcher);
  const router = useRouter()
  const {status} = useSession()

  if(status==='loading')
  {
    return (
      <div>
        <p>...Loading</p>
      </div>
    )
  }

  if(status==='unauthenticated')
  {
    return redirect('/')
  }



  return (
    <div className="relative">
      <Navbar />
      <div className="absolute top-[80px] z-10 p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.map((quiz) => (
          <div
            key={quiz.id}
            onClick={() => router.push(`/quiz/${quiz.id}/rules`)}
          >
            <QuizCard
              id={quiz.id}
              title={quiz.Name}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizsPage;
