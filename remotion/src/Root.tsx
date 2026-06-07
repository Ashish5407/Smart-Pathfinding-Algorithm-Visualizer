import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// 8 scenes: intro + 6 algos + outro
// ~28 seconds at 30fps = 840 frames
export const RemotionRoot = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={840}
    fps={30}
    width={1920}
    height={1080}
  />
);
