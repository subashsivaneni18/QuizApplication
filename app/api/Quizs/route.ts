import { NextResponse } from "next/server"
import prisma from '@/libs/prismadb'
export async function GET(req:Request)
{
    try {
      const quizs = await prisma.quiz.findMany({})
      return NextResponse.json(quizs) 
    } catch (error) {
        console.log(error)
        return NextResponse.json("Fetching Quizs Error")
    }
}