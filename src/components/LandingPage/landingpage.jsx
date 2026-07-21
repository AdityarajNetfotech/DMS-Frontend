// import { useState } from 'react'
// import {
//   Activity,

//   Archive,
//   BarChart3,
//   Bell,
//   Calendar,
//   CheckCircle2,
//   ChevronDown,
//   Clock3,
//   Database,
//   FileText,
//   Folder,
//   FolderOpen,
//   Gauge,
//   LockKeyhole,
//   Mail,
//   MapPin,
//   Menu,
//   Phone,
//   Search,
//   Send,
//   Settings,
//   Shield,

//   Trash2,
//   UploadCloud,
//   User,
//   Users,
// } from 'lucide-react'

// import { API_BASE_URL } from "../../config/api"

// const navLinks = ['Home', 'Features', 'Benefits', 'How It Works', 'Contact']

// const stats = [
//   { label: 'Total Documents', value: '1,248', icon: FileText, bg: 'bg-blue-100', color: 'text-blue-600' },
//   { label: 'Total Folders', value: '156', icon: Folder, bg: 'bg-emerald-100', color: 'text-emerald-600' },
//   { label: 'Total Users', value: '42', icon: User, bg: 'bg-violet-100', color: 'text-violet-600' },
//   { label: 'Storage Used', value: '68.4 GB', icon: Gauge, bg: 'bg-orange-100', color: 'text-orange-500' },
// ]

// const documents = [
//   { type: 'PDF', color: 'bg-red-500', name: 'Project Proposal.pdf', meta: '2.4 MB - 2 hours ago' },
//   { type: 'DOCX', color: 'bg-blue-500', name: 'Employee Handbook.docx', meta: '1.8 MB - 5 hours ago' },
//   { type: 'XLSX', color: 'bg-green-500', name: 'Budget Report.xlsx', meta: '950 KB - 1 day ago' },
//   { type: 'PPTX', color: 'bg-orange-500', name: 'Product Roadmap.pptx', meta: '3.2 MB - 2 days ago' },
//   { type: 'TXT', color: 'bg-slate-500', name: 'Meeting Notes.txt', meta: '320 KB - 2 days ago' },
// ]

// const activities = [
//   { icon: FileText, color: 'text-red-500', title: 'Project Proposal.pdf uploaded', meta: 'by Rahul Sharma - 2 hours ago' },
//   { icon: FileText, color: 'text-blue-500', title: 'Employee Handbook.docx updated', meta: 'by Priya Patel - 5 hours ago' },
//   { icon: Folder, color: 'text-green-500', title: 'Budget Report.xlsx downloaded', meta: 'by Amit Kumar - 1 day ago' },
//   { icon: Trash2, color: 'text-slate-500', title: 'Meeting Notes.txt deleted', meta: 'by Neha Verma - 2 days ago' },
// ]

// const features = [
//   { icon: FolderOpen, title: 'Centralized Storage', text: 'Store all your documents in one secure location and access them anytime.', bg: 'bg-blue-100', color: 'text-blue-600' },
//   { icon: Search, title: 'Advanced Search', text: 'Find documents quickly with powerful search and filter options.', bg: 'bg-green-100', color: 'text-green-600' },
//   { icon: Shield, title: 'Role-Based Access', text: 'Control access with role-based permissions and ensure data security.', bg: 'bg-violet-100', color: 'text-violet-600' },
//   { icon: Clock3, title: 'Version Control', text: 'Track document versions and restore previous versions easily.', bg: 'bg-orange-100', color: 'text-orange-500' },
//   { icon: BarChart3, title: 'Activity Tracking', text: 'Monitor all document activities and user actions in real-time.', bg: 'bg-blue-100', color: 'text-blue-600' },
//   { icon: UploadCloud, title: 'Backup & Recovery', text: 'Automatic backups and easy recovery to prevent data loss.', bg: 'bg-pink-100', color: 'text-pink-500' },
// ]

// const benefits = [
//   { icon: Clock3, title: 'Save Time', text: 'Reduce time spent searching for documents and focus on what matters.', bg: 'bg-blue-100', color: 'text-blue-600' },
//   { icon: Shield, title: 'Enhanced Security', text: 'Keep your documents safe with advanced security and access controls.', bg: 'bg-green-100', color: 'text-green-600' },
//   { icon: Users, title: 'Better Collaboration', text: 'Share and collaborate on documents seamlessly across teams.', bg: 'bg-violet-100', color: 'text-violet-600' },
//   { icon: BarChart3, title: 'Increase Productivity', text: 'Streamline workflows and boost overall team productivity.', bg: 'bg-orange-100', color: 'text-orange-500' },
//   { icon: Database, title: 'Cost Effective', text: 'Go paperless and reduce operational costs significantly.', bg: 'bg-pink-100', color: 'text-pink-500' },
// ]

// const steps = [
//   { icon: UploadCloud, title: '1. Upload', text: 'Upload your documents securely to the system.' },
//   { icon: Folder, title: '2. Organize', text: 'Organize documents in folders and categories.' },
//   { icon: Users, title: '3. Share & Collaborate', text: 'Share with team and set permissions.' },
//   { icon: CheckCircle2, title: '4. Secure & Track', text: 'Track activities and keep your documents secure.' },
// ]

// const sidebarItems = [
//   { icon: Gauge, label: 'Dashboard', active: true },
//   { icon: FileText, label: 'Documents' },
//   { icon: Folder, label: 'Folders' },
//   { icon: Users, label: 'Users' },
//   { icon: LockKeyhole, label: 'Roles' },
//   { icon: Activity, label: 'Activity' },
//   { icon: Trash2, label: 'Trash' },
//   { icon: Settings, label: 'Settings' },
// ]

// function Logo({ light = false }) {
//   return (
//     <div className="flex items-center gap-3">
//       <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 shadow-sm">
//         <Archive className="h-6 w-6 text-white" strokeWidth={2.4} />
//       </div>
//       <div>
//         <div className={`text-3xl font-extrabold leading-none ${light ? 'text-white' : 'text-slate-950'}`}>DMS</div>
//         <div className={`mt-1 text-[10px] font-medium ${light ? 'text-slate-300' : 'text-slate-500'}`}>
//           Document Management System
//         </div>
//       </div>
//     </div>
//   )
// }

// function SectionTitle({ eyebrow, title, subtitle }) {
//   return (
//     <div className="mx-auto mb-8 max-w-3xl text-center">
//       <p className="text-xs font-extrabold uppercase tracking-wide text-blue-600">{eyebrow}</p>
//       <h2 className="mt-2 text-2xl font-extrabold leading-tight text-slate-950 md:text-3xl">{title}</h2>
//       <p className="mt-2 text-sm font-medium text-slate-600">{subtitle}</p>
//     </div>
//   )
// }

// function DashboardPreview() {
//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_22px_60px_rgba(15,23,42,0.18)] sm:p-3">
//       <div className="grid min-h-[430px] grid-cols-1 overflow-hidden rounded-xl bg-white md:grid-cols-[104px_1fr]">
//         <aside className="hidden bg-[#061d35] px-3 py-5 text-white md:block">
//           <div className="mb-7 flex items-center gap-2 text-lg font-extrabold">
//             <Archive className="h-5 w-5 rounded bg-blue-500 p-0.5" />
//             DMS
//           </div>
//           <div className="space-y-2">
//             {sidebarItems.map((item) => {
//               const Icon = item.icon
//               return (
//                 <div
//                   key={item.label}
//                   className={`flex items-center gap-2 rounded-md px-3 py-2 text-[11px] font-bold ${item.active ? 'bg-blue-600 text-white' : 'text-slate-200'
//                     }`}
//                 >
//                   <Icon className="h-3.5 w-3.5" />
//                   {item.label}
//                 </div>
//               )
//             })}
//           </div>
//         </aside>

//         <main className="bg-white p-5">
//           <div className="mb-5 flex items-center justify-between">
//             <h3 className="text-lg font-extrabold text-slate-950">Dashboard</h3>
//             <div className="flex items-center gap-5">
//               <div className="relative">
//                 <Bell className="h-5 w-5 text-slate-700" />
//                 <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200">
//                   <User className="h-5 w-5 text-slate-600" />
//                 </div>
//                 <span className="text-xs font-bold text-slate-700">Tenant Admin</span>
//                 <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
//             {stats.map((stat) => {
//               const Icon = stat.icon
//               return (
//                 <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
//                   <div className="flex items-center justify-between gap-3">
//                     <div>
//                       <p className="text-[10px] font-bold text-slate-500">{stat.label}</p>
//                       <p className="mt-2 text-lg font-extrabold text-slate-950">{stat.value}</p>
//                     </div>
//                     <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
//                       <Icon className={`h-5 w-5 ${stat.color}`} />
//                     </div>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>

//           <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1fr]">
//             <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
//               <h4 className="mb-4 text-xs font-extrabold text-slate-950">Recent Documents</h4>
//               <div className="space-y-3">
//                 {documents.map((doc) => (
//                   <div key={doc.name} className="flex items-center gap-3">
//                     <span className={`rounded px-1.5 py-1 text-[9px] font-extrabold text-white ${doc.color}`}>{doc.type}</span>
//                     <div>
//                       <p className="text-[11px] font-extrabold text-slate-800">{doc.name}</p>
//                       <p className="text-[10px] font-medium text-slate-500">{doc.meta}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <button className="mt-6 flex items-center gap-1 text-xs font-extrabold text-blue-600">
//                 View all documents
//                 <span aria-hidden="true">-&gt;</span>
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
//                 <h4 className="text-xs font-extrabold text-slate-950">Storage Overview</h4>
//                 <div className="mt-5 flex items-center justify-between text-[10px] font-bold text-slate-600">
//                   <span>68.4 GB used of 100 GB</span>
//                   <span>68%</span>
//                 </div>
//                 <div className="mt-3 h-2 rounded-full bg-slate-100">
//                   <div className="h-2 w-[68%] rounded-full bg-blue-600" />
//                 </div>
//               </div>

//               <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
//                 <h4 className="mb-4 text-xs font-extrabold text-slate-950">Recent Activity</h4>
//                 <div className="space-y-3">
//                   {activities.map((item) => {
//                     const Icon = item.icon
//                     return (
//                       <div key={item.title} className="flex items-start gap-3">
//                         <Icon className={`mt-0.5 h-3.5 w-3.5 ${item.color}`} />
//                         <div>
//                           <p className="text-[10px] font-extrabold text-slate-800">{item.title}</p>
//                           <p className="text-[9px] font-medium text-slate-500">{item.meta}</p>
//                         </div>
//                       </div>
//                     )
//                   })}
//                 </div>
//                 <button className="mt-4 flex items-center gap-1 text-xs font-extrabold text-blue-600">
//                   View all activity
//                   <span aria-hidden="true">-&gt;</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   )
// }

// function LandingPage() {
//   const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
//   const [status, setStatus] = useState({ loading: false, message: '', type: 'success' })


//   const [activeSection, setActiveSection] = useState('home')

//   const handleSubmit = async (e) => {


//     e.preventDefault();
//     if (!formData.name || !formData.email || !formData.subject || !formData.message) {
//       setStatus({ loading: false, message: 'All fields are required.', type: 'error' });
//       return;
//     }
//     setStatus({ loading: true, message: '', type: '' });
//     try {
//       const res = await fetch(`${API_BASE_URL}/api/super-admin/enquiry`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });
//       console.log(res)
//       const data = await res.json();
//       if (data.success) {
//         setStatus({ loading: false, message: 'Thank you! Your message has been sent.', type: 'success' });
//         setFormData({ name: '', email: '', subject: '', message: '' });
//       } else {
//         setStatus({ loading: false, message: data.message || 'Something went wrong.', type: 'error' });
//       }
//     } catch (error) {
//       setStatus({ loading: false, message: 'Failed to send message.', type: 'error' });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white font-sans text-slate-900">
//       <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
//         <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
//           <Logo />
//           <nav className="hidden items-center gap-9 lg:flex">
//             {navLinks.map((link) => {
//               const sectionId = link.toLowerCase().replaceAll(' ', '-');
//               const isActive = activeSection === sectionId;
//               return (
//                 <a
//                   key={link}
//                   href={`#${sectionId}`}
//                   onClick={(e) => {
//                     e.preventDefault();
//                     setActiveSection(sectionId);
//                     document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
//                   }}
//                   className={`relative text-sm font-bold transition-colors duration-200
//                     ${isActive ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'}
//                     after:absolute after:-bottom-5 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-blue-600 after:transition-transform after:duration-200
//                     ${isActive ? 'after:scale-x-100' : 'hover:after:scale-x-100'}
//                   `}
//                 >
//                   {link}
//                 </a>
//               );
//             })}
//           </nav>

//           <div className="hidden items-center gap-5 md:flex">
//             <button
//               type="button"
//               onClick={() => window.location.href = '/superadminlogin'}
//               className="rounded-md border border-slate-200 px-8 py-3 text-sm font-extrabold text-blue-600 shadow-sm"
//             >
//               Login
//             </button>
//             <button 
//               type="button"
//               onClick={() => window.location.href = '/superadminlogin'}
//               className="rounded-md bg-blue-600 px-8 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-200"
//             >
//               Get Started
//             </button>
//           </div>
//           <button className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 md:hidden">
//             <Menu className="h-5 w-5" />
//           </button>
//         </div>
//       </header>

//       <main>
//         <section id="home" className="bg-gradient-to-br from-white via-slate-50 to-blue-50">
//           <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.25fr] lg:px-8 lg:py-16">
//             <div className="relative">
//               <div className="mb-6 inline-flex rounded-full bg-blue-100 px-4 py-1.5 text-xs font-extrabold text-blue-600">
//                 Smart. Secure. Simple.
//               </div>
//               <h1 className="max-w-xl text-4xl font-extrabold leading-[1.08] text-slate-950 sm:text-5xl lg:text-6xl">
//                 All Your Documents. Organized, Secure & <span className="text-blue-600">Accessible Anytime.</span>
//               </h1>
//               <p className="mt-6 max-w-xl text-base font-medium leading-8 text-slate-600">
//                 DMS helps organizations store, manage, track and secure their documents in a centralized system. Save time,
//                 reduce paperwork and boost productivity.
//               </p>
//               <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
//                 <button 
//                   type="button"
//                   onClick={() => window.location.href = '/superadminlogin'}
//                   className="flex items-center justify-center gap-3 rounded-md bg-blue-600 px-8 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-200"
//                 >
//                   Get Started
//                   <span aria-hidden="true">-&gt;</span>
//                 </button>
//                 <button 
//                   type="button"
//                   onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
//                   className="flex items-center justify-center gap-3 rounded-md border border-slate-200 bg-white px-8 py-4 text-sm font-extrabold text-slate-900 shadow-sm"
//                 >
//                   Request Demo
//                   <Calendar className="h-4 w-4 text-slate-600" />
//                 </button>
//               </div>

//               <div className="mt-10 flex items-center gap-2 text-sm font-medium text-slate-600">
//                 <Shield className="h-5 w-5 text-blue-600" />
//                 Trusted by organizations of all sizes
//               </div>
//               <div className="mt-8 grid max-w-xl grid-cols-1 gap-x-8 gap-y-5 text-slate-500 sm:grid-cols-2 lg:grid-cols-4">
//                 {['ACME', 'NextGen', 'TechCorp', 'Innova'].map((brand) => (
//                   <div key={brand} className="flex items-center gap-2">
//                     <div className="h-7 w-7 rotate-45 rounded border-4 border-slate-500/80" />
//                     <div>
//                       <p className="text-lg font-extrabold leading-none tracking-[0.15em]">{brand}</p>
//                       <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.35em]">Industries</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <DashboardPreview />
//           </div>
//         </section>

//         <section id="features" className="px-4 py-9 sm:px-6 lg:px-8">
//           <div className="mx-auto max-w-7xl">
//             <SectionTitle
//               eyebrow="Features"
//               title="Powerful Features for Smart Document Management"
//               subtitle="Everything you need to manage your documents efficiently and securely."
//             />
//             <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
//               {features.map((feature) => {
//                 const Icon = feature.icon
//                 return (
//                   <div key={feature.title} className="rounded-lg border border-slate-200 bg-white px-6 py-7 text-center shadow-sm">
//                     <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${feature.bg}`}>
//                       <Icon className={`h-9 w-9 ${feature.color}`} strokeWidth={2.2} />
//                     </div>
//                     <h3 className="mt-5 text-base font-extrabold text-slate-950">{feature.title}</h3>
//                     <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{feature.text}</p>
//                   </div>
//                 )
//               })}
//             </div>
//           </div>
//         </section>

//         <section id="benefits" className="bg-gradient-to-r from-slate-50 via-white to-blue-50 px-4 py-9 sm:px-6 lg:px-8">
//           <div className="mx-auto max-w-7xl">
//             <SectionTitle
//               eyebrow="Benefits"
//               title="Why Organizations Choose DMS"
//               subtitle="DMS helps businesses of all sizes improve efficiency, security and collaboration."
//             />
//             <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
//               {benefits.map((benefit) => {
//                 const Icon = benefit.icon
//                 return (
//                   <div
//                     key={benefit.title}
//                     className="rounded-xl border border-slate-200 bg-white/70 px-6 py-8 text-center shadow-sm"
//                   >
//                     <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${benefit.bg}`}>
//                       <Icon className={`h-9 w-9 ${benefit.color}`} strokeWidth={2.2} />
//                     </div>
//                     <h3 className="mt-5 text-base font-extrabold text-slate-950">{benefit.title}</h3>
//                     <p className="mt-3 text-sm font-medium leading-6 text-slate-700">{benefit.text}</p>
//                   </div>
//                 )
//               })}
//             </div>
//           </div>
//         </section>

//         <section id="how-it-works" className="px-4 py-8 sm:px-6 lg:px-8">
//           <div className="mx-auto max-w-5xl">
//             <SectionTitle
//               eyebrow="How It Works"
//               title="Simple Steps to Manage Documents Smarter"
//               subtitle=""
//             />
//             <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
//               {steps.map((step) => {
//                 const Icon = step.icon
//                 return (
//                   <div key={step.title} className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
//                     <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
//                       <Icon className="h-9 w-9 text-blue-600" />
//                     </div>
//                     <h3 className="mt-5 text-base font-extrabold text-slate-950">{step.title}</h3>
//                     <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{step.text}</p>
//                   </div>
//                 )
//               })}
//             </div>
//           </div>
//         </section>

//         <section id="contact" className="bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8 sm:px-6 lg:px-8">
//           <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[0.8fr_1.4fr]">
//             <div>
//               <p className="text-xs font-extrabold uppercase text-blue-600">Contact Us</p>
//               <h2 className="mt-4 text-3xl font-extrabold text-slate-950">Get in Touch</h2>
//               <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-slate-600">
//                 Have questions or want to learn more about DMS? We're here to help.
//               </p>
//               <div className="mt-6 space-y-4">
//                 {[
//                   { icon: Mail, title: 'Email', value: 'sales@netfotech.in' },
//                   { icon: Phone, title: 'Phone', value: '88888887965' },
//                   { icon: MapPin, title: 'Address', value: 'World Trade Center Pune,India' },
//                 ].map((item) => {
//                   const Icon = item.icon
//                   return (
//                     <div key={item.title} className="flex gap-3">
//                       <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
//                         <Icon className="h-4 w-4 text-blue-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-extrabold text-slate-900">{item.title}</p>
//                         <p className="text-sm font-bold leading-5 text-slate-700">{item.value}</p>
//                       </div>
//                     </div>
//                   )
//                 })}
//               </div>
//             </div>

//             <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
//               <div className="grid gap-4 sm:grid-cols-2">
//                 <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-11 rounded-md border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-blue-500" placeholder="Your Name" />
//                 <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="h-11 rounded-md border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-blue-500" placeholder="Your Email" />
//               </div>
//               <input required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="mt-4 h-11 w-full rounded-md border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-blue-500" placeholder="Subject" />
//               <textarea required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} className="mt-4 h-28 w-full resize-none rounded-md border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500" placeholder="Your Message" />

//               {status.message && (
//                 <div className={`mt-4 p-3 rounded-md text-sm font-semibold ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
//                   {status.message}
//                 </div>
//               )}

//               <button disabled={status.loading} type="submit" className="mt-3 flex w-full items-center justify-center gap-3 rounded-md bg-blue-600 px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-200 sm:w-auto disabled:opacity-50">
//                 {status.loading ? 'Sending...' : 'Send Message'}
//                 {!status.loading && <Send className="h-4 w-4" />}
//               </button>
//             </form>
//           </div>
//         </section>
//       </main>

//       <footer className="bg-[#031b32] text-white">
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           {/* Main Footer Content */}
//           <div className="grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr]">
//             {/* Brand Column */}
//             <div>
//               <Logo light />
//               <p className="mt-6 max-w-xs text-sm font-medium leading-7 text-slate-400">
//                 A secure and intelligent document management solution designed to help organizations store, manage
//                 and protect their important data.
//               </p>
//             </div>

//             {/* Quick Links */}
//             <div>
//               <h3 className="mb-5 text-xs font-extrabold uppercase tracking-widest text-slate-400">Navigate</h3>
//               <div className="space-y-3">
//                 {navLinks.map((link) => (
//                   <a
//                     key={link}
//                     href={`#${link.toLowerCase().replaceAll(' ', '-')}`}
//                     className="block text-sm font-semibold text-slate-300 transition-colors hover:text-white"
//                   >
//                     {link}
//                   </a>
//                 ))}
//                 <a
//                   href="/superadminlogin"
//                   className="block text-sm font-semibold text-slate-300 transition-colors hover:text-white"
//                 >
//                   Login
//                 </a>
//               </div>
//             </div>

//             {/* Contact Info */}
//             <div>
//               <h3 className="mb-5 text-xs font-extrabold uppercase tracking-widest text-slate-400">Contact</h3>
//               <div className="space-y-4">
//                 <a href="mailto:sales@netfotech.in" className="flex items-start gap-3 group">
//                   <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 group-hover:bg-blue-600/20 transition-colors">
//                     <Mail className="h-4 w-4 text-blue-400" />
//                   </div>
//                   <div>
//                     <p className="text-xs font-bold text-slate-500">Email</p>
//                     <p className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">sales@netfotech.in</p>
//                   </div>
//                 </a>
//                 <a href="tel:+9188888887965" className="flex items-start gap-3 group">
//                   <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 group-hover:bg-blue-600/20 transition-colors">
//                     <Phone className="h-4 w-4 text-blue-400" />
//                   </div>
//                   <div>
//                     <p className="text-xs font-bold text-slate-500">Phone</p>
//                     <p className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">88888887965</p>
//                   </div>
//                 </a>
//                 <div className="flex items-start gap-3">
//                   <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
//                     <MapPin className="h-4 w-4 text-blue-400" />
//                   </div>
//                   <div>
//                     <p className="text-xs font-bold text-slate-500">Address</p>
//                     <p className="text-sm font-semibold text-slate-300">World Trade Center, Pune, India</p>
//                   </div>
//                 </div>
//               </div>
//             </div>


//           </div>

//           {/* Bottom Bar */}
//           <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
//             <p className="text-sm font-medium text-slate-500">
//               &copy; 2026 DMS. All rights reserved.
//             </p>
//             <div className="flex items-center gap-6">
//               <a href="#contact" className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-300">Privacy Policy</a>
//               <a href="#contact" className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-300">Terms of Service</a>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { API_BASE_URL } from "../../config/api";
import {
  FileText,
  Search,
  ShieldCheck,
  Users,
  GitBranch,
  Activity,
  DatabaseBackup,
  ArrowRight,
  UploadCloud,
  FolderTree,
  Share2,
  Lock,
  Clock,
  Sparkles,
  Wallet,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  DMS — Document Management System                                   */
/*  Futuristic white-theme homepage with a live Three.js 3D background */
/* ------------------------------------------------------------------ */

function Scene3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 18, 62);

    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      120
    );
    camera.position.set(0, 0, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0xffffff, 0);
    mount.appendChild(renderer.domElement);

    // gentle light for the few solid meshes (accent nodes)
    const ambient = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambient);
    const point1 = new THREE.PointLight(0x4b5efc, 1.0, 60);
    point1.position.set(-6, 5, 10);
    scene.add(point1);

    const tunnel = new THREE.Group();
    scene.add(tunnel);

    /* ---- concentric rings receding into the distance ---- */
    const RING_COUNT = 30;
    const RING_SPACING = 2.6;
    const TUNNEL_DEPTH = RING_COUNT * RING_SPACING;
    const NEAR_Z = 12; // reset threshold, near the camera
    const FAR_Z = NEAR_Z - TUNNEL_DEPTH;

    const ringColors = [0x4b5efc, 0x00d4ff, 0xb9c0ee];
    const rings = [];

    for (let i = 0; i < RING_COUNT; i++) {
      const radius = 7.5;
      const points = [];
      const segments = 48;
      for (let s = 0; s <= segments; s++) {
        const a = (s / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: ringColors[i % ringColors.length],
        transparent: true,
        opacity: i % 5 === 0 ? 0.55 : 0.22,
      });
      const ring = new THREE.LineLoop(geo, mat);
      ring.position.z = NEAR_Z - i * RING_SPACING;
      ring.userData = { baseOpacity: mat.opacity };
      rings.push(ring);
      tunnel.add(ring);
    }

    /* ---- long straight rails running the length of the tunnel ---- */
    const RAIL_COUNT = 18;
    const railPositions = [];
    for (let i = 0; i < RAIL_COUNT; i++) {
      const a = (i / RAIL_COUNT) * Math.PI * 2;
      const x = Math.cos(a) * 7.5;
      const y = Math.sin(a) * 7.5;
      railPositions.push(x, y, FAR_Z - 10, x, y, NEAR_Z + 4);
    }
    const railGeo = new THREE.BufferGeometry();
    railGeo.setAttribute("position", new THREE.Float32BufferAttribute(railPositions, 3));
    const railMat = new THREE.LineBasicMaterial({ color: 0xd7dbf3, transparent: true, opacity: 0.4 });
    const rails = new THREE.LineSegments(railGeo, railMat);
    tunnel.add(rails);

    /* ---- a few drifting document panes for brand flavor ---- */
    const paneGeo = new THREE.PlaneGeometry(1.3, 1.7);
    const docs = [];
    const DOC_COUNT = 16;
    for (let i = 0; i < DOC_COUNT; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: i % 4 === 0 ? 0xe7fbff : 0xffffff,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(paneGeo, mat);
      const a = Math.random() * Math.PI * 2;
      const r = 3 + Math.random() * 3.5;
      mesh.position.set(Math.cos(a) * r, Math.sin(a) * r, NEAR_Z - Math.random() * TUNNEL_DEPTH);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      const edges = new THREE.EdgesGeometry(paneGeo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0xaab1e6, transparent: true, opacity: 0.5 })
      );
      mesh.add(line);

      mesh.userData = { rotSpeed: (Math.random() - 0.5) * 0.01 };
      docs.push(mesh);
      tunnel.add(mesh);
    }

    /* ---- glowing vanishing point at the far end ---- */
    const coreGlowGeo = new THREE.SphereGeometry(0.5, 24, 24);
    const coreGlowMat = new THREE.MeshBasicMaterial({ color: 0x4b5efc, transparent: true, opacity: 0.5 });
    const coreGlow = new THREE.Mesh(coreGlowGeo, coreGlowMat);
    coreGlow.position.set(0, 0, FAR_Z - 4);
    scene.add(coreGlow);

    const mouse = { x: 0, y: 0 };
    const handleMouse = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", handleMouse);

    const SPEED = 9; // units per second, tunnel flying toward camera
    const clock = new THREE.Clock();
    let frameId;

    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();

      tunnel.rotation.z += 0.045 * dt;

      rings.forEach((ring, i) => {
        ring.position.z += SPEED * dt;
        if (ring.position.z > NEAR_Z) ring.position.z -= TUNNEL_DEPTH;
        // fade near the camera and fade in from the far fog
        const distFromNear = NEAR_Z - ring.position.z;
        const fadeNear = Math.min(distFromNear / 3, 1);
        ring.material.opacity = ring.userData.baseOpacity * fadeNear;
        ring.rotation.z = t * 0.1 + i * 0.05;
      });

      docs.forEach((m) => {
        m.position.z += SPEED * 0.6 * dt;
        if (m.position.z > NEAR_Z) m.position.z -= TUNNEL_DEPTH;
        m.rotation.x += m.userData.rotSpeed;
        m.rotation.y += m.userData.rotSpeed * 1.4;
      });

      coreGlow.scale.setScalar(1 + Math.sin(t * 1.6) * 0.15);

      camera.position.x += (mouse.x * 1.6 - camera.position.x) * 0.04;
      camera.position.y += (-mouse.y * 1.1 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, FAR_Z);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
      rings.forEach((r) => { r.geometry.dispose(); r.material.dispose(); });
      railGeo.dispose();
      railMat.dispose();
      paneGeo.dispose();
      docs.forEach((m) => m.material.dispose());
      coreGlowGeo.dispose();
      coreGlowMat.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Benefits", href: "#benefits" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

const LOGOS = ["ACME Industries", "NextGen Industries", "TechCorp Industries", "Innova Industries"];

const FEATURES = [
  {
    icon: FileText,
    title: "Centralized Storage",
    desc: "Store all your documents in one secure location and access them anytime.",
  },
  {
    icon: Search,
    title: "Advanced Search",
    desc: "Find documents quickly with powerful search and filter options.",
  },
  {
    icon: Lock,
    title: "Role-Based Access",
    desc: "Control access with role-based permissions and ensure data security.",
  },
  {
    icon: GitBranch,
    title: "Version Control",
    desc: "Track document versions and restore previous versions easily.",
  },
  {
    icon: Activity,
    title: "Activity Tracking",
    desc: "Monitor all document activities and user actions in real-time.",
  },
  {
    icon: DatabaseBackup,
    title: "Backup & Recovery",
    desc: "Automatic backups and easy recovery to prevent data loss.",
  },
];

const BENEFITS = [
  { icon: Clock, title: "Save Time", desc: "Reduce time spent searching for documents and focus on what matters." },
  { icon: ShieldCheck, title: "Enhanced Security", desc: "Keep your documents safe with advanced security and access controls." },
  { icon: Users, title: "Better Collaboration", desc: "Share and collaborate on documents seamlessly across teams." },
  { icon: Sparkles, title: "Increase Productivity", desc: "Streamline workflows and boost overall team productivity." },
  { icon: Wallet, title: "Cost Effective", desc: "Go paperless and reduce operational costs significantly." },
];

const STEPS = [
  { n: "01", icon: UploadCloud, title: "Upload", desc: "Upload your documents securely to the system." },
  { n: "02", icon: FolderTree, title: "Organize", desc: "Organize documents in folders and categories." },
  { n: "03", icon: Share2, title: "Share & Collaborate", desc: "Share with team and set permissions." },
  { n: "04", icon: ShieldCheck, title: "Secure & Track", desc: "Track activities and keep your documents secure." },
];

/* ------------------------------------------------------------------ */

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "Inquiry for DMS Project ", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, message: "", type: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Please enter your name.";
    if (!form.email.trim()) errs.email = "Please enter your email.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email address.";
    if (!form.message.trim()) errs.message = "Please add a short message.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus({ loading: true, message: "", type: "" });
    try {
      const res = await fetch(`${API_BASE_URL}/api/super-admin/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setForm({ name: "", email: "", subject: "Inquiry for DMS Project", message: "" });
        setStatus({ loading: false, message: "", type: "" });
      } else {
        setStatus({ loading: false, message: data.message || "Failed to send message.", type: "error" });
      }
    } catch (error) {
      setStatus({ loading: false, message: "Network error. Failed to send message.", type: "error" });
    }
  };

  if (submitted) {
    return (
      <div className="card rounded-2xl p-8 flex flex-col items-center text-center gap-3">
        <CheckCircle2 size={34} color="var(--accent)" />
        <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700 }}>Message sent</h3>
        <p style={{ color: "var(--muted)", fontSize: 14.5 }}>
          Thanks for reaching out — our team will get back to you shortly.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="btn-ghost rounded-lg px-5 py-2.5 mt-2"
          style={{ fontSize: 13.5, fontWeight: 500 }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card rounded-2xl p-8 flex flex-col gap-5">
      <div>
        <label className="font-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 0.5 }}>NAME</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your full name"
          className="w-full mt-1.5 rounded-lg px-4 py-3"
          style={{ border: `1px solid ${errors.name ? "#e35" : "var(--line)"}`, fontSize: 14, outline: "none", background: "rgba(255,255,255,0.7)" }}
        />
        {errors.name && <p style={{ color: "#e35", fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
      </div>

      <div>
        <label className="font-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 0.5 }}>EMAIL</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@company.com"
          className="w-full mt-1.5 rounded-lg px-4 py-3"
          style={{ border: `1px solid ${errors.email ? "#e35" : "var(--line)"}`, fontSize: 14, outline: "none", background: "rgba(255,255,255,0.7)" }}
        />
        {errors.email && <p style={{ color: "#e35", fontSize: 12, marginTop: 4 }}>{errors.email}</p>}
      </div>

      <div>
        <label className="font-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 0.5 }}>MESSAGE</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="How can we help?"
          rows={4}
          className="w-full mt-1.5 rounded-lg px-4 py-3"
          style={{ border: `1px solid ${errors.message ? "#e35" : "var(--line)"}`, fontSize: 14, outline: "none", resize: "vertical", background: "rgba(255,255,255,0.7)" }}
        />
        {errors.message && <p style={{ color: "#e35", fontSize: 12, marginTop: 4 }}>{errors.message}</p>}
      </div>

      {status.message && (
        <p style={{ color: status.type === "error" ? "#e35" : "var(--accent)", fontSize: 13, fontWeight: 500 }}>
          {status.message}
        </p>
      )}

      <button type="submit" disabled={status.loading} className="btn-primary rounded-lg px-6 py-3 flex items-center justify-center gap-2" style={{ fontSize: 14.5, fontWeight: 600 }}>
        {status.loading ? "Sending..." : "Send message"} <ArrowRight size={16} />
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ */

export default function DMSHomepage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (href) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif", color: "var(--ink)", background: "#ffffff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --ink: #0e1225;
          --muted: #5b6272;
          --line: #e4e8f1;
          --accent: #4b5efc;
          --accent-2: #00d4ff;
          --accent-soft: rgba(75,94,252,0.08);
        }

        * { box-sizing: border-box; }

        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }

        .grad-text {
          background: linear-gradient(100deg, #0e1225 20%, #4b5efc 55%, #00d4ff 85%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .glass {
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid var(--line);
        }

        .card {
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid var(--line);
          transition: transform .35s ease, box-shadow .35s ease, border-color .35s ease;
        }
        .card:hover {
          transform: translateY(-6px) perspective(600px) rotateX(2deg);
          box-shadow: 0 24px 60px -20px rgba(75,94,252,0.35);
          border-color: rgba(75,94,252,0.35);
        }

        .btn-primary {
          background: linear-gradient(100deg, var(--accent), var(--accent-2));
          color: #fff;
          box-shadow: 0 14px 34px -12px rgba(75,94,252,0.55);
          transition: transform .25s ease, box-shadow .25s ease;
          cursor: pointer;
          border: none;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 20px 44px -14px rgba(75,94,252,0.7); }

        .btn-ghost {
          border: 1px solid var(--line);
          background: rgba(255,255,255,0.6);
          transition: border-color .25s ease, transform .25s ease;
          cursor: pointer;
        }
        .btn-ghost:hover { border-color: var(--accent); transform: translateY(-2px); }

        .nav-link { color: var(--muted); transition: color .2s ease; position: relative; background: none; border: none; cursor: pointer; font-family: inherit; }
        .nav-link:hover { color: var(--ink); }

        .badge { animation: float-slow 6s ease-in-out infinite; }
        .badge.delay-1 { animation-delay: 1.2s; }
        .badge.delay-2 { animation-delay: 2.4s; }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(1.5deg); }
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }

        .logo-item { color: var(--muted); opacity: 0.7; transition: opacity .25s ease, color .25s ease; }
        .logo-item:hover { opacity: 1; color: var(--accent); }

        input:focus, textarea:focus { border-color: var(--accent) !important; }

        html { scroll-behavior: smooth; }
      `}</style>

      <Scene3D />

      {/* NAVBAR */}
      <header className="glass" style={{ position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }} className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center"
              style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
            >
              <FileText size={19} color="#fff" />
            </div>
            <div>
              <div className="font-display" style={{ fontWeight: 700, fontSize: 18, lineHeight: 1 }}>DMS</div>
              <div className="font-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 1 }}>
                DOCUMENT MANAGEMENT SYSTEM
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <button key={l.label} onClick={() => handleNavClick(l.href)} className="nav-link" style={{ fontSize: 14, fontWeight: 500 }}>
                {l.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => window.location.href = "/superadminlogin"} className="btn-ghost rounded-lg px-4 py-2" style={{ fontSize: 14, fontWeight: 500 }}>
              Sign in
            </button>
            <button onClick={() => window.location.href = "/superadminlogin"} className="btn-primary rounded-lg px-4 py-2 flex items-center gap-2" style={{ fontSize: 14, fontWeight: 600 }}>
              Get Started <ArrowRight size={15} />
            </button>
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden px-6 pb-5 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <button key={l.label} onClick={() => handleNavClick(l.href)} className="nav-link text-left" style={{ fontSize: 14 }}>
                {l.label}
              </button>
            ))}
            <button onClick={() => window.location.href = "/superadminlogin"} className="btn-primary rounded-lg px-4 py-2" style={{ fontSize: 14, fontWeight: 600 }}>
              Get Started
            </button>
          </div>
        )}
      </header>

      {/* HERO */}
      <section style={{ position: "relative", zIndex: 10 }} className="px-6 pt-20 pb-20">
        <div style={{ maxWidth: 1200, margin: "0 auto" }} className="flex flex-col items-center text-center">
          <div
            className="flex items-center gap-2 rounded-full px-4 py-1.5 mb-8"
            style={{ background: "var(--accent-soft)", border: "1px solid rgba(75,94,252,0.25)" }}
          >
            <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: 999, background: "var(--accent)", display: "inline-block" }} />
            <span className="font-mono" style={{ fontSize: 12, color: "var(--accent)" }}>
              CENTRALIZED · SECURE · SEARCHABLE
            </span>
          </div>

          <h1 className="font-display" style={{ fontSize: "clamp(2.3rem, 5.6vw, 4.2rem)", fontWeight: 700, lineHeight: 1.08, maxWidth: 900 }}>
            All Your Documents. <span className="grad-text">Organized, Secure &amp; Accessible Anytime.</span>
          </h1>

          <p style={{ maxWidth: 640, color: "var(--muted)", fontSize: 18, marginTop: 24, lineHeight: 1.65 }}>
            DMS helps organizations store, manage, track and secure their documents in a
            centralized system. Save time, reduce paperwork and boost productivity.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
            <button onClick={() => window.location.href = "/superadminlogin"} className="btn-primary rounded-xl px-7 py-3.5 flex items-center gap-2" style={{ fontSize: 15, fontWeight: 600 }}>
              Get Started <ArrowRight size={17} />
            </button>
            <button onClick={() => handleNavClick("#how-it-works")} className="btn-ghost rounded-xl px-7 py-3.5 flex items-center gap-2" style={{ fontSize: 15, fontWeight: 500 }}>
              <Sparkles size={16} color="var(--accent)" /> See how it works
            </button>
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section style={{ position: "relative", zIndex: 10 }} className="px-6 pb-24">
        <div style={{ maxWidth: 1000, margin: "0 auto" }} className="text-center">
          <div className="font-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 1.5, marginBottom: 20 }}>
            TRUSTED BY ORGANIZATIONS OF ALL SIZES
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {LOGOS.map((logo) => {
              const [first, second] = logo.split(" ");
              return (
                <div key={logo} className="logo-item font-display flex flex-col items-center leading-tight" style={{ fontWeight: 700, fontSize: 17 }}>
                  <span>{first}</span>
                  <span className="font-mono" style={{ fontSize: 10, fontWeight: 400, letterSpacing: 1 }}>{second?.toUpperCase()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ position: "relative", zIndex: 10 }} className="px-6 pb-28 scroll-mt-24">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="text-center mb-16">
            <div className="font-mono" style={{ fontSize: 12, color: "var(--accent)", letterSpacing: 1.5 }}>FEATURES</div>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 700, marginTop: 12 }}>
              Powerful Features for Smart Document Management
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 16, marginTop: 12, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
              Everything you need to manage your documents efficiently and securely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card rounded-2xl p-7">
                <div
                  className="flex items-center justify-center mb-5"
                  style={{ width: 44, height: 44, borderRadius: 12, background: "var(--accent-soft)" }}
                >
                  <f.icon size={20} color="var(--accent)" />
                </div>
                <h3 className="font-display" style={{ fontSize: 17, fontWeight: 600 }}>{f.title}</h3>
                <p style={{ color: "var(--muted)", fontSize: 14.5, marginTop: 8, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" style={{ position: "relative", zIndex: 10 }} className="px-6 pb-28 scroll-mt-24">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="text-center mb-16">
            <div className="font-mono" style={{ fontSize: 12, color: "var(--accent)", letterSpacing: 1.5 }}>BENEFITS</div>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 700, marginTop: 12 }}>
              Why Organizations Choose DMS
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 16, marginTop: 12, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
              DMS helps businesses of all sizes improve efficiency, security and collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="card rounded-2xl p-6 text-center flex flex-col items-center">
                <div
                  className="flex items-center justify-center mb-4"
                  style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
                >
                  <b.icon size={20} color="#fff" />
                </div>
                <h3 className="font-display" style={{ fontSize: 15.5, fontWeight: 600 }}>{b.title}</h3>
                <p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 8, lineHeight: 1.55 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ position: "relative", zIndex: 10 }} className="px-6 pb-28 scroll-mt-24">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="text-center mb-16">
            <div className="font-mono" style={{ fontSize: 12, color: "var(--accent)", letterSpacing: 1.5 }}>HOW IT WORKS</div>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 700, marginTop: 12 }}>
              Simple Steps to Manage Documents Smarter
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="card rounded-2xl p-7">
                <div className="font-mono" style={{ fontSize: 12, color: "var(--muted)" }}>{s.n}</div>
                <div
                  className="flex items-center justify-center my-5"
                  style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
                >
                  <s.icon size={20} color="#fff" />
                </div>
                <h3 className="font-display" style={{ fontSize: 17, fontWeight: 600 }}>{s.title}</h3>
                <p style={{ color: "var(--muted)", fontSize: 14.5, marginTop: 8, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ position: "relative", zIndex: 10 }} className="px-6 pb-24 scroll-mt-24">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="text-center mb-16">
            <div className="font-mono" style={{ fontSize: 12, color: "var(--accent)", letterSpacing: 1.5 }}>CONTACT US</div>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 700, marginTop: 12 }}>
              Get in Touch
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 16, marginTop: 12, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
              Have questions or want to learn more about DMS? We're here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-5">
              <div className="card rounded-2xl p-6 flex items-center gap-4">
                <div className="flex items-center justify-center" style={{ width: 42, height: 42, borderRadius: 12, background: "var(--accent-soft)" }}>
                  <Mail size={19} color="var(--accent)" />
                </div>
                <div>
                  <div className="font-mono" style={{ fontSize: 11, color: "var(--muted)" }}>EMAIL</div>
                  <a href="mailto:sales@netfotech.in" className="font-display" style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>
                    sales@netfotech.in
                  </a>
                </div>
              </div>

              <div className="card rounded-2xl p-6 flex items-center gap-4">
                <div className="flex items-center justify-center" style={{ width: 42, height: 42, borderRadius: 12, background: "var(--accent-soft)" }}>
                  <Phone size={19} color="var(--accent)" />
                </div>
                <div>
                  <div className="font-mono" style={{ fontSize: 11, color: "var(--muted)" }}>PHONE</div>
                  <a href="tel:+8888887965" className="font-display" style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>
                    +91 88888 87965
                  </a>
                </div>
              </div>

              <div className="card rounded-2xl p-6 flex items-center gap-4">
                <div className="flex items-center justify-center" style={{ width: 42, height: 42, borderRadius: 12, background: "var(--accent-soft)" }}>
                  <MapPin size={19} color="var(--accent)" />
                </div>
                <div>
                  <div className="font-mono" style={{ fontSize: 11, color: "var(--muted)" }}>ADDRESS</div>
                  <div className="font-display" style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>
                    World Trade Center, Pune, India
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: "relative", zIndex: 10 }} className="px-6 pb-24">
        <div
          className="rounded-3xl text-center px-8 py-16"
          style={{ maxWidth: 1100, margin: "0 auto", background: "linear-gradient(120deg, #0e1225, #1c2350 55%, #223 100%)" }}
        >
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: "#fff" }}>
            Go paperless. Stay in control.
          </h2>
          <p style={{ color: "#b7bce0", fontSize: 16, marginTop: 14, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
            Set up your first workspace in minutes — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-9">
            <button onClick={() => window.location.href = "/superadminlogin"} className="btn-primary rounded-xl px-7 py-3.5 flex items-center gap-2" style={{ fontSize: 15, fontWeight: 600 }}>
              Get Started <ArrowRight size={17} />
            </button>
            {/* <button
              onClick={() => window.location.href = "/superadminlogin"}
              className="rounded-xl px-7 py-3.5"
              style={{ fontSize: 15, fontWeight: 500, color: "#fff", border: "1px solid rgba(255,255,255,0.25)", background: "transparent", cursor: "pointer" }}
            >
              Talk to sales
            </button> */}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ position: "relative", zIndex: 10, borderTop: "1px solid var(--line)" }} className="px-6 py-10">
        <div style={{ maxWidth: 1200, margin: "0 auto" }} className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center"
              style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
            >
              <FileText size={13} color="#fff" />
            </div>
            <span className="font-display" style={{ fontWeight: 600, fontSize: 14 }}>DMS</span>
            <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)" }}>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Status", "Docs"].map((l) => (
              <a key={l} href="#" className="nav-link" style={{ fontSize: 13 }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}