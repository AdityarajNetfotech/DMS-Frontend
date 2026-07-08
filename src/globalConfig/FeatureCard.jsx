export default function FeatureCard({
  icon,
  title,
  badge,
  description,
  percentage,
  enabled = true,
}) {
  return (
    <div className="bg-white border border-[#D8DDEA] rounded-3xl p-6">
      <div className="flex justify-between">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center">
            {icon}
          </div>

          <div>
            <h3 className="text-[18px] font-semibold">
              {title}
            </h3>

            <span className="inline-block mt-1 px-2 py-1 text-[10px] font-medium bg-[#DCE4F7] rounded">
              {badge}
            </span>
          </div>
        </div>

        {/* Toggle */}
        <div
          className={`w-14 h-8 rounded-full flex items-center px-1 ${
            enabled ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <div
            className={`w-6 h-6 bg-white rounded-full transition-all ${
              enabled ? "translate-x-6" : ""
            }`}
          />
        </div>
      </div>

      <p className="mt-6 text-gray-600 leading-7">
        {description}
      </p>

      <div className="mt-8 border-t pt-4">
        <div className="flex justify-between text-sm">
          <span>Current Utilization</span>
          <span className="font-semibold text-blue-700">
            {percentage}
          </span>
        </div>

        <div className="h-2 bg-gray-200 rounded-full mt-2">
          <div
            className="h-2 bg-blue-600 rounded-full"
            style={{
              width:
                percentage.includes("%")
                  ? percentage
                  : "70%",
            }}
          />
        </div>
      </div>
    </div>
  );
}