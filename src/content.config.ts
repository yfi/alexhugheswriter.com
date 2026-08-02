import { defineCollection, z } from "astro:content";
import { file, glob } from "astro/loaders";

const projects = defineCollection({
	loader: glob({ pattern: "*.yaml", base: "src/content/projects" }),
	schema: z.object({
		title: z.string(),
		thumbnail: z.string(),
		thumbnail_alt: z.string().optional().default(""),
		images: z.array(
			z.object({
				image: z.string(),
				alt: z.string().optional().default(""),
			}),
		),
		excerpt: z.string().optional(),
		year: z.string().optional(),
		date: z.coerce.date().optional(),
		details: z.array(
			z.object({
				key: z.string(),
				value: z.string(),
			}),
		),
	}),
});

const settings = defineCollection({
	loader: file("src/content/settings/site.yaml"),
	schema: z.object({
		title: z.string(),
		tagline: z.string(),
	}),
});

const sections = defineCollection({
	loader: glob({ pattern: "*.md", base: "src/content/sections" }),
});

export const collections = { projects, settings, sections };
