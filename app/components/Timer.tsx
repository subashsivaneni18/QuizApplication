"use client";
import { useState, useEffect, useRef } from "react";

interface TimerProps {
  minutes: number;
  onTimeUp: () => void;
  onExamComplete: () => void;
}

const Timer: React.FC<TimerProps> = ({ minutes, onTimeUp, onExamComplete }) => {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const startTime = useRef(0);
  const timeDelta = useRef(0);

  useEffect(() => {
    const storedTimeLeft = localStorage.getItem(`exam_timer_${minutes}`);
    if (storedTimeLeft) {
      setTimeLeft(Number(storedTimeLeft));
      startTime.current = performance.now() - timeDelta.current;
    }
  }, [minutes]);

  useEffect(() => {
    localStorage.setItem(`exam_timer_${minutes}`, timeLeft.toString());
  }, [minutes, timeLeft]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    if (isRunning) {
      const updateTime = () => {
        const now = performance.now();
        const elapsed = (now - startTime.current) / 1000 - timeDelta.current;
        setTimeLeft((prevTime) => Math.max(prevTime - elapsed, 0));
        if (timeLeft > 0) {
          requestAnimationFrame(updateTime);
        } else {
          onTimeUp();
          onExamComplete();
        }
      };
      requestAnimationFrame(updateTime);
    }

    return () => {
      timeDelta.current = (performance.now() - startTime.current) / 1000;
    };
  }, [isRunning, timeLeft, onTimeUp, onExamComplete]);

  const startTimer = () => {
    setIsRunning(true);
    startTime.current = performance.now();
  };

  const pauseTimer = () => {
    setIsRunning(false);
    timeDelta.current = (performance.now() - startTime.current) / 1000;
  };

  const resetTimer = () => {
    setTimeLeft(minutes * 60);
    timeDelta.current = 0;
  };

  return (
    <div>
      <p>{formatTime(timeLeft)}</p>
      <button onClick={startTimer} disabled={isRunning}>
        Start
      </button>
      <button onClick={pauseTimer} disabled={!isRunning}>
        Pause
      </button>
      <button onClick={resetTimer}>Reset</button>
      {timeLeft === 0 && (
        <p>Time is up! Exam will be submitted automatically.</p>
      )}
    </div>
  );
};

export default Timer;
