import React, { createContext, useContext, useState, useEffect } from 'react';
import { Article, Category, Subcategory, StockMovement, SystemConfig, UserProfile } from '../types';
import { LocalDB } from '../services/firebase';
import { useAuth } from './AuthContext';

interface StockContextType {
  articles: Article[];
  categories: Category[];
  subcategories: Subcategory[];
  movements: StockMovement[];
  config: SystemConfig;
  users: UserProfile[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (subId: string) => void;
  showLowStockOnly: boolean;
  setShowLowStockOnly: (val: boolean) => void;
  // CRUD Articles
  saveArticle: (article: Omit<Article, 'id' | 'fechaActualizacion'>, existingId?: string) => void;
  deleteArticle: (id: string) => void;
  // CRUD Categories
  saveCategory: (cat: Omit<Category, 'id'>, existingId?: string) => void;
  deleteCategory: (id: string, reassignCatId?: string) => boolean;
  // CRUD Subcategories
  saveSubcategory: (sub: Omit<Subcategory, 'id'>, existingId?: string) => void;
  deleteSubcategory: (id: string, reassignSubId?: string) => boolean;
  // Operations
  registerMovement: (articuloId: string, tipo: 'ENTRADA' | 'SALIDA', cantidad: number, motivo: string) => void;
  quickScanBarcode: (sku: string) => Article | null;
  // Admin User Management
  saveUser: (user: UserProfile) => void;
  deleteUser: (id: string) => void;
  resetUserMFA: (id: string) => void;
  updateAllowlist: (emails: string[]) => void;
  // System State
  isOffline: boolean;
  exportToCSV: () => void;
  importFromCSV: (file: File) => void;
}

const StockContext = createContext<StockContextType | null>(null);

// Sanitización básica para prevenir XSS en inputs de SPA
const sanitizeInput = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  
  const [articles, setArticles] = useState<Article[]>(() => LocalDB.getArticles());
  const [categories, setCategories] = useState<Category[]>(() => LocalDB.getCategories());
  const [subcategories, setSubcategories] = useState<Subcategory[]>(() => LocalDB.getSubcategories());
  const [movements, setMovements] = useState<StockMovement[]>(() => LocalDB.getMovements());
  const [config, setConfig] = useState<SystemConfig>(() => LocalDB.getConfig());
  const [users, setUsers] = useState<UserProfile[]>(() => LocalDB.getUsers());

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Actualizar configuración cuando cambien artículos (Contadores Agregados)
  useEffect(() => {
    const totalArticulos = articles.length;
    const alertasStockBajo = articles.filter(a => a.stockActual <= a.stockMinimo).length;
    const valorInventario = articles.reduce((acc, a) => acc + (a.precioVenta * a.stockActual), 0);
    const updatedCfg = { ...config, totalArticulos, alertasStockBajo, valorInventario };
    setConfig(updatedCfg);
    LocalDB.saveConfig(updatedCfg);
  }, [articles]);

  // ==========================================================================
  // ARTÍCULOS CRUD
  // ==========================================================================
  const saveArticle = (data: Omit<Article, 'id' | 'fechaActualizacion'>, existingId?: string) => {
    if (!currentUser) return;
    if (!existingId && !isAdmin) {
      alert('Error de Seguridad de Firestore: Solo el rol Admin puede crear artículos nuevos.');
      return;
    }

    const cleanData = {
      sku: sanitizeInput(data.sku),
      nombre: sanitizeInput(data.nombre),
      descripcion: sanitizeInput(data.descripcion),
      categoriaId: data.categoriaId,
      subcategoriaId: data.subcategoriaId,
      precioCosto: Number(data.precioCosto) || 0,
      precioVenta: Number(data.precioVenta) || 0,
      stockActual: Number(data.stockActual) || 0,
      stockMinimo: Number(data.stockMinimo) || 0,
      unidadMedida: sanitizeInput(data.unidadMedida),
      proveedor: sanitizeInput(data.proveedor || ''),
      imagen: data.imagen || ''
    };

    let updatedList: Article[];
    if (existingId) {
      updatedList = articles.map(a => a.id === existingId ? { ...a, ...cleanData, fechaActualizacion: new Date().toISOString() } : a);
    } else {
      const newArt: Article = {
        id: `art-${Date.now()}`,
        ...cleanData,
        fechaActualizacion: new Date().toISOString()
      };
      updatedList = [newArt, ...articles];
    }
    setArticles(updatedList);
    LocalDB.saveArticles(updatedList);
  };

  const deleteArticle = (id: string) => {
    if (!isAdmin) {
      alert('Error de Seguridad de Firestore: Solo el rol Admin puede eliminar artículos.');
      return;
    }
    const updated = articles.filter(a => a.id !== id);
    setArticles(updated);
    LocalDB.saveArticles(updated);
  };

  // ==========================================================================
  // CATEGORÍAS CRUD
  // ==========================================================================
  const saveCategory = (data: Omit<Category, 'id'>, existingId?: string) => {
    if (!isAdmin) {
      alert('Error de Seguridad de Firestore: Solo el rol Admin puede crear o editar categorías.');
      return;
    }
    const cleanData = {
      nombre: sanitizeInput(data.nombre),
      descripcion: sanitizeInput(data.descripcion),
      orden: Number(data.orden) || 1
    };

    let updatedList: Category[];
    if (existingId) {
      updatedList = categories.map(c => c.id === existingId ? { ...c, ...cleanData } : c);
    } else {
      const newCat: Category = { id: `cat-${Date.now()}`, ...cleanData };
      updatedList = [...categories, newCat];
    }
    setCategories(updatedList);
    LocalDB.saveCategories(updatedList);
  };

  const deleteCategory = (id: string, reassignCatId?: string): boolean => {
    if (!isAdmin) {
      alert('Error de Seguridad de Firestore: Solo el rol Admin puede eliminar categorías.');
      return false;
    }
    // Verificar si hay artículos asociados
    const associatedArticles = articles.filter(a => a.categoriaId === id);
    if (associatedArticles.length > 0) {
      if (!reassignCatId) {
        alert('Hay artículos asociados a esta categoría. Seleccione una categoría de reasignación o elimine los artículos primero.');
        return false;
      }
      // Reasignar artículos
      const updatedArticles = articles.map(a => a.categoriaId === id ? { ...a, categoriaId: reassignCatId, subcategoriaId: '' } : a);
      setArticles(updatedArticles);
      LocalDB.saveArticles(updatedArticles);
    }

    // Eliminar también subcategorías hijas
    const updatedSubcats = subcategories.filter(s => s.categoriaId !== id);
    setSubcategories(updatedSubcats);
    LocalDB.saveSubcategories(updatedSubcats);

    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    LocalDB.saveCategories(updated);
    return true;
  };

  // ==========================================================================
  // SUBCATEGORÍAS CRUD (Jerarquía Flexible)
  // ==========================================================================
  const saveSubcategory = (data: Omit<Subcategory, 'id'>, existingId?: string) => {
    if (!isAdmin) {
      alert('Error de Seguridad de Firestore: Solo el rol Admin puede gestionar subcategorías.');
      return;
    }
    const cleanData = {
      categoriaId: data.categoriaId,
      nombre: sanitizeInput(data.nombre),
      descripcion: sanitizeInput(data.descripcion),
      parentId: data.parentId || null,
      nivel: data.parentId ? 2 : 1
    };

    let updatedList: Subcategory[];
    if (existingId) {
      updatedList = subcategories.map(s => s.id === existingId ? { ...s, ...cleanData } : s);
    } else {
      const newSub: Subcategory = { id: `sub-${Date.now()}`, ...cleanData };
      updatedList = [...subcategories, newSub];
    }
    setSubcategories(updatedList);
    LocalDB.saveSubcategories(updatedList);
  };

  const deleteSubcategory = (id: string, reassignSubId?: string): boolean => {
    if (!isAdmin) {
      alert('Error de Seguridad de Firestore: Solo el rol Admin puede eliminar subcategorías.');
      return false;
    }
    const associatedArticles = articles.filter(a => a.subcategoriaId === id);
    if (associatedArticles.length > 0) {
      if (!reassignSubId) {
        alert('Hay artículos asociados a esta subcategoría. Debe seleccionar una para reasignarlos o blanquearlos.');
        return false;
      }
      const updatedArticles = articles.map(a => a.subcategoriaId === id ? { ...a, subcategoriaId: reassignSubId } : a);
      setArticles(updatedArticles);
      LocalDB.saveArticles(updatedArticles);
    }
    const updated = subcategories.filter(s => s.id !== id && s.parentId !== id);
    setSubcategories(updated);
    LocalDB.saveSubcategories(updated);
    return true;
  };

  // ==========================================================================
  // OPERACIONES DE STOCK (Movimientos)
  // ==========================================================================
  const registerMovement = (articuloId: string, tipo: 'ENTRADA' | 'SALIDA', cantidad: number, motivo: string) => {
    if (!currentUser) return;
    const art = articles.find(a => a.id === articuloId);
    if (!art) {
      alert('Artículo no encontrado.');
      return;
    }

    if (cantidad <= 0) {
      alert('La cantidad del movimiento debe ser mayor a cero.');
      return;
    }

    const stockAnterior = art.stockActual;
    const stockNuevo = tipo === 'ENTRADA' ? stockAnterior + cantidad : stockAnterior - cantidad;

    if (stockNuevo < 0) {
      alert('Operación rechazada por Firestore Rules: El stock resultante no puede ser negativo.');
      return;
    }

    const newMov: StockMovement = {
      id: `mov-${Date.now()}`,
      articuloId: art.id,
      sku: art.sku,
      articuloNombre: art.nombre,
      tipo,
      cantidad,
      stockAnterior,
      stockNuevo,
      motivo: sanitizeInput(motivo),
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombre,
      fecha: new Date().toISOString()
    };

    // Actualizar Artículos
    const updatedArticles = articles.map(a => a.id === art.id ? { ...a, stockActual: stockNuevo, fechaActualizacion: new Date().toISOString() } : a);
    setArticles(updatedArticles);
    LocalDB.saveArticles(updatedArticles);

    // Agregar Movimiento
    const updatedMovs = [newMov, ...movements];
    setMovements(updatedMovs);
    LocalDB.saveMovements(updatedMovs);
  };

  const quickScanBarcode = (sku: string): Article | null => {
    const clean = sku.trim().toUpperCase();
    const found = articles.find(a => a.sku.toUpperCase() === clean);
    return found || null;
  };

  // ==========================================================================
  // ADMIN USER MANAGEMENT & ALLOWLIST
  // ==========================================================================
  const saveUser = (user: UserProfile) => {
    if (!isAdmin) return;
    let updatedList: UserProfile[];
    if (users.some(u => u.id === user.id)) {
      updatedList = users.map(u => u.id === user.id ? user : u);
    } else {
      if (users.length >= 10) {
        alert('Límite del Plan Spark/Arquitectura alcanzado: Se admiten hasta un máximo de 10 usuarios gestionados.');
        return;
      }
      updatedList = [...users, user];
    }
    setUsers(updatedList);
    LocalDB.saveUsers(updatedList);

    // Si se añade un usuario, asegurar que su email esté en la Allowlist
    const updatedAllowlist = Array.from(new Set([...config.allowedEmails, user.email]));
    updateAllowlist(updatedAllowlist);
  };

  const deleteUser = (id: string) => {
    if (!isAdmin) return;
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete?.rol === 'Admin' && users.filter(u => u.rol === 'Admin').length === 1) {
      alert('No puedes eliminar al único Administrador del sistema.');
      return;
    }
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    LocalDB.saveUsers(updated);

    if (userToDelete) {
      const updatedAllowlist = config.allowedEmails.filter(e => e.toLowerCase() !== userToDelete.email.toLowerCase());
      updateAllowlist(updatedAllowlist);
    }
  };

  const resetUserMFA = (id: string) => {
    if (!isAdmin) return;
    const updated = users.map(u => u.id === id ? { ...u, mfaHabilitado: false, mfaSecret: undefined } : u);
    setUsers(updated);
    LocalDB.saveUsers(updated);
    alert('MFA reseteado con éxito. El usuario deberá escanear un nuevo código QR en su próximo ingreso.');
  };

  const updateAllowlist = (emails: string[]) => {
    if (!isAdmin) return;
    const newCfg = { ...config, allowedEmails: emails };
    setConfig(newCfg);
    LocalDB.saveConfig(newCfg);
  };

  // ==========================================================================
  // EXPORTACIÓN A CSV CLIENT-SIDE (Sin Backend)
  // ==========================================================================
  const exportToCSV = () => {
    const headers = ['SKU', 'Nombre', 'Categoria', 'Subcategoria', 'Stock Actual', 'Stock Minimo', 'Precio Costo', 'Precio Venta', 'Unidad de Medida', 'Proveedor'];
    const rows = articles.map(a => {
      const cat = categories.find(c => c.id === a.categoriaId)?.nombre || '';
      const sub = subcategories.find(s => s.id === a.subcategoriaId)?.nombre || '';
      return [
        `"${a.sku}"`,
        `"${a.nombre.replace(/"/g, '""')}"`,
        `"${cat}"`,
        `"${sub}"`,
        a.stockActual,
        a.stockMinimo,
        a.precioCosto,
        a.precioVenta,
        `"${a.unidadMedida}"`,
        `"${a.proveedor || ''}"`
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventario_stockspark_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================================================
  // IMPORTACIÓN DE CSV CLIENT-SIDE (Sin Backend, con Validación)
  // ==========================================================================
  const importFromCSV = (file: File) => {
    if (!isAdmin) {
      alert('Error de Seguridad de Firestore: Solo el rol Admin puede importar catálogos.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      if (lines.length < 2) {
        alert('El archivo CSV está vacío o no tiene formato válido.');
        return;
      }

      const headerLine = lines.shift()?.split(',').map(h => h.replace(/"/g, '').trim().toLowerCase()) || [];
      const expectedHeaders = ['sku', 'nombre', 'categoria', 'subcategoria', 'stock actual', 'stock minimo', 'precio costo', 'precio venta', 'unidad de medida', 'proveedor'];
      
      const missingHeaders = expectedHeaders.filter(h => !headerLine.includes(h));
      if (missingHeaders.length > 0) {
        alert(`Faltan columnas requeridas en el CSV: ${missingHeaders.join(', ')}`);
        return;
      }

      const importedArticles: Article[] = [];
      const errors: string[] = [];

      lines.forEach((line, idx) => {
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        const headerMap = headerLine.reduce((acc, h, i) => ({ ...acc, [h]: i }), {} as Record<string, number>);

        const sku = values[headerMap['sku']] || '';
        const nombre = sanitizeInput(values[headerMap['nombre']] || '');
        const categoriaNombre = values[headerMap['categoria']] || '';
        const subcategoriaNombre = values[headerMap['subcategoria']] || '';
        const stockActual = parseInt(values[headerMap['stock actual']]) || 0;
        const stockMinimo = parseInt(values[headerMap['stock minimo']]) || 10;
        const precioCosto = parseFloat(values[headerMap['precio costo']]) || 0;
        const precioVenta = parseFloat(values[headerMap['precio venta']]) || 0;
        const unidadMedida = sanitizeInput(values[headerMap['unidad de medida']] || 'Unidades');
        const proveedor = sanitizeInput(values[headerMap['proveedor']] || '');

        if (!sku || !nombre) {
          errors.push(`Fila ${idx + 2}: SKU o Nombre vacío.`);
          return;
        }

        // Buscar o crear categoría/subcategoría
        let cat = categories.find(c => c.nombre.toLowerCase() === categoriaNombre.toLowerCase());
        let sub = subcategories.find(s => s.nombre.toLowerCase() === subcategoriaNombre.toLowerCase() && s.categoriaId === cat?.id);

        if (!cat && categoriaNombre) {
          const newCat: Category = {
            id: `cat-${Date.now()}-${idx}`,
            nombre: sanitizeInput(categoriaNombre),
            descripcion: '',
            orden: categories.length + 1
          };
          setCategories(prev => [...prev, newCat]);
          cat = newCat;
        }

        if (!sub && subcategoriaNombre && cat) {
          const newSub: Subcategory = {
            id: `sub-${Date.now()}-${idx}`,
            categoriaId: cat.id,
            nombre: sanitizeInput(subcategoriaNombre),
            descripcion: '',
            parentId: null,
            nivel: 1
          };
          setSubcategories(prev => [...prev, newSub]);
          sub = newSub;
        }

        const newArt: Article = {
          id: `art-${Date.now()}-${idx}`,
          sku,
          nombre,
          descripcion: '',
          categoriaId: cat?.id || '',
          subcategoriaId: sub?.id || '',
          precioCosto,
          precioVenta,
          stockActual,
          stockMinimo,
          unidadMedida,
          proveedor: proveedor || undefined,
          imagen: undefined,
          fechaActualizacion: new Date().toISOString()
        };

        importedArticles.push(newArt);
      });

      if (errors.length > 0) {
        alert(`Errores en la importación:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... y ${errors.length - 5} más` : ''}`);
      }

      if (importedArticles.length > 0) {
        const updatedArticles = [...importedArticles, ...articles];
        setArticles(updatedArticles);
        LocalDB.saveArticles(updatedArticles);
        alert(`${importedArticles.length} artículos importados exitosamente.`);
      }
    };
    reader.readAsText(file);
  };

  const value: StockContextType = {
    articles,
    categories,
    subcategories,
    movements,
    config,
    users,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    showLowStockOnly,
    setShowLowStockOnly,
    saveArticle,
    deleteArticle,
    saveCategory,
    deleteCategory,
    saveSubcategory,
    deleteSubcategory,
    registerMovement,
    quickScanBarcode,
    saveUser,
    deleteUser,
    resetUserMFA,
    updateAllowlist,
    isOffline,
    exportToCSV,
    importFromCSV
  };

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
};

export const useStock = () => {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error('useStock debe usarse dentro de un StockProvider');
  return ctx;
};
