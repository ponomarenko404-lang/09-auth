import { api } from "./api";
import { Note, NoteTag } from "@/types/note";
import { User } from "@/types/user";

export interface CreateNoteData {
  title: string;
  content: string;
  tag: NoteTag;
}

interface NotesResponse {
  notes: Note[];
  totalPages: number;
}

interface AuthData {
  email: string;
  password: string;
}

interface UpdateUserData {
  username: string;
}

export interface FetchNotesParams {
  page?: number;
  search?: string;
  tag?: string;
  perPage?: number;
}

export const fetchNotes = async (
  params: FetchNotesParams,
): Promise<NotesResponse> => {
  const { data } = await api.get("/notes", {
    params,
  });

  return data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const { data } = await api.get(`/notes/${id}`);
  return data;
};

export const createNote = async (noteData: CreateNoteData): Promise<Note> => {
  const { data } = await api.post("/notes", noteData);
  return data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const { data } = await api.delete(`/notes/${id}`);
  return data;
};

export const register = async (credentials: AuthData): Promise<User> => {
  const { data } = await api.post("/auth/register", credentials);
  return data;
};

export const login = async (credentials: AuthData): Promise<User> => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const checkSession = async () => {
  const { data } = await api.get("/auth/session");
  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get("/users/me");
  return data;
};

export const updateMe = async (body: UpdateUserData): Promise<User> => {
  const { data } = await api.patch("/users/me", body);
  return data;
};

export function isValidTag(tag: string): tag is NoteTag {
  return ["Todo", "Work", "Personal", "Meeting", "Shopping"].includes(tag);
}
