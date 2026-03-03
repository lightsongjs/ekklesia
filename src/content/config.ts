import { defineCollection, z } from "astro:content";

const roleEnum = z.enum(["preot", "diacon", "strana", "citeti", "rubrica"]);

const stihiraSchema = z.object({ text: z.string() });

const fixed = defineCollection({
  type: "data",
  schema: z.union([
    // Standard fixed texts (psalm103, ectenia-mare, etc.)
    z.object({
      id: z.string(),
      title: z.string(),
      lines: z.array(
        z.object({
          role: roleEnum,
          text: z.string(),
          redInitial: z.boolean().optional(),
          italic: z.boolean().optional(),
        })
      ),
    }),
    // Stihuri la Doamne strigat-am (versete de psalm, numerotate)
    z.object({
      id: z.string(),
      title: z.string(),
      stihuri: z.array(
        z.object({
          nr: z.number(),
          text: z.string(),
        })
      ),
    }),
  ]),
});

const octoechos = defineCollection({
  type: "data",
  schema: z.object({
    glas: z.number(),
    title: z.string(),
    stihiriInvierii: z.array(stihiraSchema),
    stihiriAnatolie: z.array(stihiraSchema),
    dogmatica: stihiraSchema,
    stihiraStihoavna: z.array(stihiraSchema),
    tropar: stihiraSchema,
    troparNascatoarei: stihiraSchema.optional(),
  }),
});

const sursaSchema = z.object({
  sursa: z.string(),
  grupa: z.string().optional(),
  count: z.number(),
  rubrica: z.string(),
});

const triodion = defineCollection({
  type: "data",
  schema: z.object({
    saptamana: z.number(),
    title: z.string(),
    sundayName: z.string(),
    randuiala: z.object({
      stihiriPe: z.number(),
      surse: z.array(sursaSchema),
    }),
    stihiriVecernie: z.array(stihiraSchema),
    slavaDoamneStrigatAm: z.object({
      glas: z.string(),
      text: z.string(),
    }).optional(),
    stihiraStihoavna: z.array(stihiraSchema),
    slavaSiAcumStihoavna: stihiraSchema.optional(),
    troparSfant: z.object({
      glas: z.string(),
      rubrica: z.string(),
      text: z.string(),
      glasNascatoarei: z.number(),
    }).optional(),
  }),
});

export const collections = { fixed, octoechos, triodion };
