/**
 * Renders the Rakuten Link demo components from the portfolio app. `@/` points
 * there; React comes from the repo root, shared with the components.
 */
import path from "node:path";

import { Config } from "@remotion/cli/config";
import { rspack } from "@rspack/core";
import { enableTailwind } from "@remotion/tailwind-v4";

const repoRoot = path.resolve(process.cwd(), "../../..");

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
// Port 3000 is the portfolio dev server
Config.setPort(3210);
// The headless shell crashes on this Mac (missing ICU data); full Chrome for Testing works
Config.setChromeMode("chrome-for-testing");

Config.overrideBundlerConfig((config) => {
  const withTailwind = enableTailwind(config);
  return {
    ...withTailwind,
    plugins: [
      ...(withTailwind.plugins ?? []),
      new rspack.CopyRspackPlugin({
        patterns: [{ from: path.join(repoRoot, "apps/portfolio/public/images"), to: "images" }],
      }),
    ],
    resolve: {
      ...withTailwind.resolve,
      alias: {
        ...(withTailwind.resolve?.alias ?? {}),
        "@": path.join(repoRoot, "apps/portfolio/src"),
      },
    },
  };
});
