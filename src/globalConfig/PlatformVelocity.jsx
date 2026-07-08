export default function PlatformVelocity() {
  return (
    <div className="col-span-2 bg-[#F4F6FC] border rounded-3xl p-6">
      <h2 className="text-4xl font-semibold">
        Platform Velocity
      </h2>

      <p className="text-gray-600 mt-2">
        Release cycle overview for pending feature windows.
      </p>

      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="bg-white border rounded-xl p-4">
          <div className="text-gray-500">
            Next Window
          </div>

          <div className="text-blue-700 font-mono text-2xl mt-2">
            v2.4.0_LTS
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <div className="text-gray-500">
            Beta Features
          </div>

          <div className="text-blue-700 text-2xl mt-2">
            03
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <div className="text-gray-500">
            Deprecations
          </div>

          <div className="text-red-600 text-2xl mt-2">
            01
          </div>
        </div>
      </div>
    </div>
  );
}