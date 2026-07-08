export default function SecurityCard() {
  return (
    <div className="bg-white border rounded-2xl p-7">
      <h2 className="text-xl font-semibold">
        Security & Access Control
      </h2>

      <p className="text-gray-500">
        Strict password enforcement and authentication requirements.
      </p>

      <div className="border-t mt-5 pt-5 space-y-6">
        <div className="grid grid-cols-[170px_1fr]">
          <label>Password Complexity</label>

          <div className="space-y-3">
            <label className="flex gap-2">
              <input type="checkbox" defaultChecked />
              Must contain uppercase and lowercase
            </label>

            <label className="flex gap-2">
              <input type="checkbox" defaultChecked />
              Must contain numbers
            </label>

            <label className="flex gap-2">
              <input type="checkbox" />
              Must contain special characters
            </label>
          </div>
        </div>

        <div className="grid grid-cols-[170px_1fr]">
          <label>Min Password Length</label>

          <div className="flex gap-3 items-center">
            <input
              defaultValue="12"
              className="w-20 h-10 border rounded-lg px-3"
            />
            <span>characters minimum</span>
          </div>
        </div>

        <div className="grid grid-cols-[170px_1fr]">
          <label>MFA Enforcement</label>

          <div className="flex items-center gap-4">
            <div className="w-12 h-7 rounded-full bg-blue-600 relative">
              <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full"></div>
            </div>

            <span>
              Require Multi-Factor for all admins
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[170px_1fr]">
          <label>Session Timeout</label>

          <div className="flex gap-3">
            <select className="border rounded-lg h-10 px-3">
              <option>30</option>
            </select>

            <span>
              Minutes before auto logout
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}