import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  CalculateMetadataFunction,
} from "remotion";
import { Audio } from "@remotion/media";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const oswald = loadOswald("normal", { weights: ["600", "700"] }).fontFamily;
const inter = loadInter("normal", { weights: ["500", "700"] }).fontFamily;

type Word = { word: string; start: number; end: number };
type Scene = { id: number; text: string; duration: number; words: Word[] };
type Props = { scenes: Scene[] };

const FPS = 30;
const PAD = 0.4;
const OUT = 9; // frames of exit slide at the end of each scene
const BG = "#141414";
const CARD = "#1C1C1C";
const ORANGE = "#FF7A00";
const LABEL = "#FFB366";
const TEXT = "#F7F5F0";
const frames = (s: Scene) => Math.ceil((s.duration + PAD) * FPS);

export const calculateMetadata: CalculateMetadataFunction<Props> = async () => {
  const scenes: Scene[] = await fetch(
    staticFile("wheelstop-ad/scenes.json"),
  ).then((r) => r.json());
  return {
    props: { scenes },
    durationInFrames: scenes.reduce((n, s) => n + frames(s), 0),
  };
};

// Per-scene visuals. shots are mobile screenshots of wheelstop.in; scroll is
// how far (in screen-heights) the page glides during the scene.
type Layout = {
  shots: { src: string; scroll: number; w: number; h: number }[];
  chips: { text: string; x: number; y: number; rot: number; at: number }[];
};
const LAYOUT: Record<number, Layout> = {
  1: { shots: [], chips: [] },
  2: {
    shots: [{ src: "home.jpg", scroll: 0.1, w: 780, h: 1688 }],
    chips: [
      { text: "Zero commission", x: 30, y: 180, rot: -6, at: 20 },
      { text: "Pan-India", x: 640, y: 560, rot: 5, at: 38 },
    ],
  },
  3: {
    shots: [
      { src: "market_full.jpg", scroll: 1.6, w: 780, h: 7440 },
      { src: "creta.jpg", scroll: 0.3, w: 780, h: 1688 },
    ],
    chips: [
      { text: "5×114.3 PCD", x: 30, y: 300, rot: -5, at: 14 },
      { text: '18" × 8.5J', x: 650, y: 700, rot: 6, at: 30 },
    ],
  },
  4: {
    shots: [{ src: "sell.jpg", scroll: 0.35, w: 780, h: 1688 }],
    chips: [
      { text: "List free in 2 min", x: 30, y: 240, rot: -5, at: 18 },
      { text: "No commission", x: 650, y: 820, rot: 5, at: 34 },
    ],
  },
  5: { shots: [], chips: [] },
};

const SCREEN_W = 520;
const SCREEN_H = 1125;

const Wheel: React.FC<{ size: number; opacity?: number }> = ({
  size,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <svg
      width={size}
      height={size}
      viewBox="-100 -100 200 200"
      style={{ transform: `rotate(${frame * 1.6}deg)`, opacity }}
    >
      <circle r="96" fill="#101010" stroke={ORANGE} strokeWidth="5" />
      <circle r="84" fill="none" stroke="#2A2A2A" strokeWidth="2" />
      {Array.from({ length: 5 }, (_, i) => (
        <path
          key={i}
          d="M-8 -14 L-18 -80 Q0 -88 18 -80 L8 -14 Z"
          fill="#D9D6CF"
          transform={`rotate(${i * 72})`}
        />
      ))}
      <circle r="17" fill={ORANGE} />
      <circle r="6" fill={BG} />
    </svg>
  );
};

// Lives outside the scene Sequences so the glow and big wheel never restart.
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + Math.sin(frame / 50) * 12}% 38%, rgba(255,122,0,0.28), transparent 55%)`,
        }}
      />
      <div style={{ position: "absolute", right: -420, top: 760 }}>
        <Wheel size={1100} opacity={0.12} />
      </div>
    </AbsoluteFill>
  );
};

const Headline: React.FC<{ text: string; size: number; delay?: number }> = ({
  text,
  size,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: `0 ${size * 0.25}px`,
        width: 960,
        fontFamily: oswald,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.02,
        textTransform: "uppercase",
        color: TEXT,
      }}
    >
      {text.split(" ").map((w, i) => {
        const p = spring({
          frame: frame - delay - i * 4,
          fps,
          config: { damping: 13, stiffness: 140 },
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              transform: `translateY(${interpolate(p, [0, 1], [60, 0])}px) scale(${interpolate(p, [0, 1], [0.8, 1])})`,
              color: i === text.split(" ").length - 1 ? ORANGE : TEXT,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

const Phone: React.FC<{ layout: Layout; total: number }> = ({
  layout,
  total,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 90 } });
  const bob = Math.sin(frame / 22) * 8;
  const tilt = interpolate(enter, [0, 1], [18, -4]) + Math.sin(frame / 40) * 1.5;
  const n = layout.shots.length;
  const seg = total / n;

  return (
    <div
      style={{
        position: "absolute",
        left: (1080 - SCREEN_W) / 2,
        top: 470,
        width: SCREEN_W,
        height: SCREEN_H,
        borderRadius: 64,
        border: "14px solid #0A0A0A",
        boxShadow: `0 0 0 3px #333, 0 40px 120px rgba(0,0,0,0.7), 0 0 160px rgba(255,122,0,0.25)`,
        overflow: "hidden",
        background: TEXT,
        transform: `translateY(${interpolate(enter, [0, 1], [900, 0]) + bob}px) perspective(1600px) rotateY(${tilt}deg) rotateX(4deg)`,
      }}
    >
      {layout.shots.map((s, i) => {
        const local = frame - i * seg;
        const imgH = (s.h / s.w) * SCREEN_W;
        const y = interpolate(local, [0, seg], [0, -s.scroll * SCREEN_H], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const fadeIn =
          i === 0
            ? 1
            : interpolate(frame, [i * seg - 8, i * seg], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
        return (
          <Img
            key={s.src}
            src={staticFile(`wheelstop-ad/${s.src}`)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: SCREEN_W,
              height: imgH,
              opacity: fadeIn,
              transform: `translateY(${y}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

const Chip: React.FC<{ c: Layout["chips"][number] }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - c.at,
    fps,
    config: { damping: 9, stiffness: 160 },
  });
  return (
    <div
      style={{
        position: "absolute",
        left: c.x,
        top: 470 + c.y,
        padding: "18px 34px",
        borderRadius: 999,
        background: ORANGE,
        color: BG,
        fontFamily: inter,
        fontWeight: 700,
        fontSize: 44,
        whiteSpace: "nowrap",
        boxShadow: "0 16px 50px rgba(0,0,0,0.5)",
        opacity: p,
        transform: `scale(${p}) rotate(${c.rot}deg) translateY(${Math.sin(frame / 18 + c.at) * 6}px)`,
      }}
    >
      {c.text}
    </div>
  );
};

// Narration as live captions, current word highlighted, kept inside the IG safe zone.
const Captions: React.FC<{ words: Word[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 260,
        left: 70,
        width: 940,
        padding: "26px 34px",
        borderRadius: 36,
        background: "rgba(20,20,20,0.82)",
        border: `2px solid ${CARD}`,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: 18,
        fontFamily: inter,
        fontWeight: 700,
        fontSize: 52,
        lineHeight: 1.25,
        color: "#8A8882",
      }}
    >
      {words.map((w, i) => (
        <span
          key={i}
          style={{
            color: t >= w.end ? TEXT : t >= w.start ? ORANGE : "#8A8882",
            transform: t >= w.start && t < w.end ? "scale(1.08)" : "none",
            display: "inline-block",
          }}
        >
          {w.word}
        </span>
      ))}
    </div>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 11 } });
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          marginTop: 420,
          opacity: p,
          transform: `scale(${interpolate(p, [0, 1], [0.5, 1])})`,
        }}
      >
        <Img src={staticFile("wheelstop-ad/wheelstop-logo.svg")} style={{ width: 760 }} />
      </div>
      <div style={{ marginTop: 50 }}>
        <Headline text="Find your fit" size={120} delay={10} />
      </div>
      <div
        style={{
          marginTop: 70,
          padding: "34px 80px",
          borderRadius: 28,
          background: ORANGE,
          color: BG,
          fontFamily: inter,
          fontWeight: 700,
          fontSize: 68,
          opacity: interpolate(frame, [24, 36], [0, 1], {
            extrapolateRight: "clamp",
          }),
          transform: `scale(${pulse})`,
          boxShadow: "0 0 80px rgba(255,122,0,0.5)",
        }}
      >
        wheelstop.in
      </div>
      <div
        style={{
          marginTop: 40,
          fontFamily: inter,
          fontWeight: 500,
          fontSize: 42,
          color: LABEL,
          letterSpacing: 4,
          textTransform: "uppercase",
          opacity: interpolate(frame, [36, 50], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        India&apos;s wheel marketplace
      </div>
    </AbsoluteFill>
  );
};

const SceneView: React.FC<{ scene: Scene; total: number }> = ({
  scene,
  total,
}) => {
  const frame = useCurrentFrame();
  const layout = LAYOUT[scene.id];
  const exit = interpolate(frame, [total - OUT, total], [0, 1], {
    extrapolateLeft: "clamp",
  });
  const isEnd = scene.id === 5;
  const isHook = scene.id === 1;
  const { fps } = useVideoConfig();
  const heroIn = spring({ frame, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${-exit * exit * 1080}px)`,
        opacity: 1 - exit * 0.4,
      }}
    >
      {isEnd ? (
        <EndCard />
      ) : (
        <>
          <div
            style={{
              position: "absolute",
              top: isHook ? 940 : 190,
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Headline text={scene.text} size={isHook ? 150 : 104} />
          </div>
          {isHook ? (
            <div
              style={{
                position: "absolute",
                top: 240,
                left: 240,
                opacity: heroIn,
                transform: `scale(${interpolate(heroIn, [0, 1], [0.3, 1])})`,
              }}
            >
              <Wheel size={600} />
            </div>
          ) : (
            <>
              <Phone layout={layout} total={total} />
              {layout.chips.map((c) => (
                <Chip key={c.text} c={c} />
              ))}
            </>
          )}
          <Captions words={scene.words} />
        </>
      )}
    </AbsoluteFill>
  );
};

export const WheelstopAd: React.FC<Props> = ({ scenes }) => {
  let from = 0;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Background />
      {scenes.map((s) => {
        const f = from;
        const d = frames(s);
        from += d;
        return (
          <Sequence key={s.id} from={f} durationInFrames={d}>
            <Audio src={staticFile(`wheelstop-ad/scene_${s.id}.wav`)} />
            <SceneView scene={s} total={d} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
