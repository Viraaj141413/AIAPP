import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PreviewPanelProps {
  project: any;
}

export default function PreviewPanel({ project }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'console' | 'browser'>('preview');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    '$ Ready for commands...'
  ]);

  const switchTab = (tab: 'preview' | 'console' | 'browser') => {
    setActiveTab(tab);
  };

  const refreshPreview = () => {
    setConsoleOutput(prev => [...prev, '$ Refreshing preview...']);
  };

  const openInNewTab = () => {
    if (project?.id) {
      window.open(`/api/projects/${project.id}/preview`, '_blank');
    }
  };

  return (
    <div className="w-1/2 flex flex-col">
      {/* Preview Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="font-semibold">Preview</h3>
            
            <div className="flex items-center space-x-1">
              <Button
                variant={activeTab === 'preview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => switchTab('preview')}
                className="px-3 py-1 text-xs h-7"
              >
                Preview
              </Button>
              <Button
                variant={activeTab === 'console' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => switchTab('console')}
                className="px-3 py-1 text-xs h-7"
              >
                Console
              </Button>
              <Button
                variant={activeTab === 'browser' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => switchTab('browser')}
                className="px-3 py-1 text-xs h-7"
              >
                Browser
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshPreview}
              className="p-2 hover:bg-background"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={openInNewTab}
              className="p-2 hover:bg-background"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative">
        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="absolute inset-0">
            {project?.files && Array.isArray(project.files) && project.files.length > 0 ? (
              <iframe
                src={`/api/projects/${project.id}/preview`}
                className="w-full h-full border-0"
                title="Project Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-white text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-4">👁️</div>
                  <p className="text-lg font-medium text-gray-800">No Preview Available</p>
                  <p className="text-sm mt-2">Start building your app to see it here</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Console Tab */}
        {activeTab === 'console' && (
          <div className="absolute inset-0 bg-background p-4 font-mono text-sm">
            <div className="h-full overflow-y-auto space-y-1">
              {consoleOutput.map((line, index) => (
                <div key={index} className="text-foreground">
                  {line.startsWith('$') ? (
                    <span>
                      <span className="text-green-500">$</span>
                      <span className="ml-1">{line.substring(1)}</span>
                    </span>
                  ) : (
                    <span>{line}</span>
                  )}
                </div>
              ))}
              {project?.files?.length > 0 && (
                <>
                  <div className="text-green-500">$ Installing dependencies...</div>
                  <div className="text-muted-foreground">✓ Dependencies installed</div>
                  <div className="text-green-500">$ Starting development server...</div>
                  <div className="text-muted-foreground">✓ Server ready on port 3000</div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Browser Tab */}
        {activeTab === 'browser' && (
          <div className="absolute inset-0 bg-background">
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-4xl mb-4">🌐</div>
                <p className="text-lg font-medium">Browser View</p>
                <p className="text-sm mt-2">
                  {project?.files?.length > 0 
                    ? "Your project is ready to view in browser"
                    : "Create your app to see it in the browser"
                  }
                </p>
                {project?.files?.length > 0 && (
                  <Button
                    onClick={openInNewTab}
                    className="mt-4 bg-primary hover:bg-blue-600"
                  >
                    Open in New Tab
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
