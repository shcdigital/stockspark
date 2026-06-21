import React, { useState, useEffect, useRef } from 'react';
import { useStock } from '../../context/StockContext';
import { useAuth } from '../../context/AuthContext';
import { Article } from '../../types';
import { Search, AlertTriangle, Plus, FileDown, Upload, Edit2, Trash2, ArrowUpDown } from 'lucide-react';

interface ArticleListProps {
  onOpenArticleModal: (art?: Article) => void;
  onOpenMovementModal: (articuloId?: string) => void;
}

export const ArticleList: React.FC<ArticleListProps> = ({ onOpenArticleModal, onOpenMovementModal }) => {
  const { articles, categories, subcategories, deleteArticle, exportToCSV, importFromCSV } = useStock();
  const { isAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters state
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [subFilter, setSubFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  
  // Pagination & sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'nombre' | 'stockActual' | 'precioVenta'>('nombre');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 6;

  // Debounce effect to avoid firing excessive queries (Performance and Cost Zero requirement)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [query]);

  // Handle filter changes resetting page
  const handleCatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCatFilter(e.target.value);
    setSubFilter('');
    setCurrentPage(1);
  };

  const handleSubChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field: 'nombre' | 'stockActual' | 'precioVenta') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter articles
  const filteredArticles = articles.filter(art => {
    const matchesSearch = !debouncedQuery || 
      art.nombre.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      art.sku.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      art.descripcion.toLowerCase().includes(debouncedQuery.toLowerCase());
    
    const matchesCat = !catFilter || art.categoriaId === catFilter;
    const matchesSub = !subFilter || art.subcategoriaId === subFilter;
    const matchesLowStock = !lowStockFilter || art.stockActual <= art.stockMinimo;

    return matchesSearch && matchesCat && matchesSub && matchesLowStock;
  }).sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];
    if (typeof aVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  // Paginate
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage) || 1;
  const paginatedArticles = filteredArticles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Catálogo de Artículos (~1000 items)</h1>
          <p className="text-neutral-600 text-sm mt-1">
            Módulo optimizado con paginación y virtualización visual para minimizar consumo en Cloud Firestore.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <>
              <button
                onClick={() => onOpenArticleModal()}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary-200 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Crear Artículo</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-200 transition-all"
                title="Importar catálogo desde archivo CSV"
              >
                <Upload className="h-4 w-4" />
                <span>Importar CSV</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,text/csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (confirm(`¿Importar catálogo desde el archivo "${file.name}"? Esto añadirá los artículos al inventario actual.`)) {
                      importFromCSV(file);
                    }
                    e.target.value = '';
                  }
                }}
                className="hidden"
              />
            </>
          )}
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-semibold rounded-xl border border-neutral-200 transition-all"
          >
            <FileDown className="h-4 w-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
        
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, SKU o descripción (con debounce de 350ms)..."
              className="w-full bg-primary-50/50 border border-primary-200 rounded-xl pl-10 pr-4 py-2 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400"
            />
          </div>

          {/* Categories select */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <select
              value={catFilter}
              onChange={handleCatChange}
              className="bg-primary-50/50 border border-primary-200 rounded-xl px-3 py-2 text-neutral-900 text-sm focus:outline-none focus:border-primary-400"
            >
              <option value="">Todas las Categorías</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>

            {/* Subcategories select */}
            <select
              value={subFilter}
              onChange={handleSubChange}
              disabled={!catFilter}
              className="bg-primary-50/50 border border-primary-200 rounded-xl px-3 py-2 text-neutral-900 text-sm focus:outline-none focus:border-primary-400 disabled:opacity-50"
            >
              <option value="">Todas las Subcategorías</option>
              {subcategories.filter(s => s.categoriaId === catFilter).map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>

            {/* Low stock filter button */}
            <button
              onClick={() => { setLowStockFilter(!lowStockFilter); setCurrentPage(1); }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                lowStockFilter 
                  ? 'bg-amber-100 text-amber-700 border-amber-200' 
                  : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:text-neutral-700'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Stock Bajo</span>
            </button>
          </div>
        </div>

        {/* Sorting header indicators */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-200 text-xs text-neutral-500">
          <span>Mostrando {filteredArticles.length} artículos encontrados</span>
          <div className="flex items-center space-x-4">
            <span>Ordenar por:</span>
            <button onClick={() => handleSort('nombre')} className={`flex items-center hover:text-neutral-900 ${sortField === 'nombre' ? 'text-primary-600 font-bold' : ''}`}>
              <span>Nombre</span>
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </button>
            <button onClick={() => handleSort('stockActual')} className={`flex items-center hover:text-neutral-900 ${sortField === 'stockActual' ? 'text-primary-600 font-bold' : ''}`}>
              <span>Stock</span>
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </button>
            <button onClick={() => handleSort('precioVenta')} className={`flex items-center hover:text-neutral-900 ${sortField === 'precioVenta' ? 'text-primary-600 font-bold' : ''}`}>
              <span>Precio Venta</span>
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </button>
          </div>
        </div>

      </div>

      {/* Articles Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedArticles.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-neutral-200 text-center space-y-3 shadow-sm">
            <p className="text-neutral-600 font-semibold text-base">No se encontraron artículos que coincidan con los filtros seleccionados.</p>
            <p className="text-neutral-400 text-sm">Prueba borrando la barra de búsqueda o deseleccionando filtros.</p>
          </div>
        ) : (
          paginatedArticles.map((art) => {
            const catName = categories.find(c => c.id === art.categoriaId)?.nombre || 'Sin categoría';
            const subName = subcategories.find(s => s.id === art.subcategoriaId)?.nombre || '';
            const isLowStock = art.stockActual <= art.stockMinimo;

            return (
              <div key={art.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-neutral-300 transition-all">
                <div>
                  {/* Article Image Header */}
                  <div className="h-44 bg-neutral-50 relative overflow-hidden">
                    {art.imagen ? (
                      <img src={art.imagen} alt={art.nombre} className="w-full h-full object-cover object-center" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs italic">
                        Sin imagen
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm border border-neutral-200 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-neutral-900">
                      {art.sku}
                    </div>
                    {isLowStock && (
                      <div className="absolute top-3 right-3 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1 border border-amber-200">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Alerta Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <div className="flex items-center space-x-2 text-[11px] font-bold text-primary-600 uppercase tracking-wider truncate">
                        <span>{catName}</span>
                        {subName && <span>• {subName}</span>}
                      </div>
                      <h3 className="text-base font-bold text-neutral-900 mt-1 line-clamp-1" title={art.nombre}>{art.nombre}</h3>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2" title={art.descripcion}>{art.descripcion}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 py-2 border-t border-b border-neutral-200 bg-neutral-50/50 px-3 rounded-xl">
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase">Precio Costo / Venta</span>
                        <div className="flex items-baseline space-x-1.5 mt-0.5">
                          <span className="text-xs font-semibold text-neutral-400 line-through">${art.precioCosto.toFixed(2)}</span>
                          <span className="text-sm font-bold text-emerald-600">${art.precioVenta.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-500 block uppercase">Stock / Minimo</span>
                        <div className="flex items-baseline justify-end space-x-1 mt-0.5">
                          <span className={`text-sm font-bold ${isLowStock ? 'text-amber-600' : 'text-neutral-900'}`}>{art.stockActual}</span>
                          <span className="text-xs text-neutral-500">/ {art.stockMinimo} {art.unidadMedida}</span>
                        </div>
                      </div>
                    </div>

                    {art.proveedor && (
                      <p className="text-xs text-neutral-500 truncate">
                        <span className="font-medium text-neutral-600">Proveedor:</span> {art.proveedor}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-primary-50/30 border-t border-neutral-200 flex items-center justify-between">
                  <button
                    onClick={() => onOpenMovementModal(art.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-100"
                  >
                    Movimiento de Stock
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onOpenArticleModal(art)}
                      className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
                      title="Editar Artículo"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => { if (confirm(`¿Eliminar el artículo ${art.nombre}?`)) deleteArticle(art.id); }}
                        className="p-2 text-neutral-500 hover:text-secondary-600 hover:bg-secondary-50 rounded-xl transition-colors"
                        title="Eliminar Artículo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-neutral-200">
          <p className="text-xs text-neutral-500">
            Página <strong className="text-neutral-900">{currentPage}</strong> de <strong className="text-neutral-900">{totalPages}</strong>
          </p>
          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 text-neutral-700 rounded-xl text-xs font-semibold transition-all"
            >
              Anterior
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 text-neutral-700 rounded-xl text-xs font-semibold transition-all"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

    </div>
  );
};