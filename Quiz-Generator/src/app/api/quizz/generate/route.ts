import { NextRequest, NextResponse } from "next/server";
import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";
import { HumanMessage } from "@langchain/core/messages";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

export async function POST(req: NextRequest) {
    const body = await req.formData();
    const document = body.get("pdf");

    try {
        const pdfLoader = new PDFLoader(document as Blob, {
            parsedItemSeparator: ""
        });
        const docs = await pdfLoader.load();

        const selectedDocuments = docs.filter(doc => doc.pageContent !== undefined);
        const texts = selectedDocuments.map(doc => doc.pageContent);

        const prompt =
            "given the text which is a summary of the document, generate a quiz based on the text. Return json only that contains a quizz object with fields: name, description and questions. The questions is an array of exactly 10 objects with fields: questionText, answers. The answers is an array of exactly 4 objects with fields: answerText, isCorrect. Only one answer should have isCorrect as true.";

        if (!process.env.TOGETHER_API_KEY) {
            return NextResponse.json(
                { error: "Together AI API key not provided" },
                { status: 500 }
            );
        }

        const model = new ChatTogetherAI({
            apiKey: process.env.TOGETHER_API_KEY,
            modelName: "mistralai/Mixtral-8x7B-Instruct-v0.1"
        });

        const message = new HumanMessage({
            content: [
                {
                    type: "text",
                    text: prompt + "\n" + texts.join("\n")
                }
            ]
        });

        const result = await model.invoke([message]);
        const responseText = result.content;

        console.log("🧠 Raw Model Output:\n", responseText); // Terminal log for dev/test

        let parsed;
        try {
            parsed = JSON.parse(responseText);
        } catch (err) {
            console.error("❌ JSON parse error:", err);
            console.error("⚠️ Raw output:", responseText);
            return NextResponse.json(
                { error: "Invalid JSON from model", raw: responseText },
                { status: 500 }
            );
        }

        return NextResponse.json(parsed, { status: 200 });
    } catch (e: any) {
        console.error("💥 Error during processing:", e.message);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
