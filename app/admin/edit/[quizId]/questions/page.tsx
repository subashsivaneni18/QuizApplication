"use client";
import Navbar from "@/app/components/Navbar";
import QuestionCard from "@/app/components/QuestionCard";
import fetcher from "@/libs/fetcher";
import { Box } from "@chakra-ui/react";
import { Question } from "@prisma/client";
import React from "react";
import useSWR from "swr";

const Page = ({ params }: { params: { quizId: string } }) => {
  const { data } = useSWR<Question[]>(
    `/api/questions/${params.quizId}`,
    fetcher
  );
  

  return (
    <Box  className="grid grid-cols-3">
      {data?.map((question: Question, index) => (
        <div key={question.id} className="flex flex-col gap-5">
          <div className="p-3">
            <QuestionCard
              Text={question.Text}
              answer={question.answer}
              id={question.id}
              options={question.options}
              Qno={index + 1}
            />
          </div>
        </div>
      ))}

      {data?.length===0 &&(
        <div className="w-screen h-screen flex items-center justify-center text-4xl font-semibold">
          <p>There Are No Questions</p>
        </div>
      )}
    </Box>
  );
};

export default Page;
