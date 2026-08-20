'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { formatPrice } from '@/lib/utils'
import {
  DollarSign, ShoppingBag, Users, Shield, TrendingUp, RefreshCw,
  Plus, Edit, Trash2, CheckCircle, XCircle, Search, Flame,
  Check, AlertCircle, Sparkles, Filter, X, Layers, FolderPlus,
  Truck, ChefHat, Clock, Phone, MapPin
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MENU' | 'CATEGORIES' | 'USERS' | 'ORDERS'>('OVERVIEW')

  // Overview data
  const [analytics, setAnalytics] = useState<any>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)

  // Menu data
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL')
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)

  // Category management state
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    imageUrl: '',
    sortOrder: 1,
    isActive: true,
  })

  // New/Edit product form state
  const [prodForm, setProdForm] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    categoryId: '',
    imageUrl: '',
    isVeg: false,
    spiceLevel: 1,
    preparationTime: 10,
    isAvailable: true,
    isBestSeller: false,
    isFeatured: false,
    isNewItem: false,
    ingredients: '',
    allergens: '',
  })

  // User management data
  const [usersList, setUsersList] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('ALL')

  // Orders data
  const [ordersList, setOrdersList] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL')
  const [creatingTestOrder, setCreatingTestOrder] = useState(false)

  // Toast feedback notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4000)
  }

  useEffect(() => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      router.push('/auth/login?redirect=/admin')
      return
    }
    fetchAnalytics()
    fetchCategories()
  }, [user])

  useEffect(() => {
    if (activeTab === 'MENU') fetchProducts()
    if (activeTab === 'CATEGORIES') fetchCategories()
    if (activeTab === 'USERS') fetchUsers()
    if (activeTab === 'ORDERS') fetchOrders()
  }, [activeTab])

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true)
      const res = await fetch('/api/admin/analytics')
      const json = await res.json()
      if (json.success) setAnalytics(json.data)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const res = await fetch('/api/admin/categories')
      const json = await res.json()
      if (json.success) setCategories(json.data)
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true)
      const res = await fetch('/api/admin/products')
      const json = await res.json()
      if (json.success) setProducts(json.data)
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const res = await fetch('/api/admin/users')
      const json = await res.json()
      if (json.success) setUsersList(json.data)
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true)
      const res = await fetch('/api/admin/orders')
      const json = await res.json()
      if (json.success) setOrdersList(json.data)
    } finally {
      setLoadingOrders(false)
    }
  }

  // ── Order Handlers ──────────────────────────────────────────────────────────
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, shortCode: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const json = await res.json()
      if (json.success) {
        setOrdersList((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        )
        showNotification('success', `Order ${shortCode} updated to ${newStatus}`)
      } else {
        showNotification('error', json.error || 'Failed to update status')
      }
    } catch (e: any) {
      showNotification('error', e.message || 'Error updating order')
    }
  }

  const handleCreateMockOrder = async () => {
    try {
      setCreatingTestOrder(true)
      const res = await fetch('/api/orders/mock-create', { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        showNotification('success', `🔥 New Live Test Order ${json.data.shortCode} created!`)
        fetchOrders()
      } else {
        showNotification('error', json.error || 'Failed to create test order')
      }
    } finally {
      setCreatingTestOrder(false)
    }
  }

  // ── Category Handlers ──────────────────────────────────────────────────────
  const handleOpenAddCategory = () => {
    setEditingCategory(null)
    setCategoryForm({
      name: '',
      imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600',
      sortOrder: (categories.length || 0) + 1,
      isActive: true,
    })
    setShowAddCategoryModal(true)
  }

  const handleOpenEditCategory = (cat: any) => {
    setEditingCategory(cat)
    setCategoryForm({
      name: cat.name,
      imageUrl: cat.imageUrl || '',
      sortOrder: cat.sortOrder || 1,
      isActive: cat.isActive ?? true,
    })
    setShowAddCategoryModal(true)
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryForm),
        })
        const json = await res.json()
        if (json.success) {
          showNotification('success', `Category "${categoryForm.name}" updated!`)
          setShowAddCategoryModal(false)
          fetchCategories()
        } else {
          showNotification('error', json.error || 'Failed to update category')
        }
      } else {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryForm),
        })
        const json = await res.json()
        if (json.success) {
          showNotification('success', `Category "${categoryForm.name}" created!`)
          setShowAddCategoryModal(false)
          fetchCategories()
        } else {
          showNotification('error', json.error || 'Failed to create category')
        }
      }
    } catch (e: any) {
      showNotification('error', e.message || 'Error saving category')
    }
  }

  const handleDeleteCategory = async (cat: any) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        showNotification('success', `Category "${cat.name}" deleted.`)
        fetchCategories()
      } else {
        showNotification('error', json.error || 'Failed to delete category')
      }
    } catch (e: any) {
      showNotification('error', e.message || 'Error deleting category')
    }
  }

  // ── Product Handlers ────────────────────────────────────────────────────────
  const handleOpenAddProduct = () => {
    setEditingProduct(null)
    setProdForm({
      name: '',
      description: '',
      price: '',
      discountPrice: '',
      categoryId: categories[0]?.id || 'signature-rolls',
      imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800',
      isVeg: false,
      spiceLevel: 1,
      preparationTime: 10,
      isAvailable: true,
      isBestSeller: false,
      isFeatured: false,
      isNewItem: true,
      ingredients: 'Chicken Tikka, Paratha, Mint Chutney',
      allergens: 'Dairy, Gluten',
    })
    setShowAddProductModal(true)
  }

  const handleOpenEditProduct = (prod: any) => {
    setEditingProduct(prod)
    let ingStr = ''
    let algStr = ''
    try {
      const ingArr = typeof prod.ingredients === 'string' ? JSON.parse(prod.ingredients) : prod.ingredients
      ingStr = Array.isArray(ingArr) ? ingArr.join(', ') : ''
    } catch {
      ingStr = prod.ingredients || ''
    }
    try {
      const algArr = typeof prod.allergens === 'string' ? JSON.parse(prod.allergens) : prod.allergens
      algStr = Array.isArray(algArr) ? algArr.join(', ') : ''
    } catch {
      algStr = prod.allergens || ''
    }

    setProdForm({
      name: prod.name,
      description: prod.description,
      price: prod.price.toString(),
      discountPrice: prod.discountPrice ? prod.discountPrice.toString() : '',
      categoryId: prod.categoryId,
      imageUrl: prod.imageUrl || '',
      isVeg: prod.isVeg,
      spiceLevel: prod.spiceLevel,
      preparationTime: prod.preparationTime,
      isAvailable: prod.isAvailable,
      isBestSeller: prod.isBestSeller,
      isFeatured: prod.isFeatured,
      isNewItem: prod.isNewItem,
      ingredients: ingStr,
      allergens: algStr,
    })
    setShowAddProductModal(true)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...prodForm,
        price: parseFloat(prodForm.price),
        discountPrice: prodForm.discountPrice ? parseFloat(prodForm.discountPrice) : null,
        ingredients: prodForm.ingredients.split(',').map((s) => s.trim()).filter(Boolean),
        allergens: prodForm.allergens.split(',').map((s) => s.trim()).filter(Boolean),
      }

      if (editingProduct) {
        const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (json.success) {
          showNotification('success', `Product "${payload.name}" updated successfully!`)
          setShowAddProductModal(false)
          fetchProducts()
        } else {
          showNotification('error', json.error || 'Failed to update product')
        }
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (json.success) {
          showNotification('success', `Product "${payload.name}" created successfully!`)
          setShowAddProductModal(false)
          fetchProducts()
        } else {
          showNotification('error', json.error || 'Failed to create product')
        }
      }
    } catch (e: any) {
      showNotification('error', e.message || 'Error saving product')
    }
  }

  const handleToggleProductAvailability = async (product: any) => {
    try {
      const newAvailability = !product.isAvailable
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newAvailability }),
      })
      const json = await res.json()
      if (json.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, isAvailable: newAvailability } : p))
        )
        showNotification('success', `${product.name} is now ${newAvailability ? 'IN STOCK' : 'SOLD OUT'}`)
      }
    } catch {}
  }

  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" from the menu?`)) return
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        showNotification('success', `"${name}" removed from menu.`)
        fetchProducts()
      } else {
        showNotification('error', json.error || 'Failed to delete product')
      }
    } catch (e: any) {
      showNotification('error', e.message || 'Error deleting product')
    }
  }

  // ── User Handlers ──────────────────────────────────────────────────────────
  const handleUpdateUserRole = async (userId: string, newRole: string, userName: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      const json = await res.json()
      if (json.success) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        )
        showNotification('success', `Role for ${userName} updated to ${newRole}!`)
      } else {
        showNotification('error', json.error || 'Failed to update role')
      }
    } catch (e: any) {
      showNotification('error', e.message || 'Error updating user')
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete account for "${userName}"?`)) return
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        showNotification('success', `User "${userName}" deleted.`)
        fetchUsers()
      } else {
        showNotification('error', json.error || 'Failed to delete user')
      }
    } catch (e: any) {
      showNotification('error', e.message || 'Error deleting user')
    }
  }

  // Filtered lists
  const filteredProducts = products.filter((p) => {
    if (productCategoryFilter !== 'ALL' && p.categoryId !== productCategoryFilter) return false
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase()
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    }
    return true
  })

  const filteredUsers = usersList.filter((u) => {
    if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase()
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q))
      )
    }
    return true
  })

  const filteredOrders = ordersList.filter((o) => {
    if (orderStatusFilter !== 'ALL' && o.status !== orderStatusFilter) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed top-24 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold text-white animate-slide-up ${
            feedback.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#22092C] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#BE3144]/60 text-xs font-black uppercase tracking-wider text-white mb-2">
            <Shield className="w-3.5 h-3.5" /> Executive Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">RockinRoll Admin Console</h1>
          <p className="text-xs text-neutral-300">Live platform operations, master order queue, menu catalog & user roles</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-2xl border border-white/10 overflow-x-auto w-full lg:w-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'OVERVIEW'
                ? 'bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white shadow'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'ORDERS'
                ? 'bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white shadow'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Live Orders ({ordersList.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status)).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('MENU')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'MENU'
                ? 'bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white shadow'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            Menu Items ({products.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('CATEGORIES')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'CATEGORIES'
                ? 'bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white shadow'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Categories ({categories.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'USERS'
                ? 'bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white shadow'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            Users ({usersList.length || 0})
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB: LIVE ORDERS (MASTER CONTROLLER) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'ORDERS' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-[#22092C]">Live Master Order Queue</h3>
              <p className="text-xs text-neutral-500">Full platform orders with real-time status overriding</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleCreateMockOrder}
                disabled={creatingTestOrder}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> {creatingTestOrder ? 'Placing...' : '+ Create Test Live Order'}
              </button>
              <button
                onClick={fetchOrders}
                className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700"
                title="Refresh Orders"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-neutral-100 pb-3">
            {['ALL', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setOrderStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  orderStatusFilter === st
                    ? 'bg-[#22092C] text-white shadow'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {st === 'ALL' ? 'All Orders' : st} (
                {st === 'ALL'
                  ? ordersList.length
                  : ordersList.filter((o) => o.status === st).length}
                )
              </button>
            ))}
          </div>

          {loadingOrders ? (
            <div className="h-64 bg-neutral-200 rounded-2xl animate-pulse" />
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-neutral-500 space-y-2">
              <ShoppingBag className="w-8 h-8 mx-auto text-neutral-400" />
              <p className="font-bold">No orders found in this status category</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((ord) => {
                const isCOD = ord.payment?.gateway === 'COD'
                const phone = ord.address?.phone || ord.user?.phone || '9876543210'

                return (
                  <div
                    key={ord.id}
                    className="p-6 rounded-3xl border border-neutral-200/90 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-black text-lg text-[#22092C]">{ord.shortCode}</span>
                        <span
                          className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            ord.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-[#22092C] text-white'
                          }`}
                        >
                          {ord.status}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isCOD ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {isCOD ? 'Cash on Delivery' : 'Prepaid (Paid)'}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {new Date(ord.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-700 flex flex-wrap gap-x-6 gap-y-1">
                        <p>
                          <span className="font-bold text-[#22092C]">Customer:</span> {ord.user?.name} ({phone})
                        </p>
                        {ord.address && (
                          <p>
                            <span className="font-bold text-[#22092C]">Address:</span> {ord.address.houseFlatNo}, {ord.address.street}, {ord.address.area}
                          </p>
                        )}
                      </div>

                      {ord.specialInstructions && (
                        <p className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold">
                          Note: {ord.specialInstructions}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 text-xs font-bold text-[#22092C]">
                        {ord.items?.map((i: any) => (
                          <span key={i.id} className="px-2.5 py-1 bg-neutral-100 rounded-lg">
                            {i.quantity}x {i.name}
                            {i.addons?.length > 0 && (
                              <span className="text-[#BE3144] ml-1 text-[11px]">
                                (+{i.addons.map((a: any) => a.name).join(', ')})
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-3 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0">
                      <span className="text-xl font-black text-[#BE3144]">
                        {formatPrice(ord.grandTotal)}
                      </span>

                      {/* Admin Force Status Selector */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value, ord.shortCode)}
                          className="px-3 py-2 rounded-xl text-xs font-black uppercase border border-neutral-300 bg-white text-[#22092C] focus:ring-[#BE3144]"
                        >
                          <option value="CONFIRMED">CONFIRMED (NEW)</option>
                          <option value="PREPARING">PREPARING (KITCHEN)</option>
                          <option value="READY">READY FOR PICKUP</option>
                          <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>

                        <button
                          onClick={() => router.push(`/orders/${ord.shortCode}`)}
                          className="px-3 py-2 bg-[#22092C] text-white text-xs font-bold rounded-xl hover:bg-[#872341] whitespace-nowrap"
                        >
                          Tracker
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB: OVERVIEW & ANALYTICS */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          {loadingAnalytics ? (
            <div className="h-96 bg-neutral-200 rounded-3xl animate-pulse" />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-neutral-500">
                    <span className="text-xs font-bold uppercase">Total Revenue</span>
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-black text-[#22092C]">{formatPrice(analytics?.totalRevenue || 0)}</h3>
                  <p className="text-[11px] text-emerald-600 font-bold">+18.4% this month</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-neutral-500">
                    <span className="text-xs font-bold uppercase">Total Orders</span>
                    <ShoppingBag className="w-5 h-5 text-[#BE3144]" />
                  </div>
                  <h3 className="text-2xl font-black text-[#22092C]">{analytics?.totalOrders || 0}</h3>
                  <p className="text-[11px] text-neutral-500 font-medium">{analytics?.deliveredOrders || 0} delivered</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-neutral-500">
                    <span className="text-xs font-bold uppercase">Active Orders</span>
                    <TrendingUp className="w-5 h-5 text-[#F05941]" />
                  </div>
                  <h3 className="text-2xl font-black text-[#22092C]">{analytics?.pendingOrders || 0}</h3>
                  <p className="text-[11px] text-amber-600 font-bold">In kitchen / on road</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-neutral-500">
                    <span className="text-xs font-bold uppercase">Registered Customers</span>
                    <Users className="w-5 h-5 text-[#872341]" />
                  </div>
                  <h3 className="text-2xl font-black text-[#22092C]">{analytics?.totalCustomers || 0}</h3>
                  <p className="text-[11px] text-neutral-500">Active accounts</p>
                </div>
              </div>

              {analytics?.chartData && analytics.chartData.length > 0 && (
                <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
                  <h3 className="text-base font-extrabold text-[#22092C]">Sales Trend & Volume</h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.chartData}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#BE3144" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#BE3144" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F5F1EF" />
                        <XAxis dataKey="day" stroke="#6B6260" fontSize={11} />
                        <YAxis stroke="#6B6260" fontSize={11} />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#BE3144" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-[#22092C] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#BE3144]" /> Security Audit Logs
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-neutral-100 text-neutral-400 font-bold uppercase">
                      <tr>
                        <th className="py-2">Timestamp</th>
                        <th className="py-2">Action</th>
                        <th className="py-2">User / Email</th>
                        <th className="py-2">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {analytics?.recentAuditLogs?.map((log: any) => (
                        <tr key={log.id} className="text-neutral-700">
                          <td className="py-2.5 font-medium">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="py-2.5 font-bold text-[#BE3144]">{log.action}</td>
                          <td className="py-2.5">{log.user?.email || 'Anonymous'}</td>
                          <td className="py-2.5 text-neutral-400">{log.ipAddress || '127.0.0.1'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB: MENU MANAGEMENT */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'MENU' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search rolls, bowls..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:ring-[#BE3144] text-[#1A1A1A] font-bold"
                />
              </div>

              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="w-full sm:w-auto p-2 text-xs rounded-xl border border-neutral-300 font-bold text-[#22092C]"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={fetchProducts}
                className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700"
                title="Refresh Menu"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleOpenAddProduct}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg hover:brightness-110"
              >
                <Plus className="w-4 h-4" /> Add New Roll / Item
              </button>
            </div>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-neutral-200 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className={`bg-white rounded-3xl border overflow-hidden shadow-sm flex flex-col justify-between transition-all ${
                    !prod.isAvailable ? 'opacity-70 border-dashed border-red-300' : 'border-neutral-200'
                  }`}
                >
                  <div className="relative h-44 w-full bg-neutral-100">
                    <img
                      src={prod.imageUrl || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600'}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-white ${prod.isVeg ? 'bg-green-600' : 'bg-red-600'}`}>
                        {prod.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                      {prod.isBestSeller && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#BE3144] text-white">
                          Bestseller
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleToggleProductAvailability(prod)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg transition-all ${
                          prod.isAvailable
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {prod.isAvailable ? 'In Stock' : 'Sold Out'}
                      </button>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#BE3144] uppercase tracking-wider">
                          {prod.category?.name}
                        </span>
                        <span className="text-xs text-neutral-400">{prod.preparationTime}m prep</span>
                      </div>
                      <h4 className="font-extrabold text-base text-[#22092C] mt-1">{prod.name}</h4>
                      <p className="text-xs text-neutral-500 line-clamp-2 mt-1">{prod.description}</p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <div>
                        <span className="text-base font-black text-[#22092C]">
                          {formatPrice(prod.discountPrice ?? prod.price)}
                        </span>
                        {prod.discountPrice && (
                          <span className="text-xs text-neutral-400 line-through ml-1.5">
                            {formatPrice(prod.price)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="p-2 rounded-xl bg-neutral-100 hover:bg-[#872341] hover:text-white text-neutral-700 transition-colors"
                          title="Edit Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 transition-colors"
                          title="Delete from Menu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB: CATEGORIES */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'CATEGORIES' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-[#22092C]">Menu Categories</h3>
              <p className="text-xs text-neutral-500">Manage categories displayed on customer menu and homepage</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={fetchCategories}
                className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700"
                title="Refresh Categories"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleOpenAddCategory}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg hover:brightness-110"
              >
                <FolderPlus className="w-4 h-4" /> Add New Category
              </button>
            </div>
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 bg-neutral-200 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-neutral-100 flex-shrink-0 shadow-inner">
                      <img
                        src={cat.imageUrl || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300'}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-[#22092C]">{cat.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${cat.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {cat.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 font-mono">ID: {cat.id}</p>
                      <p className="text-xs text-neutral-600 font-bold">
                        {cat._count?.products || 0} active products • Sort: #{cat.sortOrder}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400 font-medium">Order Priority: {cat.sortOrder}</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="p-2 rounded-xl bg-neutral-100 hover:bg-[#872341] hover:text-white text-neutral-700 transition-colors"
                        title="Edit Category"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB: USER MANAGEMENT */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'USERS' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:ring-[#BE3144] text-[#1A1A1A] font-bold"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="w-full sm:w-auto p-2 text-xs rounded-xl border border-neutral-300 font-bold text-[#22092C]"
              >
                <option value="ALL">All Roles</option>
                <option value="CUSTOMER">Customers</option>
                <option value="STAFF">Kitchen Staff</option>
                <option value="DELIVERY_PARTNER">Delivery Riders</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>

            <button
              onClick={fetchUsers}
              className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-bold flex items-center gap-2 hover:bg-neutral-100"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Users
            </button>
          </div>

          {loadingUsers ? (
            <div className="h-64 bg-neutral-200 rounded-2xl animate-pulse" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 text-neutral-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Orders</th>
                    <th className="py-3 px-3">Joined Date</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#22092C] text-white flex items-center justify-center font-bold text-xs">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#22092C]">{u.name}</p>
                            <p className="text-[11px] text-neutral-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-neutral-600 font-medium">
                        {u.phone || '—'}
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u.id, e.target.value, u.name)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase border focus:outline-none ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-50 border-purple-300 text-purple-800'
                              : u.role === 'STAFF'
                              ? 'bg-amber-50 border-amber-300 text-amber-800'
                              : u.role === 'DELIVERY_PARTNER'
                              ? 'bg-blue-50 border-blue-300 text-blue-800'
                              : 'bg-neutral-100 border-neutral-300 text-neutral-800'
                          }`}
                        >
                          <option value="CUSTOMER">CUSTOMER</option>
                          <option value="STAFF">STAFF (KITCHEN)</option>
                          <option value="DELIVERY_PARTNER">DELIVERY RIDER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 font-bold text-[#22092C]">
                        {u._count?.orders || 0}
                      </td>
                      <td className="py-3 px-3 text-neutral-500">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {u.id !== user?.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="text-xl font-black text-[#22092C]">
                {editingProduct ? `Edit ${editingProduct.name}` : 'Add New Gourmet Roll / Item'}
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Malai Chicken Tikka Roll"
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 focus:ring-[#BE3144] font-bold text-[#1A1A1A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Category *</label>
                  <select
                    required
                    value={prodForm.categoryId}
                    onChange={(e) => setProdForm({ ...prodForm, categoryId: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 font-bold text-[#22092C]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Description *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Appetizing description of spices, marinade, and rolling paratha..."
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 focus:ring-[#BE3144] text-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Regular Price (₹) *</label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="249"
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 focus:ring-[#BE3144] font-bold text-[#1A1A1A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Discounted Price (₹)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="219 (Optional)"
                    value={prodForm.discountPrice}
                    onChange={(e) => setProdForm({ ...prodForm, discountPrice: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 focus:ring-[#BE3144] font-bold text-[#1A1A1A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Prep Time (Mins)</label>
                  <input
                    type="number"
                    value={prodForm.preparationTime}
                    onChange={(e) => setProdForm({ ...prodForm, preparationTime: parseInt(e.target.value) || 10 })}
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 focus:ring-[#BE3144] font-bold text-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={prodForm.imageUrl}
                  onChange={(e) => setProdForm({ ...prodForm, imageUrl: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 focus:ring-[#BE3144] text-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Ingredients (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Chicken, Butter, Mozzarella, Paratha"
                    value={prodForm.ingredients}
                    onChange={(e) => setProdForm({ ...prodForm, ingredients: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 focus:ring-[#BE3144] text-[#1A1A1A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Allergens (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Dairy, Gluten, Eggs"
                    value={prodForm.allergens}
                    onChange={(e) => setProdForm({ ...prodForm, allergens: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 focus:ring-[#BE3144] text-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 bg-[#FFF8F5] p-3 rounded-2xl border border-neutral-200">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isVeg}
                    onChange={(e) => setProdForm({ ...prodForm, isVeg: e.target.checked })}
                    className="rounded text-green-600 focus:ring-green-600"
                  />
                  <span>Pure Veg</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isAvailable}
                    onChange={(e) => setProdForm({ ...prodForm, isAvailable: e.target.checked })}
                    className="rounded text-[#BE3144] focus:ring-[#BE3144]"
                  />
                  <span>In Stock</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isBestSeller}
                    onChange={(e) => setProdForm({ ...prodForm, isBestSeller: e.target.checked })}
                    className="rounded text-[#BE3144] focus:ring-[#BE3144]"
                  />
                  <span>Bestseller</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isFeatured}
                    onChange={(e) => setProdForm({ ...prodForm, isFeatured: e.target.checked })}
                    className="rounded text-[#BE3144] focus:ring-[#BE3144]"
                  />
                  <span>Featured</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 py-3 rounded-xl border border-neutral-300 text-xs font-bold hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white text-xs font-black shadow-lg hover:brightness-110"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT CATEGORY */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="text-xl font-black text-[#22092C]">
                {editingCategory ? `Edit Category` : 'Add New Category'}
              </h3>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artisanal Kathi Rolls"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 focus:ring-[#BE3144] font-bold text-[#1A1A1A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Image Thumbnail URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={categoryForm.imageUrl}
                  onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 focus:ring-[#BE3144] text-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Sort Priority</label>
                  <input
                    type="number"
                    value={categoryForm.sortOrder}
                    onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 focus:ring-[#BE3144] font-bold text-[#1A1A1A]"
                  />
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer p-2.5 bg-[#FFF8F5] rounded-xl border border-neutral-200">
                    <input
                      type="checkbox"
                      checked={categoryForm.isActive}
                      onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                      className="rounded text-[#BE3144] focus:ring-[#BE3144]"
                    />
                    <span>Active / Visible</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="flex-1 py-3 rounded-xl border border-neutral-300 text-xs font-bold hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white text-xs font-black shadow-lg hover:brightness-110"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
