import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ChatPanelProps {
  project: any;
  isGenerating: boolean;
  onGenerating: (generating: boolean) => void;
  onLoadingMessage: (message: string) => void;
  onProjectUpdate: (project: any) => void;
}

export default function ChatPanel({
  project,
  isGenerating,
  onGenerating,
  onLoadingMessage,
  onProjectUpdate
}: ChatPanelProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get chat messages
  const { data: messages = [] } = useQuery({
    queryKey: [`/api/projects/${project?.id}/messages`],
    enabled: !!project?.id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/projects/${project.id}/chat`, {
        message: content
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${project?.id}/messages`] 
      });
    }
  });

  // AI generation mutation
  const generateMutation = useMutation({
    mutationFn: async (content: string) => {
      // First analyze the request
      onLoadingMessage("PEAKS is analyzing your request...");
      onGenerating(true);
      
      const analysisResponse = await apiRequest("POST", "/api/ai/analyze", {
        message: content
      });
      const analysis = await analysisResponse.json();
      
      onLoadingMessage(`PEAKS is making the ${analysis.projectType}...`);
      
      // Generate the project
      const generateResponse = await apiRequest("POST", "/api/ai/generate", {
        message: content,
        projectType: analysis.projectType,
        projectId: project.id
      });
      
      return generateResponse.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${project?.id}/messages`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${project?.id}`] 
      });
      
      if (data.project) {
        onProjectUpdate(data.project);
      }
      
      onGenerating(false);
      toast({
        title: "Project Updated",
        description: "PEAKS has successfully updated your project!",
      });
    },
    onError: (error) => {
      onGenerating(false);
      toast({
        title: "Generation Failed",
        description: "Unable to generate project. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = async () => {
    if (!message.trim() || !project?.id || isGenerating) return;

    const content = message.trim();
    setMessage("");
    
    // Send user message
    await sendMessageMutation.mutateAsync(content);
    
    // Generate AI response
    await generateMutation.mutateAsync(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestProject = (type: string) => {
    setMessage(`Create a ${type}`);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <div className="w-1/2 flex flex-col border-r border-border">
      {/* Chat Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">PEAKS AI</h3>
            <p className="text-xs text-muted-foreground">Ready to build anything</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="bg-secondary rounded-2xl rounded-tl-md p-4">
                  <p className="text-sm mb-3">
                    Hi! I'm PEAKS, your AI app builder. What would you like to create today? I can help you build:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'React App', icon: '⚛️' },
                      { name: 'Python Tool', icon: '🐍' },
                      { name: 'Website', icon: '🌐' },
                      { name: 'Node.js API', icon: '📡' }
                    ].map((type) => (
                      <Button
                        key={type.name}
                        variant="ghost"
                        size="sm"
                        onClick={() => suggestProject(type.name)}
                        className="justify-start h-auto p-2 bg-background hover:bg-border"
                      >
                        <span className="mr-2">{type.icon}</span>
                        <span className="text-xs">{type.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((msg: any) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'justify-end' : ''
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
              )}
              
              <div className={`flex-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`rounded-2xl p-4 inline-block max-w-md ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-md'
                      : 'bg-secondary rounded-tl-md'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-white">U</span>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="bg-secondary rounded-2xl rounded-tl-md p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              placeholder="Describe what you want to build..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[44px] max-h-[120px] resize-none bg-background border-border focus:border-primary"
              disabled={isGenerating}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || !project?.id || isGenerating}
            className="bg-primary hover:bg-blue-600 px-4 py-3"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Press Enter to send</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Claude AI Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
