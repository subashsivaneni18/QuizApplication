import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import bcrypt from "bcrypt";

export async function POST(req:Request) {
  try {
    const { email, username, password ,isAdmin} = await req.json();

    if (
      !email ||
      !password ||
      !username ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof username !== "string"
    ) {
      throw new Error("Invalid Credentials");
    }

    const isAlready = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (isAlready) {
      return NextResponse.json({ message: "Account Already Exists" });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        name: username,
        hashedPassword, // Save the hashed password in the database
        isAdmin:isAdmin
      },
    });

    return NextResponse.json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Register Error");
  }
}
