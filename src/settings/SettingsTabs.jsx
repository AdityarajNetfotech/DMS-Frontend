import {
  Settings,
  Shield,
  FolderCog,
  AtSign,
} from "lucide-react";

export default function SettingsTabs() {
  return (
    <div className="w-[180px]">
      <div className="space-y-6">
        <button className="flex gap-3 items-center font-medium">
          <Settings size={18} />
          General
        </button>

        <button className="flex gap-3 items-center">
          <Shield size={18} />
          Security
        </button>

        <button className="flex gap-3 items-center">
          <FolderCog size={18} />
          File Settings
        </button>

        <button className="flex gap-3 items-center">
          <AtSign size={18} />
          Email (SMTP)
        </button>
      </div>
    </div>
  );
}