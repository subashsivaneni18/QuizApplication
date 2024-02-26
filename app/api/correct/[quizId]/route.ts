import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";

interface SimplifiedQuestion {
  questionId: string;
  answer: string;
}

type QuizResult = {
  id: string;
  marks: number;
};

export async function POST(
  req: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    const { data: WrittenAnswers }: { data: SimplifiedQuestion[] } =
      await req.json();

    const questionIds = await prisma.quiz.findUnique({
      where: {
        id: params.quizId,
      },
      select: {
        questionIds: true,
      },
    });

    // Check if questionIds is null or undefined
    if (!questionIds || !questionIds.questionIds) {
      throw new Error("Invalid quizId or no questionIds found");
    }

    // Use Promise.all to wait for all asynchronous operations to complete
    const Key = await Promise.all(
      questionIds.questionIds.map(async (questionId) => {
        const question = await prisma.question.findUnique({
          where: {
            id: questionId,
          },
          select: {
            id: true,
            answer: true,
          },
        });
        return question;
      })
    );

    var score = 0;

    if (WrittenAnswers.length === Key.length) {
      for (var i = 0; i < WrittenAnswers.length; i++) {
        // Trim leading and trailing spaces for comparison
        const writtenAnswer = WrittenAnswers[i].answer.trim().toLowerCase();
        const keyAnswer = Key[i]?.answer.trim().toLowerCase();

        if (
          WrittenAnswers[i].questionId === Key[i]?.id &&
          writtenAnswer === keyAnswer &&
          writtenAnswer !== ""
        ) {
          score = score + 1;
        }
      }
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      throw new Error("Unauthorized");
    }

    const email = session.user?.email;

    if (!email || typeof email !== "string") {
      throw new Error("Invalid Email");
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    const completedQuiz = currentUser?.completedQuizs || [];
    const previousRecord = completedQuiz.find(
      (record) => record.id === params.quizId
    );

    const updatedUser = await prisma.user.update({
      where:{
        id:currentUser?.id
      },
      data:{
        TempScore:score
      }
    })

    if (!previousRecord || score > previousRecord.marks) {
      // If no previous record or the new score is higher, update the marks
      const updatedUser = await prisma.user.update({
        where: {
          email: email,
        },
        data: {
          completedQuizs: {
            set: [{ id: params.quizId, marks: score }],
          },
        },
      });

      return NextResponse.json({score:score,user:updatedUser });
    } else {
      // If the new score is not higher, do not update the marks
      return NextResponse.json({ score: score,user:updatedUser});
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json("Correction Error");
  }
}
