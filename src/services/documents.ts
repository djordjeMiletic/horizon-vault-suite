import { api } from "@/lib/api";
import type { DocumentDto, Paginated, SignatureRequestDto } from "@/types/api";

export async function uploadDocument(file: File, opts?: { ownerEmail?: string; caseId?: string; tags?: string }) {
  const fd = new FormData();
  fd.append("File", file);  // Backend expects "File" not "file"
  if (opts?.ownerEmail) fd.append("OwnerEmail", opts.ownerEmail);
  if (opts?.caseId) fd.append("CaseId", opts.caseId);
  if (opts?.tags) fd.append("Tags", opts.tags);
  const { data } = await api.post("/Documents", fd, { headers: { "Content-Type": "multipart/form-data" } });
  return data as DocumentDto;
}

export async function listDocuments(params?: { ownerEmail?: string; caseId?: string; page?: number; pageSize?: number }) {
  const { data } = await api.get("/Documents", { params });
  return data as Paginated<DocumentDto>;
}

export async function createSignatureRequest(documentId: string, signerEmail: string) {
  const { data } = await api.post("/esignature/requests", { documentId, signerEmail });
  return data as SignatureRequestDto;
}

export async function completeSignatureRequest(id: string, status: "Signed" | "Declined") {
  await api.post(`/esignature/requests/${id}/complete`, { status });
}

export const documentsService = {
  uploadDocument,
  listDocuments,
  createSignatureRequest,
  completeSignatureRequest,
  getAll: () => listDocuments({}),
  getByOwner: (ownerEmail: string) => listDocuments({ ownerEmail })
};