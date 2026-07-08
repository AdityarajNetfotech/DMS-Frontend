import SettingsHeader from "../settings/SettingsHeader";
import SettingsTabs from "../settings/SettingsTabs";
import GeneralConfigCard from "../settings/GeneralConfigCard";
import SecurityCard from "../settings/SecurityCard";
import FileSettingsCard from "../settings/FileSettingsCard";
import EmailSMTPCard from "../settings/EmailSMTPCard";

export default function GlobalSettings() {
  return (
    <div className="space-y-6">
      <SettingsHeader />
      <div className="flex gap-8">
        <SettingsTabs />
        <div className="flex-1 space-y-6">
          <GeneralConfigCard />
          <SecurityCard />
          <FileSettingsCard />
          <EmailSMTPCard />
        </div>
      </div>
    </div>
  );
}