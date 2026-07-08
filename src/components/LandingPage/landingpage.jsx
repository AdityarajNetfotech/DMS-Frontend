import { useState } from 'react'
import {
  Activity,
  Archive,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  FileText,
  Folder,
  FolderOpen,
  Gauge,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  Send,
  Settings,
  Shield,
  Sun,
  Trash2,
  UploadCloud,
  User,
  Users,
} from 'lucide-react'

const navLinks = ['Home', 'Features', 'Benefits', 'How It Works', 'Pricing', 'Contact']

const stats = [
  { label: 'Total Documents', value: '1,248', icon: FileText, bg: 'bg-blue-100', color: 'text-blue-600' },
  { label: 'Total Folders', value: '156', icon: Folder, bg: 'bg-emerald-100', color: 'text-emerald-600' },
  { label: 'Total Users', value: '42', icon: User, bg: 'bg-violet-100', color: 'text-violet-600' },
  { label: 'Storage Used', value: '68.4 GB', icon: Gauge, bg: 'bg-orange-100', color: 'text-orange-500' },
]

const documents = [
  { type: 'PDF', color: 'bg-red-500', name: 'Project Proposal.pdf', meta: '2.4 MB - 2 hours ago' },
  { type: 'DOCX', color: 'bg-blue-500', name: 'Employee Handbook.docx', meta: '1.8 MB - 5 hours ago' },
  { type: 'XLSX', color: 'bg-green-500', name: 'Budget Report.xlsx', meta: '950 KB - 1 day ago' },
  { type: 'PPTX', color: 'bg-orange-500', name: 'Product Roadmap.pptx', meta: '3.2 MB - 2 days ago' },
  { type: 'TXT', color: 'bg-slate-500', name: 'Meeting Notes.txt', meta: '320 KB - 2 days ago' },
]

const activities = [
  { icon: FileText, color: 'text-red-500', title: 'Project Proposal.pdf uploaded', meta: 'by Rahul Sharma - 2 hours ago' },
  { icon: FileText, color: 'text-blue-500', title: 'Employee Handbook.docx updated', meta: 'by Priya Patel - 5 hours ago' },
  { icon: Folder, color: 'text-green-500', title: 'Budget Report.xlsx downloaded', meta: 'by Amit Kumar - 1 day ago' },
  { icon: Trash2, color: 'text-slate-500', title: 'Meeting Notes.txt deleted', meta: 'by Neha Verma - 2 days ago' },
]

const features = [
  { icon: FolderOpen, title: 'Centralized Storage', text: 'Store all your documents in one secure location and access them anytime.', bg: 'bg-blue-100', color: 'text-blue-600' },
  { icon: Search, title: 'Advanced Search', text: 'Find documents quickly with powerful search and filter options.', bg: 'bg-green-100', color: 'text-green-600' },
  { icon: Shield, title: 'Role-Based Access', text: 'Control access with role-based permissions and ensure data security.', bg: 'bg-violet-100', color: 'text-violet-600' },
  { icon: Clock3, title: 'Version Control', text: 'Track document versions and restore previous versions easily.', bg: 'bg-orange-100', color: 'text-orange-500' },
  { icon: BarChart3, title: 'Activity Tracking', text: 'Monitor all document activities and user actions in real-time.', bg: 'bg-blue-100', color: 'text-blue-600' },
  { icon: UploadCloud, title: 'Backup & Recovery', text: 'Automatic backups and easy recovery to prevent data loss.', bg: 'bg-pink-100', color: 'text-pink-500' },
]

const benefits = [
  { icon: Clock3, title: 'Save Time', text: 'Reduce time spent searching for documents and focus on what matters.', bg: 'bg-blue-100', color: 'text-blue-600' },
  { icon: Shield, title: 'Enhanced Security', text: 'Keep your documents safe with advanced security and access controls.', bg: 'bg-green-100', color: 'text-green-600' },
  { icon: Users, title: 'Better Collaboration', text: 'Share and collaborate on documents seamlessly across teams.', bg: 'bg-violet-100', color: 'text-violet-600' },
  { icon: BarChart3, title: 'Increase Productivity', text: 'Streamline workflows and boost overall team productivity.', bg: 'bg-orange-100', color: 'text-orange-500' },
  { icon: Database, title: 'Cost Effective', text: 'Go paperless and reduce operational costs significantly.', bg: 'bg-pink-100', color: 'text-pink-500' },
]

const steps = [
  { icon: UploadCloud, title: '1. Upload', text: 'Upload your documents securely to the system.' },
  { icon: Folder, title: '2. Organize', text: 'Organize documents in folders and categories.' },
  { icon: Users, title: '3. Share & Collaborate', text: 'Share with team and set permissions.' },
  { icon: CheckCircle2, title: '4. Secure & Track', text: 'Track activities and keep your documents secure.' },
]

const sidebarItems = [
  { icon: Gauge, label: 'Dashboard', active: true },
  { icon: FileText, label: 'Documents' },
  { icon: Folder, label: 'Folders' },
  { icon: Users, label: 'Users' },
  { icon: LockKeyhole, label: 'Roles' },
  { icon: Activity, label: 'Activity' },
  { icon: Trash2, label: 'Trash' },
  { icon: Settings, label: 'Settings' },
]

function Logo({ light = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 shadow-sm">
        <Archive className="h-6 w-6 text-white" strokeWidth={2.4} />
      </div>
      <div>
        <div className={`text-3xl font-extrabold leading-none ${light ? 'text-white' : 'text-slate-950'}`}>DMS</div>
        <div className={`mt-1 text-[10px] font-medium ${light ? 'text-slate-300' : 'text-slate-500'}`}>
          Document Management System
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      <p className="text-xs font-extrabold uppercase tracking-wide text-blue-600">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-extrabold leading-tight text-slate-950 md:text-3xl">{title}</h2>
      <p className="mt-2 text-sm font-medium text-slate-600">{subtitle}</p>
    </div>
  )
}

function DashboardPreview() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_22px_60px_rgba(15,23,42,0.18)] sm:p-3">
      <div className="grid min-h-[430px] grid-cols-1 overflow-hidden rounded-xl bg-white md:grid-cols-[104px_1fr]">
        <aside className="hidden bg-[#061d35] px-3 py-5 text-white md:block">
          <div className="mb-7 flex items-center gap-2 text-lg font-extrabold">
            <Archive className="h-5 w-5 rounded bg-blue-500 p-0.5" />
            DMS
          </div>
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-[11px] font-bold ${
                    item.active ? 'bg-blue-600 text-white' : 'text-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </div>
              )
            })}
          </div>
        </aside>

        <main className="bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-950">Dashboard</h3>
            <div className="flex items-center gap-5">
              <div className="relative">
                <Bell className="h-5 w-5 text-slate-700" />
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200">
                  <User className="h-5 w-5 text-slate-600" />
                </div>
                <span className="text-xs font-bold text-slate-700">Tenant Admin</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500">{stat.label}</p>
                      <p className="mt-2 text-lg font-extrabold text-slate-950">{stat.value}</p>
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="mb-4 text-xs font-extrabold text-slate-950">Recent Documents</h4>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.name} className="flex items-center gap-3">
                    <span className={`rounded px-1.5 py-1 text-[9px] font-extrabold text-white ${doc.color}`}>{doc.type}</span>
                    <div>
                      <p className="text-[11px] font-extrabold text-slate-800">{doc.name}</p>
                      <p className="text-[10px] font-medium text-slate-500">{doc.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-6 flex items-center gap-1 text-xs font-extrabold text-blue-600">
                View all documents
                <span aria-hidden="true">-&gt;</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="text-xs font-extrabold text-slate-950">Storage Overview</h4>
                <div className="mt-5 flex items-center justify-between text-[10px] font-bold text-slate-600">
                  <span>68.4 GB used of 100 GB</span>
                  <span>68%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div className="h-2 w-[68%] rounded-full bg-blue-600" />
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="mb-4 text-xs font-extrabold text-slate-950">Recent Activity</h4>
                <div className="space-y-3">
                  {activities.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.title} className="flex items-start gap-3">
                        <Icon className={`mt-0.5 h-3.5 w-3.5 ${item.color}`} />
                        <div>
                          <p className="text-[10px] font-extrabold text-slate-800">{item.title}</p>
                          <p className="text-[9px] font-medium text-slate-500">{item.meta}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <button className="mt-4 flex items-center gap-1 text-xs font-extrabold text-blue-600">
                  View all activity
                  <span aria-hidden="true">-&gt;</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function LandingPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState({ loading: false, message: '', type: '' })

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setStatus({ loading: false, message: 'All fields are required.', type: 'error' });
      return;
    }
    setStatus({ loading: true, message: '', type: '' });
    try {
      const res = await fetch('http://localhost:3000/api/super-admin/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ loading: false, message: 'Thank you! Your message has been sent.', type: 'success' });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus({ loading: false, message: data.message || 'Something went wrong.', type: 'error' });
      }
    } catch (error) {
      setStatus({ loading: false, message: 'Failed to send message.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-9 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replaceAll(' ', '-')}`}
                className={`relative text-sm font-bold ${
                  link === 'Home' ? 'text-blue-600 after:absolute after:-bottom-5 after:left-0 after:h-0.5 after:w-full after:bg-blue-600' : 'text-slate-700'
                }`}
              >
                {link}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-5 md:flex">
            <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700">
              <Sun className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => window.location.href = '/login'}
              className="rounded-md border border-slate-200 px-8 py-3 text-sm font-extrabold text-blue-600 shadow-sm"
            >
              Login
            </button>
            <button className="rounded-md bg-blue-600 px-8 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-200">
              Get Started
            </button>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 md:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main>
        <section id="home" className="bg-gradient-to-br from-white via-slate-50 to-blue-50">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.25fr] lg:px-8 lg:py-16">
            <div className="relative">
              <div className="mb-6 inline-flex rounded-full bg-blue-100 px-4 py-1.5 text-xs font-extrabold text-blue-600">
                Smart. Secure. Simple.
              </div>
              <h1 className="max-w-xl text-4xl font-extrabold leading-[1.08] text-slate-950 sm:text-5xl lg:text-6xl">
                All Your Documents. Organized, Secure & <span className="text-blue-600">Accessible Anytime.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base font-medium leading-8 text-slate-600">
                DMS helps organizations store, manage, track and secure their documents in a centralized system. Save time,
                reduce paperwork and boost productivity.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button className="flex items-center justify-center gap-3 rounded-md bg-blue-600 px-8 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-200">
                  Get Started
                  <span aria-hidden="true">-&gt;</span>
                </button>
                <button className="flex items-center justify-center gap-3 rounded-md border border-slate-200 bg-white px-8 py-4 text-sm font-extrabold text-slate-900 shadow-sm">
                  Request Demo
                  <Calendar className="h-4 w-4 text-slate-600" />
                </button>
              </div>

              <div className="mt-10 flex items-center gap-2 text-sm font-medium text-slate-600">
                <Shield className="h-5 w-5 text-blue-600" />
                Trusted by organizations of all sizes
              </div>
              <div className="mt-8 grid max-w-xl grid-cols-1 gap-x-8 gap-y-5 text-slate-500 sm:grid-cols-2 lg:grid-cols-4">
                {['ACME', 'NextGen', 'TechCorp', 'Innova'].map((brand) => (
                  <div key={brand} className="flex items-center gap-2">
                    <div className="h-7 w-7 rotate-45 rounded border-4 border-slate-500/80" />
                    <div>
                      <p className="text-lg font-extrabold leading-none tracking-[0.15em]">{brand}</p>
                      <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.35em]">Industries</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DashboardPreview />
          </div>
        </section>

        <section id="features" className="px-4 py-9 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Features"
              title="Powerful Features for Smart Document Management"
              subtitle="Everything you need to manage your documents efficiently and securely."
            />
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.title} className="rounded-lg border border-slate-200 bg-white px-6 py-7 text-center shadow-sm">
                    <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${feature.bg}`}>
                      <Icon className={`h-9 w-9 ${feature.color}`} strokeWidth={2.2} />
                    </div>
                    <h3 className="mt-5 text-base font-extrabold text-slate-950">{feature.title}</h3>
                    <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{feature.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="benefits" className="bg-gradient-to-r from-slate-50 via-white to-blue-50 px-4 py-9 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Benefits"
              title="Why Organizations Choose DMS"
              subtitle="DMS helps businesses of all sizes improve efficiency, security and collaboration."
            />
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
              {benefits.map((benefit) => {
                const Icon = benefit.icon
                return (
                  <div
                    key={benefit.title}
                    className="rounded-xl border border-slate-200 bg-white/70 px-6 py-8 text-center shadow-sm"
                  >
                    <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${benefit.bg}`}>
                      <Icon className={`h-9 w-9 ${benefit.color}`} strokeWidth={2.2} />
                    </div>
                    <h3 className="mt-5 text-base font-extrabold text-slate-950">{benefit.title}</h3>
                    <p className="mt-3 text-sm font-medium leading-6 text-slate-700">{benefit.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <SectionTitle
              eyebrow="How It Works"
              title="Simple Steps to Manage Documents Smarter"
              subtitle=""
            />
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {steps.map((step) => {
                const Icon = step.icon
                return (
                  <div key={step.title} className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                      <Icon className="h-9 w-9 text-blue-600" />
                    </div>
                    <h3 className="mt-5 text-base font-extrabold text-slate-950">{step.title}</h3>
                    <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{step.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="contact" className="bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[0.8fr_1.4fr]">
            <div>
              <p className="text-xs font-extrabold uppercase text-blue-600">Contact Us</p>
              <h2 className="mt-4 text-3xl font-extrabold text-slate-950">Get in Touch</h2>
              <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-slate-600">
                Have questions or want to learn more about DMS? We're here to help.
              </p>
              <div className="mt-6 space-y-4">
                {[
                  { icon: Mail, title: 'Email', value: 'info@dms.com' },
                  { icon: Phone, title: 'Phone', value: '+1 (555) 123-4567' },
                  { icon: MapPin, title: 'Address', value: '123 Business Ave, Suite 100, New York, NY 10001, USA' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.title} className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <Icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">{item.title}</p>
                        <p className="text-sm font-bold leading-5 text-slate-700">{item.value}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-11 rounded-md border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-blue-500" placeholder="Your Name" />
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-11 rounded-md border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-blue-500" placeholder="Your Email" />
              </div>
              <input required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="mt-4 h-11 w-full rounded-md border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-blue-500" placeholder="Subject" />
              <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="mt-4 h-28 w-full resize-none rounded-md border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500" placeholder="Your Message" />
              
              {status.message && (
                <div className={`mt-4 p-3 rounded-md text-sm font-semibold ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {status.message}
                </div>
              )}
              
              <button disabled={status.loading} type="submit" className="mt-3 flex w-full items-center justify-center gap-3 rounded-md bg-blue-600 px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-200 sm:w-auto disabled:opacity-50">
                {status.loading ? 'Sending...' : 'Send Message'}
                {!status.loading && <Send className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-[#031b32] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-2 xl:grid-cols-[1.5fr_0.7fr_1fr_1fr_1.7fr] lg:px-8">
          <div>
            <Logo light />
            <p className="mt-6 max-w-xs text-sm font-medium leading-7 text-slate-300">
              DMS is a secure and intelligent document management solution designed to help organizations store, manage
              and protect their important data.
            </p>
            <div className="mt-6 flex gap-4">
              {['f', 'x', 'in', 'yt'].map((label) => (
                <button key={label} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-extrabold text-white">
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-base font-extrabold">Quick Links</h3>
            {navLinks.map((link) => (
              <a key={link} className="mb-3 block text-sm font-medium text-slate-300" href={`#${link.toLowerCase().replaceAll(' ', '-')}`}>
                {link}
              </a>
            ))}
          </div>

          <div>
            <h3 className="mb-4 text-base font-extrabold">Solutions</h3>
            {['Document Storage', 'Access Control', 'Workflow Management', 'Audit Trails', 'Backup & Recovery', 'Integrations'].map((link) => (
              <a key={link} className="mb-3 block text-sm font-medium text-slate-300" href="#features">
                {link}
              </a>
            ))}
          </div>

          <div>
            <h3 className="mb-4 text-base font-extrabold">Resources</h3>
            {['Blog', 'Help Center', 'Documentation', 'FAQs', 'Privacy Policy', 'Terms & Conditions'].map((link) => (
              <a key={link} className="mb-3 block text-sm font-medium text-slate-300" href="#contact">
                {link}
              </a>
            ))}
          </div>

          <div>
            <h3 className="mb-4 text-base font-extrabold">Newsletter</h3>
            <p className="mb-6 max-w-sm text-sm font-medium leading-6 text-slate-300">
              Subscribe to our newsletter for the latest updates and news.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input className="h-11 min-w-0 flex-1 rounded-md border-0 bg-white px-4 text-sm font-semibold text-slate-900 outline-none" placeholder="Enter your email" />
              <button className="rounded-md bg-blue-600 px-6 py-3 text-sm font-extrabold text-white">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-sm font-medium text-slate-300">
          (c) 2024 DMS. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
