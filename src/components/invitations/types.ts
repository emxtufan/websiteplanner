
import { Guest, UserProfile } from "../../types";

export interface InvitationData {
  guest: {
    name: string;
    status: string;
    type: string;
  };
  project: {
    selectedTemplate: string;
  };
  profile: UserProfile;
  isPublic?: boolean; // New flag for public link mode
  ownerId?: string; // Needed for public RSVP creation
}

export interface InvitationTemplateProps {
  data: InvitationData;
  onOpenRSVP: () => void;
}

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  colors: string[];
  previewClass: string; // Background-ul general al cardului
  elementsClass?: string; // Culoarea liniilor/formelor din preview (ex: "bg-zinc-200" sau "bg-white/20")
  thumbnailUrl?: string; // Optional: cale catre o imagine statica (screenshot)
}

export interface TemplateModule {
  default: React.FC<InvitationTemplateProps>;
  meta: TemplateMeta;
}
