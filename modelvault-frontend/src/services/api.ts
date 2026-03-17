import { apiRequest } from "../auth/authConfig";
import { msalInstance } from "../auth/AuthProvider";
import type { Model3D, Tag, UserInfo, AdminStats } from "../types";

const BASE = "/api";

/**
 * Hämtar en access token från MSAL.
 * Försöker silent först (cachad token), annars popup.
 * Returnerar null om ej inloggad.
 */
export async function getAccessToken(): Promise<string | null> {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) return null;

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...apiRequest,
      account: accounts[0],
    });
    return response.accessToken;
  } catch {
    // Silent misslyckades — token utgången, kräv popup
    try {
      const response = await msalInstance.acquireTokenPopup(apiRequest);
      return response.accessToken;
    } catch {
      return null;
    }
  }
}

/**
 * Gör en fetch med Bearer token i Authorization-headern.
 * Används för alla skyddade API-anrop.
 */
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated");

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

// ===== PUBLIC endpoints (ingen token krävs) =====

export async function fetchModels(params?: {
  search?: string;
  category?: string;
  tag?: string;
  sort?: string;
}): Promise<Model3D[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category) query.set("category", params.category);
  if (params?.tag) query.set("tag", params.tag);
  if (params?.sort) query.set("sort", params.sort);
  const res = await fetch(`${BASE}/models?${query}`);
  return res.json();
}

export async function fetchModel(id: number): Promise<Model3D> {
  const res = await fetch(`${BASE}/models/${id}`);
  if (!res.ok) throw new Error("Model not found");
  return res.json();
}

export async function likeModel(id: number) {
  await fetch(`${BASE}/models/${id}/like`, { method: "POST" });
}

export async function fetchTags(): Promise<Tag[]> {
  const res = await fetch(`${BASE}/tags`);
  return res.json();
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${BASE}/categories`);
  return res.json();
}

export function getThumbnailUrl(model: Model3D): string {
  if (!model.thumbnailPath) return "https://picsum.photos/seed/default/640/400";
  if (model.thumbnailPath.startsWith("http")) return model.thumbnailPath;
  return `/uploads/${model.thumbnailPath}`;
}

// ===== AUTH REQUIRED endpoints (skickar Bearer token) =====

export async function createModel(formData: FormData): Promise<{ id: number }> {
  const res = await authFetch(`${BASE}/models`, { method: "POST", body: formData });
  if (!res.ok) throw new Error("Failed to create model");
  return res.json();
}

export async function updateModel(
  id: number,
  data: { title: string; description: string; category: string; tags: string }
) {
  const res = await authFetch(`${BASE}/models/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update model");
}

export async function deleteModel(id: number) {
  const res = await authFetch(`${BASE}/models/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete model");
}

export async function downloadModel(id: number): Promise<Blob> {
  const res = await authFetch(`${BASE}/models/${id}/download`);
  if (!res.ok) throw new Error("Failed to download model");
  return res.blob();
}

// ===== USER / ROLE endpoints =====

export async function fetchCurrentUser(): Promise<UserInfo> {
  const res = await authFetch(`${BASE}/users/me`);
  if (!res.ok) throw new Error("Failed to fetch user info");
  return res.json();
}

// ===== ADMIN endpoints =====

export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await authFetch(`${BASE}/admin/stats`);
  if (!res.ok) throw new Error("Failed to fetch admin stats");
  return res.json();
}

export async function fetchAdminUsers(): Promise<UserInfo[]> {
  const res = await authFetch(`${BASE}/admin/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function updateUserRole(userId: number, role: number): Promise<void> {
  const res = await authFetch(`${BASE}/admin/users/${userId}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error("Failed to update user role");
}

export async function fetchAdminModels(search?: string): Promise<Model3D[]> {
  const query = new URLSearchParams();
  if (search) query.set("search", search);
  const res = await authFetch(`${BASE}/admin/models?${query}`);
  if (!res.ok) throw new Error("Failed to fetch admin models");
  return res.json();
}

export async function adminDeleteModel(id: number): Promise<void> {
  const res = await authFetch(`${BASE}/admin/models/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete model");
}
