import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Send, 
  X, 
  MessageCircle, 
  Loader2,
  AlertTriangle,
  Paperclip
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface Message {
  id: string;
  chat_id: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
  content: string;
  sent_at: string;
  is_read: boolean;
  attachments: {
    id: string;
    url: string;
    filename: string;
    mime: string;
  }[];
  sending?: boolean;
  failed?: boolean;
}

interface Warning {
  active: boolean;
  risk: string;
  message: string;
  expires_at: string;
}

interface ChatPanelProps {
  chatId?: string; // optional now
  currentUserId: string;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  embedded?: boolean;
}

export function SupportChatPanel({ 
  chatId: initialChatId, 
  currentUserId, 
  isOpen = true, 
  onClose,
  className,
  embedded = false
}: ChatPanelProps) {
  const [chatId, setChatId] = useState<string | undefined>(initialChatId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [warning, setWarning] = useState<Warning | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  // -------------------------
  // Auto-create/get chat
  // -------------------------
  useEffect(() => {
    const initChat = async () => {
      try {
        const res = await api.post("/support-chat");
        console.log(res.data);
        setChatId(res.data.chat.id);
        fetchMessages(res.data.chat.id);
      } catch (err) {
        console.error("Failed to get/create support chat", err);
      }
    };
    initChat();
  }, []);

  // -------------------------
  // Fetch messages
  // -------------------------
  useEffect(() => {
    if (chatId && isOpen) {
      fetchMessages();
    }
  }, [chatId, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!chatId) return;
    try {
      setLoading(true);
      const res = await api.get(`/support-chat/${chatId}/messages`);
      console.log(res.data);
      setMessages(res.data.messages || []);
      setWarning(res.data.warning || null);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Send new message
  // -------------------------
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && pendingFiles.length === 0) || sending || !chatId) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      chat_id: chatId,
      content: newMessage,
      sender: { id: currentUserId, name: "You", avatar: null },
      sent_at: new Date().toISOString(),
      is_read: true,
      attachments: pendingFiles.map(f => ({
        id: `temp-${f.name}`,
        url: URL.createObjectURL(f),
        filename: f.name,
        mime: f.type,
      })),
      sending: true,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage("");
    setPendingFiles([]);
    setSending(true);

    try {
      const form = new FormData();
      form.append("content", optimisticMessage.content);
      pendingFiles.forEach(f => form.append("files", f));

      const res = await api.post(`/support-chat/${chatId}/messages`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log(res.data);

      const realMessage = res.data;
      setMessages(prev => prev.map(m => (m.id === tempId ? realMessage : m)));
    } catch {
      setMessages(prev =>
        prev.map(m => (m.id === tempId ? { ...m, sending: false, failed: true } : m))
      );
    } finally {
      setSending(false);
    }
  };

  // -------------------------
  // Retry failed message
  // -------------------------
  const retryMessage = async (msg: Message) => {
    if (!chatId) return;
    setMessages(prev =>
      prev.map(m => (m.id === msg.id ? { ...m, sending: true, failed: false } : m))
    );

    try {
      const form = new FormData();
      form.append("content", msg.content);
      // Attach real files if needed (skip blob URLs)
      msg.attachments?.forEach(a => {
        if (a.url.startsWith("blob:")) return;
        // implement real file upload here if applicable
      });

      const res = await api.post(`/support-chat/${chatId}/messages`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const realMessage = res.data.data;
      setMessages(prev => prev.map(m => (m.id === msg.id ? realMessage : m)));
    } catch {
      setMessages(prev =>
        prev.map(m => (m.id === msg.id ? { ...m, sending: false, failed: true } : m))
      );
    }
  };

  // -------------------------
  // Format utilities
  // -------------------------
  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach(msg => {
      const dateKey = new Date(msg.sent_at).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
    });
    return groups;
  };

  const renderAttachment = (a: Message["attachments"][0]) => {
    if (a.mime.startsWith("image/")) return <img src={a.url} alt={a.filename} className="max-h-40 rounded-lg border mt-2" />;
    return <a href={a.url} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-2 text-xs underline">📎 {a.filename}</a>;
  };

  if (!isOpen) return null;
  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className={cn("flex flex-col bg-card border-l border-border",
      embedded ? "h-full" : "fixed right-0 top-0 h-screen w-full sm:w-96 z-50 shadow-2xl",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Support Chat</span>
        </div>
        {onClose && <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X className="h-4 w-4" /></Button>}
      </div>

      {/* Warning */}
      {warning?.active && (
        <div className="p-3 bg-warning/10 border-b border-warning/20 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
          <p className="text-xs text-warning">{warning.message}</p>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <MessageCircle className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground/70">Start the conversation!</p>
          </div>
        ) : Object.entries(messageGroups).map(([dateKey, msgs]) => (
          <div key={dateKey}>
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground px-2">{formatDate(msgs[0].sent_at)}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {msgs.map((msg, idx) => {
              const isOwn = msg.sender.id === currentUserId;
              const showAvatar = idx === 0 || msgs[idx - 1]?.sender.id !== msg.sender.id;
              return (
                <div key={msg.id} className={cn("flex gap-2 mb-2", isOwn ? "flex-row-reverse" : "flex-row")}>
                  {!isOwn && showAvatar ? (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={msg.sender.avatar || undefined} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">{msg.sender.name?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                  ) : !isOwn ? <div className="w-8" /> : null}

                  <div className={cn("max-w-[75%] group", isOwn ? "items-end" : "items-start")}>
                    {!isOwn && showAvatar && <p className="text-xs text-muted-foreground mb-1 ml-1">{msg.sender.name}</p>}
                    <div className={cn("rounded-2xl px-4 py-2 text-sm relative", isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md")}>
                      {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                      {msg.attachments?.map(att => <div key={att.id}>{renderAttachment(att)}</div>)}
                      {msg.sending && <Loader2 className="h-3 w-3 animate-spin absolute bottom-1 right-2 opacity-80" />}
                      {msg.failed && <p className="text-[10px] text-red-400 mt-1">Failed to send</p>}
                    </div>
                    <p className={cn("text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity", isOwn ? "text-right mr-1" : "ml-1")}>{formatTime(msg.sent_at)}</p>
                    {msg.failed && <button className="text-[10px] underline mt-1 text-destructive" onClick={() => retryMessage(msg)}>Retry</button>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={scrollRef} />
      </ScrollArea>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-border bg-muted/20">
        {pendingFiles.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-2">
            {pendingFiles.map(f => <span key={f.name} className="text-xs bg-muted px-2 py-1 rounded">{f.name}</span>)}
          </div>
        )}
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="icon" disabled={sending || pendingFiles.length > 5} onClick={() => document.getElementById("chat-files")?.click()}>
            <Paperclip className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Input ref={inputRef} value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-background" disabled={sending} />
          <Button type="submit" size="icon" className="h-10 w-10 flex-shrink-0" disabled={!newMessage.trim() || sending}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>

      <input type="file" multiple hidden id="chat-files" onChange={e => {
        if (!e.target.files) return;
        setPendingFiles(prev => [...prev, ...Array.from(e.target.files)]);
      }} />
    </div>
  );
}

export default SupportChatPanel;
