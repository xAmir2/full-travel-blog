import type {
  PasswordUpdateForm,
  Permission,
  ProfileDataForm,
  Role,
  RoleFormData,
  User,
} from "../types/models";

import { apiClient } from "./apiClient";

export async function getMyProfile(): Promise<User> {
  const response = await apiClient.get<User>("/users/me");
  return response.data;
}

export async function updateMyData(data: ProfileDataForm): Promise<User> {
  const response = await apiClient.put<User>("/users/me", {
    name: data.name.trim(),
    surname: data.surname.trim(),
    username: data.username.trim(),
    email: data.email.trim(),
  });

  return response.data;
}

export async function updateMyPassword(
  data: PasswordUpdateForm,
): Promise<void> {
  await apiClient.patch("/users/me/password", data);
}

export async function updateMyAvatar(avatar: File): Promise<User> {
  const formData = new FormData();
  formData.append("avatar", avatar);

  const response = await apiClient.patch<User>("/users/me/avatar", formData);

  return response.data;
}

export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>("/users");
  return response.data;
}

export async function getUserById(userId: string): Promise<User> {
  const response = await apiClient.get<User>(`/users/${userId}`);
  return response.data;
}

export async function changeUserRole(
  userId: string,
  roleId: string,
): Promise<User> {
  const response = await apiClient.patch<User>(
    `/users/${userId}/role/${roleId}`,
  );

  return response.data;
}

export async function getRoles(): Promise<Role[]> {
  const response = await apiClient.get<Role[]>("/roles");
  return response.data;
}

export async function getPermissions(): Promise<Permission[]> {
  const response = await apiClient.get<Permission[]>("/roles/permissions");
  return response.data;
}

export async function createRole(data: RoleFormData): Promise<Role> {
  const response = await apiClient.post<Role>("/roles", {
    name: data.name.trim(),
    permissionIds: data.permissionIds,
  });

  return response.data;
}

export async function updateRole(
  roleId: string,
  data: RoleFormData,
): Promise<Role> {
  const response = await apiClient.put<Role>(`/roles/${roleId}`, {
    name: data.name.trim(),
    permissionIds: data.permissionIds,
  });

  return response.data;
}

export async function deleteRole(roleId: string): Promise<void> {
  await apiClient.delete(`/roles/${roleId}`);
}

export async function deleteMyAccount(password: string): Promise<void> {
  await apiClient.delete("/users/me", {
    data: {
      password,
    },
  });
}
