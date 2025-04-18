import { NextRequest, NextResponse } from "next/server";
import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";
import { HumanMessage } from "@langchain/core/messages";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import saveQuizz from "./saveToDb";

// Define the function that matches the schema
const extractQuizFunction = async (params: any) => {
  const { quizz } = params;
  // Process the input and return the structured quiz data
  return quizz; // Ensure it matches the format you expect from the prompt
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const file = body.get("pdf");

    // Check if PDF is provided
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
    }

    // Check if the API key is available
    if (!process.env.TOGETHER_API_KEY) {
      return NextResponse.json({ error: "Together AI API key is missing" }, { status: 500 });
    }

    // Load PDF
    const loader = new PDFLoader(file, { parsedItemSeparator: "" });
    const docs = await loader.load();
    const text = docs.map(doc => doc.pageContent).filter(Boolean).join("\n");

    // Define the prompt
    const prompt = `
      Given the text, generate a quiz based on the content. Return JSON only.
      The JSON must include a "quizz" object with the following structure:
      {
        "name": "string",
        "description": "string",
        "questions": [
          {
            "questionText": "string",
            "answers": [
              { "answerText": "string", "isCorrect": true | false },
              ...
              // Exactly 4 answers per question, only one correct
            ]
          },
          ...
          // Exactly 10 questions
        ]
      }`;

    const extractionSchema = {
      name: "extractor",
      description: "Extracts structured quiz data",
      parameters: {
        type: "object",
        properties: {
          quizz: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    questionText: { type: "string" },
                    answers: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          answerText: { type: "string" },
                          isCorrect: { type: "boolean" }
                        },
                        required: ["answerText", "isCorrect"]
                      },
                      minItems: 4,
                      maxItems: 4
                    }
                  },
                  required: ["questionText", "answers"]
                },
                minItems: 10,
                maxItems: 10
              }
            },
            required: ["name", "description", "questions"]
          }
        },
        required: ["quizz"]
      }
    };

    // Create the model instance
    const togetherModel = new ChatTogetherAI({
      apiKey: process.env.TOGETHER_API_KEY,
      modelName: "mistralai/Mixtral-8x7B-Instruct-v0.1"
    });

    // Create the parser
    const parser = new JsonOutputFunctionsParser();

    // Bind the model with schema
    const runnable = togetherModel
      .bind({
        functions: [extractQuizFunction],
        function_call: { name: "extractor" }
      })
      .pipe(parser);

    // Create the message
    const message = new HumanMessage({
      content: [{ type: "text", text: prompt + "\n" + text }],
    });

    // Invoke the model and get the result
    const result = await runnable.invoke([message]);

    if (result?.quizz) {
      const { quizzId } = await saveQuizz(result.quizz);
      return NextResponse.json({ quizzId }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
    }
  } catch (err: any) {
    console.error("💥 Server Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
