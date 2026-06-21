import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StockProvider } from './context/StockContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { ArticleList } from './components/articles/ArticleList';
import { CategoryManager } from './components/catalog/CategoryManager';
import { AuditLog } from './components/audit/AuditLog';
import { UserManagement } from './components/admin/UserManagement';
import { SecurityDocs } from './components/settings/SecurityDocs';
import { LoginView } from './components/auth/LoginView';
import { ArticleFormModal } from './components/articles/ArticleFormModal';
import { StockMovementModal } from './components/stock/StockMovementModal';
import { Article } from './types';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modals state
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedArticuloId, setSelectedArticuloId] = useState<string | undefined>(undefined);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleOpenArticleModal = (art?: Article) => {
    setEditingArticle(art || null);
    setIsArticleModalOpen(true);
  };

  const handleOpenMovementModal = (articuloId?: string) => {
    setSelectedArticuloId(articuloId);
    setIsMovementModalOpen(true);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenMovementModal={handleOpenMovementModal}
            onOpenArticleModal={() => handleOpenArticleModal()}
          />
        );
      case 'articles':
        return (
          <ArticleList
            onOpenArticleModal={handleOpenArticleModal}
            onOpenMovementModal={handleOpenMovementModal}
          />
        );
      case 'categories':
        return <CategoryManager />;
      case 'audit':
        return <AuditLog />;
      case 'users':
        return <UserManagement />;
      case 'security':
        return <SecurityDocs />;
      default:
        return <Dashboard onNavigate={(tab) => setActiveTab(tab)} onOpenMovementModal={handleOpenMovementModal} onOpenArticleModal={() => handleOpenArticleModal()} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-emerald-50 text-neutral-900 flex flex-col font-sans selection:bg-primary-300 selection:text-primary-900">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {isArticleModalOpen && (
        <ArticleFormModal
          article={editingArticle}
          onClose={() => setIsArticleModalOpen(false)}
        />
      )}

      {isMovementModalOpen && (
        <StockMovementModal
          initialArticuloId={selectedArticuloId}
          onClose={() => setIsMovementModalOpen(false)}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <StockProvider>
        <AppContent />
      </StockProvider>
    </AuthProvider>
  );
};

export default App;
