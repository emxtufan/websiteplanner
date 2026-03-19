import { TemplateMeta, InvitationTemplateProps } from "./types";
import React from "react";

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

// import * as ChristeningTemplate from "./ChristeningTemplate";
import * as CastleMagicTemplateBoy from "./BoyCastelMagicTemplates";
import * as CastleMagicTemplateGirl from "./GirlCastelMagicTemplates";

// Manual registry of modules
const modules = [
  { ...ClassicTemplate, meta: { ...ClassicTemplate.meta, id: 'classic', name: 'Classic Nuntă', category: 'wedding', tags: ['wedding'] } },
  { ...RoyalRoseTemplate, meta: { ...RoyalRoseTemplate.meta, id: 'royal-rose', name: 'Royal Rose', category: 'wedding', tags: ['wedding'] } },
  { ...DarkRoyalTemplate, meta: { ...DarkRoyalTemplate.meta, id: 'dark-royal', name: 'Dark Royal', category: 'wedding', tags: ['wedding'] } },
  { ...BlushBloomTemplate, meta: { ...BlushBloomTemplate.meta, id: 'blush-bloom', name: 'Blush Bloom', category: 'wedding', tags: ['wedding'] } },
  { ...GardenRomanticTemplate, meta: { ...GardenRomanticTemplate.meta, id: 'garden-romantic', name: 'Garden Romantic', category: 'wedding', tags: ['wedding'] } },
  { ...VelumTemplate, meta: { ...VelumTemplate.meta, id: 'velum', name: 'Velum', category: 'wedding', tags: ['wedding'] } },
  { ...EternBotanicaTemplate, meta: { ...EternBotanicaTemplate.meta, id: 'etern-botanica', name: 'Etern Botanica', category: 'wedding', tags: ['wedding'] } },
  { ...TerraBohoTemplate, meta: { ...TerraBohoTemplate.meta, id: 'terra-boho', name: 'Terra Boho', category: 'wedding', tags: ['wedding'] } },
  { ...ArchRoseTemplate, meta: { ...ArchRoseTemplate.meta, id: 'arch-rose', name: 'Arch & Rose', category: 'wedding', tags: ['wedding'] } },
  { ...JungleMagicEffectTemplate, meta: { ...JungleMagicEffectTemplate.meta, id: 'regal', name: 'Regal', category: 'wedding', tags: ['wedding'] } },
  // { ...ClassicTemplate, meta: { ...ClassicTemplate.meta, id: 'classic-baptism', name: 'Classic Botez', category: 'baptism', tags: ['baptism'], description: 'Design clasic elegant pentru botez.' } },
  // { ...ClassicTemplate, meta: { ...ClassicTemplate.meta, id: 'classic-anniversary', name: 'Classic Aniversare', category: 'anniversary', tags: ['anniversary'], description: 'Design clasic pentru aniversări și petreceri.' } },
  // { ...ClassicTemplate, meta: { ...ClassicTemplate.meta, id: 'classic-kids', name: 'Classic Copii', category: 'kids', tags: ['kids', 'birthday'], description: 'Design vesel pentru petreceri copii.' } },
  // // { ...ChristeningTemplate, meta: { ...ChristeningTemplate.meta, id: 'castle-magic', name: 'Castle Magic', category: 'wedding' } },
  { ...CastleMagicTemplateBoy, meta: { ...CastleMagicTemplateBoy.meta, id: 'castle-magic-boys', name: 'Boy Castel', category: 'wedding', tags: ['baptism'] } },
  { ...CastleMagicTemplateGirl, meta: { ...CastleMagicTemplateGirl.meta, id: 'castle-magic-girl', name: 'Girl Castel', category: 'wedding', tags: ['wedding'] } },

];


export const getTemplateMeta = (id: string): TemplateMeta | null => {
  return templates.find(t => t.id === id) || null;
};
export const templates: TemplateMeta[] = [];
export const components: Record<string, React.FC<InvitationTemplateProps>> = {};

modules.forEach((mod) => {
  if (mod && mod.meta && mod.default) {
    if (components[mod.meta.id]) {
        console.warn(`Duplicate template ID detected: '${mod.meta.id}'.`);
        return;
    }
    templates.push(mod.meta as TemplateMeta);
    components[mod.meta.id] = mod.default;
  }
});

export const getTemplateComponent = (id: string): React.FC<InvitationTemplateProps> | null => {
  return components[id] || null;
};
