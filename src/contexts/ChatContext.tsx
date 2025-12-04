import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import api from "@/lib/api";

interface Chat {
  id: string;
  order_id: string;
  last_message?: {
    content: string;
    sent_at: string;
    is_read: boolean;
  };
  unread_count: number;
}

interface ChatContextType {
  chats: Chat[];
  unreadChats: number;
  refreshChats: () => Promise<void>;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [unreadChats, setUnreadChats] = useState(0);

  const refreshChats = useCallback(async () => {
    try {
      const res = await api.get("/chats", { params: { limit: 100 } });
      const fetchedChats: Chat[] = res.data?.data?.chats || [];
      setChats(fetchedChats);

      const unread = fetchedChats.reduce((acc, chat) => acc + (chat.unread_count || 0), 0);
      setUnreadChats(unread);
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    }
  }, []);

  useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  return (
    <ChatContext.Provider value={{ chats, unreadChats, refreshChats, setChats }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
};
