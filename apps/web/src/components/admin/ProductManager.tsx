import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Package, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { formatTokenAmount } from '@/lib/utils';
import { Pagination } from '@/components/ui/Pagination';
import { CustomTabs } from '@/components/ui/custom-tabs';

export function ProductManager() {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['admin-products', page, limit, activeSubTab],
    queryFn: async () => {
      return api.getRewards({ 
          page, 
          limit,
          isActive: activeSubTab === 'active' ? 'true' : 'false'
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      cost: parseInt(formData.get('cost') as string),
      stock: parseInt(formData.get('stock') as string),
      imageUrl: formData.get('imageUrl') as string,
      category: formData.get('category') as string,
      isActive: true // Default to true
    };

    try {
      if (editingProduct) {
        await api.updateReward(editingProduct.id, payload);
        toast({ title: 'Product updated successfully' });
      } else {
        await api.createReward(payload);
        toast({ title: 'Product created successfully' });
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Operation Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setIsSubmitting(true);
    try {
        await api.deleteReward(deletingProduct.id);
        toast({ title: 'Product deleted/archived successfully' });
        setIsDeleteModalOpen(false);
        setDeletingProduct(null);
        refetch();
    } catch (error: any) {
        toast({
            title: 'Delete Failed',
            description: error.message,
            variant: 'destructive'
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openDelete = (product: any) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  }

  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
            <h2 className="text-2xl font-bold text-google-grey">Products Inventory</h2>
            <CustomTabs 
                tabs={[
                    { id: 'active', label: 'Active' },
                    { id: 'archived', label: 'Archived' },
                ]}
                activeTab={activeSubTab}
                onChange={(id) => { setActiveSubTab(id); setPage(1); }}
                className="bg-white border border-gray-200 mt-2"
            />
        </div>
        <Button 
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
            className="rounded-xl bg-google-green hover:bg-google-green/90 text-white font-bold"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="bg-white rounded-[2rem] border border-google-grey overflow-hidden shadow-sm flex flex-col min-h-[400px]">
        {isLoading ? (
             <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-google-blue h-8 w-8"/></div>
        ) : (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                    <th className="p-4 font-bold text-google-grey text-sm uppercase tracking-wider">Product</th>
                    <th className="p-4 font-bold text-google-grey text-sm uppercase tracking-wider">Category</th>
                    <th className="p-4 font-bold text-google-grey text-sm uppercase tracking-wider">Price (G-CORE)</th>
                    <th className="p-4 font-bold text-google-grey text-sm uppercase tracking-wider">Stock</th>
                    <th className="p-4 font-bold text-google-grey text-sm uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data?.rewards.map((product) => (
                    <tr key={product.id} className={`hover:bg-gray-50/50 ${!product.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
                        <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <Package className="h-5 w-5 m-auto mt-2 text-gray-400" />
                            )}
                            </div>
                            <div>
                            <p className="font-bold text-google-grey flex items-center gap-2">
                                {product.name}
                                {!product.isActive && <span className="text-[10px] uppercase bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Archived</span>}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                            </div>
                        </div>
                        </td>
                        <td className="p-4 text-sm font-medium text-gray-600">{product.category}</td>
                        <td className="p-4 text-sm font-bold text-google-blue">
                        {formatTokenAmount(product.cost)}
                        </td>
                        <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {product.stock}
                        </span>
                        </td>
                        <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(product)} title="Edit">
                                <Edit2 className="h-4 w-4 text-gray-400 hover:text-google-blue" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDelete(product)} title="Delete">
                                <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                            </Button>
                        </div>
                        </td>
                    </tr>
                    ))}
                    {(!data?.rewards || data.rewards.length === 0) && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">No products found.</td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-auto border-t border-gray-100 bg-gray-50/50">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        limit={limit}
                        onLimitChange={(l) => {
                            setLimit(l);
                            setPage(1);
                        }}
                        totalItems={data?.pagination?.total}
                    />
                </div>
            )}
        </>
        )}
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-bold mb-6 text-google-grey">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                <Input name="name" defaultValue={editingProduct?.name} required className="rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                    name="description" 
                    defaultValue={editingProduct?.description} 
                    required 
                    className="w-full rounded-xl border border-gray-200 p-3 h-24 focus:outline-none focus:ring-2 focus:ring-google-blue"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Price (G-CORE)</label>
                    <Input 
                        name="cost" 
                        type="number" 
                        defaultValue={editingProduct?.cost} 
                        required 
                        min="1" 
                        className="rounded-xl"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Stock</label>
                    <Input 
                        name="stock" 
                        type="number" 
                        defaultValue={editingProduct?.stock} 
                        required 
                        min="0" 
                        className="rounded-xl"
                    />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <select 
                    name="category" 
                    defaultValue={editingProduct?.category || 'Swag'}
                    className="w-full rounded-xl border border-gray-200 p-3 bg-white"
                >
                    <option value="Swag">Swag</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Books">Books</option>
                    <option value="Digital">Digital</option>
                    <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
                <Input name="imageUrl" defaultValue={editingProduct?.imageUrl} className="rounded-xl" placeholder="https://..." />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 rounded-xl hover:bg-gray-100"
                >
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl bg-google-blue text-white font-bold hover:bg-google-blue/90"
                >
                    {isSubmitting ? 'Saving...' : 'Save Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
             <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Product?</h3>
                <p className="text-gray-500 mb-6">
                    Are you sure you want to delete <span className="font-bold text-gray-700">{deletingProduct.name}</span>? 
                    This action cannot be undone. If it has past orders, it will be archived instead.
                </p>
                <div className="flex gap-4">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="flex-1 rounded-xl border-gray-200"
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="button" 
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        className="flex-1 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 border-2 border-red-600 shadow-sm"
                    >
                        {isSubmitting ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
}
