'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface TaskItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  status: string;
}

interface ActionItemsChecklistProps {
  tasks: TaskItem[];
  isLoadingTasks: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
};

export default function ActionItemsChecklist({
  tasks,
  isLoadingTasks
}: ActionItemsChecklistProps) {
  const router = useRouter();

  return (
    <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Action Items Checklist
        </h2>
        <button
          onClick={() => router.push('/admin/tasks')}
          className="text-xs text-blue-600 font-semibold flex items-center hover:underline"
        >
          View All <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-3.5">
        {isLoadingTasks ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="flex gap-3 rounded-xl border border-slate-200 p-3 bg-slate-50 animate-pulse"
            >
              <div className="h-4 w-4 bg-slate-200 rounded mt-1 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-2/3 bg-slate-200 rounded" />
                <div className="h-2.5 w-full bg-slate-200 rounded" />
                <div className="flex justify-between mt-2 pt-1">
                  <div className="h-2 w-1/3 bg-slate-200 rounded" />
                  <div className="h-3 w-10 bg-slate-200 rounded-full" />
                </div>
              </div>
            </div>
          ))
        ) : tasks.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-6">No action items due.</p>
        ) : (
          tasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              className="flex gap-3 rounded-xl border border-slate-200 p-3 bg-slate-50/70"
            >
              <input
                type="checkbox"
                checked={task.status === 'COMPLETED'}
                readOnly
                className="mt-1 h-4 w-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <h4
                  className={`text-xs font-bold text-slate-900 ${
                    task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''
                  }`}
                >
                  {task.title}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Due: {task.dueDate}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold ${
                      task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
