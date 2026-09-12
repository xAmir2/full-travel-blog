import type { LoginFormData, SignupFormData, User } from "../types/models";

import { apiClient } from "./apiClient";

import { getApiErrorMessage } from "./apiErrors";

export async function login(data: LoginFormData): Promise<User> {
  try {
    await apiClient.post("/auth/login", {
      email: data.email.trim(),
      password: data.password,
    });

    return await getCurrentUser();
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "The email or password is incorrect."),
      { cause: error },
    );
  }
}

export async function signup(data: SignupFormData): Promise<User> {
  try {
    const response = await apiClient.post<User>("/auth/register", {
      name: data.name.trim(),
      surname: data.surname.trim(),
      username: data.username.trim(),
      email: data.email.trim(),
      password: data.password,
    });

    return response.data;
  } catch (error) {

    throw new Error(
      getApiErrorMessage(error, "The account could not be created."),
      { cause: error },
    );
  }
}

// Gets the logged-in user after the backend creates the session
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>("/users/me");
  return response.data;
}


export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}