import React, { useState } from "react";
import { useHotel } from "../context/HotelContext";
import { HotelTask, TaskCategory, TaskPriority, TaskStatus } from "../types";
import {
  Briefcase,
  Sparkles,
  Plus,
  CheckCircle2,
  Clock,
  Wrench,
  BedDouble,
  BellRing,
  UserCheck,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  X,
} from "lucide-react";

export const StaffTasksView: React.FC = () => {
  const {
    staff,
    tasks,
    rooms,
    bookings,
    addTask,
    updateTaskStatus,
    applyAiPrioritizedTasks,
    showToast,
  } = useHotel();

  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("Active");
  const [isAiPrioritizing, setIsAiPrioritizing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  // New task form state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskRoomNumber, setTaskRoomNumber] = useState("");
  const [taskCategory, setTaskCategory] = useState<TaskCategory>("Housekeeping");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("High");
  const [taskAssignedTo, setTaskAssignedTo] = useState("");
  const [taskDueTime, setTaskDueTime] = useState("14:30");

  const filteredTasks = tasks.filter((t) => {
    if (categoryFilter !== "All" && t.category !== categoryFilter) return false;
    if (statusFilter === "Active" && t.status === "Completed") return false;
    if (statusFilter === "Completed" && t.status !== "Completed") return false;
    return true;
  });

  const handleAiPrioritize = async () => {
    setIsAiPrioritizing(true);
    try {
      const response = await fetch("/api/ai/prioritize-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks,
          rooms: rooms.map((r) => ({ roomNumber: r.roomNumber, status: r.status, type: r.type })),
          checkInsToday: bookings.filter((b) => b.checkInDate === "2026-09-15"),
        }),
      });

      const data = await response.json();
      if (data.tasks && Array.isArray(data.tasks)) {
        // Merge AI scores & rationales with original tasks
        const updated = tasks.map((orig) => {
          const aiMatch = data.tasks.find((at: any) => at.id === orig.id);
          if (aiMatch) {
            return {
              ...orig,
              aiPriorityScore: aiMatch.aiPriorityScore || orig.aiPriorityScore,
              aiRationale: aiMatch.aiRationale || orig.aiRationale,
            };
          }
          return orig;
        });

        // Sort by AI score descending
        updated.sort((a, b) => (b.aiPriorityScore || 0) - (a.aiPriorityScore || 0));
        applyAiPrioritizedTasks(updated);
        if (data.advice) {
          setAiAdvice(data.advice);
        }
      }
    } catch (err) {
      console.error("AI Prioritization failed", err);
      showToast("Unable to prioritize with AI. Applied operational heuristics.", "warning");
    } finally {
      setIsAiPrioritizing(false);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle.trim(),
      roomNumber: taskRoomNumber.trim() || undefined,
      category: taskCategory,
      priority: taskPriority,
      status: "Pending",
      assignedTo: taskAssignedTo.trim() || undefined,
      dueTime: taskDueTime,
      aiPriorityScore: taskPriority === "Urgent" ? 95 : taskPriority === "High" ? 85 : 60,
    });

    setIsAddTaskOpen(false);
    setTaskTitle("");
    setTaskRoomNumber("");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            Staff Roster & Work Order Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate housekeeping turns, facility repairs, and concierge assignments with AI intelligent dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-ai-prioritize-tasks"
            onClick={handleAiPrioritize}
            disabled={isAiPrioritizing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xs disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAiPrioritizing ? "animate-spin" : ""}`} />
            <span>{isAiPrioritizing ? "Analyzing Schedule..." : "AI Prioritize Tasks"}</span>
          </button>

          <button
            id="btn-create-task"
            onClick={() => setIsAddTaskOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> New Work Order
          </button>
        </div>
      </div>

      {/* AI Operational Advice Banner if available */}
      {aiAdvice && (
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-xs font-bold text-indigo-950">AI Operations Dispatch Recommendation</div>
            <p className="text-xs text-indigo-800 mt-0.5 leading-relaxed">{aiAdvice}</p>
          </div>
          <button
            onClick={() => setAiAdvice(null)}
            className="text-xs text-indigo-600 hover:text-indigo-900 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Staff on duty strip */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Today's Staff Shift Roster ({staff.length})</h2>
          </div>
          <span className="text-xs text-slate-500">Active Shift: Morning (07:00 - 15:00)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {staff.map((member) => (
            <div
              key={member.id}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{member.name}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                      member.status === "On Duty"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {member.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{member.role}</div>
                <div className="text-[10px] text-indigo-600 font-medium">{member.department}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>{member.shift} Shift</span>
                <span>⭐ {member.rating.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks & Work Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 mr-1">Category:</span>
            {["All", "Housekeeping", "Maintenance", "Concierge", "Front Desk"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 text-xs rounded-xl font-medium transition-all ${
                  categoryFilter === cat
                    ? "bg-slate-900 text-white font-semibold shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <button
              onClick={() => setStatusFilter("Active")}
              className={`px-3 py-1 text-xs rounded-xl font-medium ${
                statusFilter === "Active" ? "bg-indigo-600 text-white font-semibold" : "bg-slate-100 text-slate-600"
              }`}
            >
              Active ({tasks.filter((t) => t.status !== "Completed").length})
            </button>
            <button
              onClick={() => setStatusFilter("Completed")}
              className={`px-3 py-1 text-xs rounded-xl font-medium ${
                statusFilter === "Completed" ? "bg-indigo-600 text-white font-semibold" : "bg-slate-100 text-slate-600"
              }`}
            >
              Completed ({tasks.filter((t) => t.status === "Completed").length})
            </button>
            <button
              onClick={() => setStatusFilter("All")}
              className={`px-3 py-1 text-xs rounded-xl font-medium ${
                statusFilter === "All" ? "bg-indigo-600 text-white font-semibold" : "bg-slate-100 text-slate-600"
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400">
              No tasks found in this view.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isCompleted = task.status === "Completed";
              const isInProgress = task.status === "In Progress";

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isCompleted
                      ? "bg-slate-50/70 border-slate-200 opacity-70"
                      : "bg-white border-slate-200 hover:border-indigo-200 shadow-2xs"
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2.5">
                      {task.roomNumber && (
                        <span className="font-bold text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                          Room {task.roomNumber}
                        </span>
                      )}
                      <span className={`text-xs font-bold ${isCompleted ? "line-through text-slate-400" : "text-slate-900"}`}>
                        {task.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                          task.priority === "Urgent"
                            ? "bg-rose-100 text-rose-800"
                            : task.priority === "High"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span>Category: <strong className="text-slate-700">{task.category}</strong></span>
                      <span>•</span>
                      <span>Assigned to: <strong className="text-slate-700">{task.assignedTo || "Unassigned"}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> Due: {task.dueTime}
                      </span>
                      {task.aiPriorityScore && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 font-semibold">
                            AI Urgency Score: {task.aiPriorityScore}
                          </span>
                        </>
                      )}
                    </div>

                    {task.aiRationale && (
                      <div className="text-[11px] text-indigo-700 bg-indigo-50/80 p-2 rounded-lg mt-2 border border-indigo-100 leading-relaxed">
                        <strong>AI Operations Rationale:</strong> {task.aiRationale}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-stretch md:self-auto justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {!isCompleted && (
                      <>
                        {isInProgress ? (
                          <button
                            onClick={() => updateTaskStatus(task.id, "Completed")}
                            className="flex-1 md:flex-initial min-h-[40px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Complete Work
                          </button>
                        ) : (
                          <button
                            onClick={() => updateTaskStatus(task.id, "In Progress")}
                            className="flex-1 md:flex-initial min-h-[40px] px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 text-xs font-semibold flex items-center justify-center transition-colors"
                          >
                            Start Work
                          </button>
                        )}
                      </>
                    )}

                    {isCompleted && (
                      <span className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddTaskOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsAddTaskOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Dispatch Work Order</h3>
              <button
                onClick={() => setIsAddTaskOpen(false)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 active:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Deep clean carpet in Room 402"
                  className="w-full px-3 py-2.5 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Room # (Optional)
                  </label>
                  <input
                    type="text"
                    value={taskRoomNumber}
                    onChange={(e) => setTaskRoomNumber(e.target.value)}
                    placeholder="e.g. 304"
                    className="w-full px-3 py-2.5 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2.5 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                  >
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Concierge">Concierge</option>
                    <option value="Front Desk">Front Desk</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2.5 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due By
                  </label>
                  <input
                    type="text"
                    value={taskDueTime}
                    onChange={(e) => setTaskDueTime(e.target.value)}
                    placeholder="14:00"
                    className="w-full px-3 py-2.5 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign To Staff
                </label>
                <select
                  value={taskAssignedTo}
                  onChange={(e) => setTaskAssignedTo(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                >
                  <option value="">Unassigned</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="flex-1 sm:flex-initial min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 active:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial min-h-[40px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold"
                >
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
