import { StrugglingUser } from "@/types";
import { getUserDisplayName } from "../utils";

interface StrugglingUserRowProps {
  data: StrugglingUser;
}

function StrugglingUserRow({ data }: StrugglingUserRowProps) {
  const displayName = getUserDisplayName(data.user);

  return (
    <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-200">
          <span className="material-symbols-outlined text-orange-700">person</span>
        </div>
        <div>
          <p className="font-medium text-gray-900">{displayName}</p>
          <p className="text-xs text-gray-500">{data.user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-red-600">{data.failedQuizzes} failed</p>
          <p className="text-xs text-gray-500">of {data.totalAttempts} attempts</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">{data.avgScore}%</p>
          <p className="text-xs text-gray-500">avg score</p>
        </div>
      </div>
    </div>
  );
}

interface StrugglingUsersCardProps {
  users: StrugglingUser[];
}

export function StrugglingUsersCard({ users }: StrugglingUsersCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <span className="material-symbols-outlined text-orange-500">warning</span>
        Users Needing Attention
      </h2>
      {users.length === 0 ? (
        <p className="py-4 text-center text-gray-500">No struggling users - great job! 🎉</p>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <StrugglingUserRow key={user.user.id} data={user} />
          ))}
        </div>
      )}
    </div>
  );
}
