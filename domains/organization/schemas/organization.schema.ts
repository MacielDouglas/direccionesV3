import z from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50),
});
