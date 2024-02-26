"use client";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import useSWR from "swr";
import { Button, useDisclosure, useToast } from "@chakra-ui/react";
import fetcher from "@/libs/fetcher";
import Navbar from "@/app/components/Navbar";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import Timer from "@/app/components/Timer"; // Make sure this import is correct
import { useRouter } from "next/navigation";
import { Question, Quiz } from "@prisma/client";

interface Result {
  score: number;
}

const getStoredResponses = () => {
  if (typeof window !== "undefined") {
    const storedResponses = localStorage.getItem("quizResponses");
    return storedResponses ? JSON.parse(storedResponses) : {};
  }
  return {};
};

const storeResponses = (responses: any) => {
  localStorage.setItem("quizResponses", JSON.stringify(responses));
};

const QuizPage = ({ params }: { params: { quizId: string } }) => {
  const router = useRouter();
  const toast = useToast();

  const [index, setIndex] = useState(0);
  const [responses, setResponses] =
    useState<Record<string, string>>(getStoredResponses);
  const [submittedAnswers, setSubmittedAnswers] = useState<
    Array<{ questionId: string; answer: string }>
  >([]);
  const [duration, setDuration] = useState(0);
  const [timer, setTimer] = useState(duration);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: questions } = useSWR<Question[] | []>(
    `/api/questions/${params.quizId}`,
    fetcher
  );
  const { data: quiz } = useSWR<Quiz>(`/api/quiz/${params.quizId}`, fetcher);

  var isQuizGoing = 0;

  useEffect(() => {
    if (duration > 0) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [duration]);



  const handleOptionClick = (option: string) => {
    if (questions && questions[index]) {
      setResponses((prev) => ({
        ...prev,
        [questions[index].id]: option || "",
      }));
    }
  };

  const handleClear = () => {
    if (questions && questions[index]) {
      setResponses((prev) => {
        const updatedResponses = { ...prev };
        if (index === questions.length - 1) {
          updatedResponses[questions[index].id] = "s";
        } else {
          delete updatedResponses[questions[index].id];
        }
        return updatedResponses;
      });
    }
  };

  const handlePrev = useCallback(() => {
    setIndex((prev) => prev - 1);
  }, [setIndex]);

  const handleNext = useCallback(() => {
    setIndex((prev) => prev + 1);
  }, [setIndex]);

  const handleSubmit = useCallback(async () => {
    const newSubmittedAnswers: Array<{ questionId: string; answer: string }> =
      [];

    for (const question of questions || []) {
      const answer = responses[question?.id] || " ";
      newSubmittedAnswers.push({ questionId: question?.id || "", answer });
    }

    setSubmittedAnswers(newSubmittedAnswers);

    try {
      const res = await axios.post(`/api/correct/${params.quizId}`, {
        data: newSubmittedAnswers,
      });

      localStorage.removeItem("quizResponses");

      toast({
        title: "Quiz Submitted Successfully",
        isClosable: true,
        status: "success",
        colorScheme: "green",
        duration: 3000,
      });

      const score = res.data?.score;

      if (score !== undefined) {
        router.push(`/quiz/${params.quizId}/results`);
      } else {
        console.error("Score is undefined in the response");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  }, [responses, questions, setSubmittedAnswers, params.quizId, router, toast]);

  useEffect(() => {
    storeResponses(responses);
  }, [responses]);

  if (!questions || questions.length === 0) {
    return (
      <div>
        <p>Loading questions...</p>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="absolute top-[150px] right-[100px]">
       
      </div>
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white p-8 rounded shadow-lg w-full max-w-lg">
          <p className="text-lg font-semibold mb-4">
            Question {index + 1}/{questions.length}
          </p>
          <p className="text-xl font-bold mb-6">
            {index + 1}.{questions[index].Text}
          </p>
          <div className="space-y-4">
            {questions[index].options.map((option, optionIndex) => (
              <button
                key={optionIndex}
                className={`block w-full py-2 px-4 rounded cursor-pointer ${
                  responses[questions[index]?.id] === option
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            {index !== 0 && (
              <Button
                className="py-2 px-4 bg-gray-400 text-white rounded cursor-pointer hover:bg-gray-500"
                onClick={() => handlePrev()}
                colorScheme="orange"
              >
                Previous
              </Button>
            )}

            <button
              className="py-2 px-4 bg-red-500 text-white rounded cursor-pointer hover:bg-red-600"
              onClick={() => handleClear()}
            >
              Clear
            </button>
            {index === questions.length - 1 && (
              <Button colorScheme="green" onClick={onOpen}>
                Submit
              </Button>
            )}
            {index !== questions.length - 1 && (
              <Button colorScheme="blue" onClick={() => handleNext()}>
                Next
              </Button>
            )}
          </div>
        </div>
      </div>

      <div>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Submit Quiz</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <p>
                Are you sure you want to submit? The best score will be
                considered.
              </p>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Continue Editing
              </Button>
              <Button colorScheme="green" onClick={handleSubmit}>
                Submit
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default QuizPage;
