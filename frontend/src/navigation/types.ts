import type { Harina } from "../types/harina";

export type GerenteStackParamList = {
  Dashboard: undefined;
  HarinasList: undefined;
  HarinaCreate: undefined;
  HarinaEdit: { harina: Harina };
  EquipoList: undefined;
  UsuarioForm: { userId?: string };
  MuroGerente: undefined;
  PreviewSupervisor: undefined;
  PreviewOperador: undefined;
};
