"use server";

import { db } from "@/db";
import { quizzSubmissions } from "@/db/schema";
import { auth } from "@/auth";
import { InferInsertModel, eq } from "drizzle-orm";

type Submission = InferInsertModel<typeof quizzSubmissions>;

export async function saveSubmission(sub: Submission, quizzId: number) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const { score } = sub;

    const newSubmission = await db
        .insert(quizzSubmissions)
        .values({
            score,
            quizzId,
            userId, // 👈 assuming `userId` is part of your schema (should be)
        })
        .returning({ insertId: quizzSubmissions.id });

    const submissionId = newSubmission[0].insertId;
    return submissionId;
}
