"use client"
import React, { useState, ChangeEvent, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
} from "@chakra-ui/react";
import Navbar from "@/app/components/Navbar";
import { useSession } from "next-auth/react";
import { redirect, usePathname, useRouter } from "next/navigation";
import useSWR from "swr";
import fetcher from "@/libs/fetcher";
import { Quiz } from "@prisma/client";
import axios from "axios";
import QuestionComponent from "@/app/components/QuestionComponent";

interface QuizData {
  title: string;
  marks: string;
  questions: Array<{
    text: string;
    options: string[];
    correctAnswer: string;
  }>;
}

const CreateQuizPage = () => {

  

  const { status } = useSession();
  const [quizData, setQuizData] = useState<QuizData>({
    title: "",
    marks: "",
    questions: [],
  });

  const pathName = usePathname();
  const quizId = pathName.split("/").pop();
  const { data: quiz } = useSWR<Quiz>(`/api/quiz/${quizId}`, fetcher);

  useEffect(() => {
    // Populate quizData with existing quiz details
    if (quiz) {
      setQuizData({
        title: quiz.Name,
        marks: (quiz.EachQuestionMark*quiz.questionIds.length).toString(),
        questions: [], // You may need to fetch existing questions and populate here
      });
    }
  }, [quiz]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuizData({
      ...quizData,
      [e.target.name]: e.target.value,
    });
  };

  const handleQuestionChange = (index: number, text: string) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      text,
    };

    setQuizData({
      ...quizData,
      questions: updatedQuestions,
    });
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;

    setQuizData({
      ...quizData,
      questions: updatedQuestions,
    });
  };

  const handleCorrectAnswerChange = (
    questionIndex: number,
    correctAnswer: string
  ) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex].correctAnswer = correctAnswer;

    setQuizData({
      ...quizData,
      questions: updatedQuestions,
    });
  };

  const handleAddQuestion = () => {
    const lastQuestion = quizData.questions[quizData.questions.length - 1];
    if (
      !lastQuestion ||
      (lastQuestion.text.trim() !== "" &&
        lastQuestion.options.length > 0 &&
        lastQuestion.correctAnswer !== "")
    ) {
      setQuizData({
        ...quizData,
        questions: [
          ...quizData.questions,
          { text: "", options: [], correctAnswer: "" },
        ],
      });
    }
  };

  const handleAddOption = (questionIndex: number) => {
    const updatedQuestions = [...quizData.questions];
    const currentOptions = updatedQuestions[questionIndex].options;

    if (currentOptions.length < 4) {
      updatedQuestions[questionIndex].options.push("");
      setQuizData({
        ...quizData,
        questions: updatedQuestions,
      });
    }
  };

  const handleAddQuestionsToQuiz = async () => {
    try {
      await axios.post(`/api/quiz/${quizId}`, {
        questions: quizData.questions,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const router = useRouter();

  if (status === "loading" || !quiz) {
    return (
      <div>
        <p>....Loading</p>
      </div>
    );
  }

  if(status==='unauthenticated')
  {
    return router.push('/')
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
              <FormLabel>Marks</FormLabel>
              <Input
                type="number"
                name="marks"
                value={quizData.marks}
                onChange={handleInputChange}
              />
            </FormControl>
          </Stack>

          <FormControl mt={4}>
            <FormLabel>Questions</FormLabel>
            <Stack spacing={4}>
              {quizData.questions.map((question, questionIndex) => (
                <QuestionComponent
                  key={questionIndex}
                  question={question}
                  questionIndex={questionIndex}
                  onQuestionChange={handleQuestionChange}
                  onOptionChange={handleOptionChange}
                  onCorrectAnswerChange={handleCorrectAnswerChange}
                  onAddOption={handleAddOption}
                />
              ))}
            </Stack>
            <Button mt={4} onClick={handleAddQuestion}>
              Add Question
            </Button>
          </FormControl>

          <Button mt={4} colorScheme="teal" onClick={handleAddQuestionsToQuiz}>
            Add Questions to Quiz
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default CreateQuizPage;
