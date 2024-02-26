
import React, { ChangeEvent } from "react";
import { Textarea, Input, Stack, Button } from "@chakra-ui/react";

interface QuestionProps {
  question: {
    text: string;
    options: string[];
    correctAnswer: string;
  };
  questionIndex: number;
  onQuestionChange: (index: number, text: string) => void;
  onOptionChange: (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => void;
  onCorrectAnswerChange: (questionIndex: number, correctAnswer: string) => void;
  onAddOption: (questionIndex: number) => void;
}

const QuestionComponent: React.FC<QuestionProps> = ({
  question,
  questionIndex,
  onQuestionChange,
  onOptionChange,
  onCorrectAnswerChange,
  onAddOption,
}) => {
  return (
    <div key={questionIndex}>
      <Textarea
        value={question.text}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          onQuestionChange(questionIndex, e.target.value)
        }
        placeholder={`Question ${questionIndex + 1}`}
      />
      <Stack spacing={2}>
        {question.options.map((option, optionIndex) => (
          <Input
            key={optionIndex}
            value={option}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onOptionChange(questionIndex, optionIndex, e.target.value)
            }
            placeholder={`Option ${optionIndex + 1}`}
          />
        ))}
        <Input
          value={question.correctAnswer}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onCorrectAnswerChange(questionIndex, e.target.value)
          }
          placeholder="Correct Answer"
        />
        <Button onClick={() => onAddOption(questionIndex)}>Add Option</Button>
      </Stack>
    </div>
  );
};

export default QuestionComponent;
