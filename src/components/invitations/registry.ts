
import { TemplateMeta, InvitationTemplateProps } from "./types";
import React from "react";

// Static imports to avoid "import.meta.glob is not a function" error
import * as ClassicTemplate from "./ClassicTemplate";
import * as ModernTemplate from "./ModernTemplate";
import * as FloralTemplate from "./FloralTemplate";
// Manual registry of modules
const modules = [
  ClassicTemplate,
  ModernTemplate,
  FloralTemplate,
];

export const templates: TemplateMeta[] = [];
export const components: Record<string, React.FC<InvitationTemplateProps>> = {};

// Process modules to build the registry
modules.forEach((mod) => {
  // Check if it matches the TemplateModule structure (must export 'meta' and 'default')
  if (mod && mod.meta && mod.default) {
    // Safety check: Don't overwrite existing IDs
    if (components[mod.meta.id]) {
        console.warn(`Duplicate template ID detected: '${mod.meta.id}'.`);
        return;
    }

    templates.push(mod.meta);
    components[mod.meta.id] = mod.default;
  }
});

// Helper to get component by ID
export const getTemplateComponent = (id: string): React.FC<InvitationTemplateProps> | null => {
  return components[id] || components['classic'] || null; // Fallback to classic
};
