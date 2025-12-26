import { getScoreRangeColor } from "../utils";

interface ScoreDistributionItem {
  range: string;
  count: number;
}

interface ScoreDistributionCardProps {
  distribution: ScoreDistributionItem[];
}

export function ScoreDistributionCard({ distribution }: ScoreDistributionCardProps) {
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Score Distribution</h2>
      <div className="space-y-3">
        {distribution.map((item) => {
          const widthPercent = (item.count / maxCount) * 100;
          return (
            <div key={item.range} className="flex items-center gap-3">
              <span className="w-16 text-sm font-medium text-gray-600">{item.range}%</span>
              <div className="flex-1">
                <div className="h-8 overflow-hidden rounded-lg bg-gray-100">
                  <div
                    className={`h-full transition-all ${getScoreRangeColor(item.range)}`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
              <span className="w-12 text-right text-sm font-semibold text-gray-800">
                {item.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
