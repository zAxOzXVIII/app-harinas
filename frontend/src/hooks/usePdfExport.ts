import { useCallback, useState } from "react";
import { Alert } from "react-native";

export const usePdfExport = () => {
  const [exporting, setExporting] = useState(false);

  const runExport = useCallback(async (task: () => Promise<void>) => {
    if (exporting) return;
    try {
      setExporting(true);
      await task();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo generar el PDF";
      Alert.alert("Exportar PDF", msg);
    } finally {
      setExporting(false);
    }
  }, [exporting]);

  return { exporting, runExport };
};
