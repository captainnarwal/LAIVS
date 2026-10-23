import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { WheelstopAd, calculateMetadata } from "./WheelstopAd";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="WheelstopAd"
        component={WheelstopAd}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ scenes: [] }}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
