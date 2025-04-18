import { NextRequest, NextResponse } from "next/server";
import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";
import { HumanMessage } from "@langchain/core/messages";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import saveQuizz from "./saveToDb";

// Helper to shuffle answers randomly
function shuffleArray<T>(array: T[]): T[] {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

// Validate and fix quiz format
function normalizeQuiz(quiz: any) {
  if (!quiz.questions) return quiz;

  quiz.questions = quiz.questions.map((q: any) => {
    if (!Array.isArray(q.answers)) q.answers = [];

    // Identify the correct answer
    const correct = q.answers.find((a: any) => a.isCorrect) || {
      answerText: "Correct Answer",
      isCorrect: true,
    };

    // Ensure only one is correct
    const distractors = q.answers
      .filter((a: any) => !a.isCorrect)
      .map((a: any) => ({ ...a, isCorrect: false }));

    // If less than 3 distractors, fill with dummy incorrects
    while (distractors.length < 3) {
      distractors.push({
        answerText: `Option ${distractors.length + 1}`,
        isCorrect: false,
      });
    }

    // Take exactly 3 distractors
    const selectedDistractors = distractors.slice(0, 3);
    const finalAnswers = shuffleArray([correct, ...selectedDistractors]);

    return {
      questionText: q.questionText || "Untitled question",
      answers: finalAnswers,
    };
  });

  return quiz;
}

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const document = body.get("pdf");

  if (!document) {
    return NextResponse.json({ error: "PDF file is missing" }, { status: 400 });
  }

  try {
    const pdfLoader = new PDFLoader(document as Blob, {
      parsedItemSeparator: " "
    });

    const docs = await pdfLoader.load();
    const selectedDocuments = docs.filter(doc => doc.pageContent !== undefined);
    const texts = selectedDocuments.map(doc => doc.pageContent).join("\n");

    const prompt = "given the text which is a summary of the document, generate a quiz based on the text. Return json only that contains a quizz object with fields: name, description and questions. The questions is an array of objects with fields: questionText, answers. The answers is an array of 4 objects with fields: answerText, isCorrect.";

    if (!process.env.TOGETHER_API_KEY) {
      return NextResponse.json({ error: "Together AI API key not provided" }, { status: 500 });
    }

    const model = new ChatTogetherAI({
      apiKey: process.env.TOGETHER_API_KEY,
      modelName: "mistralai/Mixtral-8x7B-Instruct-v0.1"
    });

    const message = new HumanMessage({
      content: [{ type: "text", text: prompt + "\n" + texts }],
    });

    const result = await model.invoke([message]);
    console.log("Model Response:", result);

    if (result?.content) {
      try {
        const parsed = JSON.parse(result.content);

        if (parsed?.quizz) {
          const normalizedQuiz = normalizeQuiz(parsed.quizz);
          const { quizzId } = await saveQuizz(normalizedQuiz);
          return NextResponse.json({ quizzId }, { status: 200 });
        } else {
          return NextResponse.json({ error: "No quiz object found in response" }, { status: 500 });
        }
      } catch (e) {
        console.error("Failed to parse the JSON:", e.message);
        return NextResponse.json({ error: "Failed to parse the quiz JSON" }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: "Empty model response" }, { status: 500 });
    }
  } catch (e: any) {
    console.error("Error processing the PDF:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
