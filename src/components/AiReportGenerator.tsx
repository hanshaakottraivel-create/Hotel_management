import React, { useState } from "react";
import { useHotel } from "../context/HotelContext";
import { AiGeneratedReport, ReportType, ReportActionItem } from "../types";
import {
  FileText,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Copy,
  Printer,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  Check,
  ShieldCheck,
  ChevronRight,
  Zap,
  Sliders,
  Calendar,
  Layers,
} from "lucide-react";

interface AiReportGeneratorProps {
  initialReportType?: ReportType;
  compact?: boolean;
}

export const AiReportGenerator: React.FC<AiReportGeneratorProps> = ({
  initialReportType = "executive-daily",
  compact = false,
}) => {
  const {
    rooms,
    bookings,
    guests,
    tasks,
    occupancyRate,
    adr,
    revPar,
    todayRevenue,
    showToast,
  } = useHotel();

  const [reportType, setReportType] = useState<ReportType>(initialReportType);
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month">("today");
  const [selectedFocus, setSelectedFocus] = useState<string[]>([
    "Dynamic Pricing",
    "Turnaround Velocity",
  ]);
  const [report, setReport] = useState<AiGeneratedReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"formatted" | "markdown">("formatted");

  const focusOptions = [
    "Dynamic Pricing",
    "Turnaround Velocity",
    "VIP Guest Care",
    "Direct Booking Margin",
    "Maintenance Assets",
  ];

  const toggleFocus = (option: string) => {
    setSelectedFocus((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const handleGenerateReport = async (overrideType?: ReportType) => {
    const activeType = overrideType || reportType;
    setIsLoading(true);
    setErrorMessage(null);

    // Prepare hotel operational context
    const occupiedRooms = rooms.filter((r) => r.status === "Occupied");
    const vacantDirtyRooms = rooms.filter((r) => r.status === "Vacant Dirty");
    const vacantCleanRooms = rooms.filter((r) => r.status === "Vacant Clean");
    const maintenanceRooms = rooms.filter((r) => r.status === "Maintenance");
    const todayArrivals = bookings.filter((b) => b.checkInDate === "2026-09-15");
    const todayDepartures = bookings.filter((b) => b.checkOutDate === "2026-09-15");
    const urgentTasks = tasks.filter((t) => t.status !== "Completed");

    const hotelContext = {
      occupancyRate,
      adr,
      revPar,
      todayRevenue,
      totalRooms: rooms.length,
      occupiedCount: occupiedRooms.length,
      vacantDirtyCount: vacantDirtyRooms.length,
      vacantCleanCount: vacantCleanRooms.length,
      maintenanceCount: maintenanceRooms.length,
      todayArrivalsCount: todayArrivals.length,
      todayDeparturesCount: todayDepartures.length,
      pendingTasksCount: urgentTasks.length,
      activeGuests: guests.length,
      sampleArrivals: todayArrivals.slice(0, 3).map((b) => ({
        guestName: b.guestName,
        roomNumber: b.roomNumber,
        roomType: b.roomType,
      })),
      sampleTasks: urgentTasks.slice(0, 3).map((t) => ({
        title: t.title,
        priority: t.priority,
        roomNumber: t.roomNumber,
      })),
    };

    try {
      const response = await fetch("/api/ai/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: activeType,
          timeframe,
          focusAreas: selectedFocus,
          hotelContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: AiGeneratedReport = await response.json();
      setReport(data);
      showToast(`Report generated: ${data.title}`, "success");
    } catch (err: any) {
      console.error("Report generation error:", err);
      setErrorMessage(
        err?.message || "Failed to communicate with the report generation service."
      );
      showToast("Error generating report. Please retry.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!report) return;
    const fullText = `# ${report.title}\nGenerated: ${report.generatedAt} (${report.source === "gemini" ? "Gemini 3.8 Flash" : "Built-in Intelligence"})\n\n${report.summary}\n\n### Strategic Advice\n${report.strategicAdvice}\n\n### Action Items\n${report.actionItems
      .map((item) => `- [${item.priority}] (${item.department}) ${item.action} (${item.timeline || "Pending"})`)
      .join("\n")}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    showToast("Report copied to clipboard", "info");
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="ai-report-generator" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-600/60 border border-indigo-400/30 text-indigo-200">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <h2 className="text-base font-bold text-white">AI Executive Reports & Operational Summaries</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Gemini 3.8 Flash
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Synthesize property-wide occupancy, yield margins, housekeeping turnaround, and VIP guest schedules into structured executive summaries.
          </p>
        </div>

        {report && (
          <div className="flex items-center gap-2 self-start md:self-auto w-full md:w-auto justify-end">
            <button
              id="btn-copy-report"
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/10 text-xs font-semibold text-white transition-colors"
              title="Copy to Clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              id="btn-print-report"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/10 text-xs font-semibold text-white transition-colors"
              title="Print or Save PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Configuration Controls Bar */}
      <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Report Type Selector */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Report Scope
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  id: "executive-daily" as ReportType,
                  title: "Daily Operations Briefing",
                  desc: "Occupancy health, arrival flow, and shift turnover",
                  icon: Building2,
                },
                {
                  id: "revenue-yield" as ReportType,
                  title: "Revenue & Yield Audit",
                  desc: "RevPAR, ADR dynamics, and room pricing recommendations",
                  icon: TrendingUp,
                },
                {
                  id: "housekeeping-turnover" as ReportType,
                  title: "Housekeeping & Facility Audit",
                  desc: "Cleanliness velocity, work orders, and room readiness",
                  icon: Layers,
                },
                {
                  id: "guest-vip" as ReportType,
                  title: "Guest & VIP Experience",
                  desc: "Arrival profiles, special requests, and service health",
                  icon: ShieldCheck,
                },
              ].map((type) => {
                const Icon = type.icon;
                const isSelected = reportType === type.id;
                return (
                  <button
                    key={type.id}
                    id={`report-type-${type.id}`}
                    onClick={() => setReportType(type.id)}
                    className={`p-3 rounded-xl text-left border transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-white border-indigo-600 shadow-xs ring-2 ring-indigo-500/10"
                        : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{type.title}</div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{type.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timeframe & Focus Areas */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Timeframe
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                {[
                  { id: "today" as const, label: "Live Shift" },
                  { id: "week" as const, label: "7 Days" },
                  { id: "month" as const, label: "30 Days" },
                ].map((tf) => (
                  <button
                    key={tf.id}
                    id={`timeframe-${tf.id}`}
                    onClick={() => setTimeframe(tf.id)}
                    className={`py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      timeframe === tf.id
                        ? "bg-indigo-600 text-white font-semibold shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Strategic Focus Areas
              </label>
              <div className="flex flex-wrap gap-1.5">
                {focusOptions.map((opt) => {
                  const active = selectedFocus.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleFocus(opt)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        active
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Generate Trigger Button */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200/80">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Live hotel state connected: {occupancyRate}% occupancy • {rooms.length} rooms • {bookings.length} reservations</span>
          </div>

          <button
            id="btn-generate-report"
            onClick={() => handleGenerateReport()}
            disabled={isLoading}
            className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs transition-all shadow-xs disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing Hotel Intelligence...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Generate Intelligence Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => handleGenerateReport()}
            className="underline font-semibold hover:text-rose-950"
          >
            Retry
          </button>
        </div>
      )}

      {/* Report Content Body */}
      <div className="p-6">
        {isLoading ? (
          <div className="py-16 text-center space-y-4">
            <div className="inline-flex p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Generating {reportType.replace("-", " ")} report...
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Analyzing room inventory, occupancy yield, guest arrivals, and maintenance work orders via Gemini AI.
              </p>
            </div>
          </div>
        ) : report ? (
          <div className="space-y-6">
            {/* Report Header Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  {report.timeframe.toUpperCase()} REPORT
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{report.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generated on {report.generatedAt} • Engine: <span className="font-semibold text-slate-700">{report.model} ({report.source})</span>
                </p>
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto text-xs">
                <button
                  onClick={() => setViewMode("formatted")}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    viewMode === "formatted" ? "bg-white text-slate-900 font-semibold shadow-2xs" : "text-slate-600"
                  }`}
                >
                  Executive View
                </button>
                <button
                  onClick={() => setViewMode("markdown")}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    viewMode === "markdown" ? "bg-white text-slate-900 font-semibold shadow-2xs" : "text-slate-600"
                  }`}
                >
                  Raw Markdown
                </button>
              </div>
            </div>

            {/* Strategic Advice Callout */}
            {report.strategicAdvice && (
              <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/5 to-slate-50 border border-amber-300/40 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-700 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Executive Strategy Directive
                  </h4>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
                    {report.strategicAdvice}
                  </p>
                </div>
              </div>
            )}

            {viewMode === "formatted" ? (
              <>
                {/* Key Findings Card Grid */}
                {report.keyFindings && report.keyFindings.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Key Operational Findings & Diagnostics
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {report.keyFindings.map((finding, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-start gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formatted Markdown Content Body */}
                <div className="bg-slate-50/50 rounded-2xl border border-slate-200 p-5 prose prose-slate max-w-none text-xs leading-relaxed space-y-4">
                  {report.summary.split("\n\n").map((block, index) => {
                    if (block.startsWith("### ")) {
                      return (
                        <h3 key={index} className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1.5 mt-4 first:mt-0">
                          {block.replace("### ", "")}
                        </h3>
                      );
                    }
                    if (block.startsWith("#### ")) {
                      return (
                        <h4 key={index} className="text-xs font-bold text-indigo-950 uppercase tracking-wider mt-3">
                          {block.replace("#### ", "")}
                        </h4>
                      );
                    }
                    if (block.startsWith("- ")) {
                      return (
                        <ul key={index} className="list-disc pl-5 space-y-1 text-slate-700">
                          {block.split("\n").map((line, lIdx) => (
                            <li key={lIdx} dangerouslySetInnerHTML={{
                              __html: line.replace(/^- /, "")
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                            }} />
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={index} className="text-slate-700" dangerouslySetInnerHTML={{
                        __html: block
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                      }} />
                    );
                  })}
                </div>

                {/* Action Items Table / List */}
                {report.actionItems && report.actionItems.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      Priority Action Directives for Hotel Shift
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-4">Department</th>
                            <th className="py-2.5 px-4">Action Item</th>
                            <th className="py-2.5 px-3">Priority</th>
                            <th className="py-2.5 px-4">Timeline</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {report.actionItems.map((item, i) => (
                            <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                                {item.department}
                              </td>
                              <td className="py-3 px-4 text-slate-700">{item.action}</td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    item.priority === "High"
                                      ? "bg-rose-100 text-rose-800"
                                      : item.priority === "Medium"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {item.priority}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                                {item.timeline || "Today"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Raw Markdown View */
              <div className="bg-slate-900 text-slate-100 p-5 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {report.summary}
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No report generated yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Select a report scope above and click "Generate Intelligence Report" to synthesize current metrics, VIP arrivals, and housekeeping schedules.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <button
                onClick={() => handleGenerateReport("executive-daily")}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors"
              >
                Quick: Daily Briefing
              </button>
              <button
                onClick={() => handleGenerateReport("revenue-yield")}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors"
              >
                Quick: Revenue & Yield Audit
              </button>
              <button
                onClick={() => handleGenerateReport("housekeeping-turnover")}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors"
              >
                Quick: Turnover Audit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
