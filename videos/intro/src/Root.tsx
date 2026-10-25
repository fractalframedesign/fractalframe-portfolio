import { Composition, Folder } from "remotion";
import { Intro } from "./Intro";
import { Articles } from "./scenes/Articles";
import { Components } from "./scenes/Components";
import { Opening } from "./scenes/Opening";
import { Outro } from "./scenes/Outro";
import { Statement } from "./scenes/Statement";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Intro-Scenes">
        <Composition
          id="Opening"
          component={Opening}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={120}
        />
        <Composition
          id="Statement"
          component={Statement}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={165}
        />
        <Composition
          id="Components"
          component={Components}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={150}
        />
        <Composition
          id="Articles"
          component={Articles}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={135}
        />
        <Composition
          id="Outro"
          component={Outro}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={90}
        />
      </Folder>
      <Composition
        id="Intro"
        component={Intro}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={600}
      />
    </>
  );
};
