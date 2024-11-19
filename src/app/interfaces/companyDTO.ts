import { Keys } from "./data";

export interface CloudinaryDto {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

export interface EmailDto {
  host: string;
  user: string;
  password: string;
  port: number;
  email: string;
}

export interface CreateContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  whatsapp?: string;
  schedule?: string;
  opening_time?: string;
  closing_time?: string;
  embed_google_map?: string;
}

export interface CreateSocialMedia {
  instagram_link?: string;
  facebook_link?: string;
  twitter_link?: string;
  linktree_link?: string;
}

export interface CreateCompanyDto {
  id?:number;
  company_name: string;
  keys?: Keys;
}