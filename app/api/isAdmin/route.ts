import { authOptions } from "@/libs/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from '@/libs/prismadb'

export async function GET(req:Request)
{
    const session = await getServerSession(authOptions)
    if(!session)
    {
        return NextResponse.json("No Session Found")
    }

    const email = session.user?.email

    if(!email || typeof email!=='string')
    {
        return NextResponse.json("No Email Found")
    }

    const isAdmin = await prisma?.user.findUnique({
        where:{
            email:email
        },
        select:{
            isAdmin:true
        }
    })

    return NextResponse.json(isAdmin)
}