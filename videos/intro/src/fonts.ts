import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";

// Same type as the website: Geist for everything, Geist Mono for small labels
export const { fontFamily: sans } = loadGeist("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});

export const { fontFamily: mono } = loadGeistMono("normal", {
  weights: ["400"],
  subsets: ["latin"],
});
