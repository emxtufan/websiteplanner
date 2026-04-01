import { TemplateMeta, InvitationTemplateProps } from "./types";
import React from "react";
import type { InvitationBlock } from "../../types";

import * as ClassicTemplate from "./ClassicTemplate";
import * as RoyalRoseTemplate from "./RoyalRoseTemplate";
import * as DarkRoyalTemplate from "./DarkRoyalTemplate";
import * as BlushBloomTemplate from "./BlushBloomTemplate";
import * as GardenRomanticTemplate from "./GardenRomanticTemplate";
import * as VelumTemplate from "./VelumTemplate";
import * as EternBotanicaTemplate from "./EternBotanicaTemplate";
import * as TerraBohoTemplate from "./TerraBohoTemplate";
import * as ArchRoseTemplate from "./ArchRoseTemplate";
import * as JungleMagicEffectTemplate from "./JungleMagicEffect";
import * as LordEffectsTemplate from "./LordEffects";
import * as GabbysDollhouseTemplate from "./GabbysDollhouseTemplate";
import * as FrozenTemplate from "./FrozenTemplate";
import * as UnicornAcademyTemplate from "./UnicornAcademyTemplate";
import * as AdventureRoadTemplate from "./AdventureRoadTemplate";
import * as JurassicTemplate from "./JurassicTemplate";

// import * as ChristeningTemplate from "./ChristeningTemplate";
import * as CastleMagicTemplateBoy from "./BoyCastelMagicTemplates";
import * as CastleMagicTemplateGirl from "./GirlCastelMagicTemplates";
import * as ZootropolisTemplate from "./ZootropolisTemplate";


import * as LittleMermaidTemplate from "./LittleMermaidTemplate";
// Manual registry of modules
const modules = [
  // ── Nuntă ────────────────────────────────────────────────────────────────
  { ...ClassicTemplate,         meta: { ...ClassicTemplate.meta,         id: 'classic',          name: 'Classic Nuntă',    category: 'wedding',  tags: ['baptism', 'kids'] } },
  { ...RoyalRoseTemplate,       meta: { ...RoyalRoseTemplate.meta,       id: 'royal-rose',       name: 'Royal Rose',       category: 'wedding',  tags: ['wedding'] } },
  // { ...DarkRoyalTemplate,       meta: { ...DarkRoyalTemplate.meta,       id: 'dark-royal',       name: 'Dark Royal',       category: 'wedding',  tags: ['wedding'] } },
  { ...BlushBloomTemplate,      meta: { ...BlushBloomTemplate.meta,      id: 'blush-bloom',      name: 'Blush Bloom',      category: 'wedding',  tags: ['wedding'] } },
  { ...GardenRomanticTemplate,  meta: { ...GardenRomanticTemplate.meta,  id: 'garden-romantic',  name: 'Garden Romantic',  category: 'wedding',  tags: ['wedding'] } },
  // { ...VelumTemplate,           meta: { ...VelumTemplate.meta,           id: 'velum',            name: 'Velum',            category: 'wedding',  tags: ['wedding'] } },
  { ...EternBotanicaTemplate,   meta: { ...EternBotanicaTemplate.meta,   id: 'etern-botanica',   name: 'Etern Botanica',   category: 'wedding',  tags: ['wedding'] } },
  // { ...TerraBohoTemplate,       meta: { ...TerraBohoTemplate.meta,       id: 'terra-boho',       name: 'Terra Boho',       category: 'wedding',  tags: ['wedding'] } },
  // { ...ArchRoseTemplate,        meta: { ...ArchRoseTemplate.meta,        id: 'arch-rose',        name: 'Arch & Rose',      category: 'wedding',  tags: ['wedding'] } },
  { ...JungleMagicEffectTemplate, meta: { ...JungleMagicEffectTemplate.meta, id: 'regal',        name: 'Regal',            category: 'wedding',  tags: ['wedding'] } },
  { ...LordEffectsTemplate,      meta: { ...LordEffectsTemplate.meta,      id: 'lord-effects',    name: 'Lord Effects',     category: 'wedding',  tags: ['wedding'] } },

  // ── Botez — apare și la evenimente de tip "kids" (zi de naștere) ─────────
  // { ...ClassicTemplate, meta: { ...ClassicTemplate.meta, id: 'classic-baptism', name: 'Classic Botez', category: 'baptism', tags: ['baptism', 'kids'], description: 'Design clasic elegant pentru botez.' } },
  { ...CastleMagicTemplateBoy,  meta: { ...CastleMagicTemplateBoy.meta,  id: 'castle-magic-boys', name: 'Boy Castel',    category: 'baptism',  tags: ['baptism', 'kids'] } },
  { ...CastleMagicTemplateGirl, meta: { ...CastleMagicTemplateGirl.meta, id: 'castle-magic-girl', name: 'Girl Castel',   category: 'baptism',  tags: ['baptism', 'kids'] } },
  { ...GabbysDollhouseTemplate, meta: { ...GabbysDollhouseTemplate.meta, id: 'gabbys-dollhouse',  name: "Gabby's Dollhouse", category: 'baptism', tags: ['baptism', 'kids', 'birthday'] } },
  { ...FrozenTemplate,          meta: { ...FrozenTemplate.meta,          id: 'frozen',           name: 'Frozen',          category: 'baptism', tags: ['baptism', 'kids', 'birthday'] } },
  { ...UnicornAcademyTemplate,  meta: { ...UnicornAcademyTemplate.meta,  id: 'unicorn-academy', name: 'Unicorn Academy', category: 'baptism', tags: ['baptism', 'kids', 'birthday'] } },
  { ...AdventureRoadTemplate,    meta: { ...AdventureRoadTemplate.meta,    id: 'adventure-road',    name: 'Adventure Road',    category: 'baptism', tags: ['baptism', 'kids', 'birthday'] } },
  { ...JurassicTemplate,         meta: { ...JurassicTemplate.meta,         id: 'jurassic-park',     name: 'Jurassic Park',     category: 'baptism', tags: ['baptism', 'kids', 'birthday'] } },
  { ...ZootropolisTemplate,         meta: { ...ZootropolisTemplate.meta,         id: 'zootropolis',     name: 'Zootropolis',     category: 'baptism', tags: ['baptism', 'kids', 'birthday'] } },
  { ...LittleMermaidTemplate,         meta: { ...LittleMermaidTemplate.meta,         id: 'little-mermaid',     name: 'Little Mermaid',     category: 'baptism', tags: ['baptism', 'kids', 'birthday'] } },
  // ── Aniversare ────────────────────────────────────────────────────────────
  // { ...ClassicTemplate, meta: { ...ClassicTemplate.meta, id: 'classic-anniversary', name: 'Classic Aniversare', category: 'anniversary', tags: ['anniversary'], description: 'Design clasic pentru aniversări.' } },

  // ── Copii / zi de naștere ─────────────────────────────────────────────────
  // { ...ClassicTemplate, meta: { ...ClassicTemplate.meta, id: 'classic-kids', name: 'Classic Copii', category: 'kids', tags: ['kids', 'birthday'], description: 'Design vesel pentru petreceri copii.' } },
];


export const getTemplateMeta = (id: string): TemplateMeta | null => {
  return templates.find(t => t.id === id) || null;
};
export const templates: TemplateMeta[] = [];
export const components: Record<string, React.FC<InvitationTemplateProps>> = {};
const defaultBlocksById: Record<string, InvitationBlock[]> = {};
const defaultProfileById: Record<string, Record<string, any>> = {};
const previewDataById: Record<string, any> = {};

modules.forEach((mod) => {
  if (mod && mod.meta && mod.default) {
    if (components[mod.meta.id]) {
        console.warn(`Duplicate template ID detected: '${mod.meta.id}'.`);
        return;
    }
    templates.push(mod.meta as TemplateMeta);
    components[mod.meta.id] = mod.default;
    if ((mod as any).CASTLE_DEFAULT_BLOCKS) {
      defaultBlocksById[mod.meta.id] = (mod as any).CASTLE_DEFAULT_BLOCKS as InvitationBlock[];
    }
    if ((mod as any).CASTLE_DEFAULTS) {
      defaultProfileById[mod.meta.id] = (mod as any).CASTLE_DEFAULTS as Record<string, any>;
    }
    if ((mod as any).CASTLE_PREVIEW_DATA) {
      previewDataById[mod.meta.id] = (mod as any).CASTLE_PREVIEW_DATA;
    }
  }
});

export const getTemplateComponent = (id: string): React.FC<InvitationTemplateProps> | null => {
  return components[id] || null;
};

export const getTemplateDefaultBlocks = (id: string): InvitationBlock[] | null => {
  return defaultBlocksById[id] || null;
};

export const getTemplateDefaultProfile = (id: string): Record<string, any> | null => {
  return defaultProfileById[id] || null;
};

export const getTemplatePreviewData = (id: string): any | null => {
  return previewDataById[id] || null;
};
