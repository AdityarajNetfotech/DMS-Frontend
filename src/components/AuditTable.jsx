export default function AuditTable() {
  return (
    <div className="bg-white border rounded-2xl overflow-hidden">
      <div className="p-5 border-b flex justify-between">
        <h2 className="font-semibold">
          Recent System Events
        </h2>

        <button className="text-blue-600">
          View All Logs
        </button>
      </div>

      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4 text-left">
              TIMESTAMP
            </th>
            <th className="p-4 text-left">
              USER
            </th>
            <th className="p-4 text-left">
              ACTION
            </th>
            <th className="p-4 text-left">
              RESOURCE
            </th>
            <th className="p-4 text-left">
              STATUS
            </th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-t">
            <td className="p-4">2024-05-24</td>
            <td className="p-4">
              sarah.j@acmeglobal.com
            </td>
            <td className="p-4">POLICY_UPDATE</td>
            <td className="p-4">
              encryption_keys_v2
            </td>
            <td className="p-4 text-green-600">
              SUCCESS
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}