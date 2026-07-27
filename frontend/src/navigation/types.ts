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
  GrupoCreate: undefined;
  CalibracionEdit: { grupoId: string };
  HumedadEdit: undefined;
  LotesPendientesArchivo: undefined;
  FluctuacionesHumedad: undefined;
};

export type GruposStackParamList = {
  Home: undefined;
  GruposList: undefined;
  // Solo se registra en el stack Gerente; se declara aqui para que
  // GruposListScreen (compartida Gerente/Supervisor) tipe bien la navegacion.
  GrupoCreate: undefined;
  CalibracionEdit: { grupoId: string };
  HumedadEdit: undefined;
  FluctuacionesHumedad: undefined;
};

export type OperadorStackParamList = {
  Home: undefined;
  AlertsList: undefined;
};
