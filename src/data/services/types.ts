export type ServiceKey =
  | "national"
  | "international"
  | "express"
  | "refrigerated"
  | "forwarding"
  | "dedicated"
  | "contract"
  | "disposal";

export interface ServiceContent {
  name: string;
  slug: string;
  excerpt: string;
  description: string[];
  benefits: { title: string; text: string }[];
  steps: { title: string; text: string }[];
  faqs: { question: string; answer: string }[];
  seoTitle: string;
  seoDescription: string;
}

export type ServiceLocaleContent = Record<ServiceKey, ServiceContent>;
