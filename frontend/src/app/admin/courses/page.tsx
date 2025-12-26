"use client";

import { Spinner } from "@/components/ui/spinner";
import { useCourses, useExpandedItems, useCourseActions } from "./hooks";
import { useCourseModals } from "./useModals";
import {
  CourseCard,
  PageHeader,
  EmptyCoursesState,
  ErrorMessage,
  CourseModalsContainer,
} from "./components";

export default function AdminCoursesPage() {
  // Data fetching
  const { courses, privileges, loading, error, refreshCourses } = useCourses();

  // UI state
  const { expandedCourses, expandedCategories, toggleCourse, toggleCategory } =
    useExpandedItems();

  // Actions
  const {
    actionLoading,
    handleDeleteCourse,
    handleDeleteCategory,
    handleDeleteLesson,
    handleTogglePublish,
  } = useCourseActions();

  // Modal management
  const {
    courseModals,
    categoryModals,
    lessonModals,
    quizModals,
    openCreateCourse,
    openEditCourse,
    openCreateCategory,
    openEditCategory,
    openCreateLesson,
    openEditLesson,
    openCreateQuiz,
    openEditQuiz,
    openDeleteQuiz,
    openManageQuestions,
    closeAllModals,
  } = useCourseModals();

  const handleSuccess = () => {
    refreshCourses();
    closeAllModals();
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      <PageHeader onCreateCourse={openCreateCourse} />

      {error && <ErrorMessage message={error} />}

      <div className="flex flex-col gap-6">
        {courses.length === 0 ? (
          <EmptyCoursesState onCreateCourse={openCreateCourse} />
        ) : (
          courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isExpanded={expandedCourses.has(course.id)}
              onToggle={() => toggleCourse(course.id)}
              onTogglePublish={() => handleTogglePublish(course, refreshCourses)}
              onEdit={() => openEditCourse(course)}
              onDelete={() => handleDeleteCourse(course.id, refreshCourses)}
              onAddCategory={() => openCreateCategory(course.id)}
              actionLoading={actionLoading}
              expandedCategories={expandedCategories}
              onToggleCategory={toggleCategory}
              onEditCategory={openEditCategory}
              onDeleteCategory={(categoryId) =>
                handleDeleteCategory(categoryId, refreshCourses)
              }
              onAddLesson={(categoryId) => openCreateLesson(course.id, categoryId)}
              onEditLesson={openEditLesson}
              onDeleteLesson={(lessonId) =>
                handleDeleteLesson(lessonId, refreshCourses)
              }
              onAddQuiz={(category) => openCreateQuiz(course.id, category)}
              onEditQuiz={(quiz) => openEditQuiz(course.id, quiz)}
              onDeleteQuiz={(quiz) => openDeleteQuiz(course.id, quiz)}
              onManageQuestions={(quiz) => openManageQuestions(course.id, quiz)}
            />
          ))
        )}
      </div>

      <CourseModalsContainer
        courseModals={courseModals}
        categoryModals={categoryModals}
        lessonModals={lessonModals}
        quizModals={quizModals}
        privileges={privileges}
        onSuccess={handleSuccess}
        closeAllModals={closeAllModals}
      />
    </div>
  );
}
