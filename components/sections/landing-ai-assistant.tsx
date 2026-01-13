"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Credenza as Dialog, CredenzaContent as DialogContent, CredenzaDescription as DialogDescription, CredenzaHeader as DialogHeader, CredenzaTitle as DialogTitle, CredenzaTrigger as DialogTrigger } from "@/components/ui/credenza";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import { MarkdownContent } from "@/components/ui/markdown-content";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const quickPrompts = [
  "How does pooling work for bulk discounts?",
  "What verification documents should a supplier prepare?",
  "Can you explain dynamic pricing to my team?",
];

export function LandingAIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = (await response.json()) as { text?: string };
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.text || "Sorry, I couldn't generate a response.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <Button
          size="lg"
          className="fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-full h-14 w-14 flex items-center justify-center"
          aria-label="Open AI Assistant"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      }>
        <span className="sr-only">Open AI Assistant</span>
      </DialogTrigger>
      <DialogContent className="min-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>AI Assistant</DialogTitle>
            <Badge variant="secondary">Preview</Badge>
          </div>
          <DialogDescription>
            Ask questions about onboarding, verification, pooling, and pricing. The assistant responds instantly.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 flex-1 overflow-hidden max-sm:px-4">
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <Button
                key={prompt}
                type="button"
                variant="outline"
                size={'badge'}
                className="justify-start whitespace-normal text-left text-xs truncate"
                onClick={() => setInput(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>

          <div className="rounded-xl border bg-muted/30 p-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2">
              {messages.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Start the conversation by selecting a prompt or typing your question below.
                </p>
              )}
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex w-full",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-xl px-4 py-3 text-sm",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border"
                      )}
                    >
                      <MarkdownContent content={message.content} />
                    </div>
                  </div>
                ))}
              </div>
              <div ref={endRef} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about verification, pools, pricing tiers..."
              aria-label="Ask the BulkBuddy assistant"
              required
            />
            <Button type="submit" disabled={isLoading} className="sm:w-32">
              {isLoading ? "Thinking..." : "Ask"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
