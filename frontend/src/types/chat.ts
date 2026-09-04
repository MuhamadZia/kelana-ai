export interface Message {
  id:              number;
  conversation_id: number;
  role:            "user" | "assistant";
  content:         string;
  created_at:      string;
}

export interface Conversation {
  id:         number;
  user_id?:   number;
  title:      string;
  created_at: string;
  updated_at: string;
  messages?:  Message[];
}

export interface SendMessagePayload {
  content: string;
}
