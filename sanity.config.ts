import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";
import { neuroAtlasTheme } from "./sanity/theme";

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder-project-id";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "neuroatlas-journal",
  title: "NeuroAtlas Journal",
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [structureTool(), visionTool()],
  theme: neuroAtlasTheme,
});
