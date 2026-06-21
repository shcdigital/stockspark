import React, { useState, useEffect } from 'react';
import { useStock } from '../../context/StockContext';
import { X, ArrowDownLeft, ArrowUpRight, AlertCircle } from 'lucide-react';

interface StockMovementModalProps {
  initialArticuloId?: string;
  onClose: () => void;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({ initialArticuloId, onClose }) => {
  const { articles, registerMovement } = useStock();

  const [articuloId, setArticuloId] = useState(initialArticuloId || (articles[0]?.id || ''));
  const [tipo, setTipo] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const selectedArticle = articles.find(a => a.id === articuloId);

  useEffect(() => {
    if (initialArticuloId) {
      setArticuloId(initialArticuloId);
    }
  }, [initialArticuloId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedArticle) {
      setError('Por favor seleccione un artículo válido.');
      return;
    }

    if (cantidad <= 0) {
      setError('La cantidad del movimiento debe ser un número entero mayor a cero.');
      return;
    }

    if (!motivo.trim()) {
      setError('Debe especificar un motivo (factura, venta, ajuste, etc.) para la auditoría.');
      return;
    }

    if (tipo === 'SALIDA' && selectedArticle.stockActual - cantidad < 0) {
      setError('Rechazado por Firestore Security Rules: El stock del artículo no puede quedar por debajo de cero.');
      return;
    }

    registerMovement(articuloId, tipo, cantidad, motivo);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-6">
        
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Registrar Movimiento de Inventario</h2>
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
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Seleccionar Artículo *</label>
            <select
              value={articuloId}
              onChange={(e) => setArticuloId(e.target.value)}
              className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-3 py-2.5 text-neutral-900 text-sm focus:outline-none focus:border-primary-400"
            >
              {articles.map(a => (
                <option key={a.id} value={a.id}>
                  {a.sku} — {a.nombre} (Stock actual: {a.stockActual})
                </option>
              ))}
            </select>
          </div>

          {selectedArticle && (
            <div className="p-4 bg-primary-50/50 rounded-xl border border-primary-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-500 block">Stock Actual</span>
                <span className="text-lg font-bold text-neutral-900">{selectedArticle.stockActual} {selectedArticle.unidadMedida}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-neutral-500 block">Stock Resultante</span>
                <span className={`text-lg font-bold ${
                  tipo === 'ENTRADA' ? 'text-emerald-600' : selectedArticle.stockActual - cantidad < 0 ? 'text-secondary-600' : 'text-amber-600'
                }`}>
                  {tipo === 'ENTRADA' ? selectedArticle.stockActual + cantidad : selectedArticle.stockActual - cantidad} {selectedArticle.unidadMedida}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-2">Tipo de Operación *</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTipo('ENTRADA')}
                className={`flex items-center justify-center space-x-2 p-3 rounded-xl border font-bold text-sm transition-all ${
                  tipo === 'ENTRADA'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-md shadow-emerald-100'
                    : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:text-neutral-700'
                }`}
              >
                <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
                <span>ENTRADA (Compra/Repo)</span>
              </button>
              <button
                type="button"
                onClick={() => setTipo('SALIDA')}
                className={`flex items-center justify-center space-x-2 p-3 rounded-xl border font-bold text-sm transition-all ${
                  tipo === 'SALIDA'
                    ? 'bg-secondary-100 text-secondary-700 border-secondary-200 shadow-md shadow-secondary-100'
                    : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:text-neutral-700'
                }`}
              >
                <ArrowUpRight className="h-5 w-5 text-secondary-600" />
                <span>SALIDA (Venta/Baja)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Cantidad *</label>
            <input
              type="number"
              min="1"
              required
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
              className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 text-sm focus:outline-none focus:border-primary-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Motivo / Descripción de la Auditoría *</label>
            <textarea
              required
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Factura #90812 / Despacho a sucursal norte / Ajuste por daño..."
              rows={3}
              className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              La identidad de su usuario quedará registrada en el histórico inmutable de movimientos.
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-200"
            >
              Confirmar Movimiento
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};