import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  const [showAuth, setShowAuth] = useState(false);
  const [demoInput, setDemoInput] = useState("");

  const handleStartChat = () => {
    if (demoInput.trim()) {
      // Redirect to login
      window.location.href = "/api/login";
    }
  };

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, hsl(237, 91%, 70%) 0%, transparent 50%), radial-gradient(circle at 75% 75%, hsl(250, 65%, 70%) 0%, transparent 50%)'
          }}
        />
      </div>

      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.93 4.93L19.07 19.07M8 8L16 16M12 2L12 22" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              PeaksAI
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={handleLogin}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Button>
            <Button 
              onClick={handleLogin}
              className="bg-primary hover:bg-blue-600 transform hover:scale-105 transition-all duration-200"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="text-center z-10 max-w-4xl mx-auto px-6">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
            Build Anything with AI
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Create full-stack applications, websites, and tools using natural language. No coding experience required.
          </p>

          {/* Demo Input */}
          <Card className="bg-secondary/80 backdrop-blur-sm border-border/50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Hi PEAKS, what do you want to make?"
                    value={demoInput}
                    onChange={(e) => setDemoInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleStartChat()}
                    className="w-full bg-transparent text-lg border-none focus:ring-0 placeholder:text-muted-foreground"
                  />
                </div>
                <Button 
                  onClick={handleStartChat}
                  className="bg-primary hover:bg-blue-600 transform hover:scale-105 transition-all duration-200"
                >
                  Start Chat
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="bg-secondary/50 backdrop-blur-sm border-border/30">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Multi-Language Support</h3>
                <p className="text-muted-foreground">Python, JavaScript, React, Node.js, and more</p>
              </CardContent>
            </Card>

            <Card className="bg-secondary/50 backdrop-blur-sm border-border/30">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Live Preview</h3>
                <p className="text-muted-foreground">See your app come to life in real-time</p>
              </CardContent>
            </Card>

            <Card className="bg-secondary/50 backdrop-blur-sm border-border/30">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Export & Deploy</h3>
                <p className="text-muted-foreground">Download your project or deploy instantly</p>
              </CardContent>
            </Card>
          </div>

          {/* Popular Project Types */}
          <div className="mt-16">
            <h3 className="text-2xl font-semibold mb-6">Popular Project Types</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { name: "React App", icon: "⚛️", color: "bg-blue-500/10 text-blue-400" },
                { name: "Python Tool", icon: "🐍", color: "bg-yellow-500/10 text-yellow-400" },
                { name: "Website", icon: "🌐", color: "bg-green-500/10 text-green-400" },
                { name: "Node.js API", icon: "📡", color: "bg-purple-500/10 text-purple-400" },
                { name: "JavaScript Game", icon: "🎮", color: "bg-red-500/10 text-red-400" },
                { name: "Dashboard", icon: "📊", color: "bg-indigo-500/10 text-indigo-400" }
              ].map((type) => (
                <Badge 
                  key={type.name}
                  variant="secondary" 
                  className={`${type.color} px-4 py-2 text-sm cursor-pointer hover:scale-105 transition-transform`}
                  onClick={() => setDemoInput(`Create a ${type.name}`)}
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
