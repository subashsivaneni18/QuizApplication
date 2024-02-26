"use client"
import React, { useState, ChangeEvent, useCallback } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useToast,
} from "@chakra-ui/react";
import Navbar from "../components/Navbar";
import { useSession } from "next-auth/react";
import axios from "axios";
import { redirect, useRouter } from "next/navigation";

interface QuizData {
  title: string;
  questions: Array<{
    text: string;
    options: string[];
  }>;
  marksForEachQuestion:number
}

const CreateQuizPage: React.FC = () => {
  const { status } = useSession();
  const [quizData, setQuizData] = useState<QuizData>({
    title: "",
    questions: [],
    marksForEachQuestion:0
  });
  const [creatingQuiz, setCreatingQuiz] = useState<boolean>(false);

  const router = useRouter()
   const toast = useToast();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.type === "number"
        ? parseInt(e.target.value, 10)
        : e.target.value;

    setQuizData({
      ...quizData,
      [e.target.name]: value,
    });
  };

 

 const handleCreateQuiz = useCallback(async () => {
   try {
     const res = await axios.post("/api/quiz", {
       title: quizData.title as string,
       markForEachQuestion:quizData.marksForEachQuestion as number
     });

     // Check if res.data contains the expected properties
     if (
       res.data &&
       res.data.id &&
       res.data.Name &&
       res.data.TotalScore
     ) {
       setQuizData({
         title: res.data.Name,
         questions: [],
         marksForEachQuestion: res.data.EachQuestionMark.toString()
       });

      router.push(`/admin/${res.data.id}`);
       toast({
         title: "Successfully Created Quiz",
         status: "success",
         duration: 3000,
         isClosable: true,
       });
     } else {
       // Handle the case where the response data is not as expected
       console.error("Invalid response data format");
     }
   } catch (error) {
     console.error(error);
     toast({
       title: "Error Occurred",
       status: "error",
       duration: 3000,
       isClosable: true,
     });
   } finally {
     setCreatingQuiz(false);
   }
 }, [toast, quizData, router]);


  if (status === "loading") {
    return (
      <div>
        <p>....Loading</p>
      </div>
    );
  }

  if(status==='unauthenticated')
  {
    return redirect('/')
  }

  return (
    <div className="relative">
      <Navbar />
      <div className="absolute top-[80px]">
        <Box p={8}>
          <Stack direction="row" spacing={4}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                type="text"
                name="title"
                value={quizData.title}
                onChange={handleInputChange}
              />
            </FormControl>


            <FormControl>
              <FormLabel>Marks for Each Question</FormLabel>
              <Input
                type="number"
                name="marksForEachQuestion"
                value={quizData.marksForEachQuestion}
                onChange={handleInputChange}
              />
            </FormControl>
          </Stack>

          <Button
            mt={4}
            colorScheme="teal"
            onClick={handleCreateQuiz}
            isLoading={creatingQuiz}
          >
            Create Quiz
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default CreateQuizPage;
