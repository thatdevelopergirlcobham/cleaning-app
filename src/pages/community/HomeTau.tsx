import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  MapIcon,
  CalendarIcon,
  UserCircleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import ReportModal from "../../components/community/ReportModal";
import { useAuth } from "../../hooks/useAuth";
import { useUserReports } from "../../hooks/useUserReports";
import { SUPABASE_URL, restHeaders } from "../../api/supabaseClient";
import { reverseGeocode } from "../../utils/geocoding";

import type { Report, ReportStatus, ReportSeverity } from "../../types/report";

interface FetchError extends Error {
  status?: number;
  statusText?: string;
}


const formatDate = (dateStr: string) => {
  try {
    return format(new Date(dateStr), "d MMMM, h:mm a");
  } catch {
    return dateStr;
  }
};

const getStatusColor = (status: Report["status"]) => {
  switch (status) {
    case "resolved":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const StatusIcon = ({ status }: { status: ReportStatus }) => {
  switch (status) {
    case "resolved":
      return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
    case "pending":
      return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
    default:
      return null;
  }
};

const HomeTau: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const { user } = useAuth();
  const { createReport } = useUserReports(false);
  const [reloadTick, setReloadTick] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  /** 🧭 Converts coordinates to text address */
  const processLocation = useCallback(async (report: Report): Promise<Report> => {
    if (!report.location || typeof report.location === "string") {
      return { ...report, locationText: report.location || "No location" };
    }

    try {
      const { lat, lng } = report.location;
      const address = await reverseGeocode({ lat, lng });
      return { ...report, locationText: address };
    } catch {
      return { ...report, locationText: "Location unavailable" };
    }
  }, []);

  /** 🔄 Fetch all reports from Supabase */
  const fetchReports = useCallback(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/reports?select=*`, {
          headers: restHeaders(),
        });

        if (!res.ok) {
          const text = await res.text();
          const err = new Error(`Fetch failed: ${res.status} ${text}`) as FetchError;
          err.status = res.status;
          err.statusText = res.statusText;
          throw err;
        }

        const data = await res.json();
        const reportsWithLocation = await Promise.all(
          (Array.isArray(data) ? data : []).map(processLocation)
        );

        setReports(reportsWithLocation);
      } catch (err) {
        console.error("Failed to load reports:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
  }, [processLocation]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports, reloadTick]);

  /** 🔍 Apply filters, search, and sorting */
  useEffect(() => {
    let result = [...reports];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(term) ||
          r.description.toLowerCase().includes(term) ||
          r.locationText?.toLowerCase().includes(term) ||
          r.type?.toLowerCase().includes(term) ||
          r.category?.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter) result = result.filter((r) => r.status === statusFilter);

    // Sorting
    switch (sortBy) {
      case "oldest":
        result.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "status":
        result.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
        break;
      case "severity": {
        const severityOrder: Record<ReportSeverity, number> = { 
          high: 0, 
          medium: 1, 
          low: 2 
        };
        result.sort((a, b) => {
          const aOrder = a.severity && a.severity in severityOrder ? severityOrder[a.severity] : 3;
          const bOrder = b.severity && b.severity in severityOrder ? severityOrder[b.severity] : 3;
          return aOrder - bOrder;
        });
        break;
      }
      default:
        result.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    setFilteredReports(result);
  }, [reports, searchTerm, statusFilter, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔰 Hero Section */}
      <div className="bg-[#0d542b] text-white py-16 text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Keep Calabar Clean</h1>
        <p className="text-lg max-w-2xl mx-auto mb-8">
          Help maintain the beauty of Calabar! Report waste issues, pollution spots,
          or environmental concerns in your community. Together, we can keep our city
          clean, green, and pristine.
        </p>
        <button
          onClick={() => setShowReportModal(true)}
          className="bg-white text-[#0d542b] font-semibold py-3 px-8 rounded-lg shadow hover:bg-gray-100 transition"
        >
          Report Waste Issue
        </button>
      </div>

      {/* 🧾 Reports Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <h2 className="text-2xl font-bold text-gray-800">Recent Waste Issues</h2>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0 items-stretch sm:items-center">
            <button
              onClick={() => setReloadTick(t => t + 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
              title="Refresh"
            >
              Refresh
            </button>
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="status">By Status</option>
              <option value="severity">By Severity</option>
            </select>
          </div>
        </div>

        {/* 🌀 Loading, Error, or Reports */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
            <p className="text-gray-600">Loading community reports...</p>
          </div>
        ) : error ? (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>{" "}
            <span>{error.message || "Failed to load reports"}</span>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 text-gray-400 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No reports found</h3>
            <p className="text-gray-500 mb-6">
              Be the first to report an issue in your community!
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={r.image_url || "https://via.placeholder.com/400x200?text=No+Image"}
                    alt={r.title}
                    className="w-full h-48 object-cover"
                    style={{ background: "#e5e7eb" }}
                  />
                  <div className="absolute top-4 right-4">
                    <div
                      className={`flex items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(
                        r.status
                      )}`}
                    >
                      <StatusIcon status={r.status} />
                      <span className="text-sm font-medium capitalize">{r.status}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-xl text-gray-800 mb-2">{r.title}</h3>
                  <p className="text-gray-700 mb-4 line-clamp-2">{r.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapIcon className="w-4 h-4 text-gray-400" />
                      <span>{r.locationText || "No location"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(r.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserCircleIcon className="w-6 h-6 text-gray-400" />
                      <span>
                        {r.is_anonymous ? "Anonymous User" : "Community Member"}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/reports/${r.id}`}
                    className="mt-4 flex items-center justify-center w-full gap-1 py-2 px-4 bg-green-800 text-white rounded-lg transition"
                  >
                    <span>View Details</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🧾 Report Modal */}
      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={async (data) => {
            if (!user) {
              window.location.href = "/auth?redirect=" + encodeURIComponent(window.location.pathname);
              return;
            }
            const loc = typeof data.location === "object" ? data.location : undefined;
            await createReport({
              title: data.title,
              description: data.description,
              category: data.category,
              priority: (data.priority as any) || "low",
              severity: "low",
              image_url: data.image_url,
              location: loc,
              is_anonymous: false,
            });
            setShowReportModal(false);
          }}
        />
      )}
    </div>
  );
};

export default HomeTau;
