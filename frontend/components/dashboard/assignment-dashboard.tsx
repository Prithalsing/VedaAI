"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft, Bell, ChevronDown, Menu } from "lucide-react";
import { io } from "socket.io-client";
import { getGeneratedPaper, getSocketUrl } from "@/lib/assignment-api";
import { SocketJobEvent } from "@/lib/assignment-types";
import { useAssignmentStore } from "@/stores/assignment-store";
import { AssignmentCreateView } from "./assignment-create-view";
import { AssignmentListView } from "./assignment-list-view";
import { AssignmentOutputView } from "./assignment-output-view";
import { DashboardEmptyState } from "./dashboard-empty-state";
import { DashboardSidebar } from "./dashboard-sidebar";
import { MobileBottomNav } from "./mobile-bottom-nav";

export function AssignmentDashboard() {
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const assignments = useAssignmentStore((state) => state.assignments);
  const selectedAssignmentId = useAssignmentStore(
    (state) => state.selectedAssignmentId,
  );
  const viewMode = useAssignmentStore((state) => state.viewMode);
  const loading = useAssignmentStore((state) => state.loading);
  const submitting = useAssignmentStore((state) => state.submitting);
  const toastMessage = useAssignmentStore((state) => state.toastMessage);
  const errorMessage = useAssignmentStore((state) => state.errorMessage);
  const fetchAssignments = useAssignmentStore((state) => state.fetchAssignments);
  const openCreate = useAssignmentStore((state) => state.openCreate);
  const openList = useAssignmentStore((state) => state.openList);
  const openOutput = useAssignmentStore((state) => state.openOutput);
  const createAssignment = useAssignmentStore((state) => state.createAssignment);
  const regenerateAssignment = useAssignmentStore(
    (state) => state.regenerateAssignment,
  );
  const deleteAssignment = useAssignmentStore((state) => state.deleteAssignment);
  const applySocketEvent = useAssignmentStore((state) => state.applySocketEvent);
  const setSocketConnected = useAssignmentStore(
    (state) => state.setSocketConnected,
  );
  const clearToast = useAssignmentStore((state) => state.clearToast);

  const selectedAssignment = assignments.find(
    (assignment) => assignment.id === selectedAssignmentId,
  );

  useEffect(() => {
    void fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    const socket = io(getSocketUrl(), {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("job_status_change", (event: SocketJobEvent) => {
      applySocketEvent(event);
    });

    socket.on("job_completed", (event: SocketJobEvent) => {
      applySocketEvent(event);
    });

    socket.on("job_failed", (event: SocketJobEvent) => {
      applySocketEvent(event);
    });

    return () => {
      socketRef.current = null;
      socket.disconnect();
    };
  }, [applySocketEvent, setSocketConnected]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) {
      return;
    }

    assignments.forEach((assignment) => {
      socket.emit("join_assignment", assignment.id);
    });
  }, [assignments]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      clearToast();
    }, 3200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [clearToast, toastMessage]);

  const heading =
    viewMode === "create"
      ? "Create Assignment"
      : viewMode === "output"
        ? "Assignment Output"
        : "Assignments";

  const handleBack = () => {
    if (viewMode === "output" || viewMode === "create") {
      openList();
    }
  };

  return (
    <main className="h-screen max-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#f6f1e9_0%,#ece8e2_45%,#d8d3cc_100%)] text-slate-900 flex flex-col">
      <div className="flex h-full min-h-0 w-full gap-4 border border-white/60 bg-white/35 p-3 pb-[145px] shadow-[0_32px_90px_rgba(15,23,42,0.14)] backdrop-blur sm:p-4 sm:pb-[155px] lg:p-4 lg:pb-4 lg:gap-5 overflow-hidden">
        <DashboardSidebar onCreateAssignment={openCreate} />

        <div className="relative flex min-w-0 min-h-0 flex-1 flex-col rounded-[28px] bg-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur">
          <header className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm lg:inline-flex"
                onClick={handleBack}
                aria-label="Back to assignments"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
                  Dashboard
                </p>
                <h1 className="truncate text-lg font-semibold sm:text-xl">
                  {heading}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
                aria-label="Notifications"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white" />
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-left shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f59e0b,#ef4444)] text-sm font-semibold text-white">
                  JD
                </div>
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    John Doe
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    Teacher account
                  </p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
              </button>
            </div>
          </header>

          {toastMessage ? (
            <div className="absolute right-5 top-20 z-20 rounded-2xl border border-emerald-200 bg-white/95 px-4 py-3 text-sm text-slate-700 shadow-lg">
              {toastMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mx-4 mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-6">
              {errorMessage}
            </div>
          ) : null}

          {loading ? (
            <section className="flex flex-1 items-center justify-center rounded-[28px] bg-[radial-gradient(circle_at_top,#ffffff_0%,#f7f5f2_45%,#efebe5_100%)]">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
                <p className="mt-4 text-sm text-slate-500">
                  Loading assignments...
                </p>
              </div>
            </section>
          ) : viewMode === "create" ? (
            <AssignmentCreateView
              onBack={openList}
              onSubmit={createAssignment}
              submitting={submitting}
            />
          ) : assignments.length === 0 ? (
            <DashboardEmptyState onCreateAssignment={openCreate} />
          ) : viewMode === "output" && selectedAssignment ? (
            <AssignmentOutputView
              assignment={selectedAssignment}
              onBack={openList}
              onRegenerate={() => regenerateAssignment(selectedAssignment.id)}
            />
          ) : (
            <AssignmentListView
              assignments={assignments}
              selectedAssignmentId={selectedAssignment?.id ?? null}
              onCreateAssignment={openCreate}
              onSelectAssignment={(assignment) => {
                if (getGeneratedPaper(assignment)) {
                  openOutput(assignment.id);
                  return;
                }

                useAssignmentStore.setState({
                  toastMessage:
                    assignment.status === "failed"
                      ? "Generation failed. Regenerate the assignment to retry."
                      : "Question paper is still being generated.",
                });
              }}
              onViewAssignment={(assignment) => {
                if (getGeneratedPaper(assignment)) {
                  openOutput(assignment.id);
                  return;
                }

                useAssignmentStore.setState({
                  toastMessage:
                    assignment.status === "failed"
                      ? "Generation failed. Regenerate the assignment to retry."
                      : "Question paper is still being generated.",
                });
              }}
              onDeleteAssignment={(assignment) => {
                const confirmed = window.confirm(
                  "Delete this assignment and its generated paper?",
                );
                if (!confirmed) {
                  return;
                }
                void deleteAssignment(assignment.id);
              }}
            />
          )}
        </div>
      </div>

      <MobileBottomNav onCreateAssignment={openCreate} title={heading} />
    </main>
  );
}
