import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { aiService } from "./aiService";
import { projectService } from "./projectService";
import { insertProjectSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Project routes
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId
      });
      
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user owns the project or it's public
      if (project.userId !== req.user.claims.sub && !project.isPublic) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.put('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const updated = await storage.updateProject(projectId, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      await storage.deleteProject(projectId);
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Chat routes
  app.get('/api/projects/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== req.user.claims.sub && !project.isPublic) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const messages = await storage.getProjectMessages(projectId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/projects/:id/chat', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Save user message
      const userMessage = await storage.createChatMessage({
        projectId,
        sender: 'user',
        content: message
      });
      
      res.json({ message: userMessage });
    } catch (error) {
      console.error("Error saving chat message:", error);
      res.status(500).json({ message: "Failed to save message" });
    }
  });

  // AI routes
  app.post('/api/ai/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const { message } = req.body;
      const analysis = await aiService.analyzeProjectRequest(message);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing request:", error);
      res.status(500).json({ message: "Failed to analyze request" });
    }
  });

  app.post('/api/ai/generate', isAuthenticated, async (req: any, res) => {
    try {
      const { message, projectType, projectId } = req.body;
      
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      let structure;
      if (project.files && Array.isArray(project.files) && project.files.length > 0) {
        // Enhance existing project
        structure = await aiService.enhanceProject(project.files as any, message, projectType);
      } else {
        // Generate new project
        const fullStructure = await aiService.generateProjectStructure(message, projectType);
        structure = fullStructure.files;
      }
      
      // Update project with new files
      const updatedProject = await storage.updateProject(projectId, {
        files: structure as any,
        type: projectType
      });
      
      // Save AI response message
      const projectFiles = project?.files;
      const hasExistingFiles = projectFiles && typeof projectFiles === 'object' && 
        ((Array.isArray(projectFiles) && projectFiles.length > 0) || 
         (!Array.isArray(projectFiles) && Object.keys(projectFiles).length > 0));
      
      await storage.createChatMessage({
        projectId,
        sender: 'ai',
        content: `I've ${hasExistingFiles ? 'enhanced' : 'created'} your ${projectType}! The project structure has been updated with new files and functionality.`
      });
      
      res.json({ 
        project: updatedProject,
        files: structure 
      });
    } catch (error) {
      console.error("Error generating project:", error);
      res.status(500).json({ message: "Failed to generate project" });
    }
  });

  // Download route
  app.get('/api/projects/:id/download', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (!project.files || !Array.isArray(project.files)) {
        return res.status(400).json({ message: "No files to download" });
      }
      
      const zipBuffer = await projectService.generateZip(
        project.files as any, 
        project.name
      );
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${project.name}.zip"`);
      res.send(zipBuffer);
    } catch (error) {
      console.error("Error downloading project:", error);
      res.status(500).json({ message: "Failed to download project" });
    }
  });

  // Preview route
  app.get('/api/projects/:id/preview', async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project || (!project.isPublic && !req.user)) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (!project.files || !Array.isArray(project.files)) {
        return res.status(400).json({ message: "No preview available" });
      }
      
      const previewHtml = projectService.generatePreviewHtml(
        project.files as any,
        project.type
      );
      
      res.setHeader('Content-Type', 'text/html');
      res.send(previewHtml);
    } catch (error) {
      console.error("Error generating preview:", error);
      res.status(500).json({ message: "Failed to generate preview" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket connection established');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'join_project') {
          // Join project room for real-time updates
          (ws as any).projectId = message.projectId;
        }
        
        if (message.type === 'ai_chat') {
          // Handle real-time AI chat
          const { projectId, content } = message;
          
          // Broadcast typing indicator
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN && 
                (client as any).projectId === projectId) {
              client.send(JSON.stringify({
                type: 'ai_typing',
                isTyping: true
              }));
            }
          });
          
          // Process AI response (simplified for real-time)
          setTimeout(() => {
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN && 
                  (client as any).projectId === projectId) {
                client.send(JSON.stringify({
                  type: 'ai_typing',
                  isTyping: false
                }));
                client.send(JSON.stringify({
                  type: 'ai_message',
                  content: 'I\'m working on your request...'
                }));
              }
            });
          }, 2000);
        }
        
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
