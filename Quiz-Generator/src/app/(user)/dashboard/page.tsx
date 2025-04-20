import { db } from "@/db";
import { eq } from "drizzle-orm";
import { quizzes } from "@/db/schema";
import { auth } from "@/auth";
import QuizzesTable, { Quizz } from "./quizzesTable";

const page = async () => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return (<p>User is Dead</p>)
    };

    const userQuizzes: Quizz[] = await db.query.quizzes.findMany({
        where: eq(quizzes.userId, userId)
    });

    console.log(userQuizzes);
    return (
        <QuizzesTable quizzes={userQuizzes} />
    )
}

export default page;