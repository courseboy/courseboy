/*
  Warnings:

  - You are about to drop the column `max_score` on the `quiz` table. All the data in the column will be lost.
  - You are about to drop the column `question_link` on the `quiz` table. All the data in the column will be lost.
  - You are about to drop the column `webhook_secret` on the `quiz` table. All the data in the column will be lost.
  - You are about to drop the column `answer_link` on the `quiz_submission` table. All the data in the column will be lost.
  - You are about to drop the column `instructor_feedback` on the `quiz_submission` table. All the data in the column will be lost.
  - Added the required column `max_score` to the `quiz_submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `percentage` to the `quiz_submission` table without a default value. This is not possible if the table is not empty.
  - Made the column `score` on table `quiz_submission` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "quiz" DROP COLUMN "max_score",
DROP COLUMN "question_link",
DROP COLUMN "webhook_secret",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "passing_score" INTEGER NOT NULL DEFAULT 70,
ADD COLUMN     "time_limit" INTEGER;

-- AlterTable
ALTER TABLE "quiz_submission" DROP COLUMN "answer_link",
DROP COLUMN "instructor_feedback",
ADD COLUMN     "answers" JSONB,
ADD COLUMN     "max_score" INTEGER NOT NULL,
ADD COLUMN     "passed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "percentage" INTEGER NOT NULL,
ADD COLUMN     "time_taken" INTEGER,
ALTER COLUMN "score" SET NOT NULL;

-- CreateTable
CREATE TABLE "quiz_question" (
    "id" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_type" TEXT NOT NULL DEFAULT 'multiple_choice',
    "options" TEXT[],
    "correct_answer" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "order_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "quiz_question_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "quiz_question" ADD CONSTRAINT "quiz_question_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
