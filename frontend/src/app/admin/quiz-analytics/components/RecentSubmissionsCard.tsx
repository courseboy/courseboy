import { RecentSubmission } from "@/types";
import { formatSubmissionDate, getUserDisplayName } from "../utils";

interface SubmissionRowProps {
  submission: RecentSubmission;
}

function SubmissionRow({ submission }: SubmissionRowProps) {
  const displayName = getUserDisplayName(submission.user);
  const statusStyle = submission.passed
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";
  const statusText = submission.passed ? "✓ Passed" : "✗ Failed";

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-3">
        <div>
          <p className="font-medium text-gray-900">{displayName}</p>
          <p className="text-xs text-gray-500">{submission.user.email}</p>
        </div>
      </td>
      <td className="py-3">
        <div>
          <p className="font-medium text-gray-900">{submission.quiz.name}</p>
          <p className="text-xs text-gray-500">{submission.course.name}</p>
        </div>
      </td>
      <td className="py-3 text-center">
        <span className="font-semibold text-gray-900">
          {submission.percentage}%
        </span>
        <span className="ml-1 text-xs text-gray-500">
          ({submission.score}/{submission.maxScore})
        </span>
      </td>
      <td className="py-3 text-center">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle}`}
        >
          {statusText}
        </span>
      </td>
      <td className="py-3 text-right text-sm text-gray-500">
        {formatSubmissionDate(submission.submittedAt)}
      </td>
    </tr>
  );
}

interface RecentSubmissionsCardProps {
  submissions: RecentSubmission[];
}

const TABLE_HEADERS = [
  { label: "User", align: "left" as const },
  { label: "Quiz", align: "left" as const },
  { label: "Score", align: "center" as const },
  { label: "Status", align: "center" as const },
  { label: "Time", align: "right" as const },
];

export function RecentSubmissionsCard({
  submissions,
}: RecentSubmissionsCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Recent Submissions
      </h2>
      {submissions.length === 0 ? (
        <p className="py-4 text-center text-gray-500">No submissions yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {TABLE_HEADERS.map((header) => (
                  <th
                    key={header.label}
                    className={`pb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-${header.align}`}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((submission) => (
                <SubmissionRow key={submission.id} submission={submission} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
