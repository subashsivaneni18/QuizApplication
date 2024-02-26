import Navbar from "@/app/components/Navbar";
import { Question} from "@prisma/client";
import React from "react";
import prisma from '@/libs/prismadb'
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";



const Page = async({params}:{params:{quizId:string}}) => {

  

  const questionIds = await prisma.quiz.findUnique({
    where:{
      id:params.quizId
    },
    select:{
      questionIds:true
    }
  })

  var questions:Question[] = []

  questionIds?.questionIds.map(async(questionId)=>{
    const x = await prisma.question.findUnique({
      where:{
        id:questionId
      }
    })
    questions=[...questions,x!!]
  })

  

  const getOptionLabel = (index: number): string => {
    return String.fromCharCode(65 + index);
  };

  const session =await getServerSession(authOptions)

  const email = session?.user?.email
  console.log(email)



  const quiz = await prisma.quiz.findUnique({
    where:{
      id:params.quizId
    }
  })


  const score = await prisma.user.findUnique({
    where:{
      email:email as string
    },
    select:{
      TempScore:true
    }
  })

  const currentUser = await prisma.user.findUnique({
    where:{
       email:email as string
    }
  })

  const completedQuizResults = currentUser?.completedQuizs || [];

  // Find the quiz with the specified id
  const matchingQuiz = completedQuizResults.find(
    (quiz) => quiz.id === params.quizId
  );

  const maxScore = matchingQuiz?.marks;
 


  const marks_per_question = quiz?.EachQuestionMark;

  

  

  return (
    <div className="relative">
      <Navbar />
      <div className="absolute top-[100px] w-screen h-full">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
              <p style={{ fontSize: "1.5rem", fontWeight: "600" }}>
                Current Score:
              </p>
              <p>
                <span style={{ fontSize: "1.5rem" }}>
                  {marks_per_question!! * (score?.TempScore || 0)}
                </span>
              </p>
            </div>
            <p style={{ fontSize: "1.5rem" }}>|</p>
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <p style={{ fontSize: "1.5rem", fontWeight: "600" }}>
                The Best Score Score:
              </p>
              <span style={{ fontSize: "1.5rem" }}>
                {marks_per_question!! * (maxScore || 0)}
              </span>
            </div>
          </div>
        </div>

        {questions?.map((question, index) => (
          <div
            key={question.id}
            className={`border p-4 mb-4 rounded ${
              question.answer ? "" : "bg-red-200"
            }`}
          >
            {/* Display the question text */}

            <p className="text-xl font-semibold">
              <span className="text-lg">{index + 1}</span>.{question.Text}
            </p>

            {/* Display the options */}
            <ul>
              {question.options.map((option, index) => (
                <li
                  key={index}
                  className={`${
                    question.answer === option ? "text-green-500" : ""
                  }`}
                >
                  {getOptionLabel(index)}.{" "}
                  <span className="text-lg font-semibold">{option}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;



