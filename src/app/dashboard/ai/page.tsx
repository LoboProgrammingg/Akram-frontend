"use client";

import { useState, useRef, useEffect } from "react";
import { aiApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, Loader2, User, Bot, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "Quais produtos vencem essa semana?",
  "Qual o custo total dos produtos muito críticos?",
  "Quantos produtos estão vencidos?",
  "Quais produtos da filial 3B estão em atenção?",
  "Qual o produto mais próximo de vencer?",
];

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (question?: string) => {
    const q = question || input.trim();
    if (!q) return;

    const userMsg: Message = { role: "user", content: q, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await aiApi.query(q);
      const aiMsg: Message = { role: "ai", content: res.data.answer, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const aiMsg: Message = {
        role: "ai",
        content: err.response?.data?.detail || "Erro ao processar pergunta. Verifique se há produtos importados.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in-up h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          IA / RAG
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Faça perguntas sobre os produtos usando inteligência artificial
        </p>
      </div>

      {/* Chat Area */}
      <Card className="glass-card border-0 flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Assistente de Validade</h3>
              <p className="text-xs text-muted-foreground text-center max-w-md mb-6">
                Pergunte sobre produtos, validades, custos e classificações.
                A IA utiliza os dados importados via planilha.
              </p>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "ai" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-lg ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-white/5 border border-white/10 rounded-bl-md backdrop-blur-sm"
                  }`}
                >
                  {msg.role === "user" ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="w-full border-collapse border border-white/10 text-xs" {...props} /></div>,
                          thead: ({node, ...props}) => <thead className="bg-white/10" {...props} />,
                          th: ({node, ...props}) => <th className="border border-white/10 px-3 py-2 text-left font-semibold text-purple-300" {...props} />,
                          td: ({node, ...props}) => <td className="border border-white/10 px-3 py-2" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-purple-300" {...props} />,
                          a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-500 pl-4 py-1 my-2 bg-white/5 italic" {...props} />,
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  <p className="text-[10px] mt-2 opacity-50 text-right">
                    {msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre os produtos..."
              disabled={loading}
              className="bg-white/5 border-white/10 h-11 focus:border-purple-500/50 focus:ring-purple-500/20"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 h-11 px-5 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
