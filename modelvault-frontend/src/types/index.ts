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
