"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminCourseApi } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { Quiz, QuizQuestion } from "@/types";

interface CreateQuizModalProps {
  courseId: number;
  categoryId: number;
  categoryName: string;
  onClose: () => void;
}

export function CreateQuizModal({
  courseId,
  categoryId,
  categoryName,
  onClose,
}: CreateQuizModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    passingScore: "70",
    timeLimit: "",
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      passingScore?: number;
      timeLimit?: number | null;
    }) => adminCourseApi.createQuiz(categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
      passingScore: parseInt(formData.passingScore) || 70,
      timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Add Quiz</h3>
            <p className="text-sm text-gray-500">For: {categoryName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Quiz Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#3A7BD5] focus:outline-none focus:ring-1 focus:ring-[#3A7BD5]"
              placeholder="e.g., Chapter 1 Quiz"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#3A7BD5] focus:outline-none focus:ring-1 focus:ring-[#3A7BD5]"
              placeholder="Optional description for the quiz"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Passing Score (%)
              </label>
              <input
                type="number"
                value={formData.passingScore}
                onChange={(e) =>
                  setFormData({ ...formData, passingScore: e.target.value })
                }
                min="0"
                max="100"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#3A7BD5] focus:outline-none focus:ring-1 focus:ring-[#3A7BD5]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Time Limit (min)
              </label>
              <input
                type="number"
                value={formData.timeLimit}
                onChange={(e) =>
                  setFormData({ ...formData, timeLimit: e.target.value })
                }
                min="1"
                placeholder="No limit"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#3A7BD5] focus:outline-none focus:ring-1 focus:ring-[#3A7BD5]"
              />
            </div>
          </div>

          {createMutation.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {(createMutation.error as Error).message ||
                "Failed to create quiz"}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !formData.name}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#3A7BD5] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2E6BC4] disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">add</span>
                  Add Quiz
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditQuizModalProps {
  courseId: number;
  quiz: Quiz;
  onClose: () => void;
}

export function EditQuizModal({ courseId, quiz, onClose }: EditQuizModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: quiz.name,
    description: quiz.description || "",
    passingScore: quiz.passingScore.toString(),
    timeLimit: quiz.timeLimit?.toString() || "",
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      name?: string;
      description?: string;
      passingScore?: number;
      timeLimit?: number | null;
    }) => adminCourseApi.updateQuiz(quiz.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
      passingScore: parseInt(formData.passingScore) || 70,
      timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Edit Quiz</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Quiz Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#3A7BD5] focus:outline-none focus:ring-1 focus:ring-[#3A7BD5]"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#3A7BD5] focus:outline-none focus:ring-1 focus:ring-[#3A7BD5]"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Passing Score (%)
              </label>
              <input
                type="number"
                value={formData.passingScore}
                onChange={(e) =>
                  setFormData({ ...formData, passingScore: e.target.value })
                }
                min="0"
                max="100"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#3A7BD5] focus:outline-none focus:ring-1 focus:ring-[#3A7BD5]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Time Limit (min)
              </label>
              <input
                type="number"
                value={formData.timeLimit}
                onChange={(e) =>
                  setFormData({ ...formData, timeLimit: e.target.value })
                }
                min="1"
                placeholder="No limit"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#3A7BD5] focus:outline-none focus:ring-1 focus:ring-[#3A7BD5]"
              />
            </div>
          </div>

          {updateMutation.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {(updateMutation.error as Error).message ||
                "Failed to update quiz"}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending || !formData.name}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#3A7BD5] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2E6BC4] disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">
                    save
                  </span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteQuizModalProps {
  courseId: number;
  quiz: Quiz;
  onClose: () => void;
}

export function DeleteQuizModal({
  courseId,
  quiz,
  onClose,
}: DeleteQuizModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => adminCourseApi.deleteQuiz(quiz.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Delete Quiz</h3>
            <p className="text-sm text-gray-500">
              This action cannot be undone
            </p>
          </div>
        </div>

        <p className="mb-6 text-gray-600">
          Are you sure you want to delete <strong>{quiz.name}</strong>? All
          questions and submission records will also be deleted.
        </p>

        {deleteMutation.error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {(deleteMutation.error as Error).message || "Failed to delete quiz"}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {deleteMutation.isPending ? (
              <Spinner size="sm" />
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">
                  delete
                </span>
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ Question Management Modal ============

interface ManageQuestionsModalProps {
  courseId: number;
  quizId: number;
  quizName: string;
  onClose: () => void;
}

export function ManageQuestionsModal({
  // courseId, // Unused
  quizId,
  quizName,
  onClose,
}: ManageQuestionsModalProps) {
  const queryClient = useQueryClient();
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(
    null
  );
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  // Fetch quiz with questions
  const { data: quizData, isLoading } = useQuery({
    queryKey: ["quiz-admin", quizId],
    queryFn: async () => {
      const response = await adminCourseApi.getQuizAdmin(quizId);
      return response.data.data;
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: number) =>
      adminCourseApi.deleteQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-admin", quizId] });
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
  });

  const questions = quizData?.questions || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Manage Questions
            </h3>
            <p className="text-sm text-gray-500">{quizName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">
                quiz
              </span>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                No questions yet
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Add questions to your quiz
              </p>
              <button
                onClick={() => setShowAddQuestion(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#3A7BD5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2E6BC4]"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Add First Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question: QuizQuestion, index: number) => (
                <div
                  key={question.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                          {index + 1}
                        </span>
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          {question.questionType === "true_false"
                            ? "True/False"
                            : "Multiple Choice"}
                        </span>
                        <span className="text-xs text-gray-400">
                          • {question.points} pts
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mb-3">
                        {question.questionText}
                      </p>
                      <div className="grid gap-2">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                              optIndex === question.correctAnswer
                                ? "bg-green-50 border border-green-200 text-green-800"
                                : "bg-gray-50 text-gray-700"
                            }`}
                          >
                            <span className="font-medium">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            {option}
                            {optIndex === question.correctAnswer && (
                              <span className="material-symbols-outlined text-green-600 ml-auto text-sm">
                                check_circle
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingQuestion(question)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-lg">
                          edit
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this question?")) {
                            deleteQuestionMutation.mutate(question.id);
                          }
                        }}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-between">
          <button
            onClick={() => setShowAddQuestion(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#3A7BD5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2E6BC4]"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add Question
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Done
          </button>
        </div>
      </div>

      {/* Add Question Modal */}
      {showAddQuestion && (
        <QuestionFormModal
          quizId={quizId}
          onClose={() => setShowAddQuestion(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["quiz-admin", quizId] });
            queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
            setShowAddQuestion(false);
          }}
        />
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <QuestionFormModal
          quizId={quizId}
          question={editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["quiz-admin", quizId] });
            queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
            setEditingQuestion(null);
          }}
        />
      )}
    </div>
  );
}

// ============ Question Form Modal ============

interface QuestionFormModalProps {
  quizId: number;
  question?: QuizQuestion;
  onClose: () => void;
  onSuccess: () => void;
}

function QuestionFormModal({
  quizId,
  question,
  onClose,
  onSuccess,
}: QuestionFormModalProps) {
  const isEditing = !!question;
  const [formData, setFormData] = useState({
    questionText: question?.questionText || "",
    questionType:
      question?.questionType ||
      ("multiple_choice" as "multiple_choice" | "true_false"),
    options: question?.options || ["", ""],
    correctAnswer: question?.correctAnswer ?? 0,
    points: question?.points?.toString() || "1",
  });

  // Set true/false options when question type changes
  useEffect(() => {
    if (
      formData.questionType === "true_false" &&
      formData.options.length !== 2
    ) {
      setFormData((prev) => ({
        ...prev,
        options: ["True", "False"],
        correctAnswer: 0,
      }));
    }
  }, [formData.questionType, formData.options.length]); // Added missing dependency

  const createMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (data: any) => adminCourseApi.createQuestion(quizId, data),
    onSuccess,
  });

  const updateMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (data: any) =>
      adminCourseApi.updateQuestion(question!.id, data),
    onSuccess,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      questionText: formData.questionText,
      questionType: formData.questionType,
      options: formData.options.filter((o) => o.trim()),
      correctAnswer: formData.correctAnswer,
      points: parseInt(formData.points) || 1,
    };

    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) return;
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
      correctAnswer:
        prev.correctAnswer >= index && prev.correctAnswer > 0
          ? prev.correctAnswer - 1
          : prev.correctAnswer,
    }));
  };

  const updateOption = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => (i === index ? value : o)),
    }));
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {isEditing ? "Edit Question" : "Add Question"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question Type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Question Type
            </label>
            <select
              value={formData.questionType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  questionType: e.target.value as "multiple_choice" | "true_false",
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#3A7BD5] focus:outline-none focus:ring-1 focus:ring-[#3A7BD5]"
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True/False</option>
            </select>
          </div>

          {/* Question Text */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Question <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.questionText}
              onChange={(e) =>
                setFormData({ ...formData, questionText: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#3A7BD5] focus:outline-none focus:ring-1 focus:ring-[#3A7BD5]"
              rows={2}
              required
            />
          </div>

          {/* Options */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Options <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Click the radio button to mark the correct answer
            </p>
            <div className="space-y-2">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.correctAnswer === index}
                    onChange={() =>
                      setFormData({ ...formData, correctAnswer: index })
                    }
                    className="h-4 w-4 text-[#3A7BD5] focus:ring-[#3A7BD5]"
                  />
                  <span className="w-6 text-sm font-medium text-gray-500">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    disabled={formData.questionType === "true_false"}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#3A7BD5] focus:outline-none focus:ring-1 focus:ring-[#3A7BD5] disabled:bg-gray-50"
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    required
                  />
                  {formData.questionType === "multiple_choice" &&
                    formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                      >
                        <span className="material-symbols-outlined text-lg">
                          close
                        </span>
                      </button>
                    )}
                </div>
              ))}
            </div>
            {formData.questionType === "multiple_choice" && (
              <button
                type="button"
                onClick={addOption}
                className="mt-2 inline-flex items-center gap-1 text-sm text-[#3A7BD5] hover:text-[#2E6BC4]"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Add Option
              </button>
            )}
          </div>

          {/* Points */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Points
            </label>
            <input
              type="number"
              value={formData.points}
              onChange={(e) =>
                setFormData({ ...formData, points: e.target.value })
              }
              min="1"
              className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#3A7BD5] focus:outline-none focus:ring-1 focus:ring-[#3A7BD5]"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {(error as Error).message || "Failed to save question"}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isPending ||
                !formData.questionText ||
                formData.options.some((o) => !o.trim())
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#3A7BD5] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2E6BC4] disabled:opacity-50"
            >
              {isPending ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">
                    {isEditing ? "save" : "add"}
                  </span>
                  {isEditing ? "Save Changes" : "Add Question"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
