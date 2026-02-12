// src/pages/Support.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  createSupportTicket,
  getMySupportTickets,
  getSupportTicketDetail,
  sendSupportMessage,
  supportUploadFile,
} from "../services/supportApi";
import {
  Loader2,
  LifeBuoy,
  Paperclip,
  Send,
  PlusCircle,
  RefreshCw,
  MessageSquare,
  BadgeCheck,
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

export const Support = () => {
  const { user, token } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [threadLoading, setThreadLoading] = useState(false);

  const [detail, setDetail] = useState(null); // {ticket, messages}
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);

  // create ticket form
  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("other");
  const [priority, setPriority] = useState("medium");
  const [description, setDescription] = useState("");

  const [attach, setAttach] = useState(null); // File
  const [attachUploading, setAttachUploading] = useState(false);
  const [attachMeta, setAttachMeta] = useState(null); // { url, type, name }

  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  const prefill = useMemo(
    () => ({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      userId: user?._id || "",
      role: user?.role || "",
    }),
    [user]
  );

  // ✅ If any ticket exists (backend hides closed), treat it as active
  const hasActiveTicket = useMemo(() => {
    return Array.isArray(tickets) && tickets.length > 0;
  }, [tickets]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await getMySupportTickets(token);
      const list = data?.tickets || [];
      setTickets(list);

      // ✅ If selectedId no longer exists (e.g. admin closed -> backend hides), clear selection
      if (selectedId && !list.some((t) => t._id === selectedId)) {
        setSelectedId(null);
        setDetail(null);
      }

      // ✅ Auto select first ticket if none selected
      if (!selectedId && list.length) {
        setSelectedId(list[0]._id);
      }
    } catch (e) {
      showToast(e.message || "Failed to load tickets", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (ticketId) => {
    if (!ticketId) return;
    try {
      setThreadLoading(true);
      const data = await getSupportTicketDetail(ticketId, token);
      setDetail(data);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e) {
      // ✅ If ticket became hidden (closed) while viewing, refresh list
      const msg = String(e?.message || "").toLowerCase();
      if (msg.includes("not found")) {
        await loadTickets();
        return;
      }
      showToast(e.message || "Failed to load ticket", "error");
    } finally {
      setThreadLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const handlePickFile = () => fileRef.current?.click();

  const onFileChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setAttach(f);
    setAttachMeta(null);

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
      setAttach(null);
      setAttachMeta(null);
    } finally {
      setAttachUploading(false);
      e.target.value = "";
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();

    // ✅ UI block: only 1 active ticket allowed
    if (hasActiveTicket) {
      showToast("You already have an active ticket. Please use the chat.", "info");
      if (tickets?.[0]?._id) setSelectedId(tickets[0]._id);
      return;
    }

    if (!subject.trim() || !description.trim()) {
      showToast("Subject and issue details are required", "error");
      return;
    }

    try {
      setCreating(true);

      const payload = {
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
        attachments: attachMeta ? [attachMeta] : [],
      };

      const res = await createSupportTicket(payload, token);
      showToast(res?.message || "Ticket created", "success");

      // reset form
      setSubject("");
      setDescription("");
      setCategory("other");
      setPriority("medium");
      setAttach(null);
      setAttachMeta(null);

      await loadTickets();
    } catch (err) {
      // ✅ Backend block (race condition): open existing active ticket
      if (err?.statusCode === 409 && err?.data?.activeTicketId) {
        showToast("You already have an active ticket. Opening it.", "info");
        await loadTickets();
        setSelectedId(err.data.activeTicketId);
        return;
      }
      showToast(err.message || "Failed to create ticket", "error");
    } finally {
      setCreating(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedId) return;
    if (!newMsg.trim() && !attachMeta) {
      showToast("Write a message or attach a file", "error");
      return;
    }

    try {
      setSending(true);
      await sendSupportMessage(
        selectedId,
        {
          message: newMsg.trim() || "(attachment)",
          attachments: attachMeta ? [attachMeta] : [],
        },
        token
      );

      setNewMsg("");
      setAttach(null);
      setAttachMeta(null);

      await loadDetail(selectedId);
      await loadTickets();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (err) {
      // If ticket got closed and backend blocks messages, refresh
      const msg = String(err?.message || "").toLowerCase();
      if (msg.includes("closed") || msg.includes("not found")) {
        showToast("This ticket was closed by admin.", "info");
        await loadTickets();
        return;
      }
      showToast(err.message || "Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

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
              <LifeBuoy className="w-4 h-4" />
              Support
            </div>
            <h1 className="mt-3 text-3xl font-bold text-gray-900">Need help?</h1>
            <p className="mt-1 text-gray-600">
              Create a ticket and chat with our admin team. Your details are already filled in.
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

        {/* Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Create Ticket */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-indigo-600" />
                    Create a Support Ticket
                  </div>
                  <div className="text-xs text-gray-500">
                    Logged in as{" "}
                    <span className="font-semibold capitalize">{prefill.role}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={createTicket} className="p-5 space-y-4">
                {/* ✅ Banner */}
                {hasActiveTicket && (
                  <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
                    You already have an active support ticket. You can create a new ticket only after the admin closes the current one.
                  </div>
                )}

                {/* Prefilled */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
                    <div className="text-xs text-gray-500">Name</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {prefill.name || "—"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {prefill.email || "—"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
                    <div className="text-xs text-gray-500">Phone</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {prefill.phone || "—"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
                    <div className="text-xs text-gray-500">User ID</div>
                    <div className="text-sm font-mono text-gray-800 truncate">
                      {prefill.userId || "—"}
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="text-sm font-semibold text-gray-800">Subject</label>
                  <input
                    disabled={hasActiveTicket}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="e.g. Payment failed but amount deducted"
                  />
                </div>

                {/* Category + Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-800">Category</label>
                    <select
                      disabled={hasActiveTicket}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="payment">Payment</option>
                      <option value="booking">Booking</option>
                      <option value="house">House / Listing</option>
                      <option value="visit">Visit</option>
                      <option value="account">Account</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-800">Priority</label>
                    <select
                      disabled={hasActiveTicket}
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-semibold text-gray-800">Issue details</label>
                  <textarea
                    disabled={hasActiveTicket}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Explain the issue clearly. Add booking id or transaction details if relevant."
                  />
                </div>

                {/* Attachment */}
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-gray-800">
                      Attachment (optional)
                    </div>
                    <input ref={fileRef} type="file" className="hidden" onChange={onFileChange} />
                    <button
                      type="button"
                      onClick={handlePickFile}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={attachUploading || hasActiveTicket}
                    >
                      {attachUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Paperclip className="w-4 h-4" />
                      )}
                      Upload
                    </button>
                  </div>

                  {attachMeta?.url ? (
                    <div className="mt-3 text-sm text-gray-700 flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-emerald-600" />
                      Attached:{" "}
                      <span className="font-semibold">{attachMeta.name || "file"}</span>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-gray-500">
                      You can upload an image/video proof (as supported by your backend).
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={creating || hasActiveTicket}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <PlusCircle className="w-5 h-5" />
                  )}
                  Create Ticket
                </button>
              </form>
            </div>
          </div>

          {/* Right: Tickets + Thread */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Tickets list */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b">
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-indigo-600" />
                      My Tickets
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Click a ticket to view conversation.
                    </div>
                  </div>

                  <div className="max-h-[520px] overflow-auto">
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
                                {t.category || "other"} •{" "}
                                {fmt(t.lastMessageAt || t.updatedAt || t.createdAt)}
                              </div>
                            </div>
                            <span className={pill(t.status)}>{t.status}</span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-600">
                        No tickets yet. Create one to get help.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Thread */}
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
                              Ticket ID:{" "}
                              <span className="font-mono">{detail.ticket._id}</span>
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
                  </div>

                  <div className="h-[380px] overflow-auto p-4 bg-gray-50">
                    {threadLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                      </div>
                    ) : detail?.messages?.length ? (
                      <div className="space-y-3">
                        {detail.messages.map((m) => {
                          const mine = m.senderRole === "user";
                          return (
                            <div
                              key={m._id}
                              className={`flex ${mine ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm border ${
                                  mine ? "bg-white border-indigo-100" : "bg-white border-gray-200"
                                }`}
                              >
                                <div className="text-xs text-gray-500 flex items-center justify-between gap-3">
                                  <span className="font-semibold">
                                    {mine ? "You" : "Admin"}
                                  </span>
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

                  {/* Composer */}
                  <div className="p-4 border-t bg-white">
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <textarea
                          value={newMsg}
                          onChange={(e) => setNewMsg(e.target.value)}
                          rows={2}
                          placeholder="Write a message..."
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          disabled={!selectedId}
                        />
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {attachMeta?.url ? (
                              <>
                                Attached:{" "}
                                <span className="font-semibold">{attachMeta.name || "file"}</span>
                              </>
                            ) : (
                              "You can attach proof if needed."
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <input ref={fileRef} type="file" className="hidden" onChange={onFileChange} />
                            <button
                              type="button"
                              onClick={handlePickFile}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
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
                              onClick={sendMessage}
                              disabled={!selectedId || sending}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
                            >
                              {sending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                              Send
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!selectedId ? (
                      <div className="mt-3 text-xs text-gray-500">
                        Select a ticket from the left to start chatting.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
};
