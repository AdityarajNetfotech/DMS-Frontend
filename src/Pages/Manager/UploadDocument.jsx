import {
  Building2,
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  LockKeyhole,
  Upload,
  UploadCloud,
} from "lucide-react";

import MainLayout from "../../layout/MainLayout";

function SelectField({ label, required, icon: Icon, value, helper }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-900">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>

      <button className="mt-3 flex h-12 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-50">
        <span className="flex min-w-0 items-center gap-3">
          {Icon ? <Icon size={19} className="shrink-0 text-slate-600" /> : null}
          <span className="truncate">{value}</span>
        </span>
        <ChevronDown size={18} className="shrink-0 text-slate-600" />
      </button>

      {helper ? <p className="mt-2 text-sm text-slate-500">{helper}</p> : null}
    </div>
  );
}

export default function UploadDocument() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <section>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950">
            Upload Document
          </h1>
          <p className="mt-3 text-base text-slate-500">
            Upload your document to the selected folder.
          </p>

          <nav className="mt-5 flex items-center gap-3 text-sm font-semibold">
            <span className="text-blue-700">Home</span>
            <ChevronRight size={16} className="text-slate-400" />
            <span className="text-blue-700">Project Alpha</span>
            <ChevronRight size={16} className="text-slate-400" />
            <span className="text-slate-900">Upload Document</span>
          </nav>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div className="flex min-h-[255px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-600 bg-white px-6 py-10 text-center">
              <UploadCloud size={70} className="text-blue-600" />

              <p className="mt-5 text-base font-bold text-slate-950">
                Drag & drop your file here
              </p>
              <p className="mt-3 text-sm font-medium text-slate-900">or</p>

              <label className="mt-4 inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800">
                <Upload size={17} />
                Choose File
                <input type="file" className="hidden" />
              </label>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG,
              PNG (Max 100MB)
            </p>

            <div className="mt-7 space-y-6">
              <div>
                <label className="text-sm font-semibold text-slate-900">
                  Document Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter document title"
                  className="mt-3 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-900">
                  Description
                </label>
                <div className="relative mt-3">
                  <textarea
                    placeholder="Enter document description (optional)"
                    rows={5}
                    maxLength={500}
                    className="min-h-[120px] w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <span className="absolute bottom-3 right-4 text-sm text-slate-500">
                    0/500
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-900">
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="Add tags (e.g., report, finance, meeting)"
                  className="mt-3 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-2 text-sm text-slate-500">
                  Press Enter to add multiple tags
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="space-y-7">
              <SelectField
                label="Select Folder"
                required
                icon={Folder}
                value="Project Alpha / Reports"
              />

              <SelectField
                label="Document Type"
                icon={FileText}
                value="Select document type"
              />

              <SelectField
                label="Access Level"
                required
                icon={LockKeyhole}
                value="Department"
                helper="Who can access this document"
              />

              <SelectField
                label="Department"
                icon={Building2}
                value="Finance Department"
                helper="Select department"
              />

              <SelectField label="Add Tags" value="Select or add tags" />

              <div className="flex items-start justify-between gap-5 border-t border-slate-100 pt-5">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Create New Version
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Upload as a new version if the document already exists
                  </p>
                </div>

                <button
                  className="relative mt-1 h-7 w-12 rounded-full bg-slate-300 transition hover:bg-slate-400"
                  aria-label="Toggle create new version"
                >
                  <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm" />
                </button>
              </div>
            </div>
          </aside>
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:justify-end">
          <button className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-7 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
            Cancel
          </button>
          <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-700 px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800">
            <UploadCloud size={18} />
            Upload Document
          </button>
        </section>
      </div>
    </MainLayout>
  );
}
