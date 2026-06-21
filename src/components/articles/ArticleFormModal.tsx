import React, { useState, useEffect } from 'react';
import { useStock } from '../../context/StockContext';
import { Article } from '../../types';
import { X, AlertCircle } from 'lucide-react';

interface ArticleFormModalProps {
  article: Article | null;
  onClose: () => void;
}

export const ArticleFormModal: React.FC<ArticleFormModalProps> = ({ article, onClose }) => {
  const { categories, subcategories, saveArticle } = useStock();

  const [form, setForm] = useState({
    sku: '',
    nombre: '',
    descripcion: '',
    categoriaId: categories[0]?.id || '',
    subcategoriaId: '',
    precioCosto: 0,
    precioVenta: 0,
    stockActual: 0,
    stockMinimo: 10,
    unidadMedida: 'Unidades',
    proveedor: '',
    imagen: ''
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (article) {
      setForm({
        sku: article.sku,
        nombre: article.nombre,
        descripcion: article.descripcion,
        categoriaId: article.categoriaId,
        subcategoriaId: article.subcategoriaId,
        precioCosto: article.precioCosto,
        precioVenta: article.precioVenta,
        stockActual: article.stockActual,
        stockMinimo: article.stockMinimo,
        unidadMedida: article.unidadMedida,
        proveedor: article.proveedor || '',
        imagen: article.imagen || ''
      });
    } else {
      setForm(prev => ({ ...prev, categoriaId: categories[0]?.id || '' }));
    }
  }, [article, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.sku.trim() || !form.nombre.trim()) {
      setError('El SKU y Nombre son obligatorios.');
      return;
    }

    if (form.stockActual < 0 || form.precioCosto < 0 || form.precioVenta < 0) {
      setError('Las reglas de Firestore exigen que el stock y precios sean números positivos.');
      return;
    }

    saveArticle(form, article?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-2xl w-full shadow-2xl my-8 space-y-6">
        
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            {article ? 'Editar Artículo en Catálogo' : 'Registrar Nuevo Artículo'}
          </h2>
          <button onClick={onClose} className="p-1 text-neutral-500 hover:text-neutral-900 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-secondary-50 border border-secondary-200 rounded-2xl text-secondary-700 text-sm flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-secondary-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">SKU / Código Único *</label>
              <input
                type="text"
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="Ej: ELE-MCU-005"
                className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm font-mono uppercase focus:outline-none focus:border-primary-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Nombre del Producto *</label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Multímetro Digital 10A"
                className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Características técnicas y aplicaciones..."
              rows={3}
              className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Categoría Principal *</label>
              <select
                required
                value={form.categoriaId}
                onChange={(e) => setForm({ ...form, categoriaId: e.target.value, subcategoriaId: '' })}
                className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 text-sm focus:outline-none focus:border-primary-400"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Subcategoría (Opcional)</label>
              <select
                value={form.subcategoriaId}
                onChange={(e) => setForm({ ...form, subcategoriaId: e.target.value })}
                className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 text-sm focus:outline-none focus:border-primary-400"
              >
                <option value="">Ninguna</option>
                {subcategories.filter(s => s.categoriaId === form.categoriaId).map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Precio Costo ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.precioCosto}
                onChange={(e) => setForm({ ...form, precioCosto: parseFloat(e.target.value) || 0 })}
                className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Precio Venta ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.precioVenta}
                onChange={(e) => setForm({ ...form, precioVenta: parseFloat(e.target.value) || 0 })}
                className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Stock Actual *</label>
              <input
                type="number"
                min="0"
                required
                value={form.stockActual}
                onChange={(e) => setForm({ ...form, stockActual: parseInt(e.target.value) || 0 })}
                className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Stock Mínimo (Alerta)</label>
              <input
                type="number"
                min="0"
                value={form.stockMinimo}
                onChange={(e) => setForm({ ...form, stockMinimo: parseInt(e.target.value) || 0 })}
                className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Unidad de Medida</label>
              <input
                type="text"
                value={form.unidadMedida}
                onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })}
                placeholder="Ej: Unidades, Metros, Kg, Cajas"
                className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Proveedor Principal</label>
              <input
                type="text"
                value={form.proveedor}
                onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
                placeholder="Ej: ElectroPartes Global"
                className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">URL de Imagen (Opcional - Almacenamiento Gratuito)</label>
            <input
              type="text"
              value={form.imagen}
              onChange={(e) => setForm({ ...form, imagen: e.target.value })}
              placeholder="https://images.unsplash.com/... o enlace de imagen"
              className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Para no exceder la cuota gratuita de 5GB de Firebase Storage, se recomienda usar enlaces CDN directos o comprimir las imágenes en el cliente antes de subirlas.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-sm font-semibold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary-200"
            >
              {article ? 'Guardar Cambios' : 'Registrar Artículo'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};