import { MoreHorizontal } from "lucide-react";

export default function DocumentTable({
  title,
  data,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 border-b">
        <h2 className="text-lg font-semibold">
          {title}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-4">
                Name
              </th>

              <th className="text-left p-4">
                Manager
              </th>

              <th className="text-left p-4">
                Department
              </th>

              <th className="text-left p-4">
                Type
              </th>

              <th className="text-left p-4">
                Size
              </th>

              <th className="text-left p-4">
                Modified
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((doc, index) => (
              <tr
                key={index}
                className="border-t hover:bg-slate-50"
              >
                <td className="p-4">
                  {doc.name}
                </td>

                <td className="p-4 text-slate-700 font-medium">
                  {doc.owner}
                </td>

                <td className="p-4 text-slate-700">
                  {doc.department !== "Global" ? (
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {doc.department}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-xs">Global</span>
                  )}
                </td>

                <td className="p-4">
                  {doc.type}
                </td>

                <td className="p-4">
                  {doc.size}
                </td>

                <td className="p-4">
                  {doc.modified}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}