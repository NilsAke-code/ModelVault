import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, apiRequest } from "../auth/authConfig";
import type { Model3D, Tag } from "../types";

const BASE = "/api";

// Hämta MSAL-instansen (samma som AuthProvider skapar)
const msalInstance = new PublicClientApplication(msalConfig);

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
