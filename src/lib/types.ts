export type Edition = 'java' | 'bedrock';
export type Accent = 'gold' | 'grass' | 'diamond' | 'redstone' | 'stone';

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  accent: Accent;
  sort_order: number;
  video_keywords: string[];
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  youtube_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  url: string;
  published_at: string;
  category_id: string | null;
  status: 'pending' | 'published' | 'hidden';
  is_featured: boolean;
  source: 'rss' | 'api' | 'websub' | 'manual';
  reviewed: boolean;
  created_at: string;
  updated_at: string;
  category?: Pick<Category, 'slug' | 'name' | 'accent'> | null;
}

export interface SeedStructure {
  id?: string;
  seed_id?: string;
  type: string;
  name: string | null;
  x: number;
  y: number | null;
  z: number;
  dimension: 'overworld' | 'nether' | 'end';
  notes: string | null;
  sort_order: number;
}

export interface Seed {
  id: string;
  slug: string;
  name: string;
  seed_code: string;
  image_url: string | null;
  description: string | null;
  mc_version: string;
  editions: Edition[];
  video_id: string | null;
  status: 'draft' | 'published';
  is_featured: boolean;
  published_at: string;
  structure_types: string[];
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  structures?: SeedStructure[];
  video?: Pick<Video, 'id' | 'youtube_id' | 'title' | 'url' | 'thumbnail_url' | 'published_at'> | null;
}

export interface PostLink {
  label: string;
  url: string;
}

export interface Post {
  id: string;
  slug: string;
  category_id: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_url: string | null;
  gallery: string[];
  links: PostLink[];
  video_id: string | null;
  status: 'draft' | 'published';
  is_featured: boolean;
  published_at: string;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  category?: Pick<Category, 'slug' | 'name' | 'accent'> | null;
  video?: Pick<Video, 'youtube_id' | 'title' | 'url'> | null;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
