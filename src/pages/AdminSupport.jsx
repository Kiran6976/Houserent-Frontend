// src/pages/AdminSupport.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  adminGetSupportTickets,
  adminGetSupportTicketDetail,
  adminReplySupportTicket,
  adminUpdateSupportTicket,
} from "../services/adminSupportApi";
import { supportUploadFile } from "../services/supportApi";
import {
  Loader2,
  Inbox,
  RefreshCw,
  MessageSquare,
  Send,
  Paperclip,
  Settings2,
} from "lucide-react";

const pill = (status) => {
  const base =
    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border";
  const s = String(status || "").toLowerCase();

  if (s === "open") return `${base} bg-indigo-50 text-indigo-700 border-indigo-100`;
  if (s === "in_progress")
    return `${base} bg-yellow-50 text-yellow-700 border-yellow-100`;
  if (s === "waiting_user")
    return `${base} bg-purple-50 text-purple-700 border-purple-100`;
  if (s === "resolved")
    return `${base} bg-emerald-50 text-emerald-700 border-emerald-100`;
  if (s === "closed") return `${base} bg-gray-50 text-gray-700 border-gray-200`;
  return `${base} bg-gray-50 text-gray-700 border-gray-200`;
};

const fmt = (d) => {
  try {
    const dt = new Date(d);
    return dt.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

export const AdminSupport = () => {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const [filterStatus, setFilterStatus] = useState("open");

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const [attachUploading, setAttachUploading] = useState(false);
  const [attachMeta, setAttachMeta] = useState(null);

  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await adminGetSupportTickets(token, filterStatus ? { status: filterStatus } : {});
      setTickets(data?.tickets || []);
      if (!selectedId && data?.tickets?.length) setSelectedId(data.tickets[0]._id);
    } catch (e) {
      showToast(e.message || "Failed to load support inbox", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (ticketId) => {
    if (!ticketId) return;
    try {
      setThreadLoading(true);
      const data = await adminGetSupportTicketDetail(ticketId, token);
      setDetail(data);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e) {
      showToast(e.message || "Failed to load ticket", "error");
    } finally {
      setThreadLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const pickFile = () => fileRef.current?.click();

  const onFileChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    try {
      setAttachUploading(true);
      const uploaded = await supportUploadFile(f, token);
      setAttachMeta({
        url: uploaded?.url,
        type: uploaded?.type || (f.type?.startsWith("video/") ? "video" : "image"),
        name: f.name,
      });
      showToast("Attachment uploaded", "success");
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
      setAttachMeta(null);
    } finally {
      setAttachUploading(false);
      e.target.value = "";
    }
  };

  const updateStatus = async (status) => {
    if (!selectedId) return;
    try {
      await adminUpdateSupportTicket(selectedId, { status }, token);
      showToast("Status updated", "success");
      await loadDetail(selectedId);
      await loadTickets();
    } catch (e) {
      showToast(e.message || "Failed to update status", "error");
    }
  };

  const sendReply = async () => {
    if (!selectedId) return;
    if (!reply.trim() && !attachMeta) {
      showToast("Write a reply or attach a file", "error");
      return;
    }

    try {
      setSending(true);
      await adminReplySupportTicket(
        selectedId,
        {
          message: reply.trim() || "(attachment)",
          attachments: attachMeta ? [attachMeta] : [],
          setStatus: "waiting_user",
        },
        token
      );

      setReply("");
      setAttachMeta(null);

      await loadDetail(selectedId);
      await loadTickets();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e) {
      showToast(e.message || "Failed to send reply", "error");
    } finally {
      setSending(false);
    }
  };

  const userBox = useMemo(() => detail?.ticket?.userId, [detail]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full text-sm font-semibold">
              <Inbox className="w-4 h-4" />
              Admin Support Inbox
            </div>
            <h1 className="mt-3 text-3xl font-bold text-gray-900">Support Tickets</h1>
            <p className="mt-1 text-gray-600">
              View tickets, reply to users, and manage status.
            </p>
          </div>

          <button
            onClick={loadTickets}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left list */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between gap-3">
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  Inbox
                </div>

                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
                  >
                    <option value="open">open</option>
                    <option value="in_progress">in_progress</option>
                    <option value="waiting_user">waiting_user</option>
                    <option value="resolved">resolved</option>
                    <option value="closed">closed</option>
                    <option value="">all</option>
                  </select>
                </div>
              </div>

              <div className="max-h-[560px] overflow-auto">
                {tickets?.length ? (
                  tickets.map((t) => (
                    <button
                      key={t._id}
                      onClick={() => setSelectedId(t._id)}
                      className={`w-full text-left p-4 border-b hover:bg-gray-50 transition ${
                        selectedId === t._id ? "bg-indigo-50/50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {t.subject || "No subject"}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {t.userId?.name || "User"} • {t.category || "other"} •{" "}
                            {fmt(t.lastMessageAt || t.updatedAt || t.createdAt)}
                          </div>
                        </div>
                        <span className={pill(t.status)}>{t.status}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-10 text-center text-gray-600">
                    No tickets in this filter.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right thread */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {detail?.ticket?.subject || "Select a ticket"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {detail?.ticket?._id ? (
                        <>
                          Ticket ID: <span className="font-mono">{detail.ticket._id}</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>

                  {detail?.ticket?.status ? (
                    <span className={pill(detail.ticket.status)}>{detail.ticket.status}</span>
                  ) : null}
                </div>

                {/* User info */}
                {userBox ? (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
                      <div className="text-xs text-gray-500">User</div>
                      <div className="text-sm font-semibold text-gray-900">{userBox.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{userBox.role}</div>
                    </div>
                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="text-sm font-semibold text-gray-900 truncate">{userBox.email}</div>
                    </div>
                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
                      <div className="text-xs text-gray-500">Phone</div>
                      <div className="text-sm font-semibold text-gray-900">{userBox.phone || "—"}</div>
                    </div>
                  </div>
                ) : null}

                {/* Status actions */}
                {detail?.ticket?._id ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["open", "in_progress", "waiting_user", "resolved", "closed"].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(s)}
                        className={`px-3 py-2 rounded-xl border text-sm ${
                          detail.ticket.status === s
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="h-[380px] overflow-auto p-4 bg-gray-50">
                {threadLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                ) : detail?.messages?.length ? (
                  <div className="space-y-3">
                    {detail.messages.map((m) => {
                      const mine = m.senderRole === "admin";
                      return (
                        <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div className="max-w-[85%] rounded-2xl px-4 py-3 shadow-sm border bg-white border-gray-200">
                            <div className="text-xs text-gray-500 flex items-center justify-between gap-3">
                              <span className="font-semibold">{mine ? "Admin" : "User"}</span>
                              <span>{fmt(m.createdAt)}</span>
                            </div>

                            <div className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
                              {m.message}
                            </div>

                            {Array.isArray(m.attachments) && m.attachments.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {m.attachments.map((a, idx) => (
                                  <div key={idx} className="text-sm">
                                    {a.type === "video" ? (
                                      <video
                                        controls
                                        className="w-full rounded-xl border border-gray-200"
                                        src={a.url}
                                      />
                                    ) : (
                                      <img
                                        alt={a.name || "attachment"}
                                        src={a.url}
                                        className="w-full rounded-xl border border-gray-200"
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-600">
                    No messages yet.
                  </div>
                )}
              </div>

              {/* Reply box */}
              <div className="p-4 border-t bg-white">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={2}
                  placeholder="Write a reply..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  disabled={!selectedId}
                />

                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {attachMeta?.url ? (
                      <>
                        Attached: <span className="font-semibold">{attachMeta.name || "file"}</span>
                      </>
                    ) : (
                      "Attach proof/screenshots if needed."
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input ref={fileRef} type="file" className="hidden" onChange={onFileChange} />

                    <button
                      type="button"
                      onClick={pickFile}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100"
                      disabled={!selectedId || attachUploading}
                      title="Attach file"
                    >
                      {attachUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Paperclip className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={sendReply}
                      disabled={!selectedId || sending}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Reply
                    </button>
                  </div>
                </div>

                {!selectedId ? (
                  <div className="mt-3 text-xs text-gray-500">
                    Select a ticket from the left to start replying.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
