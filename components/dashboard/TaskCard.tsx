"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

interface Task {
  text: string;
  completed?: boolean;
}

interface TaskCardProps {
  title?: string;
  tasks: Task[];
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, delay: i * 0.08 },
  }),
};

export default function TaskCard({
  title = "Upcoming Tasks",
  tasks,
}: TaskCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:shadow-lg">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5 space-y-4">
        {tasks.map((task, i) => (
          <motion.div
            key={task.text}
            custom={i}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-3"
          >
            {task.completed ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 shrink-0 text-zinc-300" />
            )}
            <span
              className={`text-sm ${
                task.completed
                  ? "text-zinc-400 line-through"
                  : "text-zinc-700"
              }`}
            >
              {task.text}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
