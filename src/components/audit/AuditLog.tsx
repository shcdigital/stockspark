import React, { useState } from 'react';
import { useStock } from '../../context/StockContext';
import { FileDown, Search, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const AuditLog: React.FC = () => {
  const { movements, articles } = useStock();
  const [query, setQuery] = useState('');
  const [artFilter, setArtFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'ENTRADA' | 'SALIDA'>('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredMovements = movements.filter(m => {
    const matchesSearch = !query || 
      m.articuloNombre.toLowerCase().includes(query.toLowerCase()) ||
      m.sku.toLowerCase().includes(query.toLowerCase()) ||
      m.motivo.toLowerCase().includes(query.toLowerCase()) ||
      m.usuarioNombre.toLowerCase().includes(query.toLowerCase());
    
    const matchesArt = !artFilter || m.articuloId === artFilter;
    const matchesType = typeFilter === 'ALL' || m.tipo === typeFilter;

    return matchesSearch && matchesArt && matchesType;
  });

  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage) || 1;
  const paginatedMovements = filteredMovements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportAuditCSV = () => {
    const headers = ['Fecha', 'SKU', 'Articulo', 'Tipo', 'Cantidad', 'Stock Anterior', 'Stock Nuevo', 'Motivo', 'Usuario'];
    const rows = filteredMovements.map(m => [
      `"${new Date(m.fecha).toLocaleString()}"`,
      `"${m.sku}"`,
      `"${m.articuloNombre.replace(/"/g, '""')}"`,
      `"${m.tipo}"`,
      m.cantidad,
      m.stockAnterior,
      m.stockNuevo,
      `"${m.motivo.replace(/"/g, '""')}"`,
      `"${m.usuarioNombre}"`
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `auditoria_movimientos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Historial de Auditoría de Movimientos</h1>
          <p className="text-neutral-600 text-sm mt-1">
            Registro inmutable (append-only) de entradas y salidas. Reglas de Firestore deniegan cualquier modificación o borrado.
          </p>
        </div>
        <button
          onClick={exportAuditCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-semibold rounded-xl border border-neutral-200 transition-all shadow-sm"
        >
          <FileDown className="h-4 w-4" />
          <span>Exportar Auditoría (CSV)</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar en auditoría por nombre, motivo, usuario o SKU..."
              className="w-full bg-primary-50/50 border border-primary-200 rounded-xl pl-10 pr-4 py-2 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <select
              value={artFilter}
              onChange={(e) => { setArtFilter(e.target.value); setCurrentPage(1); }}
              className="bg-primary-50/50 border border-primary-200 rounded-xl px-3 py-2 text-neutral-900 text-sm focus:outline-none focus:border-primary-400"
            >
              <option value="">Todos los Artículos</option>
              {articles.map(a => (
                <option key={a.id} value={a.id}>{a.sku} — {a.nombre}</option>
              ))}
            </select>

            <div className="flex bg-primary-50/50 border border-primary-200 rounded-xl p-1 shrink-0">
              <button
                onClick={() => { setTypeFilter('ALL'); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${typeFilter === 'ALL' ? 'bg-primary-100 text-primary-700' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                Todos
              </button>
              <button
                onClick={() => { setTypeFilter('ENTRADA'); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${typeFilter === 'ENTRADA' ? 'bg-emerald-100 text-emerald-700' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                Entradas
              </button>
              <button
                onClick={() => { setTypeFilter('SALIDA'); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${typeFilter === 'SALIDA' ? 'bg-secondary-100 text-secondary-700' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                Salidas
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary-50/50 border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                <th className="py-3 px-4">Fecha & Hora</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Artículo / SKU</th>
                <th className="py-3 px-4 text-center">Cantidad</th>
                <th className="py-3 px-4 text-center">Stock Base → Nuevo</th>
                <th className="py-3 px-4">Motivo / Factura</th>
                <th className="py-3 px-4">Usuario Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm text-neutral-700">
              {paginatedMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400 italic">
                    No se encontraron registros de auditoría con los filtros actuales.
                  </td>
                </tr>
              ) : (
                paginatedMovements.map((mov) => {
                  const isEntrada = mov.tipo === 'ENTRADA';
                  return (
                    <tr key={mov.id} className="hover:bg-primary-50/30 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-neutral-500">
                        {new Date(mov.fecha).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isEntrada ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-secondary-100 text-secondary-700 border border-secondary-200'
                        }`}>
                          {isEntrada ? <ArrowDownLeft className="h-3 w-3 mr-1 text-emerald-600" /> : <ArrowUpRight className="h-3 w-3 mr-1 text-secondary-600" />}
                          <span>{mov.tipo}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-neutral-900">{mov.articuloNombre}</p>
                        <span className="text-xs font-mono text-neutral-500">{mov.sku}</span>
                      </td>
                      <td className={`py-3 px-4 whitespace-nowrap text-center font-bold text-base ${isEntrada ? 'text-emerald-600' : 'text-secondary-600'}`}>
                        {isEntrada ? '+' : '-'}{mov.cantidad}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-center text-xs font-mono text-neutral-500">
                        {mov.stockAnterior} <span className="text-neutral-300">→</span> <strong className="text-neutral-900">{mov.stockNuevo}</strong>
                      </td>
                      <td className="py-3 px-4 text-neutral-700 text-xs max-w-xs truncate" title={mov.motivo}>
                        {mov.motivo}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-xs font-medium text-neutral-700">
                        {mov.usuarioNombre}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-primary-50/50 p-4 border-t border-neutral-200">
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

    </div>
  );
};