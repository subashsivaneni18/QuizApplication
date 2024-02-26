"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import QuizCard from "../components/QuizCard";

import { Quiz } from "@prisma/client";
import { redirect, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";

export const dynamic = "force-dynamic";
const QuizsPage = () => {

  const [ quizs,setQuizs] =useState<Quiz[]>([])
  const router = useRouter()
  const {status} = useSession()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/Quizs");
        setQuizs(response.data);
      } catch (error) {
        // Handle error if necessary
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);


  console.log(quizs)

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
        {quizs?.map((quiz) => (
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
