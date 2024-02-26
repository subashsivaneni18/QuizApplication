"use client"
import Navbar from "@/app/components/Navbar";
import fetcher from "@/libs/fetcher";
import { Button } from "@chakra-ui/react";
import { Quiz } from "@prisma/client";
import { useSession } from "next-auth/react";
import { redirect, usePathname, useRouter } from "next/navigation";
import React from "react";
import useSWR from "swr";

const Page = () => {

  const router = useRouter()
  const {status} = useSession()
  const pathname = usePathname()
  const x = pathname.split('/')[2]
  
  const {data} = useSWR<Quiz>(`/api/quiz/${x}`,fetcher)

  const no_of_questions = data?.questionIds.length || 0 
  const markForEachQuestion = data?.EachQuestionMark || 0


  if(status==='loading')
  {
    return(
      <div>
        <p>....Loading</p>
      </div>
    )
  }

  if(status==='unauthenticated')
  {
    return redirect('/')
  }

  return (
    <div className="relative w-screen h-full">
      <Navbar />
      <div className="absolute w-full h-full top-[350px] flex items-center justify-center">
        <div className="border-black border-[1px] w-fit min-w-[500px]">
          <div className="p-5">
            <p className="text-center text-xl font-bold">
              Rules and Regulations
            </p>
            <div className="space-y-2 text-lg font-semibold ml-4 mt-5">
              <p>* No negative marks are present.</p>
              <p>* Each question carries {data?.EachQuestionMark} M</p>
              <p>
                * Total marks for the test:
                <span className="ml-1">{no_of_questions * markForEachQuestion} </span>M
              </p>
              <p>* Total number of questions:<span className="ml-1">{data?.questionIds.length}</span></p>
            </div>

            <div className="ml-4 flex items-center justify-center gap-8 mt-8">
              <Button size="sm" colorScheme="blue" onClick={()=>router.push(`/quiz/${x}`)}>
                Start
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                onClick={() => router.push("/")}
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
