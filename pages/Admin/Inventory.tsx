import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useProducts } from '../../context/ProductContext';
import { useNotification } from '../../context/NotificationContext';

const Inventory: React.FC = () => {
  const { products, deleteProduct, bulkDeleteProducts, addProduct, updateProduct } = useProducts();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = React.useState('All Products');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const filteredProducts = React.useMemo(() => {
    let result = products;

    // Status Filter
    if (activeTab === 'Active') result = result.filter(p => p.status === 'Active');
    if (activeTab === 'Draft') result = result.filter(p => !p.status || p.status === 'Draft');
    if (activeTab === 'Archived') result = result.filter(p => p.status === 'Archived');

    // Filter out Archived from other tabs
    if (activeTab !== 'Archived') {
      result = result.filter(p => p.status !== 'Archived');
    }

    // Search Filter
    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [products, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalInventoryValue = React.useMemo(() => {
    return products.reduce((sum, p) => sum + ((p.cost || p.price || 0) * (p.stock || 0)), 0);
  }, [products]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This will permanently remove its clinical record.`)) {
      try {
        await deleteProduct(id);
        showNotification('Product purged from database', 'success');
      } catch (error) {
        showNotification('Failed to delete product', 'error');
      }
    }
  };

  const handleArchive = async (id: string, name: string, isArchived: boolean) => {
    const action = isArchived ? 'Restore' : 'Archive';
    if (window.confirm(`${action} "${name}"? ${isArchived ? 'It will return to Draft status.' : 'It will be hidden from the storefront and management views.'}`)) {
      try {
        await updateProduct(id, { status: isArchived ? 'Draft' : 'Archived' });
        showNotification(`Product ${isArchived ? 'restored' : 'archived'} successfully`, 'success');
      } catch (error) {
        showNotification(`Failed to ${action.toLowerCase()} product`, 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected products?`)) {
      try {
        await bulkDeleteProducts(selectedIds);
        setSelectedIds([]);
        showNotification('Products deleted successfully', 'success');
      } catch (error) {
        showNotification('Failed to delete products', 'error');
      }
    }
  };

  const handleCopyProduct = async (product: any) => {
    try {
      const { id, ...productData } = product;
      await addProduct({
        ...productData,
        name: `${productData.name} (Copy)`,
        sku: `${productData.sku}-COPY-${Math.floor(Math.random() * 1000)}`
      });
      showNotification('Product duplicated successfully', 'success');
    } catch (error) {
      showNotification('Failed to duplicate product', 'error');
    }
  };

  const handleBulkCopy = async () => {
    if (selectedIds.length === 0) return;
    try {
      showNotification(`Duplicating ${selectedIds.length} products...`, 'info');
      const productsToCopy = products.filter(p => selectedIds.includes(p.id));
      for (const p of productsToCopy) {
        const { id, ...productData } = p;
        await addProduct({
          ...productData,
          name: `${productData.name} (Copy)`,
          sku: `${productData.sku}-COPY-${Math.floor(Math.random() * 1000)}`
        });
      }
      setSelectedIds([]);
      showNotification('Products duplicated successfully', 'success');
    } catch (error) {
      showNotification('Failed to duplicate some products', 'error');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedProducts.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  return (
    <AdminLayout>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#221C1D]">Inventory & Products</h2>
          <p className="text-stone-500 text-sm md:text-base">Manage your skincare collection and track warehouse stock.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider border border-stone-200 hover:bg-stone-50 transition-colors">
            <span className="material-symbols-outlined text-sm">download</span>
            Export
          </button>
          <Link to="/admin/inventory/add" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider bg-[#F2A600] text-black hover:bg-[#D49100] transition-colors rounded">
            <span className="material-symbols-outlined text-sm">add</span>
            Add New Product
          </Link>
        </div>
      </header>

      {/* Inventory Stats - Scalable Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Products', value: products.length.toString(), trend: '0%', trendUp: true, sub: 'All items' },
          { label: 'Low Stock Items', value: products.filter(p => (p.stock || 0) < 10).length.toString(), trend: 'Active', trendUp: false, sub: 'Below 10 units' },
          { label: 'Active Listings', value: products.filter(p => p.status === 'Active').length.toString(), trend: 'Live', trendUp: true, sub: 'Shown to public' },
          { label: 'Total Value', value: 'GH₵' + totalInventoryValue.toLocaleString(), trend: '0%', trendUp: true, sub: 'Inventory worth (Cost)' }
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white border border-stone-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-2">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl md:text-2xl font-bold text-[#221C1D]">{stat.value}</h3>
              <span className={`text-[10px] font-bold ${stat.trendUp ? 'text-green-600' : 'text-stone-400'}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))
        }
      </div>

      {/* Table Area */}
      <div className="bg-white border border-stone-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-6 border-b border-stone-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-6 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {['All Products', 'Active', 'Draft', 'Archived'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap pb-1 transition-all ${activeTab === tab ? 'text-[#221C1D] border-b-2 border-[#F2A600]' : 'text-stone-400 hover:text-stone-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search SKU or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-stone-100 rounded text-[10px] font-bold text-stone-500 bg-stone-50/50 focus:outline-none focus:border-[#F2A600] transition-colors w-48 md:w-64"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-lg text-stone-300">search</span>
            </div>
            <div className="flex gap-1 text-stone-300 text-[10px] font-bold uppercase tracking-widest items-center ml-auto md:ml-4">
              <span className={`hidden sm:inline ${selectedIds.length > 0 ? 'text-[#F2A600]' : ''}`}>
                {selectedIds.length > 0 ? `${selectedIds.length} SELECTED:` : 'BULK:'}
              </span>
              <button
                disabled={selectedIds.length === 0}
                onClick={handleBulkDelete}
                className={`p-1 transition-colors ${selectedIds.length > 0 ? 'text-red-400 hover:text-red-600' : 'cursor-not-allowed'}`}
                title="Bulk Delete"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
              <button
                disabled={selectedIds.length === 0}
                onClick={handleBulkCopy}
                className={`p-1 transition-colors ${selectedIds.length > 0 ? 'text-[#F2A600] hover:text-[#D49100]' : 'cursor-not-allowed'}`}
                title="Bulk Copy"
              >
                <span className="material-symbols-outlined text-lg">content_copy</span>
              </button>
            </div>
          </div>
        </div>

        <div className="md:hidden divide-y divide-stone-50">
          {paginatedProducts.length > 0 ? paginatedProducts.map((p) => (
            <div key={p.id} className="p-6 space-y-4">
              <div className="flex gap-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(p.id)}
                  onChange={() => toggleSelect(p.id)}
                  className="rounded border-stone-300 mt-2"
                />
                <img src={p.image} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" alt={p.name} />
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start gap-2">
                    <h5 className="text-sm font-bold text-[#221C1D] break-words">{p.name}</h5>
                    <div className="flex gap-1">
                      <button onClick={() => handleArchive(p.id, p.name, p.status === 'Archived')} className="p-1 text-stone-300 hover:text-amber-600 transition-colors flex-shrink-0" title={p.status === 'Archived' ? 'Restore' : 'Archive'}>
                        <span className="material-symbols-outlined text-lg">{p.status === 'Archived' ? 'unarchive' : 'archive'}</span>
                      </button>
                      <Link to={`/admin/inventory/edit/${p.id}`} className="p-1 text-stone-300 hover:text-stone-600 transition-colors flex-shrink-0">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-1 text-stone-300 hover:text-red-600 transition-colors flex-shrink-0">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mb-2">{p.category}</p>
                  <span className={`w-fit px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${p.status === 'Active' ? 'bg-green-50 text-green-600' : p.status === 'Archived' ? 'bg-stone-800 text-white' : 'bg-stone-50 text-stone-400'}`}>
                    {p.status || (p.stock && p.stock > 0 ? 'ACTIVE' : 'DRAFT')}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-stone-50">
                <div className="flex flex-col">
                  <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mb-1">SKU</span>
                  <span className="text-xs text-stone-600 font-medium break-all">{p.sku}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mb-1">Price</span>
                  <span className="text-xs font-bold text-[#221C1D]">GH₵{p.price.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mb-1">Stock</span>
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold ${p.stock && p.stock < 10 ? 'text-red-500' : 'text-stone-600'}`}>
                      {p.stock ?? 0}
                    </span>
                    <span className="text-[8px] text-stone-400 font-bold uppercase tracking-tighter">
                      {p.stock && p.stock < 10 ? 'LOW' : 'IN'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-stone-400 font-bold uppercase text-[10px] tracking-widest">No clinical botanicals found.</div>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50/50">
                <th className="px-4 md:px-6 py-4 w-10 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-stone-300"
                    onChange={toggleSelectAll}
                    checked={paginatedProducts.length > 0 && selectedIds.length === paginatedProducts.length}
                  />
                </th>
                <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Product</th>
                <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">SKU</th>
                <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Price</th>
                <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Stock</th>
                <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</th>
                <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {paginatedProducts.length > 0 ? paginatedProducts.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/30 transition-colors">
                  <td className="px-4 md:px-6 py-5 w-10 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-stone-300"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                  </td>
                  <td className="px-4 md:px-6 py-5">
                    <div className="flex items-center gap-4">
                      <img src={p.image} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt={p.name} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-[#221C1D] truncate">{p.name}</span>
                        <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">{p.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-5 text-xs text-stone-500 font-medium whitespace-nowrap">{p.sku}</td>
                  <td className="px-4 md:px-6 py-5 text-sm font-bold text-[#221C1D] whitespace-nowrap">GH₵{p.price.toFixed(2)}</td>
                  <td className="px-4 md:px-6 py-5">
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${p.stock && p.stock < 10 ? 'text-red-500' : 'text-stone-600'}`}>
                        {p.stock ?? 0}
                      </span>
                      <span className="text-[9px] text-stone-400 font-bold uppercase tracking-tighter">
                        {p.stock && p.stock < 10 ? 'LOW STOCK' : 'IN STOCK'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.status === 'Active' ? 'bg-green-50 text-green-600' : p.status === 'Archived' ? 'bg-stone-800 text-white' : 'bg-stone-50 text-stone-400'
                      }`}>
                      {p.status || (p.stock && p.stock > 0 ? 'ACTIVE' : 'DRAFT')}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleArchive(p.id, p.name, p.status === 'Archived')} className="p-2 text-stone-300 hover:text-amber-600 transition-colors" title={p.status === 'Archived' ? 'Restore' : 'Archive'}><span className="material-symbols-outlined">{p.status === 'Archived' ? 'unarchive' : 'archive'}</span></button>
                      <Link to={`/admin/inventory/edit/${p.id}`} className="p-2 text-stone-300 hover:text-stone-600 transition-colors" title="Edit Product"><span className="material-symbols-outlined">edit</span></Link>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-2 text-stone-300 hover:text-red-600 transition-colors" title="Delete Product"><span className="material-symbols-outlined">delete</span></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-stone-400 font-bold uppercase text-[10px] tracking-widest">No clinical botanicals found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 md:p-8 border-t border-stone-50 flex flex-col md:flex-row justify-between items-center gap-4 text-stone-400">
          <span className="text-xs font-medium">Showing {Math.min(filteredProducts.length, itemsPerPage)} of {filteredProducts.length} entries</span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className={`w-8 h-8 flex items-center justify-center border border-stone-100 rounded-md transition-colors ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-stone-50'}`}
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setCurrentPage(n)}
                className={`w-8 h-8 flex items-center justify-center text-[10px] font-bold rounded-md transition-colors ${n === currentPage ? 'bg-[#F2A600] text-white' : 'hover:bg-stone-50'}`}
              >
                {n}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className={`w-8 h-8 flex items-center justify-center border border-stone-100 rounded-md transition-colors ${currentPage === totalPages || totalPages === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-stone-50'}`}
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout >
  );
};

export default Inventory;
