"use client";

import { create } from "zustand";
import {
  createAssignment as createAssignmentRequest,
  deleteAssignment as deleteAssignmentRequest,
  fetchAssignment as fetchAssignmentRequest,
  fetchAssignments as fetchAssignmentsRequest,
  regenerateAssignment as regenerateAssignmentRequest,
} from "@/lib/assignment-api";
import {
  Assignment,
  AssignmentStatus,
  CreateAssignmentInput,
  SocketJobEvent,
} from "@/lib/assignment-types";

type ViewMode = "empty" | "list" | "create" | "output";

type AssignmentStore = {
  assignments: Assignment[];
  selectedAssignmentId: string | null;
  viewMode: ViewMode;
  loading: boolean;
  submitting: boolean;
  socketConnected: boolean;
  toastMessage: string | null;
  errorMessage: string | null;
  fetchAssignments: () => Promise<void>;
  openCreate: () => void;
  openList: () => void;
  openOutput: (assignmentId: string) => void;
  createAssignment: (input: CreateAssignmentInput) => Promise<void>;
  regenerateAssignment: (assignmentId: string) => Promise<void>;
  deleteAssignment: (assignmentId: string) => Promise<void>;
  applySocketEvent: (event: SocketJobEvent) => Promise<void>;
  setSocketConnected: (connected: boolean) => void;
  clearToast: () => void;
};

function sortAssignments(assignments: Assignment[]): Assignment[] {
  return [...assignments].sort(
    (left, right) =>
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  );
}

function mergeAssignment(
  assignments: Assignment[],
  incoming: Assignment,
): Assignment[] {
  const existing = assignments.find((assignment) => assignment.id === incoming.id);
  if (!existing) {
    return sortAssignments([incoming, ...assignments]);
  }

  return sortAssignments(
    assignments.map((assignment) =>
      assignment.id === incoming.id ? { ...assignment, ...incoming } : assignment,
    ),
  );
}

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  assignments: [],
  selectedAssignmentId: null,
  viewMode: "list",
  loading: true,
  submitting: false,
  socketConnected: false,
  toastMessage: null,
  errorMessage: null,

  fetchAssignments: async () => {
    set({ loading: true, errorMessage: null });

    try {
      const assignments = await fetchAssignmentsRequest();
      set({
        assignments: sortAssignments(assignments),
        loading: false,
        viewMode: assignments.length > 0 ? "list" : "empty",
        selectedAssignmentId:
          get().selectedAssignmentId ||
          (assignments.length > 0 ? assignments[0].id : null),
      });
    } catch (error) {
      set({
        loading: false,
        errorMessage:
          error instanceof Error ? error.message : "Failed to fetch assignments.",
      });
    }
  },

  openCreate: () => set({ viewMode: "create", errorMessage: null }),

  openList: () =>
    set((state) => ({
      viewMode: state.assignments.length > 0 ? "list" : "empty",
      errorMessage: null,
    })),

  openOutput: (assignmentId: string) =>
    set({
      selectedAssignmentId: assignmentId,
      viewMode: "output",
      errorMessage: null,
    }),

  createAssignment: async (input) => {
    set({ submitting: true, errorMessage: null });

    try {
      const assignment = await createAssignmentRequest(input);
      set((state) => ({
        assignments: mergeAssignment(state.assignments, assignment),
        selectedAssignmentId: assignment.id,
        viewMode: "list",
        submitting: false,
        toastMessage: "Assignment queued for AI generation.",
      }));
    } catch (error) {
      set({
        submitting: false,
        errorMessage:
          error instanceof Error ? error.message : "Failed to create assignment.",
      });
      throw error;
    }
  },

  regenerateAssignment: async (assignmentId) => {
    try {
      const assignment = await regenerateAssignmentRequest(assignmentId);
      set((state) => ({
        assignments: mergeAssignment(state.assignments, assignment),
        selectedAssignmentId: assignmentId,
        toastMessage: "Regeneration started.",
      }));
    } catch (error) {
      set({
        errorMessage:
          error instanceof Error ? error.message : "Failed to regenerate assignment.",
      });
    }
  },

  deleteAssignment: async (assignmentId) => {
    try {
      const message = await deleteAssignmentRequest(assignmentId);
      set((state) => {
        const nextAssignments = state.assignments.filter(
          (assignment) => assignment.id !== assignmentId,
        );
        const nextSelectedAssignmentId =
          state.selectedAssignmentId === assignmentId
            ? (nextAssignments[0]?.id ?? null)
            : state.selectedAssignmentId;

        return {
          assignments: nextAssignments,
          selectedAssignmentId: nextSelectedAssignmentId,
          viewMode:
            nextAssignments.length === 0
              ? "empty"
              : state.viewMode === "output" &&
                  state.selectedAssignmentId === assignmentId
                ? "list"
                : state.viewMode,
          toastMessage: message,
        };
      });
    } catch (error) {
      set({
        errorMessage:
          error instanceof Error ? error.message : "Failed to delete assignment.",
      });
    }
  },

  applySocketEvent: async (event) => {
    if (event.status === "completed") {
      try {
        const fullAssignment = await fetchAssignmentRequest(event.assignment_id);
        set((state) => {
          const nextAssignments = mergeAssignment(state.assignments, fullAssignment);
          return {
            assignments: nextAssignments,
            toastMessage: event.message,
          } as AssignmentStore;
        });
      } catch (err) {
        console.error("Failed to fetch completed assignment details:", err);
      }
      return;
    }

    set((state) => {
      const nextAssignments = state.assignments.map((assignment) => {
        if (assignment.id !== event.assignment_id) {
          return assignment;
        }

        if (event.assignment) {
          return { ...assignment, ...event.assignment };
        }

        return {
          ...assignment,
          status: event.status as AssignmentStatus,
        };
      });

      return {
        assignments: sortAssignments(nextAssignments),
        toastMessage: event.message,
      } as AssignmentStore;
    });
  },

  setSocketConnected: (connected) => set({ socketConnected: connected }),

  clearToast: () => set({ toastMessage: null }),
}));
