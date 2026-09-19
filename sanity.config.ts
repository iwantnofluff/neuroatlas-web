import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { presentationTool, defineLocations } from "sanity/presentation";
import { schemaTypes } from "./sanity/schemaTypes";
import { neuroAtlasTheme } from "./sanity/theme";

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder-project-id";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const previewOrigin =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN || "http://localhost:3000";

export default defineConfig({
  name: "neuroatlas-journal",
  title: "NeuroAtlas Journal",
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool(),
    visionTool(),
    presentationTool({
      previewUrl: {
        initial: previewOrigin,
        previewMode: { enable: "/api/draft-mode/enable" },
      },
      resolve: {
        locations: {
          article: defineLocations({
            select: { title: "title", slug: "slug.current" },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || "Untitled",
                  href: `/journal/${doc?.slug}`,
                },
                { title: "Journal index", href: "/journal" },
              ],
            }),
          }),
        },
      },
    }),
  ],
  theme: neuroAtlasTheme,
});
