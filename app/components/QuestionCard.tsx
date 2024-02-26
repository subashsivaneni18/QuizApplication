"use client"
import fetcher from "@/libs/fetcher";
import { Button, useToast } from "@chakra-ui/react";
import axios from "axios";
import { usePathname } from "next/navigation";
import React, { useCallback } from "react";
import useSWR from "swr";

interface QuestionCardProps {
  id: string;
  Text: string;
  options: string[];
  answer: string;
  Qno: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  Text,
  answer,
  id,
  options,
  Qno,
}) => {
  const pathName = usePathname()
  const toast = useToast()
  const quizId = pathName.split('/')[3]

  const {mutate:mutateQuestions} = useSWR(`/api/questions/${quizId}`,fetcher)

  const handleDelete = useCallback(async(qId:string)=>{
    try {
      await axios.delete(`/api/questions/${quizId}`,{data:{
        questionId:qId
      }})
      mutateQuestions()
      toast({
        title: "Question Deleted",
        isClosable: true,
        duration: 3000,
        status: "success",
      });
    } catch (error) {
      console.log(error)
    }
  },[mutateQuestions,quizId,toast])


  return (
    <div>
      <div className="border-black border-[1px] p-4">
        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold">
            <span className="text-lg mr-1">{Qno}.</span>
            {Text}
          </p>
          <Button colorScheme="red" size="sm" onClick={() => handleDelete(id)}>
            Delete
          </Button>
        </div>
        <div>
          {options.map((option, index) => (
            <div key={option} className="flex items-center gap-1 ml-5">
              <p>{String.fromCharCode(97 + index)}.</p>
              <p>{option}</p>
            </div>
          ))}
        </div>

        <div className="ml-5">
          <p>
            <span>Correct Answer: </span>
            <span className="font-semibold">{answer}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
