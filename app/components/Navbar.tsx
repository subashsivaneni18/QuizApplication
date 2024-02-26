"use client";
import fetcher from "@/libs/fetcher";
import { Button,  useToast } from "@chakra-ui/react";
import { signOut  } from "next-auth/react";
import { redirect, usePathname, useRouter } from "next/navigation";
import React, { useCallback } from "react";
import useSWR from "swr";




const Navbar = () => {



  const pathName = usePathname()
  const quizId = pathName.split("/").pop();
  const toast = useToast()
  const isTeacher = true
  const isAdminPage = pathName.includes('/admin')
  const isEditPage = pathName.includes(`/admin/edit/${quizId}`)
  const isResultsPage = pathName.includes('/results')
  const isQuizPage = pathName===`/quiz/${quizId}`
  const isHomePage = pathName==='/'
  const router = useRouter()



 

  const handleClick = useCallback(()=>{
    router.push('/admin')
  },[router])

    const handleLogout = useCallback(() => {
       if(isQuizPage)
       {
         toast({
          title:"submit The Test Before You Login",
          isClosable:true,
          duration:3000,
          colorScheme:'orange',
          status:'info'
         })
       }
       else
       {
        localStorage.removeItem("quizResponses");
        signOut();
        redirect('/')
       }
    }, [isQuizPage,toast]);

    console.log(isTeacher)

    




  return (
    <div className="p-5 flex justify-between w-full shadow-xl fixed z-50 bg-white">
      <p
        onClick={() => router.push("/")}
        className="text-3xl font-semibold cursor-pointer"
      >
        BrainBurst
      </p>
      <div className="flex gap-3 items-center">
        {isTeacher &&
          !isResultsPage &&
          !isAdminPage &&
          !isQuizPage && 
          !isHomePage &&
          (
            <Button colorScheme="blue" onClick={() => handleClick()}>
              Create
            </Button>
          )}

        {isTeacher &&
          !isAdminPage &&
          !isHomePage &&
          !isQuizPage &&
          !isResultsPage && (
            <Button onClick={() => router.push("/admin/edit")}>
              Edit Existing Quizs
            </Button>
          )}

        {isEditPage && isTeacher && (
          <Button onClick={() => router.push(pathName + "/questions")}>
            Manage Questions
          </Button>
        )}

        { !isResultsPage &&!isHomePage && 
          <Button colorScheme="red" onClick={handleLogout}>
            Logout
          </Button>
        }

        {isResultsPage && (
          <Button colorScheme="blue" onClick={()=>router.push('/')}>
            Home
          </Button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
