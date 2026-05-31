export type UserRole = "buyer" | "seller" | "admin";
export type ProductType = "ready" | "customized" | "bespoke";
export type SellerStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "suspended";
export type ImageRef = { src: string; alt: string; position?: string };
export type Category = { slug: string; name: string; description: string; accent: string; image: ImageRef };
export type Artisan = { storeSlug: string; storeName: string; ownerName: string; city: string; state: string; category: string; bio: string; story: string; quote: string; process: string; materials: string; yearsExperience: number; rating: number; reviews: number; followers: number; completedOrders: number; status: SellerStatus; avatar: ImageRef; cover: ImageRef };
export type Product = { slug: string; title: string; artisanSlug: string; categorySlug: string; type: ProductType; price: number | null; priceLabel: string; description: string; story: string; materials: string; care: string; timeline: string; occasion: string; customizable: boolean; stock: number | null; colors: [string, string]; features: string[]; images: ImageRef[]; rating: number; reviewCount: number };
