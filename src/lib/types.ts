export interface LeadPayload {
  name: string;
  email: string;
  company: string;
  budget: string;
  message: string;
}

export interface Lead extends LeadPayload {
  id: string;
  status: "new" | "contacted" | "converted";
  created_at: string;
}

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
}

export type FormStatus = "idle" | "loading" | "success" | "error";
