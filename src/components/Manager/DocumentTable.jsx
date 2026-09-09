import { useState, useMemo } from "react";
import { MoreHorizontal } from "lucide-react";
import Pagination from "../common/Pagination";

export default function DocumentTable({
  title,
  data = [],
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Always show the latest document 1st
  const sortedData = useMemo(() => {
    return [...(data || [])].sort((a, b) => {
      const timeA = new Date(a.rawDate || a.createdAt || a.updatedAt || a.modified || 0).getTime();
      const timeB = new Date(b.rawDate || b.createdAt || b.updatedAt || b.modified || 0).getTime();
      return timeB - timeA;
    });
  }, [data]);

  // Paginate 10 documents per page
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        {sortedData.length > 0 && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {sortedData.length} Total
          </span>
        )}
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full min-w-[700px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Name
              </th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Manager
              </th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Department
              </th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Type
              </th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Size
              </th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Modified
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-8 text-slate-400 italic">
                  No recent documents found
                </td>
              </tr>
            ) : (
              paginatedData.map((doc, index) => (
                <tr
                  key={doc.id || doc._id || index}
                  className="border-t hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 font-semibold text-slate-900">
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

                  <td className="p-4 text-slate-600">
                    {doc.type}
                  </td>

                  <td className="p-4 text-slate-600">
                    {doc.size}
                  </td>

                  <td className="p-4 text-slate-600">
                    {doc.modified}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sortedData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={sortedData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemName="documents"
        />
      )}
    </div>
  );
}