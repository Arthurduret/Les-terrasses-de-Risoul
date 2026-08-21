import { ACTIVITY_ICONS } from "./icons";
import type { Activity } from "./activities";

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const Icon = ACTIVITY_ICONS[activity.icon];

  return (
    <div className="rounded-xl border border-wood-700 bg-anthracite-800 p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-anthracite-700 text-wood-300">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-semibold text-foreground">{activity.title}</h3>
      <p className="mt-1 text-sm text-foreground/70">{activity.description}</p>
    </div>
  );
}
