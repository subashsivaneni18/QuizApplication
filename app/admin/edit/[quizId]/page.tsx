"use client";
import React, { useState, ChangeEvent, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useToast,
} from "@chakra-ui/react";
import Navbar from "@/app/components/Navbar";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Quiz } from "@prisma/client";
import useSWR from "swr";
import fetcher from "@/libs/fetcher";


interface QuizData {
  title: string;
  marks:number
}

interface QuestionData{
  text:string
  options:string[]
  correctAnswer:string
}
const CreateQuizPage = ({ params }: { params: { quizId: string } }) => {

  const {mutate:mutateQuizs} = useSWR(`/api/Quizs`,fetcher)

  
  
  useEffect(()=>{
    const x = async ()=>{
      try {
        const res= await axios.get(`/api/quiz/${params.quizId}`);
        const data:Quiz = res.data
        const no_ofQuestions =data.questionIds.length
        const markForEachQuestion = data.EachQuestionMark
        setQuizData({
          title: data.Name,
          marks:markForEachQuestion,
        });
      } catch (error) {
        console.log(error)
      }
    }

    x()
  },[params.quizId])

  const { status } = useSession();
  
  const [quizData, setQuizData] = useState<QuizData>({
    title:  "",
    marks:0
  });

  const [creatingQuiz, setCreatingQuiz] = useState<boolean>(false);

  const router = useRouter();
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

  const handleUpdateQuiz = useCallback(async () => {
    try {
      await axios.patch(`/api/quiz/${params.quizId}`, quizData);
      toast({
        title:"Quiz Updated",
        isClosable:true,
        duration:3000,
        status:'success'
      })
    } catch (error) {
      console.log(error)
    }
  }, [quizData,params.quizId,toast]);


  const [questionsData,setQuestionsData] = useState<QuestionData>({
    correctAnswer:"",
    options:["","","",""],
    text:""
  })

  const handleOptionsChange = (index: number, value: string) => {
    const newOptions = [...questionsData.options];
    newOptions[index] = value;

    setQuestionsData({
      ...questionsData,
      options: newOptions,
    });
  };
  

  const handleAddQuestionToQuiz = useCallback(async() => {
    const isDataValid =
      questionsData.text.trim() !== "" &&
      questionsData.options.every((option) => option.trim() !== "") &&
      questionsData.correctAnswer.trim() !== "";

    if (isDataValid) {
      console.log(questionsData)
      await axios.post(`/api/questions/${params.quizId}`,questionsData)
      setQuestionsData({
        correctAnswer:"",
        options:["","","",""],
        text:""
      })
      mutateQuizs()
      toast({
        title:"Question Added To Quiz",
        duration:3000,
        isClosable:true,
        status:'success'
      })
    } else {
      toast({
        title:"Please Fill All the Fields",
        isClosable:true,
        duration:3000,
        status:'warning'
      })
    }
  }, [questionsData,mutateQuizs,params.quizId,toast]);

  const handleReset = useCallback(()=>{
    setQuestionsData({
      correctAnswer:"",
      options:["","","",""],
      text:""
    })
  },[setQuestionsData])

  const handleDeleteQuiz = useCallback(async()=>{
    try {
      await axios.delete(`/api/quiz/${params.quizId}`)
      mutateQuizs()
      toast({
        title:"Deleted Sucessfully",
        status:'success',
        isClosable:true,
        duration:3000
      })
      router.push('/admin/edit')
    } catch (error) {
      console.log(error)
    }
  },[toast,mutateQuizs,params.quizId,router])
 

  


  if (status === "loading" ) {
    return (
      <div>
        <p>....Loading</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <Navbar />
      <div className="absolute top-[80px]">
        {/* Updating Quiz Values */}
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
              <FormLabel>Marks For Each</FormLabel>
              <Input
                type="number"
                name="marks"
                value={quizData.marks}
                onChange={handleInputChange}
              />
            </FormControl>
          </Stack>

          <div className="flex items-center gap-4">
            <Button
              mt={4}
              colorScheme="teal"
              onClick={handleUpdateQuiz}
              isLoading={creatingQuiz}
            >
              Update Quiz
            </Button>
            <Button
              mt={4}
              colorScheme="red"
              onClick={handleDeleteQuiz}
              isLoading={creatingQuiz}
            >
              Delete Quiz
            </Button>
          </div>
        </Box>

        {/* Adding Question */}
        <Box
          p={8}
          className="flex w-[90vw] flex-col items-center justify-center"
          borderRadius="md"
        >
          <FormControl>
            <FormLabel>Question</FormLabel>
            <Input
              type="text"
              name="Text"
              onChange={(e) =>
                setQuestionsData({
                  ...questionsData,
                  text: e.target.value,
                })
              }
              placeholder="Enter The Questions"
              value={questionsData.text}
            />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Options</FormLabel>
            <div className="flex flex-col gap-3">
              {questionsData.options.map((option, index) => (
                <div key={index}>
                  <Input
                    type="text"
                    name={`option${index + 1}`}
                    value={questionsData.options[index]}
                    onChange={(e) => handleOptionsChange(index, e.target.value)}
                    placeholder={`Enter Option ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Correct Answer</FormLabel>
            <Input
              type="text"
              name="Correct Answer"
              onChange={(e) =>
                setQuestionsData({
                  ...questionsData,
                  correctAnswer: e.target.value,
                })
              }
              value={questionsData.correctAnswer}
              placeholder="Enter the correct Answer"
            />
          </FormControl>

          {/* buttons Portion */}
          <div className="flex gap-6 items-center">
            <Button
              mt={4}
              colorScheme="teal"
              onClick={() => handleAddQuestionToQuiz()}
            >
              Submit
            </Button>
            <Button mt={4} colorScheme="teal" onClick={() => handleReset()}>
              Reset
            </Button>
          </div>
        </Box>
      </div>
    </div>
  );
};

export default CreateQuizPage;
