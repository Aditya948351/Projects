import {
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    serial,
    boolean,
    pgEnum,
} from "drizzle-orm/pg-core"; 
import type { AdapterAccount} from "@auth/core/adapters";
import { relations } from "drizzle-orm";


export const quizzes = pgTable("quizzes", {
    id: serial("id").primaryKey(),
    name: text("name"),
    description: text("description"),
    userId: text("user_id"),
});

export const quizzesRelations = relations(quizzes, ({ many, one }) => ({
    questions: many(questions),
}));

export const questions = pgTable("questions", {
    id: serial("id").primaryKey(),
    questionText: text("question_text"),
    quizzId: integer("quizz_id") 
});

export const questionsRelations = relations(questions, ({ one, many }) => ({
    quizz: one(quizzes, {
        fields: [questions.quizzId],
        references: [quizzes.id]
    }),
    answers: many(questionAnswers),
}))

export const questionAnswers = pgTable("answers", {
    id: serial("id").primaryKey(),
    questionId: integer("question_id"),
    answerText: text("answer_text"),
    isCorrect: boolean("is_correct")
});
    
export const questionAnswersRelations = relations(
    questionAnswers, 
    ({ one }) => ({
    question: one(questions, {
        fields: [questionAnswers.questionId],
        references: [questions.id]
    })
}));