import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Send,
  Search,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useSupportChat } from "@/contexts/SupportChatContext";

interface Message {
  id: string;
  sender: "user" | "admin";
  text: string;
  timestamp: string;
}

interface SupportChat {
  id: string;
  userId: string;
  userName: string;
  userType: "client" | "writer";
  subject: string;
  status: "open" | "resolved" | "pending";
  priority: "low" | "medium" | "high";
  lastMessage: string;
  lastMessageTime: string;
  messages: Message[];
}

export default function AdminSupport() {
  const { toast } = useToast();
  const { chats, setChats, refreshChats } = useSupportChat();

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const scrollAreaRef = useRef<any>(null);
  const selectedChat = chats.find(c => c.id === selectedChatId) || null;
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter(
    (chat) =>
      chat.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedChatId) return;

    const tempId = "temp-" + Date.now();

    const tempMsg = {
      id: tempId,
      sender: { role: "admin" },
      content: replyMessage,
      sending: true,
    };

    setMessages(prev => [...prev, tempMsg]);
    setReplyMessage("");

    try {
      const res = await api.post(
        `/support-chat/${selectedChatId}/messages`,
        { content: replyMessage }
      );

      setMessages(prev =>
        prev.map(m => (m.id === tempId ? res.data : m))
      );
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === tempId ? { ...m, failed: true } : m
        )
      );
    }
  };


  const handleResolveChat = async (chatId: string) => {
    await api.post(`/support-chat/${chatId}/resolve`);

    setChats(prev =>
      prev.map(c =>
        c.id === chatId ? { ...c, status: "resolved" } : c
      )
    );
  };


  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "high":
      case "open":
        return "destructive";
      case "medium":
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    fetchMessages(chatId);
  };

  useEffect(() => {
    refreshChats();
  }, []);

  const fetchMessages = async (chatId: string) => {
    setLoadingMessages(true);
    try {
      const res = await api.get(`/support-chat/${chatId}/messages`);
      setMessages(res.data?.messages || []);

      await api.post(`/support-chat/${chatId}/mark-read`);

      setChats(prev =>
        prev.map(c =>
          c.id === chatId ? { ...c, unread_count: 0 } : c
        )
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    const viewport = scrollAreaRef.current?.getElement?.();
    if (!viewport) return;

    requestAnimationFrame(() => {
      viewport.scrollTop = viewport.scrollHeight;
    });
  }, [messages, selectedChatId]);

  return (
    <div className="flex h-[100vh] overflow-hidden">
      {/* Chat List */}
      <Card className="flex flex-col w-1/3 border-0 border-r border-border rounded-none h-full">
        <CardHeader className="pb-3 shrink-0">
          <CardTitle className="text-lg text-3xl font-bold text-foreground">
            Support
          </CardTitle>
          {/* <div className="relative mt-3">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div> */}
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-1 p-3">
              {chats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`p-3 rounded-lg cursor-pointer ${
                    selectedChatId === chat.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-accent"
                  }`}
                >
                  <div className="flex justify-between">
                    <p className="font-medium">{chat.user_name}</p>
                    {chat.unread_count > 0 && (
                      <Badge variant="destructive">{chat.unread_count}</Badge>
                    )}
                  </div>
                  <p className="text-xs opacity-70">{chat.last_message}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="flex flex-col flex-1 rounded-none border-0">
        {selectedChat ? (
          <>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedChat.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedChat.userName} ({selectedChat.userType})
                  </p>
                </div>
                {selectedChat.status !== "resolved" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolveChat(selectedChat.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Resolve
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map(m => {
                    const isAdmin = m.sender?.role === "admin";

                    return (
                      <div key={m.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                        <div className={`p-3 rounded-lg max-w-[70%] ${
                          isAdmin ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}>
                          <p>{m.content}</p>
                          {m.sending && <Loader2 className="h-3 w-3 animate-spin mt-1" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <Separator />

              <div className="border-t p-4">
                <div className="flex items-center space-x-2">
                  <Textarea
                    placeholder="Type your reply..."
                    rows={2}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <Button onClick={handleSendReply} disabled={!replyMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a chat to view messages</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
