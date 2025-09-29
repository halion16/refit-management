import { useState, useEffect } from 'react';
import { Project, STORAGE_KEYS } from '@/types';

export const useProjects = () => {
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProjects = (projects: Project[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
      setData(projects);
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  };

  const addItem = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
    };
    const updatedProjects = [...data, newProject];
    saveProjects(updatedProjects);
    return newProject;
  };

  const updateItem = (id: string, updates: Partial<Project>) => {
    const updatedProjects = data.map(project =>
      project.id === id ? { ...project, ...updates } : project
    );
    saveProjects(updatedProjects);
  };

  const deleteItem = (id: string) => {
    const updatedProjects = data.filter(project => project.id !== id);
    saveProjects(updatedProjects);
  };

  return {
    data,
    loading,
    error: null,
    addItem,
    updateItem,
    deleteItem,
    refresh: loadProjects
  };
};