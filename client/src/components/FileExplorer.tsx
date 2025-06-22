import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FileStructure {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileStructure[];
}

interface FileExplorerProps {
  isOpen: boolean;
  project: any;
  onNewProject: () => void;
  onProjectUpdate: (project: any) => void;
}

export default function FileExplorer({ 
  isOpen, 
  project, 
  onNewProject, 
  onProjectUpdate 
}: FileExplorerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const downloadMutation = useMutation({
    mutationFn: async () => {
      if (!project?.id) throw new Error("No project selected");
      
      const response = await fetch(`/api/projects/${project.id}/download`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error("Download failed");
      
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project?.name || 'project'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: "Your project has been downloaded successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Download Failed",
        description: "Unable to download project. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      'js': '🟨',
      'jsx': '⚛️',
      'ts': '🔷',
      'tsx': '⚛️',
      'html': '🟧',
      'css': '🎨',
      'py': '🐍',
      'json': '📋',
      'md': '📝',
      'txt': '📄'
    };
    return iconMap[ext || ''] || '📄';
  };

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (files: FileStructure[], level = 0, parentPath = '') => {
    return files.map((file, index) => {
      const filePath = parentPath ? `${parentPath}/${file.name}` : file.name;
      
      if (file.type === 'folder') {
        const isExpanded = expandedFolders.has(filePath);
        
        return (
          <div key={`${filePath}-${index}`}>
            <div
              className="flex items-center space-x-2 p-2 hover:bg-primary/10 rounded cursor-pointer transition-colors"
              style={{ paddingLeft: `${level * 16 + 8}px` }}
              onClick={() => toggleFolder(filePath)}
            >
              <svg 
                className={`w-3 h-3 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
              <span className="text-yellow-500">📁</span>
              <span className="text-sm">{file.name}</span>
            </div>
            {isExpanded && file.children && (
              <div>
                {renderFileTree(file.children, level + 1, filePath)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div
            key={`${filePath}-${index}`}
            className="flex items-center space-x-2 p-2 hover:bg-primary/10 rounded cursor-pointer transition-colors"
            style={{ paddingLeft: `${level * 16 + 24}px` }}
            onClick={() => {
              toast({
                title: "File Selected",
                description: `Opened ${file.name}`,
              });
            }}
          >
            <span>{getFileIcon(file.name)}</span>
            <span className="text-sm">{file.name}</span>
          </div>
        );
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="w-64 bg-secondary border-r border-border flex flex-col transition-all duration-300">
      {/* File Explorer Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Files</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewProject}
              className="h-6 w-6 p-0 hover:bg-primary/10"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-primary/10"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {project?.files && Array.isArray(project.files) && project.files.length > 0 ? (
            renderFileTree(project.files)
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <div className="text-2xl mb-2">📂</div>
              <p className="text-sm">No files yet</p>
              <p className="text-xs mt-1">Start chatting to create your first project</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Project Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          onClick={() => downloadMutation.mutate()}
          disabled={!project?.files?.length || downloadMutation.isPending}
          className="w-full bg-primary hover:bg-blue-600 text-sm"
        >
          {downloadMutation.isPending ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Downloading...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              Download
            </>
          )}
        </Button>
        
        <Button
          variant="secondary"
          className="w-full text-sm"
          onClick={() => {
            toast({
              title: "Deploy Coming Soon",
              description: "Deployment feature will be available soon!",
            });
          }}
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Deploy
        </Button>
      </div>
    </div>
  );
}
