import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BriefcaseBusiness, Paperclip, UserRound, X } from 'lucide-react';
import { getMessages, markMessagesRead, sendMessage, sendMessageAttachment } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const API_ORIGIN = /\/api$/i.test(API_BASE_URL) ? API_BASE_URL.replace(/\/api$/i, '') : API_BASE_URL;

const getFileUrl = (fileUrl) => {
  if (!fileUrl) {
    return '#';
  }
  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }
  return `${API_ORIGIN}${fileUrl}`;
};

const getInitials = (name) => {
  const fullName = String(name || '').trim();
  if (!fullName) {
    return 'U';
  }

  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
};

const formatMessageTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getDayKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const formatDayLabel = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const todayKey = getDayKey(now);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = getDayKey(yesterday);
  const dateKey = getDayKey(date);

  if (dateKey === todayKey) {
    return 'Today';
  }

  if (dateKey === yesterdayKey) {
    return 'Yesterday';
  }

  return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
};

const ROLE_BADGE_STYLE = {
  lawyer: 'border-slate-300 bg-slate-100 text-slate-700',
  client: 'border-slate-300 bg-white text-slate-600',
};

const ROLE_LABEL = {
  lawyer: 'Lawyer',
  client: 'Client',
};

const ROLE_ICON = {
  lawyer: BriefcaseBusiness,
  client: UserRound,
};

function RoleBadge({ role }) {
  const normalizedRole = role === 'lawyer' ? 'lawyer' : 'client';
  const Icon = ROLE_ICON[normalizedRole];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${
        ROLE_BADGE_STYLE[normalizedRole]
      }`}
    >
      <span
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white"
      >
        <Icon className="h-2 w-2 text-slate-500" />
      </span>
      {ROLE_LABEL[normalizedRole]}
    </span>
  );
}

function CaseMessages() {
  const { requestId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [requestMeta, setRequestMeta] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const endRef = useRef(null);
  const attachmentInputRef = useRef(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getMessages(requestId);
        setRequestMeta(response.request || null);
        setMessages(response.messages || []);
        await markMessagesRead(requestId);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load conversation');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [requestId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();
    const text = draft.trim();

    if (!text && selectedFiles.length === 0) {
      return;
    }

    try {
      setSending(true);
      const response =
        selectedFiles.length > 0
          ? await sendMessageAttachment(requestId, selectedFiles, text)
          : await sendMessage(requestId, { text });

      setMessages((prev) => [...prev, response.message]);
      setDraft('');
      setSelectedFiles([]);

      if (attachmentInputRef.current) {
        attachmentInputRef.current.value = '';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const isAccepted = requestMeta?.status === 'accepted';
  const backPath = user?.role === 'lawyer' ? '/lawyer/requests' : '/client/requests';

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-600">
        Loading conversation...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <p className="text-red-600">{error}</p>
        <Link to={backPath} className="mt-3 inline-block text-blue-600 hover:text-blue-700">
          Back to requests
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <header className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-linear-to-r from-white via-blue-50/40 to-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">{requestMeta?.case?.title || 'Case Conversation'}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <span className="truncate">Chat with {requestMeta?.otherParticipant?.fullName || 'participant'}</span>
              <RoleBadge role={requestMeta?.otherParticipant?.role || (user?.role === 'lawyer' ? 'client' : 'lawyer')} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                isAccepted ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {requestMeta?.status || 'Unknown'}
            </span>
            <Link
              to={backPath}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <Link
              to={backPath}
              aria-label="Close chat"
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="h-[65vh] overflow-y-auto bg-linear-to-b from-slate-50 to-blue-50/40 px-4 sm:px-5 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            No messages yet. Start the conversation.
          </div>
        ) : (
          messages.map((message, index) => {
            const isMine = String(message.sender?._id || message.sender) === String(user?.id);
            const senderRole = isMine
              ? user?.role || 'client'
              : message.sender?.role || requestMeta?.otherParticipant?.role || (user?.role === 'lawyer' ? 'client' : 'lawyer');
            const senderName = isMine ? 'You' : message.sender?.fullName || requestMeta?.otherParticipant?.fullName || 'Participant';
            const avatarInitials = getInitials(senderName);
            const previousMessage = index > 0 ? messages[index - 1] : null;
            const showDaySeparator = !previousMessage || getDayKey(previousMessage.createdAt) !== getDayKey(message.createdAt);

            return (
              <div key={message._id} className="space-y-2">
                {showDaySeparator && (
                  <div className="flex items-center gap-3 py-1.5">
                    <div className="h-px bg-gray-200 flex-1" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 bg-white/80 border border-gray-200 rounded-full px-2.5 py-1">
                      {formatDayLabel(message.createdAt)}
                    </span>
                    <div className="h-px bg-gray-200 flex-1" />
                  </div>
                )}

                <div className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                  {!isMine && (
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center shadow-sm">
                      {avatarInitials}
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      isMine
                        ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-br-md'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <div className={`text-[11px] font-semibold ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                        {senderName}
                      </div>
                      <RoleBadge role={senderRole} />
                    </div>

                    {message.text ? <p className="whitespace-pre-wrap leading-6">{message.text}</p> : null}

                    {Array.isArray(message.attachments) && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {message.attachments.map((item, attachmentIndex) => (
                          <a
                            key={`${item.fileUrl}-${attachmentIndex}`}
                            href={getFileUrl(item.fileUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className={`block text-xs px-2.5 py-1.5 rounded-lg border ${
                              isMine
                                ? 'text-blue-100 border-blue-300/30 bg-white/10 hover:bg-white/15'
                                : 'text-blue-700 border-blue-100 bg-blue-50 hover:bg-blue-100'
                            }`}
                          >
                            {item.fileName || 'Attachment'}
                          </a>
                        ))}
                      </div>
                    )}

                    <p className={`mt-2 text-[11px] ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                      {formatMessageTime(message.createdAt)}
                    </p>
                  </div>

                  {isMine && (
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold flex items-center justify-center shadow-sm">
                      {getInitials(user?.fullName || 'You')}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-white sticky bottom-0">
        {isAccepted ? (
          <div className="space-y-2">
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <span
                    key={`${file.name}-${index}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-700"
                  >
                    {file.name}
                    <button
                      type="button"
                      onClick={() => setSelectedFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index))}
                      className="text-blue-700 hover:text-blue-900"
                      aria-label="Remove attachment"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                ref={attachmentInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                multiple
                className="hidden"
                onChange={(event) => {
                  const files = Array.from(event.target.files || []);
                  if (files.length === 0) {
                    return;
                  }
                  setSelectedFiles((prev) => [...prev, ...files].slice(0, 3));
                }}
              />

              <button
                type="button"
                onClick={() => attachmentInputRef.current?.click()}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200"
                aria-label="Add attachment"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                type="submit"
                disabled={sending || (!draft.trim() && selectedFiles.length === 0)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">Messaging is enabled once the request is accepted.</p>
        )}
      </form>
    </div>
  );
}

export default CaseMessages;
