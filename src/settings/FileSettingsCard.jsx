export default function FileSettingsCard() {
  return (
    <div className="bg-white border rounded-2xl p-7">
      <h2 className="text-xl font-semibold">
        File System Constraints
      </h2>

      <p className="text-gray-500">
        Define storage limits and allowed document formats.
      </p>

      <div className="border-t mt-5 pt-5 space-y-6">
        <div className="grid grid-cols-[170px_1fr] gap-5">
          <label>Allowed Extensions</label>

          <textarea
            rows={4}
            defaultValue=".pdf, .docx, .xlsx, .pptx, .txt, .csv, .zip"
            className="border rounded-xl p-4"
          />
        </div>

        <div className="grid grid-cols-[170px_1fr] gap-5">
          <label>Max File Size</label>

          <div className="flex gap-3 items-center">
            <input
              defaultValue="500"
              className="w-24 h-10 border rounded-lg px-3"
            />

            <span>Megabytes (MB)</span>
          </div>
        </div>
      </div>
    </div>
  );
}