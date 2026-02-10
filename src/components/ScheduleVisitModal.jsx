import React, { useMemo, useState, useEffect } from "react";
import { X, Loader2, Calendar, Clock, MessageSquare, Sparkles } from "lucide-react";

export const ScheduleVisitModal = ({ open, onClose, onSubmit, houseTitle }) => {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ✅ lock background scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const startEndOk = useMemo(() => {
    if (!date || !startTime || !endTime) return false;
    const s = new Date(`${date}T${startTime}:00`);
    const e = new Date(`${date}T${endTime}:00`);
    return !Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime()) && e > s;
  }, [date, startTime, endTime]);

  const canSubmit = useMemo(() => {
    return !!date && !!startTime && !!endTime && startEndOk;
  }, [date, startTime, endTime, startEndOk]);

  const fmt = (iso) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const buildISO = () => {
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);
    return { start, end };
  };

  const setDuration = (mins) => {
    if (!date || !startTime) return;
    const start = new Date(`${date}T${startTime}:00`);
    if (Number.isNaN(start.getTime())) return;
    const end = new Date(start.getTime() + mins * 60 * 1000);
    const hh = String(end.getHours()).padStart(2, "0");
    const mm = String(end.getMinutes()).padStart(2, "0");
    setEndTime(`${hh}:${mm}`);
  };

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!canSubmit) {
      setErr("Please select a valid time slot (end time must be after start time).");
      return;
    }

    const { start, end } = buildISO();

    setLoading(true);
    try {
      await onSubmit({ start: start.toISOString(), end: end.toISOString(), message });
      onClose?.();
      setDate("");
      setMessage("");
      setStartTime("10:00");
      setEndTime("11:00");
    } catch (ex) {
      setErr(ex?.message || "Failed to request visit. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const summary = (() => {
    if (!date || !startTime || !endTime) return null;
    const { start, end } = buildISO();
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    return { startISO: start.toISOString(), endISO: end.toISOString(), ok: end > start };
  })();

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 px-3 sm:px-4"
      onMouseDown={(e) => {
        // ✅ click outside closes
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      {/* ✅ Use padding top/bottom and allow modal to sit nicely on small screens */}
      <div className="min-h-dvh w-full flex items-start sm:items-center justify-center py-6 sm:py-10">
        {/* ✅ Panel is flex-col + has max height */}
        <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-white/20 flex flex-col h-[95dvh] sm:h-auto sm:max-h-[90dvh]">
          {/* Header (fixed) */}
          <div className="relative p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shrink-0">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="w-full h-full bg-[radial-gradient(circle_at_top_left,white,transparent_55%)]" />
            </div>

            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold">
                  <Sparkles className="w-4 h-4" />
                  Visit Request
                </div>

                <h3 className="mt-3 text-xl font-bold">Schedule a Visit</h3>
                <p className="mt-1 text-white/85 text-sm truncate">{houseTitle || "Property"}</p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/20 transition"
                aria-label="Close"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ✅ Scrollable content area */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Date */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Choose Date
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setErr("");
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Time */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Time Slot
                  </label>

                  {/* ✅ Wrap buttons on small screens */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDuration(30)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 transition"
                      title="Set end time to 30 mins after start"
                    >
                      30m
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuration(60)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 transition"
                      title="Set end time to 1 hour after start"
                    >
                      1h
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuration(120)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 transition"
                      title="Set end time to 2 hours after start"
                    >
                      2h
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">Start</div>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(e.target.value);
                        setErr("");
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">End</div>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => {
                        setEndTime(e.target.value);
                        setErr("");
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {!startEndOk && date && startTime && endTime && (
                  <p className="mt-2 text-xs text-rose-600">End time must be after start time.</p>
                )}

                <p className="mt-2 text-xs text-gray-500">Tip: choose a slot at least 30–60 mins from now.</p>
              </div>

              {/* Message */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  Message (optional)
                </label>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Example: I can come after 6 PM. Please confirm."
                />
              </div>

              {/* Summary */}
              {summary && (
                <div
                  className={`rounded-2xl p-4 border ${
                    summary.ok ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-900">Summary</div>
                  <div className="mt-1 text-sm text-gray-700">
                    {summary.ok ? (
                      <>
                        <span className="font-medium">From:</span> {fmt(summary.startISO)}{" "}
                        <span className="text-gray-400">→</span>{" "}
                        <span className="font-medium">To:</span> {fmt(summary.endISO)}
                      </>
                    ) : (
                      <span className="text-rose-700 font-medium">Invalid slot selected</span>
                    )}
                  </div>
                </div>
              )}

              {/* Error */}
              {err && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {err}
                </div>
              )}

              {/* ✅ extra bottom space so last content doesn't hide behind sticky footer */}
              <div className="h-2" />
            </form>
          </div>

          {/* ✅ Sticky footer (always visible) */}
          <div className="shrink-0 border-t bg-white p-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                className="sm:w-1/2 w-full py-3 rounded-2xl border border-gray-200 bg-white text-gray-800 font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                className="sm:w-1/2 w-full py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  "Send Request"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
