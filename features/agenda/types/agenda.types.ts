export type AgendaEventItem = {
  id: string;
  date: Date;
  time: string | null;
  saida: string | null;
  tipo: string | null;
  territorio: string | null;
  info: string | null;
  conductor: {
    id: string;
    name: string;
    user: { image: string | null } | null;
  } | null;
};

export type AgendaFieldOptions = {
  saida: string[];
  tipo: string[];
  territorio: string[];
};

export interface AgendaMember {
  id: string;
  name: string;
  role: string | null;
  organizationId: string | null;
  user: { id: string; name: string; image: string | null } | null;
}
