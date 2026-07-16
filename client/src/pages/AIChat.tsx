import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Loader2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { aiService, ChatMessage } from "@/services/ai";
import { toast } from "sonner";

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await aiService.getChatHistory();
        if (history.length > 0) {
          setMessages(history);
        } else {
          setMessages([
            {
              id: "1",
              role: "assistant",
              content:
                "Hello! I'm StadiumIQ AI, your intelligent stadium assistant. I can help you with navigation, food recommendations, crowd information, and much more. What can I help you with today?",
              timestamp: new Date(),
            },
          ]);
        }
      } catch (e) {
        console.error("Failed to load chat history:", e);
      }
    }
    loadHistory();
  }, []);

  const handleSendMessage = async (customMessage?: string) => {
    const messageText = customMessage || input;
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customMessage) {
      setInput("");
    }
    setIsLoading(true);

    try {
      const response = await aiService.sendMessage(messageText, messages);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Failed to send message.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      const success = await aiService.clearHistory();
      if (success) {
        setMessages([
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Conversation history cleared. How can I help you today?",
            timestamp: new Date(),
          },
        ]);
        toast.success("History cleared successfully!");
      }
    } catch (e) {
      toast.error("Failed to clear chat history.");
    }
  };

  const suggestedQuestions = [
    "Where is Gate 5?",
    "Which washroom has the shortest queue?",
    "Find less crowded food stalls",
    "How do I reach my seat?",
    "What's the nearest exit?",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 h-full flex flex-col">
          {/* Header */}
          <div className="mb-8 animate-slide-in-down flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <MessageSquare size={20} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  AI Stadium Assistant
                </h1>
                <p className="text-muted-foreground text-sm">
                  Ask me anything about the stadium, navigation, food, or emergencies
                </p>
              </div>
            </div>
            {messages.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearHistory}
                className="btn-press flex items-center gap-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 size={16} />
                Clear Chat
              </Button>
            )}
          </div>

          {/* Chat Container */}
          <div className="flex-1 bg-card rounded-lg border border-border shadow-sm mb-6 overflow-hidden flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <MessageSquare
                      size={48}
                      className="mx-auto text-muted-foreground/50 mb-4"
                    />
                    <p className="text-muted-foreground">
                      Start a conversation with StadiumIQ AI
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`animate-slide-in-up flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-muted text-foreground rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.role === "user"
                            ? "text-indigo-100"
                            : "text-muted-foreground"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="animate-slide-in-up flex justify-start">
                  <div className="bg-muted text-muted-foreground px-4 py-3.5 rounded-lg rounded-bl-none flex items-center gap-1.5 shadow-sm border border-border">
                    <span className="sr-only">AI is typing...</span>
                    <div className="w-2.5 h-2.5 bg-muted-foreground/60 rounded-full bounce-dot" />
                    <div className="w-2.5 h-2.5 bg-muted-foreground/60 rounded-full bounce-dot" />
                    <div className="w-2.5 h-2.5 bg-muted-foreground/60 rounded-full bounce-dot" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-4 bg-muted/50">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !isLoading) {
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                  className="btn-press"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !input.trim()}
                  className="btn-press bg-indigo-600 hover:bg-indigo-700"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </div>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <div className="animate-fade-in">
              <p className="text-sm text-muted-foreground mb-3 font-medium">
                Try asking:
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleSendMessage(question);
                    }}
                    className="card-hover p-3 bg-card rounded-lg border border-border text-left text-sm text-foreground hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
