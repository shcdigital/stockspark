import React, { useState } from 'react';
import { useStock } from '../../context/StockContext';
import { Package, AlertTriangle, DollarSign, Users, FileDown, Search, Plus } from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onOpenMovementModal: (articuloId?: string) => void;
  onOpenArticleModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenMovementModal, onOpenArticleModal }) => {
  const { config, articles, movements, quickScanBarcode, exportToCSV } = useStock();
  const [skuScan, setSkuScan] = useState('');
  const [scanResult, setScanResult] = useState<{ found: boolean; message: string; articuloId?: string } | null>(null);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuScan.trim()) return;
    const item = quickScanBarcode(skuScan);
    if (item) {
      setScanResult({ found: true, message: `¡Encontrado! ${item.nombre} (Stock: ${item.stockActual})`, articuloId: item.id });
    } else {
      setScanResult({ found: false, message: `No se encontró ningún artículo con SKU: ${skuScan}` });
    }
  };

  const recentMovements = movements.slice(0, 5);
  const lowStockArticles = articles.filter(a => a.stockActual <= a.stockMinimo).slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Welcome & Global Counters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Panel de Control General</h1>
          <p className="text-neutral-600 text-sm mt-1">
            Resumen de inventario optimizado mediante documentos de agregación (0 lecturas innecesarias).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenArticleModal}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary-200 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Artículo</span>
          </button>
          <button
            onClick={() => onOpenMovementModal()}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-200 transition-all"
          >
            <span>Registrar Movimiento</span>
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-semibold rounded-xl border border-neutral-200 transition-all"
            title="Exportar inventario a CSV localmente"
          >
            <FileDown className="h-4 w-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-primary-100 border border-primary-200 rounded-xl text-primary-600">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase">Artículos en Catálogo</p>
            <h3 className="text-2xl font-bold text-neutral-900 mt-1">{config.totalArticulos}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase">Alertas de Stock Bajo</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{config.alertasStockBajo}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase">Valor Total Inventario</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              ${config.valorInventario.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase">Emails en Allowlist</p>
            <h3 className="text-2xl font-bold text-sky-600 mt-1">{config.allowedEmails.length} / 10</h3>
          </div>
        </div>

      </div>

      {/* Barcode Quick Scan Section */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <h2 className="text-lg font-bold text-neutral-900 mb-2 flex items-center space-x-2">
          <Search className="h-5 w-5 text-primary-600" />
          <span>Escáner / Lector de Código de Barras (SKU)</span>
        </h2>
        <p className="text-neutral-600 text-sm mb-4">
          Simule la entrada con lector de códigos de barras apuntando al input (Ej: <code className="bg-primary-50 px-2 py-0.5 rounded text-primary-600">ELE-MCU-001</code>, <code className="bg-primary-50 px-2 py-0.5 rounded text-primary-600">FER-ELC-001</code>).
        </p>

        <form onSubmit={handleScanSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={skuScan}
              onChange={(e) => setSkuScan(e.target.value)}
              placeholder="Escanee o escriba el código SKU..."
              className="w-full bg-primary-50/50 border border-primary-200 rounded-xl pl-4 pr-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400 font-mono uppercase"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-primary-200"
          >
            Buscar / Escanear
          </button>
        </form>

        {scanResult && (
          <div className={`mt-4 p-4 rounded-xl border flex items-center justify-between ${
            scanResult.found 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
              : 'bg-secondary-50 border-secondary-200 text-secondary-700'
          }`}>
            <span className="text-sm font-medium">{scanResult.message}</span>
            {scanResult.found && scanResult.articuloId && (
              <button
                onClick={() => onOpenMovementModal(scanResult.articuloId)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                Ajustar Stock
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid for Low Stock Alerts & Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low stock table */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neutral-900 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span>Atención: Stock Mínimo Alcanzado</span>
              </h2>
              <button
                onClick={() => onNavigate('articles')}
                className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
              >
                Ver todos
              </button>
            </div>
            
            <div className="space-y-3">
              {lowStockArticles.length === 0 ? (
                <p className="text-sm text-neutral-500 p-4 text-center bg-neutral-50 rounded-xl border border-neutral-200">
                  ¡Excelente! Todos los artículos cuentan con stock por encima del nivel de alerta.
                </p>
              ) : (
                lowStockArticles.map((art) => (
                  <div key={art.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200 hover:bg-neutral-100 transition-all">
                    <div className="truncate pr-4">
                      <p className="text-sm font-bold text-neutral-900 truncate">{art.nombre}</p>
                      <span className="text-xs font-mono text-neutral-500">{art.sku}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                        {art.stockActual} / {art.stockMinimo} {art.unidadMedida}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Audit Movements */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neutral-900 flex items-center space-x-2">
                <Package className="h-5 w-5 text-emerald-600" />
                <span>Últimos Movimientos Registrados</span>
              </h2>
              <button
                onClick={() => onNavigate('audit')}
                className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
              >
                Ver auditoría
              </button>
            </div>

            <div className="space-y-3">
              {recentMovements.length === 0 ? (
                <p className="text-sm text-neutral-500 p-4 text-center bg-neutral-50 rounded-xl border border-neutral-200">
                  No hay movimientos registrados aún.
                </p>
              ) : (
                recentMovements.map((mov) => (
                  <div key={mov.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200 hover:bg-neutral-100 transition-all">
                    <div className="truncate pr-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                          mov.tipo === 'ENTRADA' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-secondary-100 text-secondary-700 border border-secondary-200'
                        }`}>
                          {mov.tipo}
                        </span>
                        <p className="text-sm font-bold text-neutral-900 truncate">{mov.articuloNombre}</p>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1 truncate">Por {mov.usuarioNombre} — {mov.motivo}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-sm font-bold ${mov.tipo === 'ENTRADA' ? 'text-emerald-600' : 'text-secondary-600'}`}>
                        {mov.tipo === 'ENTRADA' ? '+' : '-'}{mov.cantidad}
                      </span>
                      <p className="text-[10px] text-neutral-400">{new Date(mov.fecha).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};