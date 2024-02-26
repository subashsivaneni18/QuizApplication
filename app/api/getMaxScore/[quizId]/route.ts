import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/libs/authOptions";


export async function GET(
  req: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Invalid session");
    }

    const email = session.user?.email;
    if (!email || typeof email !== "string") {
      throw new Error("Invalid email");
    }

    const currentUser = await prisma?.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    const completedQuizResults = currentUser.completedQuizs || [];

    // Find the quiz with the specified id
    const matchingQuiz = completedQuizResults.find(
      (quiz) => quiz.id === params.quizId
    );

    const maxScore = matchingQuiz?.marks

    return NextResponse.json({maxScore:maxScore});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error });
  }
}
