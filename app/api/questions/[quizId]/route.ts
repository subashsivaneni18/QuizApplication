import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { Question } from "@prisma/client";

interface QuestionData {
  correctAnswer: string;
  options: string[];
  text: string;
}

export async function GET(
  req: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    if (!params.quizId || typeof params.quizId !== "string") {
      throw new Error("Invalid Id");
    }

    const quiz = await prisma.quiz.findUnique({
      where: {
        id: params.quizId,
      },
      select: {
        questionIds: true,
      },
    });

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    const questionIds = quiz.questionIds || [];

    const questions: (Question | null)[] = await Promise.all(
      questionIds.map(async (questionId) => {
        const question = await prisma.question.findUnique({
          where: {
            id: questionId,
          },
        });
        return question;
      })
    );

    // Filter out null values
    const filteredQuestions: Question[] = questions.filter(
      (question): question is Question => question !== null
    );

    return NextResponse.json(filteredQuestions);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Questions fetching error", { status: 404 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    if (!params.quizId || typeof params.quizId !== "string") {
      throw new Error("Invalid Id");
    }

    const data: QuestionData = await req.json();

    const question = await prisma.question.create({
      data: {
        answer: data.correctAnswer,
        Text: data.text,
        options: data.options,
      },
    });

    const quiz = await prisma.quiz.findUnique({
      where: {
        id: params.quizId,
      },
      select: {
        questionIds: true,
      },
    });

    if (!quiz) {
      throw new Error("Quiz Not Found");
    }

    // Add the newly created question's ID to the existing question IDs
    const updatedQuestionIds = [...quiz.questionIds, question.id];

    // Update the quiz with the new question IDs
    const updatedQuiz = await prisma.quiz.update({
      where: {
        id: params.quizId,
      },
      data: {
        questionIds: updatedQuestionIds,
      },
    });

    return NextResponse.json({ success: true, quiz: updatedQuiz });
  } catch (error) {
    console.log(error);
    return NextResponse.json("Question Adding Error");
  }
}


export async function DELETE(req:Request,{params}:{params:{quizId:string}})
{
  try {
    if(!params.quizId || typeof params.quizId!=='string' )
    {
      throw new Error('Invalid String')
    }

    const {questionId} = await req.json()

    if(!questionId || typeof questionId!=='string')
    {
      throw new Error('Invalid Question Id')
    }

    const QuizQuestionIds = await prisma.quiz.findUnique({
      where:{
        id:params.quizId
      },
      select:{
        questionIds:true
      }
    })

    const updatedQuestionIds = QuizQuestionIds?.questionIds.filter((QId)=>QId!==questionId)

    const updatedQuiz = await prisma.quiz.update({
      where:{
        id:params.quizId
      },
      data:{
        questionIds:updatedQuestionIds
      }
    })

    await prisma.question.delete({
      where:{
         id:questionId
      }
    })

    return NextResponse.json(updatedQuiz)

  } catch (error) {
    console.log(error)
    return NextResponse.json("Question Deletion Error")
  }
}