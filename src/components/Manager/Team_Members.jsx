export default function TeamMembers({ members = [] }) {
  const displayMembers = members.length > 0 ? members.slice(0, 5) : [
    { name: "No team members found", role: "" },
  ];

  const getRoleBadge = (role) => {
    if (!role) return null;
    let colorClasses = "bg-slate-100 text-slate-600 border-slate-200";
    if (role === "Tenant Admin" || role === "Admin") {
      colorClasses = "bg-blue-50 text-blue-700 border-blue-200";
    } else if (role === "Manager") {
      colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
    } else if (role === "Viewer") {
      colorClasses = "bg-purple-50 text-purple-700 border-purple-200";
    }
    return (
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colorClasses}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-800">
            Team Members
          </h2>
          <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
            {members.length} Total
          </span>
        </div>

        <div className="space-y-3.5">
          {displayMembers.map((member, index) => (
            <div
              key={index}
              className="flex items-center justify-between hover:bg-slate-50/70 p-2.5 -mx-2.5 rounded-xl transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-100 text-sm group-hover:scale-105 transition-transform duration-200">
                  {member.name?.[0]?.toUpperCase() || "?"}
                </div>

                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-700 text-sm leading-none group-hover:text-blue-600 transition-colors">
                    {member.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(member.role)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden group-hover:inline transition-opacity duration-150">
                  {member.isActive !== false ? "Active" : "Offline"}
                </span>
                <span className="relative flex h-2 w-2">
                  {member.isActive !== false && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${member.isActive !== false ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}