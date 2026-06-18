import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Chip, useTheme } from "react-native-paper";

interface SecadoTimerProps {
  iniciadoEn: string;
  finalizaEn: string;
  duracionMin: number;
  isMutating?: boolean;
  onTickComplete?: () => void;
  onFinalizar?: () => void;
}

const formatMs = (ms: number): string => {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
};

export const SecadoTimer = ({
  iniciadoEn,
  finalizaEn,
  duracionMin,
  isMutating,
  onTickComplete,
  onFinalizar,
}: SecadoTimerProps) => {
  const theme = useTheme();
  const [now, setNow] = useState(Date.now());
  const end = new Date(finalizaEn).getTime();
  const start = new Date(iniciadoEn).getTime();
  const restanteMs = Math.max(0, end - now);
  const transcurridoMs = Math.max(0, now - start);
  const done = restanteMs <= 0;

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (done && onTickComplete) {
      onTickComplete();
    }
  }, [done, onTickComplete]);

  if (done) {
    return (
      <View style={styles.col}>
        <View style={styles.row}>
          <Chip compact icon="check-circle" style={{ backgroundColor: theme.colors.primaryContainer }}>
            Finalizando secado…
          </Chip>
          {isMutating ? <ActivityIndicator size="small" /> : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.col}>
      <View style={styles.row}>
        <Chip compact icon="timer-sand" textStyle={{ fontWeight: "600" }}>
          {formatMs(restanteMs)} restante
        </Chip>
        <Chip compact icon="clock-outline" textStyle={{ fontSize: 12 }}>
          {formatMs(transcurridoMs)} transcurrido
        </Chip>
        <Chip compact icon="progress-clock" textStyle={{ fontSize: 12 }}>
          Meta {duracionMin} min
        </Chip>
      </View>
      {onFinalizar ? (
        <Button
          mode="outlined"
          icon="stop-circle-outline"
          onPress={onFinalizar}
          loading={isMutating}
          compact
          style={styles.finalizarBtn}
        >
          Finalizar secado
        </Button>
      ) : null}
    </View>
  );
};

interface IniciarSecadoButtonProps {
  duracionMin: number;
  loading?: boolean;
  onPress: () => void;
}

export const IniciarSecadoButton = ({
  duracionMin,
  loading,
  onPress,
}: IniciarSecadoButtonProps) => (
  <View style={styles.row}>
    <Button mode="contained" onPress={onPress} loading={loading} icon="play-circle-outline" compact>
      Iniciar secado
    </Button>
    <Chip compact icon="timer-outline" textStyle={{ fontSize: 12 }}>
      {duracionMin} min
    </Chip>
  </View>
);

const styles = StyleSheet.create({
  col: { marginTop: 12, gap: 8 },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  finalizarBtn: { alignSelf: "flex-start" },
});
