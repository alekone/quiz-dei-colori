import { colorMeta, type Color } from "@/lib/quiz";

type QuadrantChartProps = {
  percentages: Record<Color, number>;
  size?: number;
  showAxisLabels?: boolean;
  showQuadrantLabels?: boolean;
};

export function QuadrantChart({
  percentages,
  size = 260,
  showAxisLabels = true,
  showQuadrantLabels = true,
}: QuadrantChartProps) {
  const center = size / 2;
  const axis = size * 0.42;
  const scale = axis / 100;

  const pointFor = (color: Color) => {
    const value = percentages[color];
    const delta = value * scale;
    switch (color) {
      case "giallo":
        return { x: center - delta, y: center - delta };
      case "verde":
        return { x: center + delta, y: center - delta };
      case "rosso":
        return { x: center - delta, y: center + delta };
      case "blu":
        return { x: center + delta, y: center + delta };
    }
  };

  const entusiasta = pointFor("giallo");
  const riflessivo = pointFor("verde");
  const preciso = pointFor("blu");
  const concreto = pointFor("rosso");

  const polygon = [
    `${entusiasta.x},${entusiasta.y}`,
    `${riflessivo.x},${riflessivo.y}`,
    `${preciso.x},${preciso.y}`,
    `${concreto.x},${concreto.y}`,
  ].join(" ");

  const half = size / 2;
  const border = 6;

  return (
    <svg
      width={size}
      height={size}
      className="rounded-xl border border-slate-200 bg-white"
    >
      <rect x="0" y="0" width={size} height={size} fill="white" />

      <rect x="0" y="0" width={half} height={border} fill="#facc15" />
      <rect x={half} y="0" width={half} height={border} fill="#22c55e" />
      <rect x="0" y="0" width={border} height={half} fill="#facc15" />
      <rect x="0" y={half} width={border} height={half} fill="#ef4444" />
      <rect x={size - border} y="0" width={border} height={half} fill="#22c55e" />
      <rect
        x={size - border}
        y={half}
        width={border}
        height={half}
        fill="#3b82f6"
      />
      <rect x="0" y={size - border} width={half} height={border} fill="#ef4444" />
      <rect
        x={half}
        y={size - border}
        width={half}
        height={border}
        fill="#3b82f6"
      />

      <line
        x1={center}
        y1={size * 0.08}
        x2={center}
        y2={size * 0.92}
        stroke="#cbd5f5"
        strokeWidth="1"
      />
      <line
        x1={size * 0.08}
        y1={center}
        x2={size * 0.92}
        y2={center}
        stroke="#cbd5f5"
        strokeWidth="1"
      />

      <polygon
        points={polygon}
        fill="rgba(15, 23, 42, 0.08)"
        stroke="#0f172a"
        strokeWidth="1"
      />

      {([
        ["giallo", entusiasta],
        ["verde", riflessivo],
        ["blu", preciso],
        ["rosso", concreto],
      ] as [Color, { x: number; y: number }][]).map(([color, point]) => (
        <circle
          key={color}
          cx={point.x}
          cy={point.y}
          r="4"
          fill={colorMeta[color].accent}
        />
      ))}

      {showQuadrantLabels && (
        <>
          <text x="16" y="28" fontSize="10" fill="#111827">
            Entusiasta
          </text>
          <text x={size - 70} y="28" fontSize="10" fill="#111827">
            Riflessivo
          </text>
          <text x="16" y={size - 12} fontSize="10" fill="#111827">
            Concreto
          </text>
          <text x={size - 54} y={size - 12} fontSize="10" fill="#111827">
            Preciso
          </text>
        </>
      )}

      {showAxisLabels && (
        <>
          <text
            x={center}
            y="16"
            fontSize="10"
            fill="#64748b"
            textAnchor="middle"
          >
            Emozioni
          </text>
          <text
            x={center}
            y={size - 6}
            fontSize="10"
            fill="#64748b"
            textAnchor="middle"
          >
            Logica
          </text>
          <text
            x="8"
            y={center}
            fontSize="10"
            fill="#64748b"
            textAnchor="start"
            dominantBaseline="middle"
          >
            Azione
          </text>
          <text
            x={size - 8}
            y={center}
            fontSize="10"
            fill="#64748b"
            textAnchor="end"
            dominantBaseline="middle"
          >
            Riflessione
          </text>
        </>
      )}
    </svg>
  );
}
