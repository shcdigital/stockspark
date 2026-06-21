import React, { useState } from 'react';
import { useStock } from '../../context/StockContext';
import { useAuth } from '../../context/AuthContext';
import { FolderTree, Plus, Edit2, Trash2, FolderPlus } from 'lucide-react';
import { Category, Subcategory } from '../../types';

export const CategoryManager: React.FC = () => {
  const { categories, subcategories, saveCategory, deleteCategory, saveSubcategory, deleteSubcategory, articles } = useStock();
  const { isAdmin } = useAuth();

  // Modals state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({ nombre: '', descripcion: '', orden: 1 });

  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subForm, setSubForm] = useState({ categoriaId: '', nombre: '', descripcion: '', parentId: '' });

  // Reassignment delete prompt state
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);
  const [reassignCatId, setReassignCatId] = useState<string>('');
  const [deletingSubId, setDeletingSubId] = useState<string | null>(null);
  const [reassignSubId, setReassignSubId] = useState<string>('');

  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setCatForm({ nombre: '', descripcion: '', orden: categories.length + 1 });
    setIsCatModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setCatForm({ nombre: cat.nombre, descripcion: cat.descripcion, orden: cat.orden });
    setIsCatModalOpen(true);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.nombre.trim()) return;
    saveCategory(catForm, editingCategory?.id);
    setIsCatModalOpen(false);
  };

  const openNewSubcategoryModal = (categoriaId?: string, parentId?: string) => {
    setEditingSubcategory(null);
    setSubForm({
      categoriaId: categoriaId || (categories[0]?.id || ''),
      nombre: '',
      descripcion: '',
      parentId: parentId || ''
    });
    setIsSubModalOpen(true);
  };

  const openEditSubcategoryModal = (sub: Subcategory) => {
    setEditingSubcategory(sub);
    setSubForm({
      categoriaId: sub.categoriaId,
      nombre: sub.nombre,
      descripcion: sub.descripcion,
      parentId: sub.parentId || ''
    });
    setIsSubModalOpen(true);
  };

  const handleSubcategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.nombre.trim() || !subForm.categoriaId) return;
    saveSubcategory({
      categoriaId: subForm.categoriaId,
      nombre: subForm.nombre,
      descripcion: subForm.descripcion,
      parentId: subForm.parentId || null,
      nivel: subForm.parentId ? 2 : 1
    }, editingSubcategory?.id);
    setIsSubModalOpen(false);
  };

  const handleConfirmCatDelete = () => {
    if (!deletingCatId) return;
    const success = deleteCategory(deletingCatId, reassignCatId);
    if (success) {
      setDeletingCatId(null);
      setReassignCatId('');
    }
  };

  const handleConfirmSubDelete = () => {
    if (!deletingSubId) return;
    const success = deleteSubcategory(deletingSubId, reassignSubId);
    if (success) {
      setDeletingSubId(null);
      setReassignSubId('');
    }
  };

  const handleDeleteCatClick = (catId: string) => {
    const hasArt = articles.some(a => a.categoriaId === catId);
    if (hasArt) {
      setDeletingCatId(catId);
      const otherCat = categories.find(c => c.id !== catId);
      if (otherCat) setReassignCatId(otherCat.id);
    } else {
      deleteCategory(catId);
    }
  };

  const handleDeleteSubClick = (subId: string) => {
    const hasArt = articles.some(a => a.subcategoriaId === subId);
    if (hasArt) {
      setDeletingSubId(subId);
      const otherSub = subcategories.find(s => s.id !== subId);
      if (otherSub) setReassignSubId(otherSub.id);
    } else {
      deleteSubcategory(subId);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Estructura del Catálogo (Categorías & Subcategorías)</h1>
          <p className="text-neutral-600 text-sm mt-1">
            Gestiona la jerarquía flexible de N niveles. Protegido en Firestore Security Rules por rol de Admin.
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={openNewCategoryModal}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary-200 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva Categoría</span>
            </button>
            <button
              onClick={() => openNewSubcategoryModal()}
              className="flex items-center space-x-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-semibold rounded-xl border border-neutral-200 transition-all"
            >
              <FolderPlus className="h-4 w-4" />
              <span>Nueva Subcategoría</span>
            </button>
          </div>
        )}
      </div>

      {!isAdmin && (
        <div className="p-4 bg-primary-50 border border-primary-200 rounded-2xl text-primary-700 text-sm flex items-center space-x-3">
          <FolderTree className="h-5 w-5 shrink-0 text-primary-600" />
          <span>Su rol actual es <strong>Operador</strong>. Dispone de permiso de solo lectura para las categorías. Solo el Administrador puede crear, editar o borrarlas.</span>
        </div>
      )}

      {/* Reassignment Delete Prompt Modal for Category */}
      {deletingCatId && (
        <div className="fixed inset-0 bg-neutral-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-secondary-600">¡Advertencia! Categoría con Artículos Activos</h3>
            <p className="text-sm text-neutral-600">
              La categoría que desea eliminar contiene artículos en el inventario. Para mantener la integridad relacional, seleccione a qué categoría desea transferir dichos artículos:
            </p>
            <select
              value={reassignCatId}
              onChange={(e) => setReassignCatId(e.target.value)}
              className="w-full bg-primary-50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 text-sm focus:outline-none focus:border-primary-400"
            >
              <option value="">Seleccione una categoría destino...</option>
              {categories.filter(c => c.id !== deletingCatId).map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeletingCatId(null)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmCatDelete}
                disabled={!reassignCatId}
                className="px-4 py-2 bg-secondary-500 hover:bg-secondary-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold"
              >
                Reasignar y Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassignment Delete Prompt Modal for Subcategory */}
      {deletingSubId && (
        <div className="fixed inset-0 bg-neutral-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-secondary-600">Subcategoría con Artículos Activos</h3>
            <p className="text-sm text-neutral-600">
              Esta subcategoría tiene artículos asignados. Seleccione a qué otra subcategoría desea transferirlos:
            </p>
            <select
              value={reassignSubId}
              onChange={(e) => setReassignSubId(e.target.value)}
              className="w-full bg-primary-50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 text-sm focus:outline-none focus:border-primary-400"
            >
              <option value="">Seleccione subcategoría destino...</option>
              {subcategories.filter(s => s.id !== deletingSubId).map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeletingSubId(null)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSubDelete}
                disabled={!reassignSubId}
                className="px-4 py-2 bg-secondary-500 hover:bg-secondary-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold"
              >
                Reasignar y Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories & Subcategories Tree List */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const catSubs = subcategories.filter(s => s.categoriaId === cat.id && !s.parentId);
          const catArtCount = articles.filter(a => a.categoriaId === cat.id).length;

          return (
            <div key={cat.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 bg-primary-50/50 border-b border-neutral-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 text-primary-600 rounded-xl border border-primary-200">
                    <FolderTree className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                      <span>{cat.nombre}</span>
                      <span className="text-xs bg-white text-neutral-600 px-2 py-0.5 rounded-full border border-neutral-200">
                        {catArtCount} artículos
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">{cat.descripcion}</p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openNewSubcategoryModal(cat.id)}
                      className="p-2 bg-neutral-100 hover:bg-neutral-200 text-primary-600 rounded-xl transition-colors"
                      title="Añadir subcategoría a esta categoría"
                    >
                      <FolderPlus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditCategoryModal(cat)}
                      className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl transition-colors"
                      title="Editar Categoría"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCatClick(cat.id)}
                      className="p-2 bg-secondary-50 hover:bg-secondary-100 text-secondary-600 border border-secondary-200 rounded-xl transition-colors"
                      title="Eliminar Categoría"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Subcategories Container */}
              <div className="p-5 divide-y divide-neutral-200 bg-white">
                {catSubs.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic px-4 py-2">No hay subcategorías definidas para esta categoría.</p>
                ) : (
                  catSubs.map((sub) => {
                    const subSubs = subcategories.filter(s => s.parentId === sub.id);
                    const subArtCount = articles.filter(a => a.subcategoriaId === sub.id).length;

                    return (
                      <div key={sub.id} className="py-3 px-4 flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-primary-600">Nivel 1</span>
                              <h4 className="text-sm font-bold text-neutral-900">{sub.nombre}</h4>
                              <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full border border-neutral-200">
                                {subArtCount} art.
                              </span>
                            </div>
                            <p className="text-xs text-neutral-500 mt-0.5">{sub.descripcion}</p>
                          </div>

                          {isAdmin && (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => openNewSubcategoryModal(cat.id, sub.id)}
                                className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Añadir subcategoría Nivel 2 anidada"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => openEditSubcategoryModal(sub)}
                                className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                                title="Editar Subcategoría"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubClick(sub.id)}
                                className="p-1.5 text-neutral-500 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
                                title="Eliminar Subcategoría"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Level 2 Subcategories */}
                        {subSubs.length > 0 && (
                          <div className="pl-6 border-l-2 border-neutral-200 space-y-2 mt-2">
                            {subSubs.map((sub2) => {
                              const sub2ArtCount = articles.filter(a => a.subcategoriaId === sub2.id).length;
                              return (
                                <div key={sub2.id} className="flex items-center justify-between bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-[10px] font-bold text-emerald-600">Nivel 2</span>
                                      <h5 className="text-xs font-bold text-neutral-900">{sub2.nombre}</h5>
                                      <span className="text-[10px] bg-white text-neutral-600 px-1.5 py-0.5 rounded-full border border-neutral-200">
                                        {sub2ArtCount} art.
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-neutral-500 mt-0.5">{sub2.descripcion}</p>
                                  </div>
                                  {isAdmin && (
                                    <div className="flex items-center space-x-1">
                                      <button
                                        onClick={() => openEditSubcategoryModal(sub2)}
                                        className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteSubClick(sub2.id)}
                                        className="p-1 text-neutral-500 hover:text-secondary-600 hover:bg-secondary-50 rounded transition-colors"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Category Form */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-neutral-900">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Nombre de la Categoría *</label>
                <input
                  type="text"
                  required
                  value={catForm.nombre}
                  onChange={(e) => setCatForm({ ...catForm, nombre: e.target.value })}
                  placeholder="Ej: Herramientas Eléctricas"
                  className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Descripción</label>
                <textarea
                  value={catForm.descripcion}
                  onChange={(e) => setCatForm({ ...catForm, descripcion: e.target.value })}
                  placeholder="Breve descripción del alcance..."
                  rows={3}
                  className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Orden de Visualización</label>
                <input
                  type="number"
                  min="1"
                  value={catForm.orden}
                  onChange={(e) => setCatForm({ ...catForm, orden: Number(e.target.value) })}
                  className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold"
                >
                  {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Subcategory Form */}
      {isSubModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-neutral-900">
              {editingSubcategory ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
            </h3>
            <form onSubmit={handleSubcategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Categoría Padre *</label>
                <select
                  required
                  value={subForm.categoriaId}
                  onChange={(e) => setSubForm({ ...subForm, categoriaId: e.target.value })}
                  className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 text-sm focus:outline-none focus:border-primary-400"
                >
                  <option value="">Seleccione Categoría Base...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              {subForm.parentId && (
                <div>
                  <label className="block text-xs font-medium text-primary-600 mb-1">Subcategoría Nivel 1 Base</label>
                  <input
                    type="text"
                    disabled
                    value={subcategories.find(s => s.id === subForm.parentId)?.nombre || ''}
                    className="w-full bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-2.5 text-neutral-500 text-sm cursor-not-allowed"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Nombre de Subcategoría *</label>
                <input
                  type="text"
                  required
                  value={subForm.nombre}
                  onChange={(e) => setSubForm({ ...subForm, nombre: e.target.value })}
                  placeholder="Ej: Tornillería y Fijación"
                  className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Descripción</label>
                <textarea
                  value={subForm.descripcion}
                  onChange={(e) => setSubForm({ ...subForm, descripcion: e.target.value })}
                  placeholder="Detalles de la subcategoría..."
                  rows={3}
                  className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold"
                >
                  {editingSubcategory ? 'Guardar Cambios' : 'Crear Subcategoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};