import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, FolderTree } from 'lucide-react';
import { Category, Product } from '../../types';
import { ConfirmDialog } from '../../components/ConfirmDialog';

interface AdminCategoriesPageProps {
  categories: Category[];
  products: Product[];
  onSaveCategory: (cat: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
  onReorderCategory: (id: string, direction: 'up' | 'down') => void;
}

export const AdminCategoriesPage: React.FC<AdminCategoriesPageProps> = ({
  categories,
  products,
  onSaveCategory,
  onDeleteCategory,
  onReorderCategory,
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [catName, setCatName] = useState('');
  const [catVisible, setCatVisible] = useState(true);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);

  const getProductsCountForCategory = (catId: string) => {
    return products.filter((p) => p.category_id === catId).length;
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatVisible(cat.visible);
    setIsCreatingNew(false);
  };

  const handleOpenNew = () => {
    setEditingCategory(null);
    setCatName('');
    setCatVisible(true);
    setIsCreatingNew(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const slug = catName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    onSaveCategory({
      id: editingCategory?.id,
      name: catName.trim(),
      slug: slug || `cat-${Date.now()}`,
      visible: catVisible,
    });

    setEditingCategory(null);
    setIsCreatingNew(false);
    setCatName('');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFD1] pb-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1C211E]">
            Gestione Categorie
          </h2>
          <p className="text-xs sm:text-sm text-[#55645A]">
            Organizza le sezioni della vetrina e l'ordine dei filtri visualizzati dai clienti.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 bg-[#1B3B2B] hover:bg-[#28553E] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuova Categoria</span>
        </button>
      </div>

      {/* New / Edit Category Modal */}
      {(isCreatingNew || editingCategory) && (
        <div className="bg-[#FAF7F2] p-5 sm:p-6 rounded-2xl border border-[#D8C3A5] shadow-xs space-y-4 animate-fadeIn">
          <h3 className="font-display font-bold text-base text-[#1C211E]">
            {isCreatingNew ? 'Crea Nuova Categoria' : `Modifica Categoria "${editingCategory?.name}"`}
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">
                  Nome Categoria *
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Es. Pizze al Taglio, Bevande..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={catVisible}
                    onChange={(e) => setCatVisible(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1B3B2B] focus:ring-[#1B3B2B]"
                  />
                  <span className="text-xs font-bold text-[#1C211E]">Visibile</span>
                </label>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setIsCreatingNew(false);
                    }}
                    className="px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200 rounded-lg"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1B3B2B] text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    Salva
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-2xl border border-[#E8DFD1] shadow-xs overflow-hidden">
        <div className="divide-y divide-[#F5F2EB]">
          {sortedCategories.map((cat, index) => {
            const count = getProductsCountForCategory(cat.id);

            return (
              <div
                key={cat.id}
                className="p-4 flex items-center justify-between gap-3 hover:bg-[#FAF7F2]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Reordering arrows */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      disabled={index === 0}
                      onClick={() => onReorderCategory(cat.id, 'up')}
                      className="p-1 text-stone-400 hover:text-[#1B3B2B] disabled:opacity-20"
                      title="Sposta prima"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={index === sortedCategories.length - 1}
                      onClick={() => onReorderCategory(cat.id, 'down')}
                      className="p-1 text-stone-400 hover:text-[#1B3B2B] disabled:opacity-20"
                      title="Sposta dopo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-base text-[#1C211E]">
                        {cat.name}
                      </h4>
                      {!cat.visible && (
                        <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-bold">
                          Nascosta
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#7A8A7E]">
                      {count} {count === 1 ? 'prodotto associato' : 'prodotti associati'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onSaveCategory({
                        ...cat,
                        visible: !cat.visible,
                      })
                    }
                    className={`p-2 rounded-lg border min-h-[36px] min-w-[36px] flex items-center justify-center ${
                      cat.visible
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-stone-100 border-stone-300 text-stone-400'
                    }`}
                    title={cat.visible ? 'Visibile' : 'Nascosta'}
                  >
                    {cat.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-2 bg-[#FAF7F2] hover:bg-[#EAE4D7] text-[#1B3B2B] rounded-lg border border-[#D8C3A5] min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Modifica nome"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCategoryToDelete(cat)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Elimina categoria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        title="Eliminare categoria?"
        message={`Sei sicuro di voler eliminare "${categoryToDelete?.name}"? I prodotti associati resteranno nel sistema senza categoria.`}
        confirmText="Elimina Categoria"
        isDestructive
        onConfirm={() => {
          if (categoryToDelete) {
            onDeleteCategory(categoryToDelete.id);
            setCategoryToDelete(null);
          }
        }}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
};
