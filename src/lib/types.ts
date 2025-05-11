export interface Model {
  id: string;
  name: string;
  description: string;
  thumbnail_url: string;
  model_url: string;
  category: string;
  created_at: string;
  author: string;
  file_format: string; // glb, gltf, obj等
  polygon_count: number;
  file_size: number;
}

export type ModelsResponse = {
  models: Model[];
  nextCursor: string | null;
}; 