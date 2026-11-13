import {
  ArrowLeft,
  BatteryFull,
  Calendar,
  Check,
  ChevronLeft,
  CreditCard,
  Info,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Signal,
  UserRound,
  Wifi,
  X,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Audio, Easing, Freeze, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";

import { CallScreen } from "@/components/project-demos/rakuten-link/CallScreen";
import { ChatThread } from "@/components/project-demos/rakuten-link/ChatThread";
import { contactById, type Message } from "@/components/project-demos/rakuten-link/data";
import { LinkDesktopApp } from "@/components/project-demos/rakuten-link/LinkDesktopApp";
import { LinkMobileApp } from "@/components/project-demos/rakuten-link/LinkMobileApp";

import { noto, rubik } from "./fonts";
import { BEAT, SCENES } from "./timeline";

const EASE = Easing.bezier(0.23, 1, 0.32, 1);

/** 0 → 1 over `dur` frames from `start`, eased out */
const enter = (frame: number, start: number, dur = 14) =>
  interpolate(frame, [start, start + dur], [0, 1], { easing: EASE, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const rise = (p: number, px = 40): CSSProperties => ({ opacity: p, transform: `translateY(${(1 - p) * px}px)` });

const display: CSSProperties = { fontFamily: "var(--font-link-display)" };

/* ---------- shared pieces ---------- */

const StatusBar = () => (
  <div className="text-ink flex h-11 shrink-0 items-center justify-between px-7 text-sm font-semibold">
    <span>9:41</span>
    <span className="flex items-center gap-1.5">
      <Signal className="size-4" />
      <Wifi className="size-4" />
      <BatteryFull className="size-5" />
    </span>
  </div>
);

/** Same frame as the demo's phone, for screens the demo opens from inside */
const PhoneShell = ({ children }: { children: ReactNode }) => (
  <div className="bg-surface border-ink relative flex h-[760px] w-[380px] flex-col overflow-hidden rounded-[3rem] border-[10px] shadow-2xl">
    {children}
  </div>
);

const Headline = ({ children, size = 84, color = "var(--ink)" }: { children: ReactNode; size?: number; color?: string }) => (
  <p style={{ ...display, fontSize: size, lineHeight: 1.04, fontWeight: 700, letterSpacing: "-0.02em", color }}>{children}</p>
);

const Sub = ({ children, color = "var(--ink-muted)" }: { children: ReactNode; color?: string }) => (
  <p style={{ fontSize: 34, lineHeight: 1.35, color, marginTop: 20, maxWidth: 760 }}>{children}</p>
);

/* ---------- 1 · Hook ---------- */

const Hook = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill className="items-center justify-center" style={{ background: "var(--accent-1)" }}>
      <div className="text-center" style={{ color: "white" }}>
        <div style={rise(enter(f, 2), 30)}>
          <Headline size={128} color="white">
            Call anyone in Japan.
          </Headline>
        </div>
        <div style={{ ...rise(enter(f, BEAT * 2, 10), 24), marginTop: 18 }}>
          <Headline size={168} color="var(--accent-3-deep)">
            Free.
          </Headline>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 2 · Reveal: Calls tab, then a call ---------- */

const Reveal = () => {
  const f = useCurrentFrame();
  const local = SCENES.callAt - SCENES.reveal.from;
  const phone = enter(f, 0, 18);
  const callUp = enter(f, local, 12);
  const calling = f >= local;
  return (
    <AbsoluteFill className="flex-row items-center" style={{ background: "var(--canvas)", gap: 120, paddingLeft: 260 }}>
      <div style={{ ...rise(phone, 120), transform: `translateY(${(1 - phone) * 120}px) scale(1.12)` }}>
        <div className="relative">
          <LinkMobileApp skipSplash />
          {calling && (
            <div
              className="absolute inset-0 overflow-hidden rounded-[3rem] border-[10px] border-transparent"
              style={{ transform: `translateY(${(1 - callUp) * 100}%)` }}
            >
              <CallScreen name="Aiko Tanaka" phone="070-1234-5601" onEnd={() => {}} className="rounded-[2.4rem]" />
            </div>
          )}
        </div>
      </div>
      <div>
        <div style={rise(enter(f, 8))}>
          <Headline size={96} color="var(--accent-1)">
            Rakuten Link
          </Headline>
        </div>
        <div style={rise(enter(f, 14))}>
          <Sub>Free calls and messages for Rakuten Mobile customers.</Sub>
        </div>
        {calling && (
          <div style={{ ...rise(enter(f, local + 4)), marginTop: 48 }}>
            <Headline size={64}>Unlimited domestic calls.</Headline>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 3 · Messages arrive one by one ---------- */

const CHAT: { at: number; message: Message }[] = [
  { at: 6, message: { id: "v1", from: "them", kind: "text", text: "Free tonight? 🍜", time: "06:12 PM" } },
  { at: 6 + BEAT * 2, message: { id: "v2", from: "me", kind: "text", text: "Yes! Where?", time: "06:12 PM", seen: true } },
  { at: 6 + BEAT * 4, message: { id: "v3", from: "them", kind: "location", place: "Shibuya Station, Tokyo", time: "06:13 PM" } },
  { at: 6 + BEAT * 6, message: { id: "v4", from: "me", kind: "text", text: "On my way 🏃", time: "06:14 PM", seen: true } },
];

const Messages = () => {
  const f = useCurrentFrame();
  const aiko = contactById("aiko");
  const days = [{ date: "Today", messages: CHAT.filter((m) => f >= m.at).map((m) => m.message) }];
  return (
    <AbsoluteFill className="flex-row items-center" style={{ background: "var(--canvas)", gap: 120, paddingLeft: 260 }}>
      <div style={{ transform: "scale(1.12)" }}>
        <PhoneShell>
          <StatusBar />
          <header className="bg-surface border-surface-border flex h-14 shrink-0 items-center gap-2 border-b px-2">
            <ChevronLeft className="text-ink size-6" />
            <h2 className="text-ink flex-1 text-lg font-bold">{aiko.name}</h2>
            <Phone className="text-ink me-2 size-5" />
          </header>
          <ChatThread contact={aiko} days={days} />
        </PhoneShell>
      </div>
      <div>
        <div style={rise(enter(f, 4))}>
          <Headline size={80}>Free messages between Link users.</Headline>
        </div>
        <div style={rise(enter(f, 12))}>
          <Sub>Photos, voice notes and locations, all included.</Sub>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 4 · Desktop and phone together ---------- */

const Desktop = () => {
  const f = useCurrentFrame();
  const win = enter(f, 0, 16);
  const phone = enter(f, 6, 16);
  return (
    <AbsoluteFill className="items-center" style={{ background: "var(--canvas)", paddingTop: 70 }}>
      <div style={rise(enter(f, 2), 24)}>
        <Headline size={72}>On your phone and your computer.</Headline>
      </div>
      <div className="relative" style={{ marginTop: 50, width: 1500, height: 760 }}>
        <div style={{ ...rise(win, 60), position: "absolute", left: 0, top: 40, width: 1080, transform: `translateY(${(1 - win) * 60}px) scale(1.02)`, transformOrigin: "top left" }}>
          <LinkDesktopApp />
        </div>
        <div style={{ position: "absolute", right: 40, top: 0, opacity: phone, transform: `translateY(${(1 - phone) * 80}px) scale(0.92)`, transformOrigin: "top right" }}>
          <LinkMobileApp skipSplash />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 5 · The design system ---------- */

const SWATCHES = [
  { label: "Pink", hex: "#FF008C", bg: "var(--accent-1)" },
  { label: "Ground blue", hex: "#000033", bg: "var(--accent-3-deep)" },
  { label: "UI blue", hex: "#3B3BA3", bg: "var(--accent-2)" },
];
const ICONS = [ChevronLeft, ArrowLeft, X, Check, Plus, UserRound, Mail, Info, MapPin, CreditCard, Calendar, MoreHorizontal];

const System = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "var(--surface)", padding: "0 200px", justifyContent: "center" }}>
      <div style={rise(enter(f, 0), 24)}>
        <Headline size={80}>One design system. Two apps.</Headline>
      </div>
      <div className="flex" style={{ gap: 56, marginTop: 70 }}>
        <div className="flex" style={{ gap: 24 }}>
          {SWATCHES.map((s, i) => {
            const p = enter(f, 6 + i * 5, 12);
            return (
              <div key={s.hex} style={{ opacity: p, transform: `scale(${0.85 + p * 0.15})` }}>
                <div style={{ width: 210, height: 210, borderRadius: 28, background: s.bg }} />
                <p className="text-ink" style={{ fontSize: 26, fontWeight: 700, marginTop: 16 }}>{s.label}</p>
                <p className="text-ink-muted" style={{ fontSize: 24 }}>{s.hex}</p>
              </div>
            );
          })}
        </div>
        <div className="text-ink" style={{ ...rise(enter(f, 22), 30), borderLeft: "2px solid var(--surface-border)", paddingLeft: 56 }}>
          <p style={{ ...display, fontSize: 112, lineHeight: 1 }}>
            <span style={{ fontWeight: 300 }}>00 </span>
            <span style={{ fontWeight: 500 }}>00 </span>
            <span style={{ fontWeight: 700 }}>00</span>
          </p>
          <p className="text-ink-muted" style={{ fontSize: 24, marginTop: 10 }}>Rubik</p>
          <p style={{ fontSize: 88, marginTop: 26, lineHeight: 1 }}>
            Aa <span style={{ fontWeight: 700 }}>Aa</span>
          </p>
          <p className="text-ink-muted" style={{ fontSize: 24, marginTop: 10 }}>Noto Sans</p>
          <div className="grid" style={{ gridTemplateColumns: "repeat(6, 60px)", gap: 14, marginTop: 34 }}>
            {ICONS.map((Icon, i) => {
              const p = enter(f, 30 + i * 2, 10);
              return (
                <span key={i} className="bg-canvas flex items-center justify-center" style={{ width: 60, height: 60, borderRadius: 14, opacity: p }}>
                  <Icon className="text-ink" style={{ width: 28, height: 28 }} strokeWidth={1.5} />
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 6 · Outro ---------- */

const Outro = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill className="items-center justify-center text-center" style={{ background: "var(--accent-1)" }}>
      <div style={rise(enter(f, 0), 24)}>
        <Headline size={150} color="white">
          Rakuten Link
        </Headline>
      </div>
      <div style={rise(enter(f, 8), 20)}>
        <p style={{ fontSize: 40, color: "white", marginTop: 24 }}>Designed from first idea to launch · Kiran Pingle</p>
      </div>
    </AbsoluteFill>
  );
};

const POSTER_FRAME = 440;

export const LinkVideo: React.FC = () => {
  const s = SCENES;
  return (
    <AbsoluteFill
      data-project="rakuten-link"
      style={{ "--font-link-display": rubik, "--font-link-text": noto, fontFamily: noto, background: "var(--canvas)" } as CSSProperties}
    >
      <Sequence from={s.hook.from} durationInFrames={s.hook.to - s.hook.from}>
        <Hook />
      </Sequence>
      <Sequence from={s.reveal.from} durationInFrames={s.reveal.to - s.reveal.from}>
        <Reveal />
      </Sequence>
      <Sequence from={s.messages.from} durationInFrames={s.messages.to - s.messages.from}>
        <Messages />
      </Sequence>
      <Sequence from={s.desktop.from} durationInFrames={s.desktop.to - s.desktop.from}>
        <Desktop />
      </Sequence>
      <Sequence from={s.system.from} durationInFrames={s.system.to - s.system.from}>
        <System />
      </Sequence>
      <Sequence from={s.outro.from} durationInFrames={s.outro.to - s.outro.from}>
        <Outro />
      </Sequence>
      {/* Poster: frame 0 shows the settled desktop scene so thumbnails pick it up */}
      <Sequence from={0} durationInFrames={1}>
        <AbsoluteFill style={{ background: "var(--canvas)" }}>
          <Freeze frame={POSTER_FRAME - s.desktop.from}>
            <Desktop />
          </Freeze>
        </AbsoluteFill>
      </Sequence>
      <Audio src={staticFile("music.wav")} />
    </AbsoluteFill>
  );
};
