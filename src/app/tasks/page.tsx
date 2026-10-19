"use client";

import React, { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { TaskItem } from "@/components/tasks/TaskItem";
import { TaskModal } from "@/components/tasks/TaskModal";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { useTasks } from "@/hooks/useTasks";
import { Task, TaskCategory } from "@/types";
import { Plus, Trash2, CheckCircle2, Archive, Search } from "lucide-react";

export default function TasksPage() {
  const {
    tasks,
    toggleTaskComplete,
    deleteTask,
    updateTask,
    addTask,
    archiveTask,
    bulkComplete,
    bulkDelete,
  } = useTasks();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [viewMode, setViewMode] = useState<"list" | "grouped">("list");
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Ignore archived tasks from standard active list
      if (t.archived_at || t.status === "archived") return false;

      // Category filter
      if (selectedCategory !== "ALL" && t.category !== selectedCategory) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== "ALL" && t.priority !== selectedPriority) {
        return false;
      }

      // Status filter
      if (selectedStatus === "incomplete" && t.status === "completed") {
        return false;
      }
      if (selectedStatus === "completed" && t.status !== "completed") {
        return false;
      }
      if (selectedStatus === "overdue") {
        const todayStr = new Date().toISOString().slice(0, 10);
        if (t.due_date >= todayStr || t.status === "completed") return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        const matchesCat = t.category.toLowerCase().includes(q);
        const matchesTag = t.tags?.some((tag) => tag.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesTag) return false;
      }

      return true;
    });
  }, [tasks, selectedCategory, selectedPriority, selectedStatus, searchQuery]);

  // Grouped tasks by category
  const groupedTasks = useMemo(() => {
    const groups: Partial<Record<TaskCategory, Task[]>> = {};
    filteredTasks.forEach((t) => {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category]!.push(t);
    });
    return groups;
  }, [filteredTasks]);

  const handleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    }
  };

  const handleBulkComplete = async () => {
    await bulkComplete(selectedTaskIds);
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedTaskIds.length} tasks permanently?`)) {
      await bulkDelete(selectedTaskIds);
      setSelectedTaskIds([]);
    }
  };

  return (
    <AppShell>
      <Header
        onOpenAddTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onSearchChange={setSearchQuery}
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F1F3EC]">
              Task Central
            </h1>
            <p className="text-xs font-mono text-[#92988D]">
              Manage engineering workload, CS concepts, and routines
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C6FF5E] text-[#090B09] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#b5f547] transition-all self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>

        {/* Filters */}
        <TaskFilters
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedPriority={selectedPriority}
          onSelectPriority={setSelectedPriority}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
        />

        {/* Bulk Action Toolbar if items selected */}
        {selectedTaskIds.length > 0 && (
          <div className="p-3 rounded-xl bg-[#171C16] border border-[#384534] flex items-center justify-between gap-3 text-xs font-mono">
            <span className="text-[#C6FF5E] font-bold">
              {selectedTaskIds.length} task(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkComplete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#232A21] text-[#C6FF5E] hover:bg-[#2C3529]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete Selected</span>
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(255,94,94,0.15)] text-[#FF5E5E] border border-[rgba(255,94,94,0.3)] hover:bg-[#FF5E5E] hover:text-black"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        )}

        {/* Task List or Grouped View */}
        {filteredTasks.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-[#0E110E] border border-[#232A21] space-y-3">
            <div className="font-mono text-sm text-[#92988D]">NO MATCHING TASKS</div>
            <p className="text-xs text-[#5E645A]">
              Adjust your filters or add a new task to your pipeline.
            </p>
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-2.5">
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={toggleTaskComplete}
                onEdit={(t) => {
                  setEditingTask(t);
                  setIsTaskModalOpen(true);
                }}
                onDelete={deleteTask}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedTasks).map(([cat, catTasks]) => (
              <div key={cat} className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#232A21]">
                  <span className="text-sm font-bold font-mono text-[#F1F3EC] tracking-wide">
                    {cat}
                  </span>
                  <span className="text-xs font-mono text-[#92988D]">
                    {catTasks?.filter((t) => t.status === "completed").length} /{" "}
                    {catTasks?.length} completed
                  </span>
                </div>
                <div className="space-y-2.5">
                  {catTasks?.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={toggleTaskComplete}
                      onEdit={(t) => {
                        setEditingTask(t);
                        setIsTaskModalOpen(true);
                      }}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        initialTask={editingTask}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={async (data) => {
          if (editingTask) {
            await updateTask(editingTask.id, data);
            return { success: true };
          } else {
            return await addTask(data);
          }
        }}
      />
    </AppShell>
  );
}
