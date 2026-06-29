"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface Activity {
  text: string;
  time?: string;
}

interface ActivityCardProps {
  title?: string;
  activities: Activity[];
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, delay: i * 0.08 },
  }),
};

export default function ActivityCard({
  title = "Recent Activity",
  activities,
}: ActivityCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:shadow-lg">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5 space-y-4">
        {activities.map((activity, i) => (
          <motion.div
            key={activity.text}
            custom={i}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="flex items-start gap-3"
          >
            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-zinc-300" />
            <div className="flex-1">
              <p className="text-sm text-zinc-700">{activity.text}</p>
              {activity.time && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-400">
                  <Clock className="h-3 w-3" />
                  {activity.time}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
