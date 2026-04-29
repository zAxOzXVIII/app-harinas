import type { Harina } from "../types/harina";

export type GerenteStackParamList = {
  Dashboard: undefined;
  HarinasList: undefined;
  HarinaCreate: undefined;
  HarinaEdit: { harina: Harina };
  EquipoList: undefined;
  UsuarioForm: { userId?: string };
  MuroGerente: undefined;
  AlertsList: undefined;
  PreviewSupervisor: undefined;
  PreviewOperador: undefined;
  GruposList: undefined;
  CalibracionEdit: { grupoId: string };
  HumedadEdit: undefined;
};

export type GruposStackParamList = {
  Home: undefined;
  GruposList: undefined;
  CalibracionEdit: { grupoId: string };
  HumedadEdit: undefined;
};

export type OperadorStackParamList = {
  Home: undefined;
  AlertsList: undefined;
};
