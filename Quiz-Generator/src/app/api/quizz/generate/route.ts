import { NextRequest, NextResponse } from "next/server";
import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";
import { HumanMessage } from "@langchain/core/messages";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const file = body.get("pdf");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
    }

    if (!process.env.TOGETHER_API_KEY) {
      return NextResponse.json({ error: "Together AI API key is missing" }, { status: 500 });
    }

    // Step 1: Load PDF using LangChain's PDFLoader
    const loader = new PDFLoader(file, { parsedItemSeparator: "" });
    const docs = await loader.load();

    const text = docs.map(doc => doc.pageContent).filter(Boolean).join("\n");

    // Step 2: Define prompt
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

    // Step 3: Define JSON schema for Together AI function call
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

    // Step 4: Create Together AI model instance
    const togetherModel = new ChatTogetherAI({
      apiKey: process.env.TOGETHER_API_KEY,
      modelName: "mistralai/Mixtral-8x7B-Instruct-v0.1"
    });

    // Step 5: Bind model with schema parser
    const parser = new JsonOutputFunctionsParser();
    const pipeline = togetherModel.bind({
      functions: [extractionSchema],
      function_call: { name: "extractor" }
    }).pipe(parser);

    // Step 6: Create and send prompt to Together AI
    const message = new HumanMessage({
      content: [{ type: "text", text: `${prompt}\n${text}` }]
    });

    const result = await pipeline.invoke([message]);

    console.log("🧠 Structured Quiz Response:", result);

    return NextResponse.json(result, { status: 200 });

  } catch (err: any) {
    console.error("💥 Server Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
