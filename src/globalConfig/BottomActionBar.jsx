export default function BottomActionBar() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
      <div className="bg-[#1F2937] rounded-full flex items-center px-6 py-3 gap-8 shadow-2xl">
        <span className="text-white">
          0 features modified
        </span>

        <div className="w-px h-6 bg-gray-500" />

        <button className="text-white">
          Discard
        </button>

        <button className="bg-blue-600 text-white px-8 py-3 rounded-full">
          Apply Changes
        </button>
      </div>
    </div>
  );
}