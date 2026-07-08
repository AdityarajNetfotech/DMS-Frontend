import {
  MoreHorizontal,
  FileText,
} from "lucide-react";

const docs = [
  {
    name: "Project Proposal.pdf",
    owner: "John Doe",
    size: "2.4 MB",
    modified: "2 hrs ago",
  },
  {
    name: "Budget Report.xlsx",
    owner: "Sarah",
    size: "1.1 MB",
    modified: "Yesterday",
  },
  {
    name: "Design Assets.zip",
    owner: "Alex",
    size: "45 MB",
    modified: "3 days ago",
  },
  {
    name: "Meeting Notes.docx",
    owner: "Emma",
    size: "540 KB",
    modified: "1 week ago",
  },
];

export default function RecentDocuments() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="p-5 border-b">
        <h2 className="font-semibold text-lg">
          Recent Documents
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-4">
                Document
              </th>
              <th className="text-left p-4">
                Owner
              </th>
              <th className="text-left p-4">
                Size
              </th>
              <th className="text-left p-4">
                Modified
              </th>
              <th className="text-left p-4">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {docs.map((doc, i) => (
              <tr
                key={i}
                className="border-t hover:bg-slate-50"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText
                        size={18}
                        className="text-blue-600"
                      />
                    </div>

                    {doc.name}
                  </div>
                </td>

                <td className="p-4">
                  {doc.owner}
                </td>

                <td className="p-4">
                  {doc.size}
                </td>

                <td className="p-4">
                  {doc.modified}
                </td>

                <td className="p-4">
                  <button>
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}