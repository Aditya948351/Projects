"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/progressBar";
import { ChevronLeft, Users, X } from "lucide-react";
import ResultCard from "./ResultCard";
import QuizSubmission from "./QuizSubmission";

const questions = [
    {
        questionText: "Who is Linux",
        answers : [
            { answerText: "A person who created a open Source Operating system", isCorrect: true, id: 1},
            { answerText: "it is an open source platform running on kernel", isCorrect: false, id: 2},
            { answerText: "It is a open source operating system like Windows", isCorrect: false, id: 3},
            { answerText: "He is a man of culture", isCorrect: false, id: 4},
        ]
    },
    {
        questionText: "What does CSS actually control in a webpage?",
        answers: [
            { answerText: "The look and feel, like how stylish your code dresses", isCorrect: true, id: 1 },
            { answerText: "The database connections", isCorrect: false, id: 2 },
            { answerText: "The CPU performance of the webpage", isCorrect: false, id: 3 },
            { answerText: "Only the background color, nothing else", isCorrect: false, id: 4 }
        ]
    },
    {
        questionText: "What will this Python code output? print('2' + '2')",
        answers: [
            { answerText: "22, because Python is dramatic with strings", isCorrect: true, id: 1 },
            { answerText: "4, because 2 + 2 is 4,lol", isCorrect: false, id: 2 },
            { answerText: "Error, because Python forgot how to add", isCorrect: false, id: 3 },
            { answerText: "Nothing, it just vibes silently", isCorrect: false, id: 4 }
        ]
    }

]

export default function Home() {
  const [started, setStarted] = useState<boolean>(false);  
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  
  const handleNext = () => {
    if (!started) {
        setStarted(true);
        return;
    }

    if (currentQuestion <questions.length -1) {
        setCurrentQuestion(currentQuestion + 1);
    } else {
        setSubmitted(true);
        return;
    }

    setSelectedAnswer(null);
    setIsCorrect(null);
  }

  const handleAnswer = (answer: { answerText?: string; isCorrect: any; id: any; }) => {
    setSelectedAnswer(answer.id);
    const isCurrentCorrect = answer.isCorrect;
    if (isCurrentCorrect) {
        setScore(score + 1);
    }
    setIsCorrect(isCurrentCorrect);
  }

  const scorePercentage: number = Math.round((score / questions.length) * 100);

  if (submitted) {
    return (
        <QuizSubmission
            score={score}
            scorePercentage={scorePercentage}
            totalQuestions={questions.length}
            />    
    )
  }

  return (
    <div className="flex flex-col flex-1">
        <div className="position-sticky top-0 z-10 shadow-md
        py-4 w-full">
            <header className="grid grid-cols-[auto,1fr,auto]
            grid-flow-col items-center justify-between py-2
            gap-2"> 
                <Button size="icon" 
                    variant="outline"><ChevronLeft />
                </Button>
                <ProgressBar value={(currentQuestion/ questions.
                    length) * 100} 
                />
                <Button size="icon" variant="outline">
                    <X />
                </Button>
            </header>
        </div>
        <main className="flex min-h-screenf justify-center flex-1">
          {!started ? <h1 className="text-3xl font-bold">Quiz Generator</h1> : (
            <div>
                <h2 className="text-3xl font-bold">{questions
                    [currentQuestion].questionText}</h2>
                <div className="grid grid-cols-1 gap-6 mt-6">
                    {
                        questions[currentQuestion].answers.map
                        (answer =>  {
                            const variant = selectedAnswer === answer.id ? (answer.
                            isCorrect ? "neoSuccess" : "neoDanger" ) : "neoOutline";
                            return (
                                <Button key = {answer.id} variant ={variant} size="xl" 
                                onClick={() => handleAnswer(answer)}><p
                                className="whitespace-normal">{answer.answerText}</p></
                                Button>
                            )
                        })
                    }
                </div>
            </div>
          )}
        </main>
    <footer className="footer pb-9 px-6 relative mb-0fff">
      <ResultCard isCorrect={isCorrect} correctAnswer={questions
      [currentQuestion].answers.find(answer =>answer.isCorrect === true)?.
      answerText}/>  
      <Button variant="neo" size="lg" onClick={handleNext}>{!started ? 'Start' : 
        (currentQuestion === questions.length - 1 ) ? 'Submit' :
        'Next'}</Button>
    </footer>
    </div>
  )
}
