'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { formatPrice } from '@/lib/utils'
import {
  DollarSign, ShoppingBag, Users, Shield, TrendingUp, RefreshCw,
  Plus, Edit, Trash2, CheckCircle, XCircle, Search, Flame,
  Check, AlertCircle, Sparkles, Filter, X, Layers, FolderPlus,
  Truck, ChefHat, Clock, Phone, MapPin, Tag, Key, Globe, MessageSquare, UploadCloud, Package, Activity, BarChart3, AlertTriangle,
  Send, Copy, HelpCircle, ExternalLink, Mail, CheckCheck, Smartphone, QrCode
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MENU' | 'CATEGORIES' | 'COUPONS' | 'INVENTORY' | 'USERS' | 'ORDERS' | 'INTEGRATIONS'>('OVERVIEW')

  // Overview data
  
  // Coupon management state
  const [couponsList, setCouponsList] = useState<any[]>([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [showAddCouponModal, setShowAddCouponModal] = useState(false)
  const [couponForm, setCouponForm] = useState({
    id: '',
    discountType: 'FLAT',
    value: 50,
    minOrderAmount: 199,
    maxDiscount: 50,
    isActive: true,
  })

  // WhatsApp test state
  const [testPhone, setTestPhone] = useState('')
  const [testingWhatsApp, setTestingWhatsApp] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [uploadingProdImage, setUploadingProdImage] = useState(false)
  const [uploadingCatImage, setUploadingCatImage] = useState(false)

  const handleAdminFileUpload = async (file: File, type: 'PRODUCT' | 'CATEGORY') => {
    const isProd = type === 'PRODUCT'
    if (isProd) setUploadingProdImage(true)
    else setUploadingCatImage(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()

      if (json.success && json.url) {
        if (isProd) {
          setProdForm((prev) => ({ ...prev, imageUrl: json.url }))
        } else {
          setCategoryForm((prev) => ({ ...prev, imageUrl: json.url }))
        }
        showNotification('success', 'Image uploaded successfully!')
      } else {
        showNotification('error', json.error || 'Failed to upload image')
      }
    } catch {
      showNotification('error', 'Error uploading image')
    } finally {
      if (isProd) setUploadingProdImage(false)
      else setUploadingCatImage(false)
    }
  }

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(keyName)
    setTimeout(() => setCopiedKey(null), 2500)
    showNotification('success', `Copied to clipboard!`)
  }

  
  // Live Settings & API Keys State
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({
    CASHFREE_APP_ID: '',
    CASHFREE_SECRET_KEY: '',
    CASHFREE_ENVIRONMENT: 'PROD',
    RESEND_API_KEY: '',
    RESEND_FROM_EMAIL: 'orders@rockinroll.in',
    BREVO_API_KEY: '',
    BREVO_SENDER_EMAIL: 'rockinroll@gmail.com',
    WHATSAPP_API_KEY: '',
    WHATSAPP_PHONE_ID: '',
    ULTRAMSG_INSTANCE_ID: '',
    ULTRAMSG_TOKEN: '',
  })
  const [loadingSettings, setLoadingSettings] = useState(false)
  const [savingSection, setSavingSection] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoadingSettings(true)
      const res = await fetch('/api/admin/settings')
      const json = await res.json()
      if (json.success && json.data) {
        const loaded: Record<string, string> = {}
        for (const [k, v] of Object.entries(json.data as Record<string, any>)) {
          loaded[k] = v.value || ''
        }
        setSettingsForm((prev) => ({ ...prev, ...loaded }))
      }
    } finally {
      setLoadingSettings(false)
    }
  }

  const handleSaveSettings = async (keysToSave: string[], sectionName: string) => {
    try {
      setSavingSection(sectionName)
      const payload: Record<string, string> = {}
      for (const k of keysToSave) {
        payload[k] = settingsForm[k] || ''
      }

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.success) {
        showNotification('success', `${sectionName} credentials saved to database!`)
        fetchSettings()
      } else {
        showNotification('error', json.error || 'Failed to save credentials')
      }
    } catch (e: any) {
      showNotification('error', e.message || 'Error saving settings')
    } finally {
      setSavingSection(null)
    }
  }

  
  // Inventory state
  const [inventoryList, setInventoryList] = useState<any[]>([])
  const [lowStockCount, setLowStockCount] = useState(0)
  const [loadingInventory, setLoadingInventory] = useState(false)
  const [editingInventoryItem, setEditingInventoryItem] = useState<any>(null)
  const [restockQty, setRestockQty] = useState<number>(10)

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
    if (activeTab === 'COUPONS') fetchCoupons()
    if (activeTab === 'INVENTORY') fetchInventory()
    if (activeTab === 'INTEGRATIONS') fetchSettings()
  }, [activeTab])

  
  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true)
      const res = await fetch('/api/admin/coupons')
      const json = await res.json()
      if (json.success) setCouponsList(json.data)
    } finally {
      setLoadingCoupons(false)
    }
  }

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: couponForm.id.trim().toUpperCase(),
          discountType: couponForm.discountType,
          value: parseFloat(couponForm.value as any) || 0,
          minOrderAmount: parseFloat(couponForm.minOrderAmount as any) || 0,
          maxDiscount: couponForm.maxDiscount ? parseFloat(couponForm.maxDiscount as any) : null,
          isActive: couponForm.isActive,
        }),
      })
      const json = await res.json()
      if (json.success) {
        showNotification('success', `Coupon '${couponForm.id}' created successfully!`)
        setShowAddCouponModal(false)
        setCouponForm({ id: '', discountType: 'FLAT', value: 50, minOrderAmount: 199, maxDiscount: 50, isActive: true })
        fetchCoupons()
      } else {
        showNotification('error', json.error || 'Failed to create coupon')
      }
    } catch (e: any) {
      showNotification('error', e.message || 'Error creating coupon')
    }
  }

  const handleToggleCoupon = async (couponId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      const json = await res.json()
      if (json.success) {
        setCouponsList((prev) =>
          prev.map((c) => (c.id === couponId ? { ...c, isActive: !currentStatus } : c))
        )
        showNotification('success', `Coupon ${couponId} is now ${!currentStatus ? 'ACTIVE' : 'PAUSED'}`)
      } else {
        showNotification('error', json.error || 'Failed to update coupon')
      }
    } catch (e: any) {
      showNotification('error', e.message || 'Error updating coupon')
    }
  }

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm(`Are you sure you want to delete coupon code "${couponId}"?`)) return
    try {
      const res = await fetch(`/api/admin/coupons/${couponId}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        showNotification('success', `Coupon ${couponId} deleted`)
        fetchCoupons()
      } else {
        showNotification('error', json.error || 'Failed to delete coupon')
      }
    } catch (e: any) {
      showNotification('error', e.message || 'Error deleting coupon')
    }
  }

  const handleSendTestWhatsApp = async () => {
    if (!testPhone || testPhone.length < 10) {
      showNotification('error', 'Please enter a valid 10-digit mobile number')
      return
    }
    try {
      setTestingWhatsApp(true)
      const res = await fetch('/api/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone }),
      })
      const json = await res.json()
      if (json.success) {
        showNotification('success', `WhatsApp test OTP sent to +91 ${testPhone}`)
      } else {
        showNotification('error', json.error || 'Failed to dispatch WhatsApp message')
      }
    } catch (e: any) {
      showNotification('error', e.message || 'WhatsApp error')
    } finally {
      setTestingWhatsApp(false)
    }
  }

  
  const fetchInventory = async () => {
    try {
      setLoadingInventory(true)
      const res = await fetch('/api/admin/inventory')
      const json = await res.json()
      if (json.success) {
        setInventoryList(json.data)
        setLowStockCount(json.lowStockCount || 0)
      }
    } finally {
      setLoadingInventory(false)
    }
  }

  const handleUpdateStock = async (itemId: string, newQty: number, itemName: string) => {
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, currentQty: newQty }),
      })
      const json = await res.json()
      if (json.success) {
        showNotification('success', `Stock updated for ${itemName}: ${newQty}`)
        fetchInventory()
      } else {
        showNotification('error', json.error || 'Failed to update stock')
      }
    } catch (e: any) {
      showNotification('error', e.message || 'Error updating stock')
    }
  }

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
          <button
            onClick={() => setActiveTab('COUPONS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'COUPONS'
                ? 'bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white shadow'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Coupons ({couponsList.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'INVENTORY'
                ? 'bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white shadow'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventory & Rush</span>
            {lowStockCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black animate-pulse">
                {lowStockCount} LOW
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('INTEGRATIONS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'INTEGRATIONS'
                ? 'bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white shadow'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Integrations & Setup</span>
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
      {/* TAB: COUPONS & DISCOUNT ENGINE */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'COUPONS' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Tag className="w-6 h-6 text-[#BE3144]" />
                <h2 className="text-xl font-black text-[#22092C]">Promo Coupons & Discount Engine</h2>
              </div>
              <p className="text-xs text-neutral-500">Create percentage or flat vouchers, minimum order restrictions, and promotional campaigns</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowAddCouponModal(true)}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" /> Create New Coupon
              </button>
              <button
                onClick={fetchCoupons}
                className="p-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                title="Refresh Coupons"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Coupons</p>
                <h3 className="text-2xl font-black text-[#22092C] mt-1">{couponsList.length}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
                <Tag className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Active Promos</p>
                <h3 className="text-2xl font-black text-emerald-900 mt-1">
                  {couponsList.filter((c) => c.isActive).length}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Campus Special</p>
                <h3 className="text-2xl font-black text-amber-900 mt-1">CGC50</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Coupons Table */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
            {loadingCoupons ? (
              <div className="p-12 text-center text-xs text-neutral-400">Loading coupons...</div>
            ) : couponsList.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Tag className="w-10 h-10 text-neutral-300 mx-auto" />
                <h4 className="font-bold text-[#22092C]">No coupons created yet</h4>
                <p className="text-xs text-neutral-500">Create your first promo code to boost orders!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#22092C] text-white font-extrabold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-4 px-6">Coupon Code</th>
                      <th className="py-4 px-6">Discount Value</th>
                      <th className="py-4 px-6">Min Order</th>
                      <th className="py-4 px-6">Max Cap</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                    {couponsList.map((c) => (
                      <tr key={c.id} className="hover:bg-[#FFF8F5]/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm px-3 py-1 bg-neutral-100 rounded-lg text-[#22092C] border border-neutral-200">
                              {c.id}
                            </span>
                            <button
                              onClick={() => copyToClipboard(c.id, c.id)}
                              className="text-neutral-400 hover:text-[#BE3144]"
                              title="Copy code"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-extrabold text-[#BE3144]">
                            {c.discountType === 'PERCENTAGE' ? `${c.value}% OFF` : `₹${c.value} FLAT OFF`}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-neutral-800">
                          {c.minOrderAmount > 0 ? formatPrice(c.minOrderAmount) : 'No Minimum'}
                        </td>
                        <td className="py-4 px-6">
                          {c.maxDiscount ? formatPrice(c.maxDiscount) : 'No Limit'}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleToggleCoupon(c.id, c.isActive)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors ${
                              c.isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${c.isActive ? 'bg-emerald-600' : 'bg-neutral-500'}`} />
                            {c.isActive ? 'ACTIVE' : 'PAUSED'}
                          </button>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteCoupon(c.id)}
                            className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/*       
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB: INVENTORY STOCK ALERTS & KITCHEN RUSH HEATMAP */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'INVENTORY' && (
        <div className="space-y-8">
          
          {/* Header */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Package className="w-6 h-6 text-[#BE3144]" />
                <h2 className="text-xl font-black text-[#22092C]">Kitchen Inventory & Peak Rush Heatmap</h2>
              </div>
              <p className="text-xs text-neutral-500">
                Monitor live ingredient stocks, receive low-threshold alerts, and plan prep shifts with hourly rush forecasts
              </p>
            </div>

            <button
              onClick={fetchInventory}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-xs font-bold text-neutral-700 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingInventory ? 'animate-spin' : ''}`} /> Refresh Inventory
            </button>
          </div>

          {/* Low stock alert banner */}
          {lowStockCount > 0 && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-3xl flex items-center justify-between gap-4 text-red-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm">Low Stock Alert Detected</h4>
                  <p className="text-xs text-red-700">
                    {lowStockCount} kitchen ingredient(s) have fallen below their safety threshold. Restock immediately to prevent delayed orders during peak rush.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Kitchen Peak Rush 24-Hour Forecast Heatmap */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#BE3144]" />
                  <h3 className="font-extrabold text-base text-[#22092C]">24-Hour Kitchen Rush Intensity Heatmap</h3>
                </div>
                <p className="text-xs text-neutral-500">Hourly order load based on campus lunch, evening tea & late-night delivery patterns</p>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-neutral-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Normal
                </span>
                <span className="flex items-center gap-1.5 text-amber-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderate
                </span>
                <span className="flex items-center gap-1.5 text-red-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Peak Rush 🔥
                </span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
              {[
                { hour: '11:00 AM', label: 'Opening Prep', rush: 'LOW', orders: '4-8', color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
                { hour: '12:00 PM', label: 'Lunch Starts', rush: 'MED', orders: '15-22', color: 'bg-amber-50 border-amber-200 text-amber-900' },
                { hour: '01:00 PM', label: 'Campus Lunch Rush 🔥', rush: 'PEAK', orders: '35-48', color: 'bg-red-50 border-red-300 text-red-900 ring-2 ring-red-500/20' },
                { hour: '02:00 PM', label: 'Afternoon Lunch', rush: 'PEAK', orders: '28-36', color: 'bg-red-50 border-red-300 text-red-900' },
                { hour: '03:00 PM', label: 'Post-Lunch Rest', rush: 'LOW', orders: '6-10', color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
                { hour: '04:00 PM', label: 'Evening Shift In', rush: 'LOW', orders: '8-12', color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
                { hour: '05:00 PM', label: 'Campus Tea & Snack', rush: 'MED', orders: '20-26', color: 'bg-amber-50 border-amber-200 text-amber-900' },
                { hour: '06:00 PM', label: 'Sunset Cravings', rush: 'MED', orders: '22-28', color: 'bg-amber-50 border-amber-200 text-amber-900' },
                { hour: '07:00 PM', label: 'Dinner Warmup', rush: 'MED', orders: '25-32', color: 'bg-amber-50 border-amber-200 text-amber-900' },
                { hour: '08:00 PM', label: 'Hostel Dinner Rush 🔥', rush: 'PEAK', orders: '45-60', color: 'bg-red-50 border-red-300 text-red-900 ring-2 ring-red-500/20' },
                { hour: '09:00 PM', label: 'Prime Dinner Delivery 🔥', rush: 'PEAK', orders: '50-65', color: 'bg-red-50 border-red-300 text-red-900 ring-2 ring-red-500/20' },
                { hour: '10:00 PM', label: 'Late Night Midnight Rush', rush: 'PEAK', orders: '38-52', color: 'bg-red-50 border-red-300 text-red-900' },
              ].map((slot, i) => (
                <div key={i} className={`p-3.5 rounded-2xl border ${slot.color} space-y-1`}>
                  <div className="flex items-center justify-between font-mono font-black text-[11px]">
                    <span>{slot.hour}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md bg-white/80 font-extrabold">{slot.rush}</span>
                  </div>
                  <p className="font-extrabold text-[11px] truncate">{slot.label}</p>
                  <p className="text-[10px] opacity-80">{slot.orders} orders/hr</p>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden space-y-4 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#22092C]">Live Ingredient Inventory & Thresholds</h3>
              <span className="text-xs text-neutral-500">{inventoryList.length} tracked items</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#22092C] text-white font-extrabold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-4 px-6">Ingredient Name</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Current Stock</th>
                    <th className="py-4 px-6">Stock Level Indicator</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                  {inventoryList.map((item) => {
                    const isLow = item.currentQty <= item.minThreshold
                    const pct = Math.min(100, Math.round((item.currentQty / (item.idealQty || 100)) * 100))

                    return (
                      <tr key={item.id} className="hover:bg-[#FFF8F5]/60 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-black text-sm text-[#22092C]">{item.name}</p>
                          <p className="text-[10px] text-neutral-400">Min Alert: {item.minThreshold} {item.unit} | Ideal: {item.idealQty} {item.unit}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 bg-neutral-100 rounded-lg text-[10px] font-bold text-neutral-700">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`font-mono font-black text-sm ${isLow ? 'text-red-600' : 'text-[#22092C]'}`}>
                            {item.currentQty} {item.unit}
                          </span>
                        </td>
                        <td className="py-4 px-6 w-48">
                          <div className="space-y-1">
                            <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isLow ? 'bg-red-500' : pct < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-neutral-400 font-bold">{pct}% of ideal capacity</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isLow
                                ? 'bg-red-100 text-red-800 animate-pulse'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isLow ? 'bg-red-600' : 'bg-emerald-600'}`} />
                            {isLow ? 'LOW STOCK' : 'HEALTHY'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateStock(item.id, item.currentQty + 10, item.name)}
                              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-[#22092C] font-bold text-xs rounded-lg"
                              title="Add +10"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => handleUpdateStock(item.id, item.idealQty, item.name)}
                              className="px-3 py-1 bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white font-black text-xs rounded-lg shadow hover:brightness-110"
                              title="Restock to full capacity"
                            >
                              Fill to Max
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}


      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB: INTEGRATIONS & SERVICE SETUP GUIDES */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'INTEGRATIONS' && (
        <div className="space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Key className="w-6 h-6 text-[#BE3144]" />
                <h2 className="text-xl font-black text-[#22092C]">Live Integrations & API Keys Setup</h2>
              </div>
              <p className="text-xs text-neutral-500">
                Configure Cashfree Payments, Transactional Emails, WhatsApp Cloud API & Business Email routing directly from the Admin console
              </p>
            </div>

            <button
              onClick={fetchSettings}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-xs font-bold text-neutral-700 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingSettings ? 'animate-spin' : ''}`} /> Refresh Keys
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 1. CASHFREE PAYMENT GATEWAY */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#BE3144] to-[#F05941] flex items-center justify-center text-white shadow">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#22092C]">Cashfree Payments Setup</h3>
                    <p className="text-[11px] text-neutral-500">Live UPI, Cards, Google Pay & NetBanking</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                  {settingsForm.CASHFREE_APP_ID ? 'Configured' : 'Live Mode'}
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSaveSettings(['CASHFREE_APP_ID', 'CASHFREE_SECRET_KEY', 'CASHFREE_ENVIRONMENT'], 'Cashfree')
                }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-neutral-700 uppercase">Environment</label>
                  <select
                    value={settingsForm.CASHFREE_ENVIRONMENT || 'PROD'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, CASHFREE_ENVIRONMENT: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold text-[#1A1A1A] focus:ring-[#BE3144]"
                  >
                    <option value="PROD">Production (Live Payments)</option>
                    <option value="SANDBOX">Sandbox (Test Mode)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-neutral-700 uppercase">Cashfree App ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 123456789abcdef..."
                    value={settingsForm.CASHFREE_APP_ID || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, CASHFREE_APP_ID: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono text-xs text-[#1A1A1A] focus:ring-[#BE3144]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-neutral-700 uppercase">Cashfree Secret Key</label>
                  <input
                    type="password"
                    placeholder="cfsk_ma_prod_..."
                    value={settingsForm.CASHFREE_SECRET_KEY || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, CASHFREE_SECRET_KEY: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono text-xs text-[#1A1A1A] focus:ring-[#BE3144]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-neutral-500 block mb-1">
                    Webhook Endpoint (Paste in Cashfree Dashboard):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value="https://rockinroll.in/api/payments/cashfree/webhook"
                      className="w-full p-2.5 bg-neutral-50 font-mono text-[11px] rounded-xl border border-neutral-200 text-neutral-800"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard('https://rockinroll.in/api/payments/cashfree/webhook', 'cashfree')}
                      className="px-3 py-2.5 bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl text-xs font-bold"
                    >
                      {copiedKey === 'cashfree' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSection === 'Cashfree'}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  {savingSection === 'Cashfree' ? 'Saving to Database...' : '💾 Save Cashfree Keys'}
                </button>
              </form>
            </div>

            {/* 2. TRANSACTIONAL EMAIL (RESEND & BREVO) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#22092C] to-[#351044] flex items-center justify-center text-white shadow">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#22092C]">Email Setup (Resend / Brevo)</h3>
                    <p className="text-[11px] text-neutral-500">Sign Up OTPs, Password Resets & Order Status</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                  Active
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSaveSettings(['RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'BREVO_API_KEY'], 'Email')
                }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-neutral-700 uppercase">
                    Resend API Key (<a href="https://resend.com/api-keys" target="_blank" className="text-[#BE3144] underline">resend.com</a>)
                  </label>
                  <input
                    type="password"
                    placeholder="re_123456789_abcdef..."
                    value={settingsForm.RESEND_API_KEY || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, RESEND_API_KEY: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono text-xs text-[#1A1A1A] focus:ring-[#BE3144]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-neutral-700 uppercase">Verified From Email</label>
                  <input
                    type="email"
                    placeholder="orders@rockinroll.in"
                    value={settingsForm.RESEND_FROM_EMAIL || 'orders@rockinroll.in'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, RESEND_FROM_EMAIL: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold text-xs text-[#1A1A1A] focus:ring-[#BE3144]"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FFF8F5] border border-[#872341]/20 space-y-1.5 text-[11px]">
                  <p className="font-bold text-[#22092C]">🌐 DNS Configuration for rockinroll.in:</p>
                  <p className="text-neutral-600">SPF TXT Record for Cloudflare:</p>
                  <div className="p-2 bg-white rounded-lg font-mono text-[10px] text-neutral-800 border border-neutral-200">
                    v=spf1 include:resend.com ~all
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSection === 'Email'}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#22092C] to-[#351044] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  {savingSection === 'Email' ? 'Saving to Database...' : '💾 Save Email Keys'}
                </button>
              </form>
            </div>

            {/* 3. WHATSAPP BUSINESS NOTIFICATIONS */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#25D366] to-[#128C7E] flex items-center justify-center text-white shadow">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#22092C]">WhatsApp Business API Keys</h3>
                    <p className="text-[11px] text-neutral-500">Live order confirmations, rider map link & OTPs</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                  Active
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSaveSettings(['WHATSAPP_PHONE_ID', 'WHATSAPP_API_KEY', 'ULTRAMSG_INSTANCE_ID', 'ULTRAMSG_TOKEN'], 'WhatsApp')
                }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-neutral-700 uppercase">
                    WhatsApp Phone Number ID (<a href="https://developers.facebook.com" target="_blank" className="text-[#25D366] underline">Meta Cloud API</a>)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 104829104810294"
                    value={settingsForm.WHATSAPP_PHONE_ID || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, WHATSAPP_PHONE_ID: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono text-xs text-[#1A1A1A] focus:ring-[#25D366]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-neutral-700 uppercase">
                    Meta WhatsApp Permanent Access Token
                  </label>
                  <input
                    type="password"
                    placeholder="EAA..."
                    value={settingsForm.WHATSAPP_API_KEY || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, WHATSAPP_API_KEY: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono text-xs text-[#1A1A1A] focus:ring-[#25D366]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-600 uppercase">UltraMsg Instance (Optional)</label>
                    <input
                      type="text"
                      placeholder="instance12345"
                      value={settingsForm.ULTRAMSG_INSTANCE_ID || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, ULTRAMSG_INSTANCE_ID: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono text-xs text-[#1A1A1A]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-600 uppercase">UltraMsg Token (Optional)</label>
                    <input
                      type="password"
                      placeholder="token..."
                      value={settingsForm.ULTRAMSG_TOKEN || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, ULTRAMSG_TOKEN: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono text-xs text-[#1A1A1A]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSection === 'WhatsApp'}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  {savingSection === 'WhatsApp' ? 'Saving to Database...' : '💾 Save WhatsApp Keys'}
                </button>
              </form>

              {/* Test WhatsApp sender */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2 pt-3">
                <p className="font-bold text-emerald-900 text-xs">📲 Test WhatsApp Dispatcher:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-[#1A1A1A]"
                  />
                  <button
                    onClick={handleSendTestWhatsApp}
                    disabled={testingWhatsApp || testPhone.length < 10}
                    className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-black text-xs whitespace-nowrap disabled:opacity-50"
                  >
                    {testingWhatsApp ? 'Sending...' : 'Send Test OTP'}
                  </button>
                </div>
              </div>
            </div>

            {/* 4. BUSINESS EMAIL CREATION SETUP */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#22092C]">Business Email Setup (@rockinroll.in)</h3>
                    <p className="text-[11px] text-neutral-500">Free Cloudflare Email Routing & Custom Inboxes</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase">
                  Guides
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
                  <p className="font-bold text-blue-950">⚡ 100% Free Cloudflare Email Routing Setup:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px] text-blue-900 leading-relaxed">
                    <li>Go to <strong>Cloudflare Dashboard ➔ rockinroll.in ➔ Email Routing</strong>.</li>
                    <li>Add destination address: <code className="font-bold">rockinroll779@gmail.com</code> and verify in Gmail.</li>
                    <li>Create rule for <code className="font-bold">support@rockinroll.in</code> ➔ Forward to <code className="font-bold">rockinroll779@gmail.com</code>.</li>
                    <li>Create rule for <code className="font-bold">orders@rockinroll.in</code> ➔ Forward to <code className="font-bold">rockinroll779@gmail.com</code>.</li>
                    <li>Click <strong>"Add missing DNS records automatically"</strong>.</li>
                  </ol>
                </div>

                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-600">
                  💡 All emails sent to <strong className="text-[#22092C]">support@rockinroll.in</strong> and <strong className="text-[#22092C]">orders@rockinroll.in</strong> will automatically arrive inside your personal Gmail inbox instantly with zero fees.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

{/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT PROMO COUPON */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 border border-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#BE3144]" />
                <h3 className="text-lg font-black text-[#22092C]">Create Promo Coupon</h3>
              </div>
              <button
                onClick={() => setShowAddCouponModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Coupon Code (e.g. CGC50, FESTIVE20)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ROLLFEAST50"
                  value={couponForm.id}
                  onChange={(e) => setCouponForm({ ...couponForm, id: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 text-xs font-mono font-black uppercase rounded-xl border border-neutral-300 focus:ring-[#BE3144] tracking-wider text-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 focus:ring-[#BE3144] font-bold text-[#1A1A1A]"
                  >
                    <option value="FLAT">Flat ₹ Amount</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">
                    {couponForm.discountType === 'PERCENTAGE' ? 'Discount %' : 'Flat ₹ OFF'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={couponForm.value}
                    onChange={(e) => setCouponForm({ ...couponForm, value: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 focus:ring-[#BE3144] font-bold text-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Min Cart Value (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 focus:ring-[#BE3144] font-bold text-[#1A1A1A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Optional"
                    value={couponForm.maxDiscount || ''}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 focus:ring-[#BE3144] font-bold text-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-[#FFF8F5] rounded-xl border border-neutral-200">
                <input
                  type="checkbox"
                  id="couponActive"
                  checked={couponForm.isActive}
                  onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                  className="rounded text-[#BE3144] focus:ring-[#BE3144]"
                />
                <label htmlFor="couponActive" className="text-xs font-bold text-neutral-700 cursor-pointer">
                  Activate coupon immediately upon creation
                </label>
              </div>

              <div className="flex gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddCouponModal(false)}
                  className="flex-1 py-3 rounded-xl border border-neutral-300 text-xs font-bold hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white text-xs font-black shadow-lg hover:brightness-110"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="text-xl font-black text-[#22092C]">
                {editingProduct ? `Edit ${editingProduct.name}` : 'Add New Kathi Roll'}
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-extrabold text-neutral-700 uppercase text-[11px]">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Classic Smoked Chicken Roll"
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-[#BE3144] font-bold text-[#1A1A1A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-neutral-700 uppercase text-[11px]">Category *</label>
                  <select
                    required
                    value={prodForm.categoryId}
                    onChange={(e) => setProdForm({ ...prodForm, categoryId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-[#BE3144] font-bold text-[#1A1A1A]"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-neutral-700 uppercase text-[11px]">Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe the flavors, spices, flatbread, and signature chutneys..."
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-[#BE3144] text-[#1A1A1A]"
                />
              </div>

              {/* 📸 Click-to-Upload & Camera Upload Box */}
              <div className="space-y-2">
                <label className="font-extrabold text-neutral-700 uppercase text-[11px]">Kathi Roll Photo / Image</label>
                
                {prodForm.imageUrl ? (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-neutral-200 group">
                    <img src={prodForm.imageUrl} alt="Product preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setProdForm({ ...prodForm, imageUrl: '' })}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-xl shadow hover:bg-red-700 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-neutral-300 hover:border-[#BE3144] rounded-2xl bg-[#FFF8F5]/60 hover:bg-[#FFF8F5] cursor-pointer transition-colors text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleAdminFileUpload(file, 'PRODUCT')
                      }}
                      className="hidden"
                    />
                    <UploadCloud className="w-6 h-6 text-[#BE3144] mb-1" />
                    <p className="text-xs font-bold text-[#22092C]">
                      {uploadingProdImage ? 'Uploading image...' : 'Click to upload Kathi roll photo from device or camera'}
                    </p>
                    <p className="text-[10px] text-neutral-400">Supports JPG, PNG, WEBP</p>
                  </label>
                )}

                <input
                  type="url"
                  placeholder="Or paste direct image URL (https://...)"
                  value={prodForm.imageUrl}
                  onChange={(e) => setProdForm({ ...prodForm, imageUrl: e.target.value })}
                  className="w-full p-2.5 text-[11px] rounded-xl border border-neutral-300 focus:ring-[#BE3144] font-mono text-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-neutral-700 uppercase text-[11px]">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-black text-[#22092C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-neutral-700 uppercase text-[11px]">Discount Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Optional"
                    value={prodForm.discountPrice}
                    onChange={(e) => setProdForm({ ...prodForm, discountPrice: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold text-[#1A1A1A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-neutral-700 uppercase text-[11px]">Dietary Type</label>
                  <select
                    value={prodForm.isVeg ? 'VEG' : 'NON_VEG'}
                    onChange={(e) => setProdForm({ ...prodForm, isVeg: e.target.value === 'VEG' })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold text-[#1A1A1A]"
                  >
                    <option value="VEG">🟢 100% Pure Veg</option>
                    <option value="NON_VEG">🔴 Non-Veg / Chicken</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-neutral-700 uppercase text-[11px]">Spice Level</label>
                  <select
                    value={prodForm.spiceLevel}
                    onChange={(e) => setProdForm({ ...prodForm, spiceLevel: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold text-[#1A1A1A]"
                  >
                    <option value={1}>Mild 🌶️</option>
                    <option value={2}>Medium 🌶️🌶️</option>
                    <option value={3}>Fiery Hot 🌶️🌶️🌶️</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isAvailable}
                    onChange={(e) => setProdForm({ ...prodForm, isAvailable: e.target.checked })}
                    className="rounded text-[#BE3144] focus:ring-[#BE3144]"
                  />
                  <span className="font-bold text-xs text-[#22092C]">In Stock</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isBestSeller}
                    onChange={(e) => setProdForm({ ...prodForm, isBestSeller: e.target.checked })}
                    className="rounded text-[#BE3144] focus:ring-[#BE3144]"
                  />
                  <span className="font-bold text-xs text-[#22092C]">Bestseller ⭐</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isFeatured}
                    onChange={(e) => setProdForm({ ...prodForm, isFeatured: e.target.checked })}
                    className="rounded text-[#BE3144] focus:ring-[#BE3144]"
                  />
                  <span className="font-bold text-xs text-[#22092C]">Featured ✨</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isNewItem}
                    onChange={(e) => setProdForm({ ...prodForm, isNewItem: e.target.checked })}
                    className="rounded text-[#BE3144] focus:ring-[#BE3144]"
                  />
                  <span className="font-bold text-xs text-[#22092C]">New Item 🔥</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 py-3 rounded-xl border border-neutral-300 font-bold hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingProdImage}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white font-black shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  {editingProduct ? 'Update Kathi Roll' : 'Create Kathi Roll'}
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
