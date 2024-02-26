"use client";
import Navbar from "@/app/components/Navbar";
import QuizCard from "@/app/components/QuizCard";
import fetcher from "@/libs/fetcher";
import { Quiz } from "@prisma/client";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import useSWR from "swr";

const Page = () => {
  const {status} = useSession()
  const router = useRouter();


  const { data: quizs ,mutate} = useSWR<Quiz[]>(`/api/Quizs`, fetcher);

  
    useEffect(() => {
      mutate();
    }, [mutate]);

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
      <div className="absolute top-[90px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {quizs?.map((quiz: Quiz) => (
          <div
            key={quiz.id}
            className="p-4"
            onClick={() => router.push(`/admin/edit/${quiz.id}`)}
          >
            <QuizCard
              id={quiz.id}
              category="Maths"
              title={quiz.Name}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
