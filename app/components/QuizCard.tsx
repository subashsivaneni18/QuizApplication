"use client"
import { Badge, Box, Button } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import React from "react";

interface QuizCardProps {
  title: string;
  category?: string;
  duration?: number;
  id:string;
}

const QuizCard: React.FC<QuizCardProps> = ({
  title,
  category,
  duration,
  id,
}) => {
  const formattedDuration = `${duration} min`;


  const pathName = usePathname()

  const isAdminEditPage = pathName.includes('/admin/edit')

  return (
    <Box
      width="md"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      minH="150px"
      h="100%"
    >
      <Box p="6">
        <Box display="flex" alignItems="center" gap={3}>
          <Box
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xl"
            textTransform="uppercase"
            ml="2"
          >
            <p className="text-xl">{title}</p>
          </Box>

          {/* <Badge borderRadius="full" px="2" colorScheme="teal">
            {category}
          </Badge> */}
        </Box>

        <div className="flex items-center gap-3">
          {/* <p className="font-light text-sm">Marks {marks}</p> */}
        </div>

        <Box className="my-2">
          <Button colorScheme="green">
            {isAdminEditPage ? "Edit This Quiz" : "Take Quiz"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default QuizCard;
