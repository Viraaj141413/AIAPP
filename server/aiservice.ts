// External Claude API configuration
const CLAUDE_API_URL = "https://replitback.created.app/api/claude-chat";

// Claude API service
async function chatWithClaude(message: string): Promise<string> {
  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return data.response;
      } else {
        throw new Error(data.error || 'Unknown error from Claude API');
      }
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error: any) {
    console.error('Claude API Error:', error);
    throw new Error(`Failed to communicate with Claude API: ${error.message}`);
  }
}

export interface ProjectStructure {
  type: string;
  name: string;
  description: string;
  files: FileStructure[];
  dependencies?: string[];
  commands?: {
    install?: string;
    dev?: string;
    build?: string;
  };
}

export interface FileStructure {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileStructure[];
}

export class AIService {
  async analyzeProjectRequest(userMessage: string): Promise<{
    projectType: string;
    analysis: string;
    complexity: 'simple' | 'medium' | 'complex';
  }> {
    try {
      const prompt = `You are PEAKS AI, an expert software architect. Analyze the user's request and determine:
1. What type of project they want (React App, Python Tool, Website, Node.js API, etc.)
2. Brief analysis of what they're asking for
3. Complexity level (simple/medium/complex)

Respond in JSON format with keys: "projectType", "analysis", "complexity"

User request: ${userMessage}`;

      const response = await chatWithClaude(prompt);
      const result = JSON.parse(response);
      return {
        projectType: result.projectType || 'Web Application',
        analysis: result.analysis || 'Creating a basic web application',
        complexity: result.complexity || 'medium'
      };
    } catch (error) {
      console.error('Error analyzing project request:', error);
      return {
        projectType: 'Web Application',
        analysis: 'Creating a basic web application based on your request',
        complexity: 'medium'
      };
    }
  }

  async generateProjectStructure(
    userMessage: string, 
    projectType: string
  ): Promise<ProjectStructure> {
    try {
      const prompt = `You are PEAKS AI, an expert full-stack developer. Generate a complete project structure for the user's request.

Create a JSON response with:
- type: project type
- name: project name
- description: brief description
- files: array of file/folder objects with structure and content
- dependencies: array of required packages
- commands: install, dev, build commands

For files, include actual working code content. Create proper folder structures.
Support: React, Vue, Python, Node.js, HTML/CSS/JS, and more.

Make the code production-ready and functional.

Create a ${projectType} based on this request: ${userMessage}`;

      const response = await chatWithClaude(prompt);
      const result = JSON.parse(response);
      return result;
    } catch (error) {
      console.error('Error generating project structure:', error);
      return this.getDefaultProjectStructure(projectType, userMessage);
    }
  }

  async enhanceProject(
    currentFiles: FileStructure[],
    userMessage: string,
    projectType: string
  ): Promise<FileStructure[]> {
    try {
      const prompt = `You are PEAKS AI. The user wants to enhance their existing project. 
Analyze their current files and their new request, then return the updated file structure.

Current project type: ${projectType}
Return complete updated file structure as JSON array.

Current files: ${JSON.stringify(currentFiles, null, 2)}

New request: ${userMessage}

Please update the project with the requested changes.`;

      const response = await chatWithClaude(prompt);
      const result = JSON.parse(response);
      return Array.isArray(result) ? result : result.files || currentFiles;
    } catch (error) {
      console.error('Error enhancing project:', error);
      return currentFiles;
    }
  }

  private getDefaultProjectStructure(projectType: string, userMessage: string): ProjectStructure {
    const templates: Record<string, ProjectStructure> = {
      'React App': {
        type: 'React App',
        name: 'React Application',
        description: 'A modern React application',
        files: [
          {
            name: 'package.json',
            type: 'file',
            content: JSON.stringify({
              name: 'react-app',
              version: '1.0.0',
              dependencies: {
                'react': '^18.2.0',
                'react-dom': '^18.2.0'
              },
              scripts: {
                'dev': 'vite',
                'build': 'vite build'
              }
            }, null, 2)
          },
          {
            name: 'src',
            type: 'folder',
            children: [
              {
                name: 'App.jsx',
                type: 'file',
                content: `function App() {
  return (
    <div className="app">
      <h1>Welcome to Your React App</h1>
      <p>Built with PEAKS AI</p>
    </div>
  );
}

export default App;`
              },
              {
                name: 'main.jsx',
                type: 'file',
                content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
              },
              {
                name: 'index.css',
                type: 'file',
                content: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 0;
  background: #f5f5f5;
}

.app {
  text-align: center;
  padding: 2rem;
}

h1 {
  color: #333;
  margin-bottom: 1rem;
}`
              }
            ]
          },
          {
            name: 'index.html',
            type: 'file',
            content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`
          }
        ],
        dependencies: ['react', 'react-dom', 'vite'],
        commands: {
          install: 'npm install',
          dev: 'npm run dev',
          build: 'npm run build'
        }
      },
      'Website': {
        type: 'Website',
        name: 'Website',
        description: 'A modern website',
        files: [
          {
            name: 'index.html',
            type: 'file',
            content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>Welcome to My Website</h1>
  </header>
  <main>
    <p>Built with PEAKS AI</p>
  </main>
  <script src="script.js"></script>
</body>
</html>`
          },
          {
            name: 'style.css',
            type: 'file',
            content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: #333;
}

header {
  background: #6366f1;
  color: white;
  text-align: center;
  padding: 2rem;
}

main {
  padding: 2rem;
  text-align: center;
}`
          },
          {
            name: 'script.js',
            type: 'file',
            content: `document.addEventListener('DOMContentLoaded', function() {
  console.log('Website loaded successfully!');
});`
          }
        ]
      }
    };

    return templates[projectType] || templates['Website'];
  }
}

export const aiService = new AIService();
