import { api } from "./api";

export interface AccountUser {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface UpdateMeInput {
  name?: string;
  email?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const getMe = () => api<AccountUser>("/users/me");

export const updateMe = (values: UpdateMeInput) =>
  api<AccountUser>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(values),
  });

export const changePassword = (values: ChangePasswordInput) =>
  api<{ message: string }>("/users/me/password", {
    method: "POST",
    body: JSON.stringify(values),
  });

export const deleteMe = () =>
  api<void>("/users/me", { method: "DELETE" });
