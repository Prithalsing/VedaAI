import {
  Assignment,
  CreateAssignmentInput,
  GeneratedPaper,
} from "./assignment-types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
const SERVER_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

type AssignmentsResponse = {
  success: boolean;
  assignments: Assignment[];
};

type AssignmentResponse = {
  success: boolean;
  assignment: Assignment;
};

type MessageResponse = {
  success: boolean;
  message: string;
};

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", "Bearer veda-ai-secure-secret-token-2024");

  const response = await fetch(`${API_BASE_URL}${input}`, {
    ...init,
    headers,
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload as T;
}

export async function fetchAssignments(): Promise<Assignment[]> {
  const payload = await request<AssignmentsResponse>("/assignments");
  return payload.assignments;
}

export async function createAssignment(
  input: CreateAssignmentInput,
): Promise<Assignment> {
  const formData = new FormData();
  formData.append("due_date", input.dueDate);
  formData.append("question_configs", JSON.stringify(input.questionConfigs));
  if (input.additionalInstructions) {
    formData.append("additional_instructions", input.additionalInstructions);
  }
  if (input.assignmentTitle) {
    formData.append("assignment_title", input.assignmentTitle);
  }

  if (input.file) {
    formData.append("file", input.file);
  }

  const payload = await request<AssignmentResponse>("/assignments", {
    method: "POST",
    body: formData,
  });

  return payload.assignment;
}

export async function fetchAssignment(id: string): Promise<Assignment> {
  const payload = await request<AssignmentResponse>(`/assignments/${id}`);
  return payload.assignment;
}

export async function regenerateAssignment(id: string): Promise<Assignment> {
  const payload = await request<AssignmentResponse>(
    `/assignments/${id}/regenerate`,
    {
      method: "POST",
    },
  );

  return payload.assignment;
}

export async function deleteAssignment(id: string): Promise<string> {
  const payload = await request<MessageResponse>(`/assignments/${id}`, {
    method: "DELETE",
  });

  return payload.message;
}

export function getGeneratedPaper(
  assignment: Assignment,
): GeneratedPaper | undefined {
  if (!assignment.generated_paper_id) {
    return undefined;
  }

  if (typeof assignment.generated_paper_id === "string") {
    return undefined;
  }

  return assignment.generated_paper_id;
}

export function getSocketUrl(): string {
  return process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
}

export function getServerBaseUrl(): string {
  return SERVER_BASE_URL;
}
