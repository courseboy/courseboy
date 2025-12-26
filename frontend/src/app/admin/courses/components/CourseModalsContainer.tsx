"use client";

import {
  Privilege,
  AdminCourse,
  AdminCategory,
  AdminLesson,
  Quiz,
} from "@/types";
import { CreateCourseModal } from "@/components/admin/courses/CreateCourseModal";
import { EditCourseModal } from "@/components/admin/courses/EditCourseModal";
import { CreateCategoryModal } from "@/components/admin/courses/CreateCategoryModal";
import { EditCategoryModal } from "@/components/admin/courses/EditCategoryModal";
import { CreateLessonModal } from "@/components/admin/courses/CreateLessonModal";
import { EditLessonModal } from "@/components/admin/courses/EditLessonModal";
import {
  CreateQuizModal,
  EditQuizModal,
  DeleteQuizModal,
  ManageQuestionsModal,
} from "@/components/admin/courses/QuizModals";

interface CourseModals {
  isCreateCourseModalOpen: boolean;
  isEditCourseModalOpen: boolean;
  selectedCourse: AdminCourse | null;
}

interface CategoryModals {
  isCreateCategoryModalOpen: boolean;
  isEditCategoryModalOpen: boolean;
  selectedCourseForCategory: number | null;
  selectedCategory: AdminCategory | null;
}

interface LessonModals {
  isCreateLessonModalOpen: boolean;
  isEditLessonModalOpen: boolean;
  selectedCourseForLesson: number | null;
  selectedCategoryForLesson: number | null;
  selectedLesson: AdminLesson | null;
}

interface QuizModals {
  isCreateQuizModalOpen: boolean;
  isEditQuizModalOpen: boolean;
  isDeleteQuizModalOpen: boolean;
  isManageQuestionsModalOpen: boolean;
  selectedCourseForQuiz: number | null;
  selectedCategoryForQuiz: AdminCategory | null;
  selectedQuiz: Quiz | null;
}

interface CourseModalsContainerProps {
  courseModals: CourseModals;
  categoryModals: CategoryModals;
  lessonModals: LessonModals;
  quizModals: QuizModals;
  privileges: Privilege[];
  onSuccess: () => void;
  closeAllModals: () => void;
}

export function CourseModalsContainer({
  courseModals,
  categoryModals,
  lessonModals,
  quizModals,
  privileges,
  onSuccess,
  closeAllModals,
}: CourseModalsContainerProps) {
  return (
    <>
      {/* Course Modals */}
      <CreateCourseModal
        isOpen={courseModals.isCreateCourseModalOpen}
        onClose={closeAllModals}
        onSuccess={onSuccess}
        privileges={privileges}
      />

      {courseModals.selectedCourse && (
        <EditCourseModal
          isOpen={courseModals.isEditCourseModalOpen}
          onClose={closeAllModals}
          onSuccess={onSuccess}
          course={courseModals.selectedCourse}
          privileges={privileges}
        />
      )}

      {/* Category Modals */}
      {categoryModals.selectedCourseForCategory && (
        <CreateCategoryModal
          isOpen={categoryModals.isCreateCategoryModalOpen}
          onClose={closeAllModals}
          onSuccess={onSuccess}
          courseId={categoryModals.selectedCourseForCategory}
        />
      )}

      {categoryModals.selectedCategory && (
        <EditCategoryModal
          isOpen={categoryModals.isEditCategoryModalOpen}
          onClose={closeAllModals}
          onSuccess={onSuccess}
          category={categoryModals.selectedCategory}
        />
      )}

      {/* Lesson Modals */}
      {lessonModals.selectedCourseForLesson &&
        lessonModals.selectedCategoryForLesson && (
          <CreateLessonModal
            isOpen={lessonModals.isCreateLessonModalOpen}
            onClose={closeAllModals}
            onSuccess={onSuccess}
            courseId={lessonModals.selectedCourseForLesson}
            categoryId={lessonModals.selectedCategoryForLesson}
          />
        )}

      {lessonModals.selectedLesson && (
        <EditLessonModal
          isOpen={lessonModals.isEditLessonModalOpen}
          onClose={closeAllModals}
          onSuccess={onSuccess}
          lesson={lessonModals.selectedLesson}
        />
      )}

      {/* Quiz Modals */}
      {quizModals.isCreateQuizModalOpen &&
        quizModals.selectedCourseForQuiz &&
        quizModals.selectedCategoryForQuiz && (
          <CreateQuizModal
            courseId={quizModals.selectedCourseForQuiz}
            categoryId={quizModals.selectedCategoryForQuiz.id}
            categoryName={quizModals.selectedCategoryForQuiz.name}
            onClose={() => {
              closeAllModals();
              onSuccess();
            }}
          />
        )}

      {quizModals.isEditQuizModalOpen &&
        quizModals.selectedCourseForQuiz &&
        quizModals.selectedQuiz && (
          <EditQuizModal
            courseId={quizModals.selectedCourseForQuiz}
            quiz={quizModals.selectedQuiz}
            onClose={() => {
              closeAllModals();
              onSuccess();
            }}
          />
        )}

      {quizModals.isDeleteQuizModalOpen &&
        quizModals.selectedCourseForQuiz &&
        quizModals.selectedQuiz && (
          <DeleteQuizModal
            courseId={quizModals.selectedCourseForQuiz}
            quiz={quizModals.selectedQuiz}
            onClose={() => {
              closeAllModals();
              onSuccess();
            }}
          />
        )}

      {quizModals.isManageQuestionsModalOpen &&
        quizModals.selectedCourseForQuiz &&
        quizModals.selectedQuiz && (
          <ManageQuestionsModal
            courseId={quizModals.selectedCourseForQuiz}
            quizId={quizModals.selectedQuiz.id}
            quizName={quizModals.selectedQuiz.name}
            onClose={() => {
              closeAllModals();
              onSuccess();
            }}
          />
        )}
    </>
  );
}
