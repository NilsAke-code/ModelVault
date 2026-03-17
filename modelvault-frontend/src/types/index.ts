export interface Model3D {
  id: number;
  title: string;
  description: string;
  filePath: string;
  thumbnailPath: string;
  category: string;
  authorId: string;
  authorName: string;
  downloads: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  isExploreModel: boolean;
  tags: string[];
}

export interface Tag {
  id: number;
  name: string;
}

export interface UserInfo {
  id: number;
  email: string;
  displayName: string;
  role: number;
}

export interface AdminStats {
  totalModels: number;
  totalUsers: number;
  totalDownloads: number;
  totalLikes: number;
  modelsLast7Days: number;
  modelsLast30Days: number;
  usersLast7Days: number;
  usersLast30Days: number;
}
