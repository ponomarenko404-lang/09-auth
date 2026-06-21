import { cookies } from "next/headers";
import { api } from "./api";
import { Note } from "@/types/note";
import { User } from "@/types/user";
import { AxiosResponse } from "axios";

interface NotesResponse {
  notes: Note[];
  totalPages: number;
}

interface FetchNotesParams {
  page?: number;
  search?: string;
  tag?: string;
  perPage?: number;
}

const getCookieHeader = async () => {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
};

export const fetchNotes = async (
  params: FetchNotesParams,
): Promise<NotesResponse> => {
  const cookieHeader = await getCookieHeader();

  const { data } = await api.get("/notes", {
    params,
    headers: {
      Cookie: cookieHeader,
    },
  });

  return data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const cookieHeader = await getCookieHeader();

  const { data } = await api.get(`/notes/${id}`, {
    headers: {
      Cookie: cookieHeader,
    },
  });

  return data;
};

export const checkSession = async (): Promise<AxiosResponse> => {
  const cookieHeader = await getCookieHeader();

  return await api.get("/auth/session", {
    headers: {
      Cookie: cookieHeader,
    },
  });
};

export const getMe = async (): Promise<User> => {
  const cookieHeader = await getCookieHeader();

  const { data } = await api.get("/users/me", {
    headers: {
      Cookie: cookieHeader,
    },
  });

  return data;
};
