
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminCategories } from './components/AdminCategories';
import { AdminTools } from './components/AdminTools';
import { AdminUsers } from './components/AdminUsers';
import { NewProjectModal } from './components/NewProjectModal';
import { ToolActivationModal } from './components/ToolActivationModal';
import { useTools, useCategories } from './hooks/useTools';
import { useCategories } from './hooks/useCategories';
import type { DynamicTool, View, Project, ToolCategory, ChatHistoryItem } from './types';
import { XIcon } from './components/Icons';

// Rename Modal Component defined locally to avoid creating new files
const RenameModal: React.FC<{
    item: { id: string; name: string; type: 'project' | 'chat' } | null;
    onClose: () => void;
    onRename: (newName: string) => void;
}> = ({ item, onClose, onRename }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (item) {
            setName(item.name);
        }
    }, [item]);

    if (!item) return null;

    const handleRename = () => {
        if (name.trim()) {
            onRename(name.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/50 z-[1000] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-light-bg-component dark:bg-dark-bg-component rounded-lg shadow-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-4 lg:p-6 border-b border-light-border dark:border-dark-border flex justify-between items-center">
                    <h3 className="font-serif text-xl font-bold text-light-text-primary dark:text-dark-text-primary">Rename {item.type === 'project' ? 'Project' : 'Chat'}</h3>
                    <button onClick={onClose} className="text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-primary dark:hover:text-dark-text-primary">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6">
                    <label htmlFor="rename-input" className="block font-medium text-light-text-primary dark:text-dark-text-primary mb-2">Name</label>
                    <input
                        id="rename-input"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full p-2.5 bg-light-bg-component dark:bg-dark-bg-component border border-light-border dark:border-dark-border rounded-sm text-light-text-primary dark:text-dark-text-primary focus:border-primary-accent focus:ring-2 focus:ring-primary-accent/20 outline-none"
                        onKeyDown={e => e.key === 'Enter' && handleRename()}
                        autoFocus
                    />
                </div>
                <div className="p-4 lg:p-6 border-t border-light-border dark:border-dark-border flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 rounded-sm bg-light-bg-sidebar dark:bg-dark-bg-component border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary hover:opacity-85">Cancel</button>
                    <button onClick={handleRename} className="px-5 py-2 rounded-sm bg-primary-accent text-text-on-accent hover:opacity-85">Save</button>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [currentView, setCurrentView] = useState<View>('dashboard-view');
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [selectedTool, setSelectedTool] = useState<DynamicTool | null>(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [projects, setProjects] = useState<Project[]>([
        { id: 'proj-1', name: 'Q4 Email Campaign', tags: ['EMAIL_COPY', 'SALES_FUNNEL_COPY'] },
        { id: 'proj-2', name: 'Website Copy Revamp', tags: ['OTHER_FLOWS', 'COPY_IMPROVEMENT'] },
    ]);
    const [searchTerm, setSearchTerm] = useState('');

    const [favoriteTools, setFavoriteTools] = useState<string[]>(['hso', 'money-tales']);
    const [recentTools, setRecentTools] = useState<string[]>(['youtube', 'freestyle']);
    const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
    
    const [toolForActivation, setToolForActivation] = useState<DynamicTool | null>(null);
    const [dontShowAgainToolIds, setDontShowAgainToolIds] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('dontShowAgainToolIds');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [itemToRename, setItemToRename] = useState<{ id: string; name: string; type: 'project' | 'chat' } | null>(null);

    // Use dynamic tools and categories
    const { tools } = useTools();
    const { categories } = useCategories();

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
    }, [theme]);

    const handleToggleTheme = useCallback(() => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    }, []);

    const handleNavigate = useCallback((view: View) => {
        setCurrentView(view);
        
        // Handle admin mode transitions
        if (view.startsWith('admin-')) {
            setIsAdminMode(true);
        } else if (isAdminMode && !view.startsWith('admin-')) {
            setIsAdminMode(false);
        }
        
        setSidebarOpen(false);
        setSelectedTool(null);
        if (view !== 'all-tools-view') {
            setSearchTerm('');
        }
    }, []);

    const addRecentTool = (toolId: string) => {
        setRecentTools(prev => {
            const newRecents = [toolId, ...prev.filter(id => id !== toolId)];
            return newRecents.slice(0, 10);
        });
    };
    
    const handleStartToolSession = useCallback((tool: DynamicTool) => {
        addRecentTool(tool.id);
        setSelectedTool(tool);
        setCurrentView('tool-interface-view');
        setToolForActivation(null);
        setSidebarOpen(false);
    }, []);

    const handleInitiateToolActivation = useCallback((tool: DynamicTool) => {
        if (dontShowAgainToolIds.includes(tool.id)) {
            handleStartToolSession(tool);
        } else {
            setToolForActivation(tool);
        }
    }, [dontShowAgainToolIds, handleStartToolSession]);

    const handleSetDontShowAgain = (toolId: string, shouldAdd: boolean) => {
        setDontShowAgainToolIds(prev => {
            const newSet = new Set(prev);
            if (shouldAdd) {
                newSet.add(toolId);
            } else {
                newSet.delete(toolId);
            }
            const newList = Array.from(newSet);
            localStorage.setItem('dontShowAgainToolIds', JSON.stringify(newList));
            return newList;
        });
    };

    const handleCreateProject = useCallback((projectName: string, tags: ToolCategory[]) => {
        const newProject: Project = {
            id: `proj-${Date.now()}`,
            name: projectName || 'Untitled Project',
            tags,
        };
        setProjects(prevProjects => [...prevProjects, newProject]);
        setModalOpen(false);
    }, []);

    const handleSearchChange = useCallback((value: string) => {
      if (currentView !== 'all-tools-view') {
        setCurrentView('all-tools-view');
      }
      setSearchTerm(value);
    }, [currentView]);

    const handleToggleFavorite = useCallback((toolId: string) => {
        setFavoriteTools(prev => prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]);
    }, []);

    const handleSaveChat = useCallback((chat: Omit<ChatHistoryItem, 'id'>) => {
        setChatHistory(prev => [{ ...chat, id: Date.now().toString() }, ...prev]);
        handleNavigate('dashboard-view');
    }, [handleNavigate]);

    const handleClearHistory = useCallback(() => {
        setChatHistory([]);
    }, []);

    const handleDeleteProject = useCallback((projectId: string) => {
        if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            setProjects(prev => prev.filter(p => p.id !== projectId));
        }
    }, []);

    const handleDeleteChat = useCallback((chatId: string) => {
        if (window.confirm('Are you sure you want to delete this chat history? This action cannot be undone.')) {
            setChatHistory(prev => prev.filter(c => c.id !== chatId));
        }
    }, []);

    const handleRename = useCallback((newName: string) => {
        if (!itemToRename) return;

        if (itemToRename.type === 'project') {
            setProjects(prev => prev.map(p => p.id === itemToRename.id ? { ...p, name: newName } : p));
        } else if (itemToRename.type === 'chat') {
            setChatHistory(prev => prev.map(c => c.id === itemToRename.id ? { ...c, toolTitle: newName } : c));
        }

        setItemToRename(null);
    }, [itemToRename]);

    // Render admin interface
    if (isAdminMode) {
        const renderAdminView = () => {
            switch (currentView) {
                case 'admin-dashboard':
                    return <AdminDashboard />;
                case 'admin-categories':
                    return <AdminCategories />;
                case 'admin-tools':
                    return <AdminTools />;
                case 'admin-users':
                    return <AdminUsers />;
                default:
                    return <AdminDashboard />;
            }
        };

        return (
            <>
                <AdminLayout currentView={currentView} onNavigate={handleNavigate}>
                    {renderAdminView()}
                </AdminLayout>
                <style>{`
                    :root {
                        --primary-accent-color: #008F6B;
                        --text-on-accent-color: #FFFFFF;
                    }
                    .dark {
                        --primary-accent-color: #00FFB3;
                        --text-on-accent-color: #000000;
                    }
                `}</style>
            </>
        );
    }

    return (
        <>
            <div className={`page-overlay fixed inset-0 z-40 bg-black/40 dark:bg-black/50 transition-opacity lg:hidden ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setSidebarOpen(false)}></div>
            <div className="flex h-screen font-sans">
                <Sidebar
                    currentView={currentView}
                    isSidebarOpen={isSidebarOpen}
                    onNavigate={handleNavigate}
                    onNewProject={() => setModalOpen(true)}
                    projects={projects}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    favoriteTools={favoriteTools}
                    recentTools={recentTools}
                    chatHistory={chatHistory}
                    onInitiateToolActivation={handleInitiateToolActivation}
                    onClearHistory={handleClearHistory}
                    onOpenRenameModal={setItemToRename}
                    onDeleteProject={handleDeleteProject}
                    onDeleteChat={handleDeleteChat}
                />
                <MainContent
                    currentView={currentView}
                    selectedTool={selectedTool}
                    onInitiateToolActivation={handleInitiateToolActivation}
                    onNavigate={handleNavigate}
                    onToggleTheme={handleToggleTheme}
                    theme={theme}
                    onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    favoriteTools={favoriteTools}
                    onToggleFavorite={handleToggleFavorite}
                    onSaveChat={handleSaveChat}
                    projects={projects}
                    onNewProject={() => setModalOpen(true)}
                    onOpenRenameModal={setItemToRename}
                    onDeleteProject={handleDeleteProject}
                />
            </div>
            
            {/* Admin Access Button - Temporary for development */}
            <button
                onClick={() => handleNavigate('admin-dashboard')}
                className="fixed bottom-4 right-4 px-4 py-2 bg-red-600 text-white rounded-md shadow-lg hover:bg-red-700 transition-colors z-50"
            >
                Admin Panel
            </button>
            
            <NewProjectModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onCreate={handleCreateProject}
                categories={categories.map(cat => cat.name as ToolCategory)}
            />
            <ToolActivationModal
                tool={toolForActivation}
                onClose={() => setToolForActivation(null)}
                onStart={handleStartToolSession}
                onSetDontShowAgain={handleSetDontShowAgain}
            />
            <RenameModal
                item={itemToRename}
                onClose={() => setItemToRename(null)}
                onRename={handleRename}
            />
        </>
    );
};

export default App;
