export default function GeneralConfigCard() {
  return (
    <div className="bg-white border rounded-2xl p-7">
      <h2 className="text-xl font-semibold">
        General Configuration
      </h2>

      <p className="text-gray-500 mt-1">
        Manage basic platform identity and visual branding.
      </p>

      <div className="border-t mt-5 pt-5 space-y-6">
        <div className="grid grid-cols-[170px_1fr] items-center gap-5">
          <label>Platform Name</label>

          <input
            defaultValue="Nexus DMS"
            className="h-12 border rounded-xl px-4"
          />
        </div>

        <div className="grid grid-cols-[170px_1fr] gap-5">
          <label>Logo Upload</label>

          <div className="flex gap-5 items-center">
            <div className="w-14 h-14 border-2 border-dashed rounded-xl"></div>

            <div>
              <button className="text-blue-600">
                Upload new image
              </button>

              <p className="text-gray-500 text-sm">
                Recommended size: 512x512 SVG or PNG
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[170px_1fr] gap-5 items-center">
          <label>Brand Color</label>

          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 bg-blue-700"></div>

            <input
              defaultValue="#004AC6"
              className="border rounded-lg h-10 px-3"
            />

            <span className="text-gray-500">
              Primary brand accent color
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}