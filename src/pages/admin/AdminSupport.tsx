import { useState } from "react";
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

const mockChats: SupportChat[] = [
  {
    id: "SC-001",
    userId: "U-123",
    userName: "Sarah Johnson",
    userType: "writer",
    subject: "Account Activation Issue",
    status: "open",
    priority: "high",
    lastMessage:
      "I've submitted my activation fee but my account is still pending",
    lastMessageTime: "2024-01-10T15:30:00",
    messages: [
      {
        id: "1",
        sender: "user",
        text: "I've submitted my activation fee but my account is still pending",
        timestamp: "2024-01-10T15:30:00",
      },
    ],
  },
  {
    id: "SC-002",
    userId: "U-456",
    userName: "University Client",
    userType: "client",
    subject: "Payment Issue",
    status: "pending",
    priority: "medium",
    lastMessage: "When will the payment be processed?",
    lastMessageTime: "2024-01-10T14:20:00",
    messages: [
      {
        id: "1",
        sender: "user",
        text: "I approved a writer's submission yesterday but they haven't received payment",
        timestamp: "2024-01-10T14:15:00",
      },
      {
        id: "2",
        sender: "admin",
        text: "Thank you for reaching out. I'm checking on this now.",
        timestamp: "2024-01-10T14:18:00",
      },
      {
        id: "3",
        sender: "user",
        text: "When will the payment be processed?",
        timestamp: "2024-01-10T14:20:00",
      },
    ],
  },
];

export default function AdminSupport() {
  const { toast } = useToast();
  const [chats] = useState(mockChats);
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(
    chats[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [replyMessage, setReplyMessage] = useState("");

  const filteredChats = chats.filter(
    (chat) =>
      chat.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendReply = () => {
    if (!replyMessage.trim()) return;
    toast({
      title: "Reply Sent",
      description: "Your message has been sent to the user.",
    });
    setReplyMessage("");
  };

  const handleResolveChat = (chatId: string) => {
    toast({
      title: "Chat Resolved",
      description: "Support ticket has been marked as resolved.",
    });
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
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat?.id === chat.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm truncate">{chat.subject}</p>
                    <Badge
                      variant={getBadgeVariant(chat.priority)}
                      className="text-xs capitalize"
                    >
                      {chat.priority}
                    </Badge>
                  </div>

                  <p className="text-xs opacity-80 line-clamp-2 mb-2">
                    <span className="font-medium">{chat.userName}:</span>{" "}
                    {chat.lastMessage}
                  </p>

                  <div className="flex items-center justify-between text-xs opacity-70">
                    <Badge
                      variant={getBadgeVariant(chat.status)}
                      className="capitalize"
                    >
                      {chat.status}
                    </Badge>
                    <span>
                      {new Date(chat.lastMessageTime).toLocaleTimeString()}
                    </span>
                  </div>
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
                  {selectedChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "admin"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender === "admin"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <div className="flex items-center justify-end mt-2 space-x-1">
                          <span className="text-xs opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
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
