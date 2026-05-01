import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";

interface Props {
  data: number[];
  height?: number;
  width?: number;
  color?: string;
  strokeWidth?: number;
  fill?: boolean;
}

/**
 * Sparkline simple sin SVG: dibuja segmentos rotando pequenas Views.
 * Suficiente para mostrar tendencia de telemetria (T, HR) en tarjetas.
 */
export const Sparkline = ({
  data,
  height = 60,
  width = 240,
  color,
  strokeWidth = 2,
  fill = true,
}: Props) => {
  const theme = useTheme();
  const stroke = color ?? theme.colors.primary;

  const segments = useMemo(() => {
    if (data.length < 2) return [];
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const stepX = width / (data.length - 1);

    const points = data.map((v, i) => ({
      x: i * stepX,
      y: height - ((v - min) / span) * height,
    }));

    const segs: Array<{ x: number; y: number; w: number; angle: number }> = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      segs.push({ x: a.x, y: a.y, w: len, angle });
    }
    return { segs, points };
  }, [data, height, width]);

  if (!segments || (segments as { segs: unknown[] }).segs.length === 0) {
    return <View style={[styles.empty, { height, width }]} />;
  }

  const { segs, points } = segments as {
    segs: Array<{ x: number; y: number; w: number; angle: number }>;
    points: Array<{ x: number; y: number }>;
  };

  return (
    <View style={[styles.wrapper, { height, width }]}>
      {fill
        ? points.map((p, i) =>
            i < points.length - 1 ? (
              <View
                key={`fill-${i}`}
                style={{
                  position: "absolute",
                  left: p.x,
                  top: p.y,
                  width: points[i + 1].x - p.x + 1,
                  height: height - p.y,
                  backgroundColor: stroke,
                  opacity: 0.08,
                }}
              />
            ) : null
          )
        : null}

      {segs.map((s, i) => (
        <View
          key={`seg-${i}`}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y - strokeWidth / 2,
            width: s.w,
            height: strokeWidth,
            backgroundColor: stroke,
            transform: [{ rotateZ: `${s.angle}deg` }],
            transformOrigin: "0% 50%",
            borderRadius: strokeWidth,
          }}
        />
      ))}

      {points.map((p, i) => (
        <View
          key={`p-${i}`}
          style={{
            position: "absolute",
            left: p.x - 2,
            top: p.y - 2,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: stroke,
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { position: "relative", overflow: "hidden" },
  empty: { backgroundColor: "rgba(127,127,127,0.08)", borderRadius: 6 },
});
