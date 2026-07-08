// import FeatureHeader from "../components/globalConfig/FeatureHeader";
import FeatureHeader from "../globalConfig/FeatureHeader";
import FeatureGrid from "../globalConfig/FeatureGrid";
import PlatformVelocity from "../globalConfig/PlatformVelocity";
import BottomActionBar from "../globalConfig/BottomActionBar";

export default function GlobalConfig() {
  return (
    <div className="space-y-6">
      <FeatureHeader />
      <div className="mt-6">
        <FeatureGrid />
      </div>
      <BottomActionBar />
    </div>
  );
}