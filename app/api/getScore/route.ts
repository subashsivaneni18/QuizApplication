import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/libs/authOptions";


export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session); // Add this line for logging

    if (!session) {
      return NextResponse.json("No Session Found", { status: 401 });
    }

    const email = session.user?.email;

    if (!email || typeof email !== "string") {
      throw new Error("No Email Present");
    }

    const currentUser = await prisma?.user.findUnique({
      where: {
        email: email!!,
      },
    });

    const tempScore = currentUser?.TempScore;

    return NextResponse.json({ score: tempScore });
  } catch (error) {
    console.error("Error:", error); // Add this line for logging
    return NextResponse.json({ error }, { status: 500 });
  }
}
