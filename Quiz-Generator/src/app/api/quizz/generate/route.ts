import { NextRequest, NextResponse } from "next/server";


import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

import { PDFLoader } from "langchain/document_loaders/fs/pdf";

export async function POST(req: NextRequest) {
    const body = await req.formData();
    const document = body.get("pdf");

    try{
        const pdfLoader = new PDFLoader(document as Blob, {
            parsedItemSeparator: ""
        });
        const docs = await pdfLoader.load();

        const selectedDocuments = docs.filter((doc) => doc.pageContent !== undefined);
        const texts = selectedDocuments.map((doc) =>doc.pageContent);
        
        const prompt = "given the text which is a summary of the document, generate a quiz based on the text. Return json only that contains a quizz object with fields: name, description and questions. The questions is an array of objects with fields: questionText, answers. The answers is an array of objects with fields: answerText, isCorrect."
        
        
if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "API Key Not Provided" }, { status:500});
}        
        const model = new ChatOpenAI({
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: "gpt-4-1106-preview"
        });

        const message = new HumanMessage({
            content: [
                {
                    type:"text",
                    text:prompt + "\n" + texts.join("\n")
                }
            ]
        })


        const result = await model.invoke([message]);
        console.log(result);

        return NextResponse.json({message : "created successfully"}, { status:200});
    } catch(e:any) {
        return NextResponse.json({ error: e.message }, { status:500});
    }
}