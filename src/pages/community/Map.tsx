// MapPage.jsx
// CleanCal — Map page (Community + Admin) built with React + Tailwind
// - Designed to fit CleanCal design system in README
// - Uses react-leaflet + leaflet for the interactive map (OpenStreetMap tiles; no API key required)
// - AI bits (EcoBot) and Supabase hooks are placeholders (see TODOs)
//
// Install (recommended):
// npm install react-leaflet leaflet lucide-react
// Add Leaflet CSS to your index.css or index.html:
// import 'leaflet/dist/leaflet.css';
//
// Tailwind & fonts: ensure tailwind.config.js defines the palette & font families from README.
// Example tailwind.config.js additions (brief):
// theme: { extend: { colors: { primary: '#16A34A', secondary: '#2563EB', accent: '#FACC15' }, fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'], heading: ['Outfit', 'Inter'] } } }
//
// Integration notes:
// - Replace mockReports with live data from Supabase (subscribe to real-time updates).
// - Hook updateReportStatus(reportId, status) to your Admin verification API (Supabase RPC or updates).
// - Hook EcoBot chat to Google Gemini API in the EcoBot panel.

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import L from 'leaflet';
import { CheckCircle, XCircle, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

interface Report {
  id: string;
  title: string;
  lat: number;
  lng: number;
  status: 'pending' | 'approved' | 'resolved' | 'rejected';
  photo: string | null;
  description: string;
  createdAt: string;
  reporter: {
    name: string;
    phone: string | null;
  };
}

interface CurrentUser {
  role: 'community' | 'admin';
}




// Fix Leaflet default icon issue in many bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Mock data (replace with Supabase call)
const mockReports: Report[] = [
  {
    id: 'r_01',
    title: 'Overflowing plastic dump',
    lat: 4.9541,
    lng: 8.3240,
    status: 'pending', // pending | approved | resolved | rejected
    photo: null,
    description: 'Heap of mixed plastics near market entrance',
    createdAt: '2025-10-25T09:34:00Z',
    reporter: { name: 'Ada', phone: null },
  },
  {
    id: 'r_02',
    title: 'Organic waste — smells',
    lat: 4.9580,
    lng: 8.3200,
    status: 'approved',
    photo: null,
    description: 'Food waste beside drain. Attracting pests.',
    createdAt: '2025-10-26T12:20:00Z',
    reporter: { name: 'Chinedu', phone: null },
  },
];
export default function MapPage({ currentUser = { role: 'community' } }: { currentUser?: CurrentUser }) {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
//   const [showEcoBotPanel, setShowEcoBotPanel] = useState(false);

  useEffect(() => {
    // TODO: replace with Supabase subscription to 'reports' table
    // supabase.from('reports').on('*', payload => update state)
  }, []);

  const center = useMemo<LatLngTuple>(() => [4.9572, 8.3475], []); // Calabar-ish center

  function filterVisibleReports(): Report[] {
    // Community feed should show approved + resolved only on feed/map unless user is admin
    if (currentUser?.role === 'admin') return reports;
    return reports.filter((r) => r.status === 'approved' || r.status === 'resolved');
  }

  async function updateReportStatus(id: string, status: Report['status']) {
    // TODO: wire this to Supabase update
    // await supabase.from('reports').update({ status }).eq('id', id)
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    // show toast via your Toaster (assumes useToast available in your codebase)
    // useToast().success(`Report ${status}`)
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-800 font-sans">
      <main className="container mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading">CleanCal Map</h1>
            <p className="text-sm text-slate-600">Community waste reporting and verification — Calabar</p>
          </div>
          <div className="flex items-center gap-3">
            {/* <button
              onClick={() => setShowEcoBotPanel((s) => !s)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-white shadow-sm hover:shadow-md"
            >
              <MessageSquare size={16} /> EcoBot
            </button> */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setShowAdminPanel((s) => !s)}
                className="px-4 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:shadow-md"
              >
                Admin
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <section className="col-span-1 md:col-span-8 rounded-2xl overflow-hidden shadow-sm">
            <MapContainer center={center} zoom={13} className="h-[60vh] md:h-[70vh] w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {filterVisibleReports().map((r) => (
                <Marker
                  key={r.id}
                  position={[r.lat, r.lng]}
                  eventHandlers={{ click: () => setSelectedReport(r) }}
                >
                  <Popup>
                    <div className="max-w-xs">
                      <h3 className="font-heading text-lg">{r.title}</h3>
                      <p className="text-sm text-slate-700">{r.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100">{r.status}</span>
                      </div>
                      {r.status !== 'pending' && (
                        <div className="mt-3 text-xs text-slate-600 italic">EcoBot Insight: Compost organic waste nearby.</div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Floating Chat/AI Button */}
            {/* <EcoBotFloatButton onOpen={() => setShowEcoBotPanel(true)} /> */}
          </section>

          <aside className="col-span-1 md:col-span-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="text-lg font-heading">Report Feed</h2>
              <p className="text-sm text-slate-600 mb-3">Showing approved & resolved reports (community view)</p>

              <div className="space-y-3 max-h-[60vh] overflow-auto pr-2">
                {filterVisibleReports().length === 0 && (
                  <div className="text-sm text-slate-500">No visible reports yet. Create the first one!</div>
                )}

                {filterVisibleReports().map((r) => (
                  <ReportCard
                    key={r.id}
                    report={r}
                    onView={() => {
                      setSelectedReport(r);
                      // center map? Could use leaflet map instance via ref
                    }}
                    isAdmin={currentUser?.role === 'admin'}
                    onApprove={() => updateReportStatus(r.id, 'approved')}
                    onReject={() => updateReportStatus(r.id, 'rejected')}
                    onResolve={() => updateReportStatus(r.id, 'resolved')}
                  />
                ))}
              </div>
            </div>

            {/* Quick KPIs */}
            <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="font-heading text-sm">Quick KPIs</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50">
                  <div className="text-xs text-slate-500">Active Reports</div>
                  <div className="text-xl font-bold">{reports.filter(r => r.status === 'approved' || r.status === 'pending').length}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50">
                  <div className="text-xs text-slate-500">Resolved</div>
                  <div className="text-xl font-bold">{reports.filter(r => r.status === 'resolved').length}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Admin side panel */}
        {showAdminPanel && currentUser?.role === 'admin' && (
          <AdminPanel
            reports={reports.filter((r) => r.status === 'pending')}
            onClose={() => setShowAdminPanel(false)}
            onApprove={(id) => updateReportStatus(id, 'approved')}
            onReject={(id) => updateReportStatus(id, 'rejected')}
          />
        )}

        {/* EcoBot side panel */}
        {/* (
          <div className="fixed right-6 bottom-6 w-96 rounded-2xl bg-white shadow-md p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white">E</div>
                <div>
                  <div className="text-sm font-heading">EcoBot</div>
                  <div className="text-xs text-slate-500">AI assistant — suggestions & insights</div>
                </div>
              </div>
              <button className="text-slate-500" onClick={() => setShowEcoBotPanel(false)}>Close</button>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-slate-700">Ask EcoBot for waste-sorting tips, nearby recycling centers, or suggestion templates for admins.</div>
              <textarea className="w-full rounded-2xl border p-3" rows={3} placeholder="Ask EcoBot... (placeholder, Gemini integration TODO)" />
              <div className="flex gap-2">
                <button className="flex-1 rounded-2xl bg-primary text-white px-4 py-2">Send</button>
                <button className="rounded-2xl border px-4 py-2">Sample Tips</button>
              </div>
            </div>
          </div>
        ) */}
        {/* Selected report quick view */}
        {selectedReport && (
          <div className="fixed left-1/2 md:left-6 transform -translate-x-1/2 md:translate-x-0 bottom-6 w-11/12 md:w-80 rounded-2xl bg-white p-4 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-heading">{selectedReport.title}</h4>
                <p className="text-xs text-slate-500">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                <p className="text-sm text-slate-700 mt-2">{selectedReport.description}</p>
                <div className="mt-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${badgeClass(selectedReport.status)}`}>{selectedReport.status}</span>
                </div>
              </div>
              <button onClick={() => setSelectedReport(null)} className="ml-4 text-slate-500">Close</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

interface ReportCardProps {
  report: Report;
  onView: () => void;
  isAdmin: boolean;
  onApprove: () => void;
  onReject: () => void;
  onResolve: () => void;
}

function ReportCard({ report, onView, isAdmin, onApprove, onReject, onResolve }: ReportCardProps) {
  return (
    <article className="rounded-2xl border p-3 bg-white shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
          <MapPin size={18} />
        </div>
        <div className="flex-1">
          <h4 className="font-heading text-sm">{report.title}</h4>
          <p className="text-xs text-slate-500">{new Date(report.createdAt).toLocaleString()}</p>
          <p className="text-sm text-slate-700 mt-2">{report.description}</p>

          <div className="mt-3 flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${badgeClass(report.status)}`}>{report.status}</span>
            <button onClick={onView} className="text-xs underline">View</button>
            {isAdmin && (
              <div className="ml-auto flex items-center gap-2">
                <button onClick={onApprove} title="Approve" className="p-2 rounded-2xl bg-green-50 text-green-700"><CheckCircle size={16} /></button>
                <button onClick={onReject} title="Reject" className="p-2 rounded-2xl bg-red-50 text-red-700"><XCircle size={16} /></button>
                <button onClick={onResolve} title="Mark resolved" className="p-2 rounded-2xl bg-slate-50 text-slate-700">Done</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function badgeClass(status: Report['status']): string {
  switch (status) {
    case 'approved':
      return 'bg-green-50 text-green-700';
    case 'resolved':
      return 'bg-slate-50 text-slate-600';
    case 'pending':
      return 'bg-yellow-50 text-yellow-700';
    case 'rejected':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-slate-50 text-slate-600';
  }
}

interface AdminPanelProps {
  reports: Report[];
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function AdminPanel({ reports, onClose, onApprove, onReject }: AdminPanelProps) {
  return (
    <div className="fixed top-20 right-6 w-[420px] rounded-2xl bg-white shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading">Verification Queue</h3>
        <button onClick={onClose} className="text-slate-500">Close</button>
      </div>

      {reports.length === 0 && <div className="text-sm text-slate-500">No pending reports.</div>}

      <div className="space-y-3 max-h-[60vh] overflow-auto">
        {reports.map((r) => (
          <div key={r.id} className="p-3 rounded-2xl border bg-slate-50">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-heading">{r.title}</div>
                    <div className="text-xs text-slate-500">{r.description}</div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button onClick={() => onApprove(r.id)} className="px-3 py-1 rounded-2xl bg-primary text-white">Approve</button>
                  <button onClick={() => onReject(r.id)} className="px-3 py-1 rounded-2xl border">Reject</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// interface EcoBotFloatButtonProps {
//   onOpen: () => void;
// }

// function EcoBotFloatButton(props: EcoBotFloatButtonProps) {
//   return (
//     <button
//       onClick={props.onOpen}
//       aria-label="Open EcoBot"
//       className="fixed right-6 bottom-24 w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:shadow-xl"
//     >
//       <MessageSquare size={20} />
//     </button>
//   );
// }
