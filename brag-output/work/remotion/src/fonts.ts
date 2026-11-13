import { loadFont as loadNoto } from "@remotion/google-fonts/NotoSans";
import { loadFont as loadRubik } from "@remotion/google-fonts/Rubik";

// Rakuten Mobile foundation type: Rubik for display and numbers, Noto Sans for text
export const { fontFamily: rubik } = loadRubik("normal", { weights: ["300", "500", "700"], subsets: ["latin"] });
export const { fontFamily: noto } = loadNoto("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });
