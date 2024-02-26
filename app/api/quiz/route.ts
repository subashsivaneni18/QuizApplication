// Import necessary modules and libraries
import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

// Define the POST function for the API route
export async function POST(req: Request) {
  try {
    // Extract data from the request body
    const { title,  markForEachQuestion } = await req.json();

    console.log("Received Data:", {
      title,
      markForEachQuestion,
    });

    // Check for required fields
    if (!title  || !markForEachQuestion) {
      throw new Error("Invalid data: Missing required fields");
    }

    // Check data types
    if (
      typeof title !== "string" ||
      typeof markForEachQuestion !== "number"
    ) {
      throw new Error("Invalid data: Incorrect data types");
    }

    // Create a new quiz in the database using Prisma
    const newQuiz = await prisma.quiz.create({
      data: {
        Name: title,
        EachQuestionMark: markForEachQuestion,
        
      },
    });

    // Log the newly created quiz for debugging
    console.log(newQuiz);

    // Return a JSON response with the new quiz data
    return NextResponse.json(newQuiz);
  } catch (error) {
    // Log and return an error response if an exception occurs
    console.error("Error:", error);
    return NextResponse.json(
      "Creation Error"
    );
  }
}



