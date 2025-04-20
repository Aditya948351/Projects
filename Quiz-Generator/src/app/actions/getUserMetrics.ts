import { quizzes, questions, quizzSubmissions } from "@/db/schema";
import { auth } from "@/auth";
import { count } from "drizzle-orm";

const getUserMetrics = async() => {
    const session = await auth();
    const userId = session?.user?.id;

    const numQuizzes = await db.select({ value: count()})
}