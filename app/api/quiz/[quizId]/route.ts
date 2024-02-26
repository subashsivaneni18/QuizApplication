import prisma from "@/libs/prismadb";
import { addAbortListener } from "events";
import { NextResponse } from "next/server";

interface Question {
  text: string;
  options: string[];
  correctAnswer: string;
}

interface QuizData {
  questions: Question[];
}

interface QuizDetails{
  title:string
  duration:number
  marks:number
}

export async function POST(
  req: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    if (typeof params.quizId !== "string" || !params.quizId) {
      throw new Error("Invalid Id");
    }

    const quiz = await prisma.quiz.findUnique({
      where: {
        id: params.quizId as string,
      },
    });

    const { questions } = (await req.json()) as QuizData;

    // Use Promise.all to wait for all promises inside map to resolve
    const Qids: string[] = await Promise.all(
      questions.map(async (question) => {
        const q = await prisma.question.create({
          data: {
            Text: question.text,
            answer: question.correctAnswer,
            options: question.options,
          },
        });

        return q.id;
      })
    );

    const updatedQuiz = await prisma.quiz.update({
      where: {
        id: params.quizId,
      },
      data: {
        questionIds: Qids,
      },
    });

    console.log(questions);

    return NextResponse.json(questions[0].text);
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}

export async function GET(
  req: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    if (!params.quizId || typeof params.quizId !== "string") {
      throw new Error("Invalid id");
    }
    const quiz = await prisma.quiz.findUnique({
      where: {
        id: params.quizId,
      },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.log(error);
    return NextResponse.json("Quiz Fetching Error");
  }
}


export async function PATCH(req:Request,{ params }: { params: { quizId: string }})
{
  try {
    const data:QuizDetails = await req.json()
    const quiz = await prisma.quiz.findUnique({
      where:{
        id:params.quizId
      }
    })

    if(!quiz)
    {
      return NextResponse.json("Quiz Not Found")
    }

    const updatedQuiz = await prisma.quiz.update({
      where:{
        id:params.quizId
      },
      data:{
        Name:data.title,
        EachQuestionMark:data.marks
      }
    })

    return NextResponse.json(updatedQuiz)
  } catch (error) {
    console.log(error)
    return NextResponse.json('Update Error')
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    if(!params.quizId || typeof params.quizId!=='string')
    {
      throw new Error('Invalid Quiz Id')
    }
    
    await prisma.quiz.delete({
      where:{
        id:params.quizId
      }
    })

    return NextResponse.json("Deleted Sucessfully")

  } catch (error) {
    console.log(error)
    return NextResponse.json(error)
  }
}