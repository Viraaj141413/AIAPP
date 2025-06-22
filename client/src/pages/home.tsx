import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import FileExplorer from "@/components/FileExplorer";
import ChatPanel from "@/components/ChatPanel";
import PreviewPanel from "@/components/PreviewPanel";
import LoadingOverlay from "@/components/LoadingOverlay";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [match, params] = useRoute("/project/:id");
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Get projects
  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
    enabled: !!user,
  });

  // Get current project
  const { data: project } = useQuery({
    queryKey: [`/api/projects/${params?.id}`],
    enabled: !!params?.id,
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json();
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setCurrentProject(newProject);
      toast({
        title: "Project Created",
        description: "Your new project is ready!",
      });
    },
  });

  useEffect(() => {
    if (project) {
      setCurrentProject(project);
    } else if (projects?.length > 0 && !params?.id) {
      setCurrentProject(projects[0]);
    }
  }, [project, projects, params?.id]);

  const handleNewProject = async () => {
    if (!user) return;

    const projectData = {
      name: "Untitled Project",
      description: "A new project created with PEAKS AI",
      type: "website",
      files: [],
    };

    createProjectMutation.mutate(projectData);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (authLoading) {
    return <LoadingOverlay 
      isVisible={true} 
      title="Loading PEAKS AI..." 
      message="Preparing your workspace" 
    />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-secondary border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-primary/10"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gradient-to-r from-primary to-purple-500 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.93 4.93L19.07 19.07M8 8L16 16M12 2L12 22" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <span className="font-bold">PeaksAI</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-2 bg-background rounded-lg px-3 py-1">
            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-sm">
              {currentProject?.name || "Untitled Project"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 bg-background rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">AI Ready</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground p-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5z"/>
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <FileExplorer
          isOpen={sidebarOpen}
          project={currentProject}
          onNewProject={handleNewProject}
          onProjectUpdate={setCurrentProject}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Chat Panel */}
          <ChatPanel
            project={currentProject}
            isGenerating={isGenerating}
            onGenerating={setIsGenerating}
            onLoadingMessage={setLoadingMessage}
            onProjectUpdate={setCurrentProject}
          />

          {/* Preview Panel */}
          <PreviewPanel
            project={currentProject}
          />
        </div>
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={isGenerating}
        title={loadingMessage}
        message="Please wait while PEAKS creates your project"
      />
    </div>
  );
}
