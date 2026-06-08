import { z } from "zod";

export const templateConfigSchema = z.object({
  theme: z.object({
    background: z.string().min(1),
    surface: z.string().min(1),
    text: z.string().min(1),
    muted: z.string().min(1),
    accent: z.string().min(1),
  }),
  typography: z.enum(["modern", "editorial", "bold", "classic"]),
  heroLayout: z.enum(["split", "centered", "stacked"]),
  ctaPlacement: z.enum(["hero", "sticky", "both"]),
  sectionOrder: z.array(z.string()),
  cardStyle: z.enum(["soft", "outlined", "elevated"]),
  footerStyle: z.enum(["minimal", "full"]),
});
