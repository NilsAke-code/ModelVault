import type { Model3D, Tag } from '../types';

const BASE = '/api';

export async function fetchModels(params?: {
  search?: string;
  category?: string;
  tag?: string;
  sort?: string;
}): Promise<Model3D[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.category) query.set('category', params.category);
  if (params?.tag) query.set('tag', params.tag);
  if (params?.sort) query.set('sort', params.sort);
  const res = await fetch(`${BASE}/models?${query}`);
  return res.json();
}

export async function fetchModel(id: number): Promise<Model3D> {
  const res = await fetch(`${BASE}/models/${id}`);
  if (!res.ok) throw new Error('Model not found');
  return res.json();
}

export async function createModel(formData: FormData): Promise<{ id: number }> {
  const res = await fetch(`${BASE}/models`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Failed to create model');
  return res.json();
}

export async function updateModel(id: number, data: { title: string; description: string; category: string; tags: string }) {
  const res = await fetch(`${BASE}/models/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update model');
}

export async function deleteModel(id: number) {
  const res = await fetch(`${BASE}/models/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete model');
}

export async function likeModel(id: number) {
  await fetch(`${BASE}/models/${id}/like`, { method: 'POST' });
}

export function getDownloadUrl(id: number) {
  return `${BASE}/models/${id}/download`;
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
  if (!model.thumbnailPath) return 'https://picsum.photos/seed/default/640/400';
  if (model.thumbnailPath.startsWith('http')) return model.thumbnailPath;
  return `/uploads/${model.thumbnailPath}`;
}
