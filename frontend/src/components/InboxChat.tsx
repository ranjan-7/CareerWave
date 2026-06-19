'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Send, MessageSquare, Clock, User } from 'lucide-react';
import Button from './ui/Button';

export default function InboxChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const queryUserId = searchParams.get('userId');

  const [threads, setThreads] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(queryUserId);
  const [selectedThreadInfo, setSelectedThreadInfo] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [typedMessage, setTypedMessage] = useState('');
  
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch thread list (inbox list)
  const fetchThreads = async (silent = false) => {
    if (silent === false) setLoadingThreads(true);
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads);
        
        // If queryUserId is selected, pull its profile information
        if (selectedUserId) {
          const match = data.threads.find((t: any) => t.userId === selectedUserId);
          if (match) {
            setSelectedThreadInfo(match);
          } else if (!selectedThreadInfo && silent === false) {
            // If not found in current inbox threads, fetch user profile separately
            fetchPartnerProfile(selectedUserId);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (silent === false) setLoadingThreads(false);
    }
  };

  // Helper: fetch profile of a partner if they aren't in the thread list yet
  const fetchPartnerProfile = async (partnerId: string) => {
    try {
      const res = await fetch(`/api/auth/session`); // fallback session endpoint returns profile if admin or we mock check
      // For simplicity, we can construct a placeholder or search in threads.
      // If we are starting a chat with an employer from the dashboard, we find their company details.
    } catch (e) {
      console.error(e);
    }
  };

  // 2. Fetch messages for the selected thread
  const fetchMessages = async (partnerId: string, silent = false) => {
    if (silent === false) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages?userId=${partnerId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        if (silent === false) {
          setTimeout(scrollToBottom, 50);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (silent === false) setLoadingMessages(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (user) {
      fetchThreads();
    }
  }, [user]);

  // Load messages when selecting a user
  useEffect(() => {
    if (user && selectedUserId) {
      fetchMessages(selectedUserId);
      
      // Update selected thread info matching selectedUserId
      const match = threads.find(t => t.userId === selectedUserId);
      if (match) setSelectedThreadInfo(match);
    } else {
      setMessages([]);
      setSelectedThreadInfo(null);
    }
  }, [selectedUserId, threads]);

  // Polling loop for active real-time updates
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      fetchThreads(true);
      if (selectedUserId) {
        fetchMessages(selectedUserId, true);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [user, selectedUserId]);

  const handleSelectThread = (partnerId: string) => {
    setSelectedUserId(partnerId);
    // Push state parameter to URL
    const dest = user?.role === 'SEEKER' ? '/seeker/messages' : '/employer/messages';
    router.push(`${dest}?userId=${partnerId}`);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !typedMessage.trim() || sending) return;

    setSending(true);
    const text = typedMessage.trim();
    setTypedMessage('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedUserId,
          content: text,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Append sent message locally
        setMessages((prev) => [...prev, data.message]);
        setTimeout(scrollToBottom, 50);
        // Refresh inbox threads
        fetchThreads(true);
      } else {
        toast('Failed to send message', 'error');
      }
    } catch (err) {
      console.error(err);
      toast('Error sending message', 'error');
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60 overflow-hidden h-[75vh] w-full flex-grow">
      
      {/* 1. Left Sidebar: Thread List */}
      <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/20">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Conversations</h2>
        </div>

        <div className="flex-grow overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {loadingThreads ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading inbox...</div>
          ) : threads.length === 0 ? (
            <div className="py-12 px-4 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <MessageSquare className="h-8 w-8 text-slate-300" />
              <span>No conversations yet. Chat options appear when application reviews commence.</span>
            </div>
          ) : (
            threads.map((thread) => {
              const isActive = thread.userId === selectedUserId;
              const hasUnread = thread.lastMessage.senderId === thread.userId && !thread.lastMessage.isRead;

              return (
                <button
                  key={thread.userId}
                  onClick={() => handleSelectThread(thread.userId)}
                  className={`w-full text-left p-4 flex gap-3 items-start hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors ${
                    isActive ? 'bg-white dark:bg-slate-800/80 shadow-sm border-l-4 border-primary-500' : ''
                  }`}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 font-bold dark:bg-slate-800 dark:text-slate-400">
                    {thread.avatar ? (
                      <img src={thread.avatar} alt={thread.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  
                  <div className="flex-grow min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs truncate ${hasUnread ? 'font-bold text-slate-950 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                        {thread.name}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {new Date(thread.lastMessage.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className={`text-[11px] truncate ${hasUnread ? 'font-semibold text-slate-950 dark:text-white' : 'text-slate-500'}`}>
                      {thread.lastMessage.content}
                    </p>
                  </div>

                  {hasUnread && (
                    <span className="h-2 w-2 rounded-full bg-primary-600 self-center flex-shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Right Workspace: Chat Messages Box */}
      <div className="flex-grow flex flex-col h-full bg-white dark:bg-slate-900">
        {selectedUserId ? (
          <>
            {/* Header info */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-600 font-semibold dark:bg-slate-800 dark:text-slate-400">
                {selectedThreadInfo?.avatar ? (
                  <img src={selectedThreadInfo.avatar} alt={selectedThreadInfo?.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <User className="h-4.5 w-4.5" />
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  {selectedThreadInfo?.name || 'Contact'}
                </h3>
                <span className="text-[10px] text-slate-400">
                  {selectedThreadInfo?.role === 'EMPLOYER' ? 'Employer' : 'Candidate'}
                </span>
              </div>
            </div>

            {/* Message History list */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-slate-950/10">
              {loadingMessages ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">Send a message to open conversation.</div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user.id;
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-md rounded-2xl px-4 py-2 text-sm shadow-sm leading-normal flex flex-col ${
                        isMe 
                          ? 'bg-primary-600 text-white rounded-br-none' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-bl-none border border-slate-200/40 dark:border-slate-800/40'
                      }`}>
                        <span>{msg.content}</span>
                        <span className={`text-[9px] mt-1 self-end ${isMe ? 'text-primary-200' : 'text-slate-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Bottom Form input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="Type your message here..."
                disabled={sending}
                className="flex-grow rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <Button
                type="submit"
                isLoading={sending}
                disabled={!typedMessage.trim()}
                variant="primary"
                className="px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <MessageSquare className="h-12 w-12 text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No chat selected</h3>
            <p className="text-xs max-w-xs mt-1">
              Select a conversation partner from the thread panel to start exchanging messages.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
