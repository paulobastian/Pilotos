import { z } from "zod";

const itemType = z.enum([
  "link", "idea", "article", "video", "book", "course", "tool", "product", "reference", "other",
]);
const itemStatus = z.enum(["inbox", "review", "in_progress", "done", "archived"]);
const itemPriority = z.enum(["low", "normal", "high"]);

export const itemInputSchema = z.object({
  title: z.string().trim().min(1, "Informe um título").max(300),
  url: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  description: z.string().trim().max(2000).optional().nullable(),
  personal_note: z.string().trim().max(5000).optional().nullable(),
  type: itemType.default("link"),
  status: itemStatus.default("inbox"),
  priority: itemPriority.default("normal"),
  category_id: z.string().uuid().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  is_favorite: z.boolean().default(false),
  favicon: z.string().max(2000).optional().nullable(),
  thumbnail: z.string().max(2000).optional().nullable(),
  domain: z.string().max(300).optional().nullable(),
  // Tag names — created on the fly if they don't exist yet.
  tags: z.array(z.string().trim().min(1).max(50)).max(30).default([]),
});

export type ItemInput = z.infer<typeof itemInputSchema>;

export const quickAddSchema = z.object({
  url: z.string().trim().min(1, "Cole um link ou digite uma ideia").max(2000),
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(60),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida").default("#64748b"),
});
export type CategoryInput = z.infer<typeof categoryInputSchema>;

export const tagInputSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida").default("#64748b"),
});
export type TagInput = z.infer<typeof tagInputSchema>;

export const projectInputSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(120),
  description: z.string().trim().max(2000).optional().nullable(),
  image_url: z.string().trim().max(2000).optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#64748b"),
});
export type ProjectInput = z.infer<typeof projectInputSchema>;

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().min(8, "Mínimo de 8 caracteres").max(72),
});

export const signInSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Mínimo de 8 caracteres").max(72),
});
