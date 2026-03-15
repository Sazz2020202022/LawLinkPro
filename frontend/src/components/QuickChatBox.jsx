import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BriefcaseBusiness, ExternalLink, MessageSquareText, Minus, Search, Send, UserRound, X } from 'lucide-react';
import {
  getClientRequests,
  getLawyerRequests,
  getMessages,
  markMessagesRead,
  sendMessage,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const REFRESH_INTERVAL_MS = 30000;
const MESSAGE_POLL_INTERVAL_MS = 12000;

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

const getConversationTimestamp = (request) => {
  return request.latestMessageAt || request.acceptedAt || request.respondedAt || request.updatedAt || request.createdAt;
};

const sortRequests = (requests) => {
  return [...requests].sort((left, right) => {
    return new Date(getConversationTimestamp(right) || 0) - new Date(getConversationTimestamp(left) || 0);
  });
};

const formatConversationTime = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const formatMessageTime = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

function QuickChatBox() {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [conversationError, setConversationError] = useState('');
  const [conversations, setConversations] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [messages, setMessages] = useState([]);
  const [requestMeta, setRequestMeta] = useState(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const endRef = useRef(null);

  const isHiddenOnRoute = /\/requests\/[^/]+\/messages$/i.test(location.pathname);
  const isLawyer = user?.role === 'lawyer';

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((item) => {
      const participantName = isLawyer ? item.client?.fullName : item.lawyer?.fullName;
      const caseTitle = item.case?.title || '';
      return `${participantName || ''} ${caseTitle}`.toLowerCase().includes(query);
    });
  }, [conversations, isLawyer, search]);

  const selectedConversation = useMemo(() => {
    return conversations.find((item) => item._id === selectedRequestId) || null;
  }, [conversations, selectedRequestId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isHiddenOnRoute) {
      setIsOpen(false);
      setIsMinimized(false);
    }
  }, [isHiddenOnRoute]);

  useEffect(() => {
    const handler = (event) => {
      const requestId = event.detail?.requestId;
      if (!requestId) return;
      setIsOpen(true);
      setIsMinimized(false);
      setSelectedRequestId(requestId);
    };
    window.addEventListener('open-quick-chat', handler);
    return () => window.removeEventListener('open-quick-chat', handler);
  }, []);

  useEffect(() => {
    if (isHiddenOnRoute || !user?.role) {
      return undefined;
    }

    let isActive = true;

    const loadConversations = async ({ showLoader } = { showLoader: true }) => {
      try {
        if (showLoader) {
          setLoadingConversations(true);
        }
        setConversationError('');

        const response = isLawyer ? await getLawyerRequests() : await getClientRequests();
        const accepted = sortRequests(
          (response.requests || []).filter((item) => item.status === 'accepted')
        );

        if (!isActive) {
          return;
        }

        setConversations(accepted);

        setSelectedRequestId((currentId) => {
          if (currentId && accepted.some((item) => item._id === currentId)) {
            return currentId;
          }

          return accepted[0]?._id || '';
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setConversationError(error.response?.data?.message || 'Unable to load quick chats');
      } finally {
        if (isActive && showLoader) {
          setLoadingConversations(false);
        }
      }
    };

    loadConversations();

    const intervalId = window.setInterval(() => {
      loadConversations({ showLoader: false });
    }, REFRESH_INTERVAL_MS);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [isHiddenOnRoute, isLawyer, user?.role]);

  useEffect(() => {
    if (!isOpen || isMinimized || !selectedRequestId) {
      return undefined;
    }

    let isActive = true;

    const loadMessages = async ({ showLoader } = { showLoader: true }) => {
      try {
        if (showLoader) {
          setLoadingMessages(true);
        }
        setMessageError('');

        const response = await getMessages(selectedRequestId);

        if (!isActive) {
          return;
        }

        setRequestMeta(response.request || null);
        setMessages(response.messages || []);
        await markMessagesRead(selectedRequestId);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setMessageError(error.response?.data?.message || 'Unable to load conversation');
      } finally {
        if (isActive && showLoader) {
          setLoadingMessages(false);
        }
      }
    };

    loadMessages();

    const intervalId = window.setInterval(() => {
      loadMessages({ showLoader: false });
    }, MESSAGE_POLL_INTERVAL_MS);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [isMinimized, isOpen, selectedRequestId]);

  const handleSend = async (event) => {
    event.preventDefault();
    const text = draft.trim();

    if (!text || !selectedRequestId) {
      return;
    }

    try {
      setSending(true);
      setMessageError('');
      const response = await sendMessage(selectedRequestId, { text });
      setMessages((prev) => [...prev, response.message]);
      setDraft('');
      setConversations((prev) => {
        return sortRequests(
          prev.map((item) =>
            item._id === selectedRequestId
              ? { ...item, latestMessageAt: response.message?.createdAt || new Date().toISOString() }
              : item
          )
        );
      });
    } catch (error) {
      setMessageError(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (isHiddenOnRoute || !user?.role) {
    return null;
  }

  const selectedParticipantName = isLawyer
    ? selectedConversation?.client?.fullName || requestMeta?.otherParticipant?.fullName || 'Client'
    : selectedConversation?.lawyer?.fullName || requestMeta?.otherParticipant?.fullName || 'Lawyer';
  const selectedParticipantRole = isLawyer ? 'client' : 'lawyer';

  const selectedCaseTitle = selectedConversation?.case?.title || requestMeta?.case?.title || 'Case conversation';
  const fullChatPath = selectedRequestId
    ? `${isLawyer ? '/lawyer' : '/client'}/requests/${selectedRequestId}/messages`
    : `${isLawyer ? '/lawyer' : '/client'}/requests`;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <section className="h-[min(100vh-3.5rem,44rem)] w-[min(100vw-1.5rem,44rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.2)]">
          <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-linear-to-r from-slate-900 via-slate-800 to-blue-900 px-4 py-3 text-white">
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold uppercase tracking-[0.16em] text-blue-100">Quick Chat</h2>
              <p className="truncate text-xs text-slate-200">
                {conversations.length > 0 ? `${conversations.length} active conversation${conversations.length > 1 ? 's' : ''}` : 'No accepted chats yet'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMinimized((prev) => !prev)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20"
                aria-label={isMinimized ? 'Expand quick chat' : 'Minimize quick chat'}
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Close quick chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {!isMinimized && (
            <div className="grid h-full grid-cols-1 sm:grid-cols-[16rem_minmax(0,1fr)]">
              <aside className="flex h-full flex-col border-b border-slate-200 bg-slate-50 sm:border-b-0 sm:border-r">
                <div className="border-b border-slate-200 p-3">
                  <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                    <Search className="h-4 w-4" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search chats"
                      className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </label>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loadingConversations ? (
                    <p className="p-4 text-sm text-slate-500">Loading chats...</p>
                  ) : conversationError ? (
                    <p className="p-4 text-sm text-red-600">{conversationError}</p>
                  ) : filteredConversations.length === 0 ? (
                    <p className="p-4 text-sm text-slate-500">No accepted chats found.</p>
                  ) : (
                    filteredConversations.map((item) => {
                      const isSelected = item._id === selectedRequestId;
                      const participantName = isLawyer ? item.client?.fullName : item.lawyer?.fullName;
                      const participantRole = isLawyer ? 'client' : 'lawyer';

                      return (
                        <button
                          key={item._id}
                          type="button"
                          onClick={() => {
                            setSelectedRequestId(item._id);
                            setIsMinimized(false);
                          }}
                          className={`flex w-full items-start gap-3 border-b border-slate-200 px-3 py-3 text-left transition ${
                            isSelected ? 'bg-white' : 'hover:bg-white/80'
                          }`}
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-xs font-semibold text-white">
                            {getInitials(participantName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-semibold text-slate-900">{participantName || 'Conversation'}</p>
                              <span className="shrink-0 text-[11px] text-slate-500">
                                {formatConversationTime(getConversationTimestamp(item))}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <RoleBadge role={participantRole} />
                              <p className="min-w-0 truncate text-xs font-medium text-slate-600">{item.case?.title || 'Case conversation'}</p>
                            </div>
                            <p className="mt-1 truncate text-[11px] text-slate-500">
                              {item.latestMessageAt ? 'Recent activity available' : 'Open the chat to continue'}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </aside>

              <div className="flex min-h-0 h-full flex-col bg-white">
                {selectedRequestId ? (
                  <>
                    <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900">{selectedParticipantName}</p>
                          <RoleBadge role={selectedParticipantRole} />
                        </div>
                        <p className="truncate text-xs text-slate-500">{selectedCaseTitle}</p>
                      </div>
                      <Link
                        to={fullChatPath}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Full Chat
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto bg-linear-to-b from-slate-50 to-blue-50/50 px-4 py-4">
                      {loadingMessages ? (
                        <p className="text-sm text-slate-500">Loading messages...</p>
                      ) : messageError ? (
                        <p className="text-sm text-red-600">{messageError}</p>
                      ) : messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
                          Start the conversation from here or open the full chat page.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {messages.map((message) => {
                            const isMine = String(message.sender?._id || message.sender) === String(user?.id);
                            const senderRole = isMine ? user?.role || 'client' : requestMeta?.otherParticipant?.role || selectedParticipantRole;
                            const senderName = isMine
                              ? 'You'
                              : message.sender?.fullName || requestMeta?.otherParticipant?.fullName || 'Participant';

                            return (
                              <div
                                key={message._id}
                                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm shadow-sm ${
                                    isMine
                                      ? 'rounded-br-md bg-linear-to-r from-blue-600 to-indigo-600 text-white'
                                      : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <p className={`text-[11px] font-semibold ${isMine ? 'text-blue-100' : 'text-slate-500'}`}>
                                      {senderName}
                                    </p>
                                    <RoleBadge role={senderRole} />
                                  </div>
                                  {message.text ? <p className="mt-1 whitespace-pre-wrap leading-6">{message.text}</p> : null}
                                  {Array.isArray(message.attachments) && message.attachments.length > 0 ? (
                                    <p className={`mt-2 text-[11px] ${isMine ? 'text-blue-100' : 'text-slate-500'}`}>
                                      {message.attachments.length} attachment{message.attachments.length > 1 ? 's' : ''}. Open full chat to view files.
                                    </p>
                                  ) : null}
                                  <p className={`mt-2 text-[11px] ${isMine ? 'text-blue-100' : 'text-slate-400'}`}>
                                    {formatMessageTime(message.createdAt)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={endRef} />
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSend} className="border-t border-slate-200 bg-white p-3">
                      <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-2 py-2">
                        <input
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          placeholder="Type a quick reply"
                          className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                        />
                        <button
                          type="submit"
                          disabled={sending || !draft.trim()}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 text-white transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Send message"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                      <MessageSquareText className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">No chat selected</p>
                      <p className="mt-1 text-sm text-slate-500">Accepted requests will show up here for quick replies.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setIsMinimized(false);
        }}
        className="group inline-flex items-center gap-3 rounded-full border border-blue-400/20 bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white shadow-[0_18px_45px_rgba(37,99,235,0.35)] transition hover:-translate-y-px hover:from-blue-700 hover:to-indigo-700"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
          <MessageSquareText className="h-5 w-5" />
        </span>
        <span className="text-left">
          <span className="block text-xs uppercase tracking-[0.16em] text-blue-100">Messenger</span>
          <span className="block text-sm font-semibold">Quick Chat Box</span>
        </span>
        {conversations.length > 0 && (
          <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-white px-2 py-1 text-xs font-bold text-blue-700">
            {conversations.length}
          </span>
        )}
      </button>
    </div>
  );
}

export default QuickChatBox;