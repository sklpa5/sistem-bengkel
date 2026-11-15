import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Car,
  AlertTriangle,
  Package,
  FileText,
  Users,
  CreditCard,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  UserCheck,
  ChevronRight,
  X,
  Phone,
  Tag,
  Boxes,
  RotateCcw,
  Sparkles,
  QrCode,
  Check,
  Percent,
  Download,
  Eye,
  Settings,
  HelpCircle,
  BarChart3
} from 'lucide-react';

import {
  initialInventory,
  initialServices,
  mechanicsList,
  initialCustomers,
  initialWorkOrders,
  initialInvoices,
  revenueTrends
} from './data/mockData';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');

  // Core Data States
  const [inventory, setInventory] = useState(initialInventory);
  const [workOrders, setWorkOrders] = useState(initialWorkOrders);
  const [customers, setCustomers] = useState(initialCustomers);
  const [invoices, setInvoices] = useState(initialInvoices);

  // Notifications State
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Modals States
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedSPKDetail, setSelectedSPKDetail] = useState(null);
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState(null);

  // Filter States for Inventory
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState('Semua');
  const [inventoryStockFilter, setInventoryStockFilter] = useState('Semua');

  // Filter States for Work Orders
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('Semua');

  // Filter States for Customers
  const [customerSearch, setCustomerSearch] = useState('');

  // -------------------------------------------------------------
  // POS & Cashier State
  // -------------------------------------------------------------
  const [posSelectedSPK, setPosSelectedSPK] = useState(null);
  const [posDiscount, setPosDiscount] = useState(0);
  const [posIncludeTax, setPosIncludeTax] = useState(false);
  const [posPaymentMethod, setPosPaymentMethod] = useState('Tunai');
  const [posAmountPaid, setPosAmountPaid] = useState('');
  const [posDirectItems, setPosDirectItems] = useState([]);
  const [posCustomerName, setPosCustomerName] = useState('Pelanggan Umum');
  const [posVehiclePlate, setPosVehiclePlate] = useState('B 1234 XXX');

  // Helper: Format Rupiah
  const formatRp = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num || 0);
  };

  // -------------------------------------------------------------
  // KPI Calculations
  // -------------------------------------------------------------
  const criticalStockItems = useMemo(() => {
    return inventory.filter(item => item.stock <= item.minStock);
  }, [inventory]);

  const totalMonthlyRevenue = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0) + 42500000;
  }, [invoices]);

  const activeUnitsCount = useMemo(() => {
    return workOrders.filter(wo => wo.status === 'Dikerjakan' || wo.status === 'Menunggu Antrean' || wo.status === 'Siap Bayar').length;
  }, [workOrders]);

  const completedUnitsToday = useMemo(() => {
    return workOrders.filter(wo => wo.status === 'Selesai' || wo.paymentStatus === 'Lunas').length;
  }, [workOrders]);

  // Total Inventory Valuation
  const totalInventoryValuation = useMemo(() => {
    return inventory.reduce((sum, item) => sum + (item.buyPrice * item.stock), 0);
  }, [inventory]);

  // -------------------------------------------------------------
  // Action Handlers
  // -------------------------------------------------------------
  // Quick Restock Handler
  const handleQuickRestock = (partId, amount = 10) => {
    setInventory(prev =>
      prev.map(item => {
        if (item.id === partId) {
          const newStock = item.stock + amount;
          return { ...item, stock: newStock };
        }
        return item;
      })
    );
    const item = inventory.find(i => i.id === partId);
    showToast(`Berhasil restock +${amount} unit untuk "${item?.name}"!`, 'success');
  };

  // Restock All Critical Items
  const handleRestockAllCritical = () => {
    setInventory(prev =>
      prev.map(item => {
        if (item.stock <= item.minStock) {
          return { ...item, stock: item.stock + 10 };
        }
        return item;
      })
    );
    showToast(`Semua ${criticalStockItems.length} suku cadang kritis berhasil di-restock +10 unit!`, 'success');
  };

  // Update SPK Status
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setWorkOrders(prev =>
      prev.map(wo => {
        if (wo.id === orderId) {
          return { ...wo, status: newStatus };
        }
        return wo;
      })
    );
    showToast(`Status SPK ${orderId} diubah menjadi "${newStatus}"`, 'info');
  };

  // -------------------------------------------------------------
  // Form State: New Work Order
  // -------------------------------------------------------------
  const [newOrderForm, setNewOrderForm] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    vehiclePlate: '',
    vehicleModel: '',
    odometer: '',
    mechanic: 'Agus Pratama',
    complaints: '',
    selectedServices: [],
    selectedParts: [] // [{ partId, qty }]
  });

  // Handle Select Customer in New SPK
  const handleSelectCustomerForSPK = (custId) => {
    const cust = customers.find(c => c.id === custId);
    if (cust) {
      setNewOrderForm(prev => ({
        ...prev,
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        vehiclePlate: cust.vehicles[0]?.plate || '',
        vehicleModel: `${cust.vehicles[0]?.brand || ''} ${cust.vehicles[0]?.model || ''}`,
        odometer: cust.vehicles[0]?.lastKm || ''
      }));
    }
  };

  // Submit New Work Order with AUTOMATIC INVENTORY DEDUCTION
  const handleCreateWorkOrder = (e) => {
    e.preventDefault();
    if (!newOrderForm.customerName || !newOrderForm.vehiclePlate) {
      showToast('Nama pelanggan dan nomor plat wajib diisi!', 'error');
      return;
    }

    // Check inventory stock sufficiency
    for (const p of newOrderForm.selectedParts) {
      const invItem = inventory.find(i => i.id === p.partId);
      if (!invItem || invItem.stock < p.qty) {
        showToast(`Stok ${invItem?.name || 'suku cadang'} tidak mencukupi (sisa ${invItem?.stock || 0})!`, 'error');
        return;
      }
    }

    // Map selected services
    const servicesData = newOrderForm.selectedServices.map(srvId => {
      const srv = initialServices.find(s => s.id === srvId);
      return { id: srv.id, name: srv.name, price: srv.price };
    });

    // Map selected parts with prices
    const partsData = newOrderForm.selectedParts.map(p => {
      const part = inventory.find(i => i.id === p.partId);
      return {
        partId: part.id,
        sku: part.sku,
        name: part.name,
        qty: p.qty,
        price: part.sellPrice
      };
    });

    const newSPKId = `SPK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(workOrders.length + 1).padStart(3, '0')}`;

    const newOrder = {
      id: newSPKId,
      customerName: newOrderForm.customerName,
      customerPhone: newOrderForm.customerPhone || '0812-xxxx-xxxx',
      vehiclePlate: newOrderForm.vehiclePlate.toUpperCase(),
      vehicleModel: newOrderForm.vehicleModel || 'Kendaraan Umum',
      odometer: Number(newOrderForm.odometer) || 0,
      entryDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      mechanic: newOrderForm.mechanic,
      complaints: newOrderForm.complaints || 'Pemeriksaan umum berkala',
      services: servicesData,
      partsUsed: partsData,
      status: 'Menunggu Antrean',
      paymentStatus: 'Belum Bayar',
      notes: 'SPK dibuat via sistem AutoFix Pro.'
    };

    // 1. DEDUCT INVENTORY AUTOMATICALLY
    if (newOrderForm.selectedParts.length > 0) {
      setInventory(prev =>
        prev.map(item => {
          const used = newOrderForm.selectedParts.find(p => p.partId === item.id);
          if (used) {
            return { ...item, stock: Math.max(0, item.stock - used.qty) };
          }
          return item;
        })
      );
    }

    // 2. Add to Work Orders
    setWorkOrders([newOrder, ...workOrders]);

    // 3. Update or Add Customer Record
    const existingCustIndex = customers.findIndex(c => c.name.toLowerCase() === newOrderForm.customerName.toLowerCase() || c.phone === newOrderForm.customerPhone);
    if (existingCustIndex >= 0) {
      const updatedCustomers = [...customers];
      updatedCustomers[existingCustIndex].serviceHistory.unshift({
        date: new Date().toISOString().substring(0, 10),
        spkId: newSPKId,
        serviceName: servicesData.map(s => s.name).join(', ') || 'Servis Kendaraan',
        total: servicesData.reduce((a, b) => a + b.price, 0) + partsData.reduce((a, b) => a + (b.price * b.qty), 0),
        mechanic: newOrderForm.mechanic,
        status: 'Menunggu Antrean'
      });
      setCustomers(updatedCustomers);
    } else {
      const newCust = {
        id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
        name: newOrderForm.customerName,
        phone: newOrderForm.customerPhone || '0812-xxxx-xxxx',
        email: `${newOrderForm.customerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        address: 'Wilayah Bengkel',
        vehicles: [{
          plate: newOrderForm.vehiclePlate.toUpperCase(),
          brand: newOrderForm.vehicleModel.split(' ')[0] || 'Mobil',
          model: newOrderForm.vehicleModel,
          year: 2022,
          color: 'Hitam',
          lastKm: Number(newOrderForm.odometer) || 0
        }],
        serviceHistory: [{
          date: new Date().toISOString().substring(0, 10),
          spkId: newSPKId,
          serviceName: servicesData.map(s => s.name).join(', ') || 'Servis Kendaraan',
          total: servicesData.reduce((a, b) => a + b.price, 0) + partsData.reduce((a, b) => a + (b.price * b.qty), 0),
          mechanic: newOrderForm.mechanic,
          status: 'Menunggu Antrean'
        }]
      };
      setCustomers([newCust, ...customers]);
    }

    setIsNewOrderModalOpen(false);
    setNewOrderForm({
      customerId: '',
      customerName: '',
      customerPhone: '',
      vehiclePlate: '',
      vehicleModel: '',
      odometer: '',
      mechanic: 'Agus Pratama',
      complaints: '',
      selectedServices: [],
      selectedParts: []
    });

    showToast(`SPK Baru ${newSPKId} berhasil dibuat! Stok suku cadang otomatis terpotong.`, 'success');
  };

  // -------------------------------------------------------------
  // Form State: Add New Part
  // -------------------------------------------------------------
  const [newPartForm, setNewPartForm] = useState({
    sku: '',
    name: '',
    category: 'Oli & Pelumas',
    buyPrice: '',
    sellPrice: '',
    stock: '',
    minStock: '',
    unit: 'Pcs',
    shelf: '',
    compatibility: ''
  });

  const handleAddNewPart = (e) => {
    e.preventDefault();
    if (!newPartForm.name || !newPartForm.sellPrice) {
      showToast('Nama suku cadang dan harga jual wajib diisi!', 'error');
      return;
    }

    const newPart = {
      id: `PRT-${String(inventory.length + 1).padStart(3, '0')}`,
      sku: newPartForm.sku || `SKU-GEN-${String(inventory.length + 1).padStart(2, '0')}`,
      name: newPartForm.name,
      category: newPartForm.category,
      buyPrice: Number(newPartForm.buyPrice) || 0,
      sellPrice: Number(newPartForm.sellPrice) || 0,
      stock: Number(newPartForm.stock) || 0,
      minStock: Number(newPartForm.minStock) || 3,
      unit: newPartForm.unit || 'Pcs',
      shelf: newPartForm.shelf || 'Rak Umum',
      compatibility: newPartForm.compatibility || 'Universal'
    };

    setInventory([...inventory, newPart]);
    setIsAddPartModalOpen(false);
    setNewPartForm({
      sku: '',
      name: '',
      category: 'Oli & Pelumas',
      buyPrice: '',
      sellPrice: '',
      stock: '',
      minStock: '',
      unit: 'Pcs',
      shelf: '',
      compatibility: ''
    });

    showToast(`Suku cadang "${newPart.name}" berhasil ditambahkan ke inventaris!`, 'success');
  };

  // -------------------------------------------------------------
  // Form State: Add New Customer
  // -------------------------------------------------------------
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    plate: '',
    brand: 'Toyota',
    model: '',
    year: '2021',
    color: 'Hitam',
    km: ''
  });

  const handleAddNewCustomer = (e) => {
    e.preventDefault();
    if (!newCustomerForm.name || !newCustomerForm.phone || !newCustomerForm.plate) {
      showToast('Nama, Telepon, dan Nomor Plat kendaraan wajib diisi!', 'error');
      return;
    }

    const newCust = {
      id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
      name: newCustomerForm.name,
      phone: newCustomerForm.phone,
      email: newCustomerForm.email || `${newCustomerForm.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      address: newCustomerForm.address || 'Jakarta',
      vehicles: [{
        plate: newCustomerForm.plate.toUpperCase(),
        brand: newCustomerForm.brand,
        model: newCustomerForm.model || `${newCustomerForm.brand} Standard`,
        year: Number(newCustomerForm.year) || 2021,
        color: newCustomerForm.color || 'Hitam',
        lastKm: Number(newCustomerForm.km) || 0
      }],
      serviceHistory: []
    };

    setCustomers([newCust, ...customers]);
    setIsAddCustomerModalOpen(false);
    setNewCustomerForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      plate: '',
      brand: 'Toyota',
      model: '',
      year: '2021',
      color: 'Hitam',
      km: ''
    });

    showToast(`Pelanggan "${newCust.name}" berhasil didaftarkan!`, 'success');
  };

  // -------------------------------------------------------------
  // POS Cashier Calculations & Actions
  // -------------------------------------------------------------
  // Calculate Totals for POS
  const posCalculations = useMemo(() => {
    let servicesTotal = 0;
    let partsTotal = 0;
    let items = [];

    if (posSelectedSPK) {
      posSelectedSPK.services.forEach(s => {
        servicesTotal += s.price;
        items.push({ type: 'Jasa', name: s.name, qty: 1, price: s.price, total: s.price });
      });
      posSelectedSPK.partsUsed.forEach(p => {
        const itemTot = p.price * p.qty;
        partsTotal += itemTot;
        items.push({ type: 'Part', name: p.name, qty: p.qty, price: p.price, total: itemTot });
      });
    }

    // Add direct retail items if any
    posDirectItems.forEach(item => {
      const itemTot = item.price * item.qty;
      if (item.type === 'Jasa') servicesTotal += itemTot;
      else partsTotal += itemTot;
      items.push({ ...item, total: itemTot });
    });

    const subtotal = servicesTotal + partsTotal;
    const discountAmount = Number(posDiscount) || 0;
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const taxAmount = posIncludeTax ? Math.round(afterDiscount * 0.11) : 0;
    const grandTotal = afterDiscount + taxAmount;
    const paidAmount = Number(posAmountPaid) || 0;
    const change = Math.max(0, paidAmount - grandTotal);

    return {
      servicesTotal,
      partsTotal,
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal,
      paidAmount,
      change,
      items
    };
  }, [posSelectedSPK, posDirectItems, posDiscount, posIncludeTax, posAmountPaid]);

  // Handle Checkout / Pay Invoice
  const handleProcessPayment = () => {
    if (posCalculations.grandTotal <= 0) {
      showToast('Tidak ada tagihan yang diproses!', 'error');
      return;
    }
    if (posPaymentMethod === 'Tunai' && posCalculations.paidAmount < posCalculations.grandTotal) {
      showToast('Nominal pembayaran tunai kurang dari total tagihan!', 'error');
      return;
    }

    const newInvoiceNo = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(invoices.length + 1).padStart(3, '0')}`;

    const newInvoice = {
      invoiceNo: newInvoiceNo,
      spkId: posSelectedSPK ? posSelectedSPK.id : 'RETAIL-POS',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      customerName: posSelectedSPK ? posSelectedSPK.customerName : posCustomerName,
      customerPhone: posSelectedSPK ? posSelectedSPK.customerPhone : '0812-xxxx-xxxx',
      vehiclePlate: posSelectedSPK ? posSelectedSPK.vehiclePlate : posVehiclePlate.toUpperCase(),
      vehicleModel: posSelectedSPK ? posSelectedSPK.vehicleModel : 'Pelanggan Walk-in',
      odometer: posSelectedSPK ? posSelectedSPK.odometer : 0,
      mechanic: posSelectedSPK ? posSelectedSPK.mechanic : 'Siti Rahma (Kasir)',
      items: posCalculations.items,
      subtotalServices: posCalculations.servicesTotal,
      subtotalParts: posCalculations.partsTotal,
      subtotal: posCalculations.subtotal,
      discount: posCalculations.discountAmount,
      tax: posCalculations.taxAmount,
      grandTotal: posCalculations.grandTotal,
      paymentMethod: posPaymentMethod,
      amountPaid: posPaymentMethod === 'Tunai' ? posCalculations.paidAmount : posCalculations.grandTotal,
      change: posPaymentMethod === 'Tunai' ? posCalculations.change : 0,
      cashier: 'Siti Rahma',
      status: 'Lunas'
    };

    // 1. Save Invoice
    setInvoices([newInvoice, ...invoices]);

    // 2. If tied to SPK, update SPK status to Lunas & Selesai
    if (posSelectedSPK) {
      setWorkOrders(prev =>
        prev.map(wo => {
          if (wo.id === posSelectedSPK.id) {
            return { ...wo, paymentStatus: 'Lunas', status: 'Selesai' };
          }
          return wo;
        })
      );
    }

    // 3. Reset POS fields
    setPosSelectedSPK(null);
    setPosDirectItems([]);
    setPosDiscount(0);
    setPosAmountPaid('');

    // 4. Show printable receipt immediately
    setSelectedReceipt(newInvoice);
    showToast(`Pembayaran ${newInvoiceNo} Berhasil! Faktur Lunas.`, 'success');
  };

  // Helper: Open SPK in POS
  const handleLoadSPKIntoPOS = (spk) => {
    setPosSelectedSPK(spk);
    setPosDiscount(0);
    setPosIncludeTax(false);
    setPosAmountPaid('');
    setActiveTab('cashier');
    showToast(`SPK ${spk.id} dimuat ke Kasir & Billing.`, 'info');
  };

  // Filtered Inventory Data
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.sku.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.compatibility.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchCategory = inventoryCategory === 'Semua' || item.category === inventoryCategory;
      const matchStock =
        inventoryStockFilter === 'Semua' ? true :
        inventoryStockFilter === 'Aman' ? item.stock > item.minStock :
        inventoryStockFilter === 'Menipis' ? (item.stock <= item.minStock && item.stock > 0) :
        inventoryStockFilter === 'Habis' ? item.stock === 0 : true;
      return matchSearch && matchCategory && matchStock;
    });
  }, [inventory, inventorySearch, inventoryCategory, inventoryStockFilter]);

  // Filtered Work Orders
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      const matchSearch = wo.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        wo.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        wo.vehiclePlate.toLowerCase().includes(orderSearch.toLowerCase()) ||
        wo.mechanic.toLowerCase().includes(orderSearch.toLowerCase());
      const matchStatus = orderStatusFilter === 'Semua' || wo.status === orderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [workOrders, orderSearch, orderStatusFilter]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch) ||
        c.vehicles.some(v => v.plate.toLowerCase().includes(customerSearch.toLowerCase()));
      return matchSearch;
    });
  }, [customers, customerSearch]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-blue-600 selection:text-white">

      {/* ============================================================== */}
      {/* SIDEBAR NAVIGATION */}
      {/* ============================================================== */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  AutoFix <span className="text-blue-500">Pro</span>
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 font-semibold px-1.5 py-0.5 rounded border border-blue-500/30">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400">Workshop & Sparepart OS</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 flex-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard KPI</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('work-orders')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'work-orders'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-4 h-4" />
              <span>Work Order / SPK</span>
            </div>
            {activeUnitsCount > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'work-orders' ? 'bg-blue-800 text-white' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {activeUnitsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Boxes className="w-4 h-4" />
              <span>Inventaris Suku Cadang</span>
            </div>
            {criticalStockItems.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                {criticalStockItems.length} Kritis
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'customers'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Users className="w-4 h-4" />
              <span>Pelanggan & Kendaraan</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {customers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cashier')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'cashier'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center space-x-3">
              <CreditCard className="w-4 h-4" />
              <span>Kasir & Invoice</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400">
              POS
            </span>
          </button>
        </nav>

        {/* Workshop Live Bay Quick Summary */}
        <div className="p-4 m-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Bengkel</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1"></span>
              Buka
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Mekanik Aktif:</span>
              <span className="font-semibold text-white">4 Orang</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Stall Terisi:</span>
              <span className="font-semibold text-blue-400">3 / 4 Stall</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">SPK Selesai Hari Ini:</span>
              <span className="font-semibold text-emerald-400">{completedUnitsToday} Unit</span>
            </div>
          </div>
        </div>

        {/* User / Cashier footer */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
              SR
            </div>
            <div>
              <div className="font-semibold text-slate-200">Siti Rahma</div>
              <div className="text-[10px] text-slate-500">Kasir & Admin Service</div>
            </div>
          </div>
          <div className="text-right text-[11px] text-emerald-400 font-mono">
            Online
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MAIN CONTENT AREA */}
      {/* ============================================================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Top Header Bar */}
        <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
              {activeTab === 'dashboard' && <span>Dashboard & Analitik Bengkel</span>}
              {activeTab === 'work-orders' && <span>Manajemen Work Order / SPK</span>}
              {activeTab === 'inventory' && <span>Inventaris & Stok Suku Cadang</span>}
              {activeTab === 'customers' && <span>Database Pelanggan & Riwayat Kendaraan</span>}
              {activeTab === 'cashier' && <span>Sistem Kasir, Billing & Faktur</span>}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Action: New Work Order */}
            <button
              onClick={() => setIsNewOrderModalOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md shadow-blue-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Buat SPK Baru</span>
            </button>

            {/* Quick Action: Add Part */}
            <button
              onClick={() => setIsAddPartModalOpen(true)}
              className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition"
            >
              <Package className="w-3.5 h-3.5" />
              <span>+ Tambah Part</span>
            </button>
          </div>
        </header>

        {/* Toast Notification Banner */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur text-sm transition-all animate-bounce">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />}
            <span className="text-slate-100 font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Body Content by Tab */}
        <div className="p-6 space-y-6">

          {/* ========================================================== */}
          {/* TAB 1: DASHBOARD */}
          {/* ========================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">

              {/* KPI Top Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Card 1: Total Pendapatan */}
                <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition shadow-sm">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pendapatan (Bln Ini)</span>
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white tracking-tight">
                    {formatRp(totalMonthlyRevenue)}
                  </div>
                  <div className="flex items-center space-x-1.5 mt-2 text-xs">
                    <span className="text-emerald-400 font-semibold flex items-center">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +14.8%
                    </span>
                    <span className="text-slate-400">vs bulan lalu</span>
                  </div>
                </div>

                {/* Card 2: Unit Dikerjakan */}
                <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition shadow-sm">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unit Dalam Pengerjaan</span>
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Car className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white tracking-tight">
                    {activeUnitsCount} <span className="text-sm font-normal text-slate-400">Unit Aktif</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 text-xs text-slate-400">
                    <span className="text-blue-400 font-medium">{completedUnitsToday} selesai hari ini</span>
                    <span>•</span>
                    <span className="text-amber-400 font-medium">1 antrean</span>
                  </div>
                </div>

                {/* Card 3: Alert Stok Kritis */}
                <div className={`rounded-2xl p-5 border relative overflow-hidden transition shadow-sm ${
                  criticalStockItems.length > 0
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-slate-900/80 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Alert Stok Kritis</span>
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center animate-pulse">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-amber-300 tracking-tight">
                    {criticalStockItems.length} <span className="text-sm font-normal text-slate-400">Item Menipis</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-slate-400">Batas min. stok terlampaui</span>
                    {criticalStockItems.length > 0 && (
                      <button
                        onClick={handleRestockAllCritical}
                        className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                      >
                        Restock Semua (+10)
                      </button>
                    )}
                  </div>
                </div>

                {/* Card 4: Nilai Aset Inventaris */}
                <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition shadow-sm">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Valuasi Sparepart</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white tracking-tight">
                    {formatRp(totalInventoryValuation)}
                  </div>
                  <div className="flex items-center space-x-1.5 mt-2 text-xs text-slate-400">
                    <span className="text-emerald-400 font-semibold">{inventory.length} SKU</span>
                    <span>dalam katalog gudang</span>
                  </div>
                </div>
              </div>

              {/* CRITICAL STOCK NOTIFICATION & QUICK RESTOCK PANEL */}
              {criticalStockItems.length > 0 && (
                <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 rounded-2xl p-5 border border-amber-500/40 shadow-xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-white text-base flex items-center space-x-2">
                          <span>Peringatan Stok Suku Cadang Segera Habis!</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                            {criticalStockItems.length} Item
                          </span>
                        </h2>
                        <p className="text-xs text-slate-400">
                          Suku cadang berikut berada di bawah batas minimum pemakaian servis harian. Segera lakukan restock cepat.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleRestockAllCritical}
                      className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20 shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>⚡ Restock Semua Item (+10 Unit)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {criticalStockItems.map(item => (
                      <div
                        key={item.id}
                        className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                              {item.sku}
                            </span>
                            <span className="text-[10px] text-slate-400">{item.shelf}</span>
                          </div>
                          <div className="text-sm font-semibold text-white truncate mt-1">
                            {item.name}
                          </div>
                          <div className="flex items-center space-x-2 mt-1 text-xs">
                            <span className="text-rose-400 font-bold">
                              Sisa {item.stock} {item.unit}
                            </span>
                            <span className="text-slate-500">(Min: {item.minStock})</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleQuickRestock(item.id, 10)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 flex items-center space-x-1 shadow transition"
                          title="Restock cepat 10 unit"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+10</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REVENUE CHART & SERVICE CATEGORY BREAKDOWN */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left (2 cols): Interactive Revenue Graph */}
                <div className="lg:col-span-2 bg-slate-900/80 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        <span>Grafik Tren Pendapatan 7 Hari Terakhir</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Komparasi pendapatan Jasa Servis vs Penjualan Suku Cadang
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 text-xs font-medium">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-slate-300">Jasa Servis</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                        <span className="text-slate-300">Suku Cadang</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual SVG Chart */}
                  <div className="space-y-4">
                    <div className="h-56 w-full flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-800">
                      {revenueTrends.map((trend, idx) => {
                        const maxVal = 11000000;
                        const serviceHeight = Math.round((trend.services / maxVal) * 100);
                        const partsHeight = Math.round((trend.parts / maxVal) * 100);

                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                            {/* Value tooltip on hover */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-[11px] px-2 py-1 rounded shadow-lg border border-slate-700 text-center mb-1 pointer-events-none whitespace-nowrap z-10">
                              <div className="font-bold text-white">{formatRp(trend.total)}</div>
                              <div className="text-blue-400">Jasa: {formatRp(trend.services)}</div>
                              <div className="text-cyan-400">Part: {formatRp(trend.parts)}</div>
                            </div>

                            {/* Stacked / Dual Bar */}
                            <div className="w-full max-w-[36px] flex items-end space-x-1 justify-center">
                              {/* Service Bar */}
                              <div
                                style={{ height: `${serviceHeight}%` }}
                                className="w-1/2 bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-md transition-all duration-500 hover:brightness-125"
                              ></div>
                              {/* Parts Bar */}
                              <div
                                style={{ height: `${partsHeight}%` }}
                                className="w-1/2 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-md transition-all duration-500 hover:brightness-125"
                              ></div>
                            </div>

                            {/* Day Label */}
                            <span className="text-[11px] text-slate-400 mt-2 truncate font-medium text-center">
                              {trend.day.split(' ')[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span>Rata-rata pendapatan harian: <strong className="text-slate-200">Rp 6.385.000</strong></span>
                      <span className="text-emerald-400 font-semibold">Tertinggi: Sabtu (Rp 10.100.000)</span>
                    </div>
                  </div>
                </div>

                {/* Right (1 col): Stall / Bay Workshop Status & Top Services */}
                <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center space-x-2 mb-1">
                      <Wrench className="w-5 h-5 text-indigo-400" />
                      <span>Live Workshop Bays</span>
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Pemantauan langsung stall servis & mekanik bertugas
                    </p>

                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-blue-400">Stall 01</span>
                            <span className="text-xs text-white font-medium">B 1982 KZA</span>
                          </div>
                          <p className="text-[11px] text-slate-400">Toyota Avanza • Agus Pratama</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400">
                          Selesai
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-blue-400">Stall 02</span>
                            <span className="text-xs text-white font-medium">B 9081 PQR</span>
                          </div>
                          <p className="text-[11px] text-slate-400">Innova Reborn • Budi Santoso</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-500/20 text-blue-400 animate-pulse">
                          Dikerjakan
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-blue-400">Stall 03</span>
                            <span className="text-xs text-white font-medium">B 2341 SIK</span>
                          </div>
                          <p className="text-[11px] text-slate-400">Honda HR-V • Hendra Wijaya</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400">
                          Selesai
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-500">Stall 04</span>
                            <span className="text-xs text-slate-400">Tersedia (Kosong)</span>
                          </div>
                          <p className="text-[11px] text-slate-500">Siap untuk SPK Antrean baru</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-400">
                          Kosong
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <button
                      onClick={() => setActiveTab('work-orders')}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1 transition"
                    >
                      <span>Lihat Semua Work Order / SPK</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 2: MANAJEMEN WORK ORDER / SPK */}
          {/* ========================================================== */}
          {activeTab === 'work-orders' && (
            <div className="space-y-6">

              {/* Toolbar & Filters */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex flex-1 items-center space-x-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari No. SPK, Plat Nomor, Pelanggan, Mekanik..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Filter Status SPK */}
                  <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
                    {['Semua', 'Menunggu Antrean', 'Dikerjakan', 'Siap Bayar', 'Selesai'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition ${
                          orderStatusFilter === st
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-slate-800/80 text-slate-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsNewOrderModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Buat SPK Baru (Potong Stok Otomatis)</span>
                </button>
              </div>

              {/* Work Order Cards / Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkOrders.map((wo) => {
                  const totalEstServices = wo.services.reduce((s, it) => s + it.price, 0);
                  const totalEstParts = wo.partsUsed.reduce((s, it) => s + (it.price * it.qty), 0);
                  const grandTotalEst = totalEstServices + totalEstParts;

                  return (
                    <div
                      key={wo.id}
                      className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-sm group"
                    >
                      <div>
                        {/* Header: SPK ID & Status Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            {wo.id}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            wo.status === 'Selesai' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                            wo.status === 'Dikerjakan' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                            wo.status === 'Siap Bayar' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                            'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}>
                            {wo.status}
                          </span>
                        </div>

                        {/* Vehicle & Customer Info */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white group-hover:text-blue-400 transition">
                              {wo.vehiclePlate}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {wo.odometer ? `${wo.odometer.toLocaleString('id-ID')} KM` : '-'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium">{wo.vehicleModel}</p>
                          <p className="text-[11px] text-slate-500">{wo.customerName} • {wo.customerPhone}</p>
                        </div>

                        {/* Keluhan / Complaints */}
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-3 text-xs">
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider mb-0.5">Keluhan:</span>
                          <p className="text-slate-200 line-clamp-2 italic">"{wo.complaints}"</p>
                        </div>

                        {/* Breakdown: Services & Parts Used */}
                        <div className="space-y-1 mb-3 text-xs">
                          <div className="flex justify-between text-slate-400">
                            <span>Mekanik:</span>
                            <span className="text-slate-200 font-medium">{wo.mechanic}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Total Jasa ({wo.services.length}):</span>
                            <span className="text-slate-200">{formatRp(totalEstServices)}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Suku Cadang ({wo.partsUsed.length} item):</span>
                            <span className="text-slate-200">{formatRp(totalEstParts)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-white pt-1.5 border-t border-slate-800">
                            <span>Estimasi Total:</span>
                            <span className="text-blue-400">{formatRp(grandTotalEst)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-3 border-t border-slate-800">
                        {/* Quick Status Select */}
                        <div className="flex items-center space-x-1.5">
                          <select
                            value={wo.status}
                            onChange={(e) => handleUpdateOrderStatus(wo.id, e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500"
                          >
                            <option value="Menunggu Antrean">Menunggu Antrean</option>
                            <option value="Dikerjakan">Dikerjakan</option>
                            <option value="Siap Bayar">Siap Bayar</option>
                            <option value="Selesai">Selesai</option>
                          </select>

                          <button
                            onClick={() => setSelectedSPKDetail(wo)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition"
                            title="Detail SPK & Cetak"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Pay in Cashier Button */}
                        {wo.paymentStatus !== 'Lunas' ? (
                          <button
                            onClick={() => handleLoadSPKIntoPOS(wo)}
                            className="w-full py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-xs font-bold border border-emerald-500/30 transition flex items-center justify-center space-x-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Proses ke Kasir & Bayar</span>
                          </button>
                        ) : (
                          <div className="w-full py-1 text-center text-xs text-emerald-400 font-bold bg-emerald-950/30 rounded border border-emerald-500/30">
                            ✓ Lunas
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredWorkOrders.length === 0 && (
                <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-300 font-semibold">Tidak ada Work Order / SPK yang cocok</p>
                  <p className="text-xs text-slate-500 mt-1">Gunakan tombol "+ Buat SPK Baru" untuk menambahkan order servis.</p>
                </div>
              )}

            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 3: INVENTARIS SUKU CADANG */}
          {/* ========================================================== */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">

              {/* Top Stat Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Item SKU</span>
                    <div className="text-xl font-bold text-white mt-1">{inventory.length} SKU</div>
                  </div>
                  <Boxes className="w-8 h-8 text-blue-400" />
                </div>
                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Valuasi Aset</span>
                    <div className="text-xl font-bold text-emerald-400 mt-1">{formatRp(totalInventoryValuation)}</div>
                  </div>
                  <DollarSign className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Perlu Restock</span>
                    <div className="text-xl font-bold text-amber-400 mt-1">{criticalStockItems.length} Item Menipis</div>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari berdasarkan SKU (e.g. SKU-OIL-01) atau Nama Barang..."
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Filter Status Stok */}
                    <select
                      value={inventoryStockFilter}
                      onChange={(e) => setInventoryStockFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Semua">Semua Status Stok</option>
                      <option value="Aman">Stok Aman (&gt; min)</option>
                      <option value="Menipis">Stok Menipis (≤ min)</option>
                      <option value="Habis">Stok Habis (0)</option>
                    </select>

                    {/* Add Part Button */}
                    <button
                      onClick={() => setIsAddPartModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/30 transition shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Suku Cadang</span>
                    </button>
                  </div>
                </div>

                {/* Categories Filter Pills */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 text-xs">
                  <span className="text-slate-500 font-semibold mr-1 shrink-0">Kategori:</span>
                  {[
                    'Semua',
                    'Oli & Pelumas',
                    'Sistem Rem',
                    'Mesin & Pengapian',
                    'Filter',
                    'Suspensi & Kaki-kaki',
                    'Kelistrikan'
                  ].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setInventoryCategory(cat)}
                      className={`px-3 py-1 rounded-lg shrink-0 transition ${
                        inventoryCategory === cat
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inventory Table */}
              <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">SKU / Rak</th>
                        <th className="py-3 px-4">Nama Suku Cadang & Kompatibilitas</th>
                        <th className="py-3 px-4">Kategori</th>
                        <th className="py-3 px-4 text-right">Harga Beli</th>
                        <th className="py-3 px-4 text-right">Harga Jual</th>
                        <th className="py-3 px-4 text-center">Stok & Status</th>
                        <th className="py-3 px-4 text-center">Aksi Cepat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredInventory.map((item) => {
                        const isLow = item.stock <= item.minStock;
                        const isZero = item.stock === 0;
                        const marginPercent = Math.round(((item.sellPrice - item.buyPrice) / item.buyPrice) * 100);

                        return (
                          <tr key={item.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 block w-max">
                                {item.sku}
                              </span>
                              <span className="text-[10px] text-slate-500 mt-1 block">{item.shelf}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-100 text-sm">{item.name}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                                Cocok: {item.compatibility}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                                {item.category}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-slate-400">
                              {formatRp(item.buyPrice)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="font-mono font-bold text-white">{formatRp(item.sellPrice)}</div>
                              <span className="text-[10px] text-emerald-400 font-semibold">+{marginPercent}% margin</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="font-bold text-sm text-white">
                                {item.stock} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                              </div>
                              <div className="mt-1">
                                {isZero ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                    Habis (0)
                                  </span>
                                ) : isLow ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                                    Kritis (≤ {item.minStock})
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    Stok Aman
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center space-x-1.5">
                                <button
                                  onClick={() => handleQuickRestock(item.id, 10)}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow"
                                  title="Restock 10 Unit"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>+10</span>
                                </button>
                                <button
                                  onClick={() => handleQuickRestock(item.id, 1)}
                                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition"
                                  title="Tambah 1 Unit"
                                >
                                  +1
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredInventory.length === 0 && (
                  <div className="text-center py-10">
                    <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 font-medium">Suku cadang tidak ditemukan</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 4: DATA PELANGGAN & RIWAYAT SERVIS */}
          {/* ========================================================== */}
          {activeTab === 'customers' && (
            <div className="space-y-6">

              {/* Toolbar */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari Pelanggan, No. WhatsApp, atau Plat Nomor Kendaraan..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={() => setIsAddCustomerModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/30 transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Pelanggan & Kendaraan</span>
                </button>
              </div>

              {/* Customer Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCustomers.map((cust) => (
                  <div
                    key={cust.id}
                    className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition"
                  >
                    <div>
                      {/* Customer Name & Phone */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-base font-bold text-white flex items-center space-x-2">
                            <span>{cust.name}</span>
                            <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                              {cust.id}
                            </span>
                          </h3>
                          <div className="flex items-center space-x-3 mt-1 text-xs text-slate-400">
                            <span className="flex items-center space-x-1 text-emerald-400">
                              <Phone className="w-3 h-3" />
                              <span>{cust.phone}</span>
                            </span>
                            <span>•</span>
                            <span className="truncate max-w-[200px]">{cust.email}</span>
                          </div>
                        </div>

                        <span className="text-xs bg-blue-500/10 text-blue-400 font-bold px-2 py-0.5 rounded-full border border-blue-500/20">
                          {cust.serviceHistory.length}x Servis
                        </span>
                      </div>

                      {/* Registered Vehicles */}
                      <div className="space-y-2 mb-4">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Kendaraan Terdaftar:
                        </span>
                        {cust.vehicles.map((v, i) => (
                          <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                                <Car className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-white text-xs block font-mono">{v.plate}</span>
                                <span className="text-[11px] text-slate-400">{v.brand} {v.model} ({v.year})</span>
                              </div>
                            </div>
                            <div className="text-right text-xs">
                              <span className="text-slate-400 block text-[10px]">Odometer:</span>
                              <span className="font-mono font-semibold text-slate-200">
                                {v.lastKm ? `${v.lastKm.toLocaleString('id-ID')} KM` : '-'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center space-x-2 pt-3 border-t border-slate-800">
                      <button
                        onClick={() => setSelectedCustomerHistory(cust)}
                        className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                      >
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>Riwayat Servis ({cust.serviceHistory.length})</span>
                      </button>

                      <button
                        onClick={() => {
                          handleSelectCustomerForSPK(cust.id);
                          setIsNewOrderModalOpen(true);
                        }}
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition shadow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Buat SPK Kendaraan Ini</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 5: KASIR, INVOICE & CETAK STRUK */}
          {/* ========================================================== */}
          {activeTab === 'cashier' && (
            <div className="space-y-6">

              {/* Two Column Layout: POS Calculator & Billing on Left, Pending Orders on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left 2 Cols: Active Billing Form */}
                <div className="lg:col-span-2 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                      <div>
                        <h2 className="text-base font-bold text-white flex items-center space-x-2">
                          <CreditCard className="w-5 h-5 text-emerald-400" />
                          <span>Kasir Pembayaran & Faktur</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {posSelectedSPK
                            ? `Memproses pembayaran untuk SPK: ${posSelectedSPK.id}`
                            : 'Penjualan Langsung (Retail POS) atau Pilih SPK di sebelah kanan'}
                        </p>
                      </div>

                      {posSelectedSPK && (
                        <button
                          onClick={() => setPosSelectedSPK(null)}
                          className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center space-x-1"
                        >
                          <X className="w-3 h-3" />
                          <span>Batal Pilih SPK</span>
                        </button>
                      )}
                    </div>

                    {/* Customer & Vehicle Header in POS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                          Nama Pelanggan
                        </label>
                        {posSelectedSPK ? (
                          <div className="text-sm font-bold text-white">{posSelectedSPK.customerName}</div>
                        ) : (
                          <input
                            type="text"
                            value={posCustomerName}
                            onChange={(e) => setPosCustomerName(e.target.value)}
                            placeholder="Nama Pelanggan Walk-in"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                          Nomor Plat Kendaraan
                        </label>
                        {posSelectedSPK ? (
                          <div className="text-sm font-bold text-blue-400 font-mono">{posSelectedSPK.vehiclePlate}</div>
                        ) : (
                          <input
                            type="text"
                            value={posVehiclePlate}
                            onChange={(e) => setPosVehiclePlate(e.target.value)}
                            placeholder="e.g. B 1234 ABC"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono"
                          />
                        )}
                      </div>
                    </div>

                    {/* Item Breakdown Table in Billing */}
                    <div className="border border-slate-800 rounded-xl overflow-hidden mb-4">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Item / Layanan</th>
                            <th className="py-2.5 px-3 text-center">Tipe</th>
                            <th className="py-2.5 px-3 text-center">Qty</th>
                            <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                            <th className="py-2.5 px-3 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {posCalculations.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/30">
                              <td className="py-2 px-3 font-medium text-slate-200">{item.name}</td>
                              <td className="py-2 px-3 text-center">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                  item.type === 'Jasa' ? 'bg-blue-500/20 text-blue-300' : 'bg-cyan-500/20 text-cyan-300'
                                }`}>
                                  {item.type}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center font-bold text-slate-100">{item.qty}</td>
                              <td className="py-2 px-3 text-right font-mono text-slate-400">{formatRp(item.price)}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-white">{formatRp(item.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {posCalculations.items.length === 0 && (
                        <div className="p-6 text-center text-slate-500 text-xs">
                          Belum ada item tagihan. Pilih SPK di sebelah kanan atau gunakan Penjualan Langsung.
                        </div>
                      )}
                    </div>

                    {/* Quick Add Retail Item if needed */}
                    {!posSelectedSPK && (
                      <div className="mb-4 p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400">Tambah Cepat Retail:</span>
                        <select
                          id="quick-add-part"
                          className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2 py-1"
                          onChange={(e) => {
                            const part = inventory.find(i => i.id === e.target.value);
                            if (part) {
                              setPosDirectItems([...posDirectItems, {
                                type: 'Part',
                                name: part.name,
                                qty: 1,
                                price: part.sellPrice
                              }]);
                            }
                            e.target.value = '';
                          }}
                        >
                          <option value="">+ Pilih Suku Cadang Retail...</option>
                          {inventory.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({formatRp(p.sellPrice)}) - Stok: {p.stock}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Calculation Summary & Payment Method */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                      {/* Left: Payment Method & Cash Received */}
                      <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-300 block">Metode Pembayaran</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Tunai', 'QRIS', 'Transfer BCA', 'Kartu Debit'].map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setPosPaymentMethod(m)}
                              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 border ${
                                posPaymentMethod === m
                                  ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {m === 'Tunai' && <DollarSign className="w-3.5 h-3.5" />}
                              {m === 'QRIS' && <QrCode className="w-3.5 h-3.5" />}
                              {m === 'Transfer BCA' && <ArrowUpRight className="w-3.5 h-3.5" />}
                              {m === 'Kartu Debit' && <CreditCard className="w-3.5 h-3.5" />}
                              <span>{m}</span>
                            </button>
                          ))}
                        </div>

                        {posPaymentMethod === 'Tunai' && (
                          <div className="space-y-2 pt-1">
                            <label className="text-xs font-semibold text-slate-400 block">Uang Diterima (Rp)</label>
                            <input
                              type="number"
                              value={posAmountPaid}
                              onChange={(e) => setPosAmountPaid(e.target.value)}
                              placeholder={`Minimal ${posCalculations.grandTotal}`}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                            />
                            {/* Quick Nominal Buttons */}
                            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                              <button
                                type="button"
                                onClick={() => setPosAmountPaid(String(posCalculations.grandTotal))}
                                className="px-2 py-1 bg-slate-800 text-[11px] rounded text-slate-300 hover:text-white"
                              >
                                Uang Pas
                              </button>
                              <button
                                type="button"
                                onClick={() => setPosAmountPaid('100000')}
                                className="px-2 py-1 bg-slate-800 text-[11px] rounded text-slate-300 hover:text-white"
                              >
                                100rb
                              </button>
                              <button
                                type="button"
                                onClick={() => setPosAmountPaid('500000')}
                                className="px-2 py-1 bg-slate-800 text-[11px] rounded text-slate-300 hover:text-white"
                              >
                                500rb
                              </button>
                              <button
                                type="button"
                                onClick={() => setPosAmountPaid('1000000')}
                                className="px-2 py-1 bg-slate-800 text-[11px] rounded text-slate-300 hover:text-white"
                              >
                                1 Juta
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Calculations */}
                      <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Subtotal Jasa Servis:</span>
                          <span className="font-mono text-slate-200">{formatRp(posCalculations.servicesTotal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Subtotal Suku Cadang:</span>
                          <span className="font-mono text-slate-200">{formatRp(posCalculations.partsTotal)}</span>
                        </div>

                        {/* Diskon Input */}
                        <div className="flex items-center justify-between text-slate-400 pt-1">
                          <span>Potongan Diskon (Rp):</span>
                          <input
                            type="number"
                            value={posDiscount}
                            onChange={(e) => setPosDiscount(e.target.value)}
                            className="w-24 bg-slate-900 border border-slate-700 text-right px-2 py-0.5 rounded text-xs text-white font-mono"
                          />
                        </div>

                        {/* PPN Toggle */}
                        <div className="flex items-center justify-between text-slate-400">
                          <label className="flex items-center space-x-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={posIncludeTax}
                              onChange={(e) => setPosIncludeTax(e.target.checked)}
                              className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                            />
                            <span>Pajak PPN (11%)</span>
                          </label>
                          <span className="font-mono text-slate-300">{formatRp(posCalculations.taxAmount)}</span>
                        </div>

                        {/* Grand Total */}
                        <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                          <span>Total Tagihan:</span>
                          <span className="text-emerald-400 font-mono">{formatRp(posCalculations.grandTotal)}</span>
                        </div>

                        {posPaymentMethod === 'Tunai' && (
                          <div className="flex justify-between text-xs text-slate-300 pt-1">
                            <span>Kembalian:</span>
                            <span className="font-mono font-bold text-cyan-300">{formatRp(posCalculations.change)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Checkout & Print Action */}
                  <div className="pt-6 border-t border-slate-800 mt-6 flex items-center justify-end space-x-3">
                    <button
                      onClick={handleProcessPayment}
                      disabled={posCalculations.grandTotal <= 0}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center space-x-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                    >
                      <Check className="w-5 h-5" />
                      <span>Selesaikan Pembayaran & Cetak Struk</span>
                    </button>
                  </div>
                </div>

                {/* Right 1 Col: SPK Siap Bayar & Selesai Quick Selector */}
                <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span>SPK Menunggu Pembayaran</span>
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Klik salah satu order di bawah untuk memproses kasir instan:
                    </p>

                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {workOrders
                        .filter(wo => wo.paymentStatus !== 'Lunas')
                        .map(wo => {
                          const isCurrent = posSelectedSPK?.id === wo.id;
                          const totalServ = wo.services.reduce((a, b) => a + b.price, 0);
                          const totalPart = wo.partsUsed.reduce((a, b) => a + (b.price * b.qty), 0);
                          const total = totalServ + totalPart;

                          return (
                            <div
                              key={wo.id}
                              onClick={() => handleLoadSPKIntoPOS(wo)}
                              className={`p-3 rounded-xl border cursor-pointer transition ${
                                isCurrent
                                  ? 'bg-blue-600/20 border-blue-500 shadow-md'
                                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold text-blue-400">{wo.id}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  wo.status === 'Selesai' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                  {wo.status}
                                </span>
                              </div>
                              <div className="text-xs font-bold text-white mt-1">{wo.vehiclePlate}</div>
                              <div className="text-[11px] text-slate-400">{wo.customerName} • {wo.vehicleModel}</div>
                              <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-slate-800/60 text-xs">
                                <span className="text-slate-500">Total Biaya:</span>
                                <span className="font-mono font-bold text-emerald-400">{formatRp(total)}</span>
                              </div>
                            </div>
                          );
                        })}

                      {workOrders.filter(wo => wo.paymentStatus !== 'Lunas').length === 0 && (
                        <div className="p-6 text-center text-slate-500 text-xs">
                          Semua SPK sudah lunas dibayar!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Invoice History Button */}
                  <div className="pt-4 border-t border-slate-800 mt-4">
                    <span className="text-xs text-slate-400 block mb-2 font-medium">Riwayat Invoice Terbit ({invoices.length}):</span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {invoices.slice(0, 3).map((inv) => (
                        <div
                          key={inv.invoiceNo}
                          className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-mono font-bold text-slate-200 block text-[11px]">{inv.invoiceNo}</span>
                            <span className="text-[10px] text-slate-400">{inv.customerName} ({inv.vehiclePlate})</span>
                          </div>
                          <button
                            onClick={() => setSelectedReceipt(inv)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded text-[10px] font-semibold flex items-center space-x-1"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Cetak</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </main>

      {/* ============================================================== */}
      {/* MODAL: BUAT WORK ORDER / SPK BARU */}
      {/* ============================================================== */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsNewOrderModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Buat Surat Perintah Kerja (SPK) Baru</h3>
                <p className="text-xs text-slate-400">
                  Pilih suku cadang untuk pemotongan stok otomatis secara real-time.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="space-y-4">
              {/* Quick Select Customer */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Pilih Pelanggan Terdaftar (Opsional)
                </label>
                <select
                  value={newOrderForm.customerId}
                  onChange={(e) => handleSelectCustomerForSPK(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Input Manual / Pelanggan Baru --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.vehicles[0]?.plate} ({c.vehicles[0]?.model})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer & Vehicle Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Nama Pelanggan *</label>
                  <input
                    type="text"
                    required
                    value={newOrderForm.customerName}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, customerName: e.target.value })}
                    placeholder="e.g. Bambang Sudibyo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">No. WhatsApp / Telp</label>
                  <input
                    type="text"
                    value={newOrderForm.customerPhone}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, customerPhone: e.target.value })}
                    placeholder="e.g. 0812-3456-7890"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">No. Plat Kendaraan *</label>
                  <input
                    type="text"
                    required
                    value={newOrderForm.vehiclePlate}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, vehiclePlate: e.target.value })}
                    placeholder="e.g. B 1982 KZA"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Merk & Tipe Kendaraan</label>
                  <input
                    type="text"
                    value={newOrderForm.vehicleModel}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, vehicleModel: e.target.value })}
                    placeholder="e.g. Toyota Avanza 1.3 G"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Odometer (KM Saat Ini)</label>
                  <input
                    type="number"
                    value={newOrderForm.odometer}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, odometer: e.target.value })}
                    placeholder="e.g. 48500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Mekanik Penanggung Jawab</label>
                  <select
                    value={newOrderForm.mechanic}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, mechanic: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {mechanicsList.map(m => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.specialty})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Complaints */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Keluhan / Catatan Kendaraan</label>
                <textarea
                  rows="2"
                  value={newOrderForm.complaints}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, complaints: e.target.value })}
                  placeholder="Deskripsikan masalah mesin, rem, getaran, suara mencurigakan..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              {/* Select Services */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Pilih Layanan Jasa Servis:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                  {initialServices.map(srv => {
                    const isChecked = newOrderForm.selectedServices.includes(srv.id);
                    return (
                      <label
                        key={srv.id}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition ${
                          isChecked ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewOrderForm({ ...newOrderForm, selectedServices: [...newOrderForm.selectedServices, srv.id] });
                              } else {
                                setNewOrderForm({ ...newOrderForm, selectedServices: newOrderForm.selectedServices.filter(id => id !== srv.id) });
                              }
                            }}
                            className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
                          />
                          <span className="font-medium truncate max-w-[170px]">{srv.name}</span>
                        </div>
                        <span className="font-mono text-blue-400">{formatRp(srv.price)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Select Spare Parts with Automatic Deduction */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Suku Cadang yang Digunakan (Otomatis Potong Stok):
                  </label>
                  <span className="text-[11px] text-amber-400 font-medium">Stok inventaris otomatis berkurang</span>
                </div>

                <div className="space-y-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
                  <select
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    onChange={(e) => {
                      const partId = e.target.value;
                      if (!partId) return;
                      const existing = newOrderForm.selectedParts.find(p => p.partId === partId);
                      if (existing) {
                        setNewOrderForm({
                          ...newOrderForm,
                          selectedParts: newOrderForm.selectedParts.map(p =>
                            p.partId === partId ? { ...p, qty: p.qty + 1 } : p
                          )
                        });
                      } else {
                        setNewOrderForm({
                          ...newOrderForm,
                          selectedParts: [...newOrderForm.selectedParts, { partId, qty: 1 }]
                        });
                      }
                      e.target.value = '';
                    }}
                  >
                    <option value="">+ Klik untuk menambahkan suku cadang ke SPK...</option>
                    {inventory.map(p => (
                      <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                        {p.name} ({p.sku}) - Sisa Stok: {p.stock} {p.unit} - {formatRp(p.sellPrice)}
                      </option>
                    ))}
                  </select>

                  {/* List of Selected Parts */}
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {newOrderForm.selectedParts.map((sp) => {
                      const item = inventory.find(i => i.id === sp.partId);
                      return (
                        <div key={sp.partId} className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-white">{item?.name}</span>
                            <span className="text-[11px] text-slate-400 block font-mono">
                              {formatRp(item?.sellPrice)} per {item?.unit} (Stok ada: {item?.stock})
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400">Qty:</span>
                            <input
                              type="number"
                              min="1"
                              max={item?.stock || 99}
                              value={sp.qty}
                              onChange={(e) => {
                                const val = Math.max(1, Math.min(Number(e.target.value), item?.stock || 1));
                                setNewOrderForm({
                                  ...newOrderForm,
                                  selectedParts: newOrderForm.selectedParts.map(p =>
                                    p.partId === sp.partId ? { ...p, qty: val } : p
                                  )
                                });
                              }}
                              className="w-14 bg-slate-950 border border-slate-700 text-center rounded px-1.5 py-0.5 text-xs text-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setNewOrderForm({
                                  ...newOrderForm,
                                  selectedParts: newOrderForm.selectedParts.filter(p => p.partId !== sp.partId)
                                });
                              }}
                              className="text-rose-400 hover:text-rose-300 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {newOrderForm.selectedParts.length === 0 && (
                      <div className="text-center py-2 text-slate-500 text-xs">
                        Belum ada suku cadang yang dipilih.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan & Terbitkan SPK</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: TAMBAH SUKU CADANG BARU */}
      {/* ============================================================== */}
      {isAddPartModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsAddPartModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Tambah Suku Cadang ke Inventaris</h3>
                <p className="text-xs text-slate-400">Masukkan detail barang, harga, dan batas minimum stok</p>
              </div>
            </div>

            <form onSubmit={handleAddNewPart} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Kode SKU</label>
                  <input
                    type="text"
                    value={newPartForm.sku}
                    onChange={(e) => setNewPartForm({ ...newPartForm, sku: e.target.value })}
                    placeholder="e.g. SKU-OIL-03"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Kategori</label>
                  <select
                    value={newPartForm.category}
                    onChange={(e) => setNewPartForm({ ...newPartForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Oli & Pelumas">Oli & Pelumas</option>
                    <option value="Sistem Rem">Sistem Rem</option>
                    <option value="Mesin & Pengapian">Mesin & Pengapian</option>
                    <option value="Filter">Filter</option>
                    <option value="Suspensi & Kaki-kaki">Suspensi & Kaki-kaki</option>
                    <option value="Kelistrikan">Kelistrikan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nama Suku Cadang *</label>
                <input
                  type="text"
                  required
                  value={newPartForm.name}
                  onChange={(e) => setNewPartForm({ ...newPartForm, name: e.target.value })}
                  placeholder="e.g. Oli Idemitsu 5W-30 SN (4L)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Harga Beli (Modal)</label>
                  <input
                    type="number"
                    value={newPartForm.buyPrice}
                    onChange={(e) => setNewPartForm({ ...newPartForm, buyPrice: e.target.value })}
                    placeholder="250000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Harga Jual *</label>
                  <input
                    type="number"
                    required
                    value={newPartForm.sellPrice}
                    onChange={(e) => setNewPartForm({ ...newPartForm, sellPrice: e.target.value })}
                    placeholder="340000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Stok Awal</label>
                  <input
                    type="number"
                    value={newPartForm.stock}
                    onChange={(e) => setNewPartForm({ ...newPartForm, stock: e.target.value })}
                    placeholder="10"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 text-center font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Min. Stok (Alert)</label>
                  <input
                    type="number"
                    value={newPartForm.minStock}
                    onChange={(e) => setNewPartForm({ ...newPartForm, minStock: e.target.value })}
                    placeholder="4"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 text-center"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Satuan</label>
                  <select
                    value={newPartForm.unit}
                    onChange={(e) => setNewPartForm({ ...newPartForm, unit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Botol">Botol</option>
                    <option value="Galon">Galon</option>
                    <option value="Set">Set</option>
                    <option value="Pasang">Pasang</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Lokasi Rak / Lemari</label>
                  <input
                    type="text"
                    value={newPartForm.shelf}
                    onChange={(e) => setNewPartForm({ ...newPartForm, shelf: e.target.value })}
                    placeholder="e.g. Rak B-02"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Kompatibilitas Kendaraan</label>
                  <input
                    type="text"
                    value={newPartForm.compatibility}
                    onChange={(e) => setNewPartForm({ ...newPartForm, compatibility: e.target.value })}
                    placeholder="e.g. Avanza, Xenia, Mobilio"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddPartModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
                >
                  Simpan Suku Cadang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: TAMBAH PELANGGAN & KENDARAAN BARU */}
      {/* ============================================================== */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsAddCustomerModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Registrasi Pelanggan & Kendaraan</h3>
                <p className="text-xs text-slate-400">Tambahkan data pemilik dan unit mobil/motor</p>
              </div>
            </div>

            <form onSubmit={handleAddNewCustomer} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Nama Pemilik *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerForm.name}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                    placeholder="e.g. Ir. Hendra Saputra"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">No. WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    placeholder="e.g. 0813-1234-5678"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Alamat Rumah / Kantor</label>
                <input
                  type="text"
                  value={newCustomerForm.address}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                  placeholder="e.g. Jl. Thamrin No. 25, Jakpus"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                  Informasi Unit Kendaraan:
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Nomor Plat Polisi *</label>
                    <input
                      type="text"
                      required
                      value={newCustomerForm.plate}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, plate: e.target.value })}
                      placeholder="e.g. B 8821 RFS"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Merk Kendaraan</label>
                    <select
                      value={newCustomerForm.brand}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, brand: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Toyota">Toyota</option>
                      <option value="Honda">Honda</option>
                      <option value="Mitsubishi">Mitsubishi</option>
                      <option value="Daihatsu">Daihatsu</option>
                      <option value="Suzuki">Suzuki</option>
                      <option value="Nissan">Nissan</option>
                      <option value="Yamaha">Yamaha (Motor)</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Model / Varian</label>
                    <input
                      type="text"
                      value={newCustomerForm.model}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, model: e.target.value })}
                      placeholder="e.g. Fortuner GR"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Tahun</label>
                    <input
                      type="number"
                      value={newCustomerForm.year}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, year: e.target.value })}
                      placeholder="2022"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white text-center"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Odometer (KM)</label>
                    <input
                      type="number"
                      value={newCustomerForm.km}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, km: e.target.value })}
                      placeholder="35000"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DETAIL WORK ORDER / CETAK SPK */}
      {/* ============================================================== */}
      {selectedSPKDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedSPKDetail(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white no-print"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {selectedSPKDetail.id}
                </span>
                <h3 className="text-base font-bold text-white mt-1">Lembar Surat Perintah Kerja (SPK)</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {selectedSPKDetail.status}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">Pelanggan:</span>
                  <span className="font-bold text-white">{selectedSPKDetail.customerName}</span>
                  <span className="text-slate-500 block">{selectedSPKDetail.customerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Kendaraan:</span>
                  <span className="font-mono font-bold text-blue-400">{selectedSPKDetail.vehiclePlate}</span>
                  <span className="text-slate-300 block">{selectedSPKDetail.vehicleModel}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Mekanik Bertugas:</span>
                  <span className="font-semibold text-white">{selectedSPKDetail.mechanic}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Odometer KM:</span>
                  <span className="font-mono text-slate-200">
                    {selectedSPKDetail.odometer ? `${selectedSPKDetail.odometer.toLocaleString('id-ID')} KM` : '-'}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-400 block mb-1">Keluhan Pelanggan:</span>
                <p className="p-3 bg-slate-950 rounded-xl text-slate-200 italic border border-slate-800">
                  "{selectedSPKDetail.complaints}"
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-400 block mb-1">Rincian Pekerjaan Servis:</span>
                <div className="space-y-1">
                  {selectedSPKDetail.services.map((s, idx) => (
                    <div key={idx} className="flex justify-between p-2 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-slate-200">{s.name}</span>
                      <span className="font-mono text-blue-400">{formatRp(s.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-400 block mb-1">Suku Cadang Diganti:</span>
                <div className="space-y-1">
                  {selectedSPKDetail.partsUsed.map((p, idx) => (
                    <div key={idx} className="flex justify-between p-2 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-slate-200">{p.name} ({p.qty}x)</span>
                      <span className="font-mono text-cyan-400">{formatRp(p.price * p.qty)}</span>
                    </div>
                  ))}
                  {selectedSPKDetail.partsUsed.length === 0 && (
                    <div className="p-2 text-slate-500 italic bg-slate-950 rounded-lg">
                      Tidak ada suku cadang yang diganti pada SPK ini.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 mt-6 flex items-center justify-between no-print">
              <button
                onClick={() => setSelectedSPKDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Tutup
              </button>

              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-blue-600/30 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak SPK Fisik</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: RIWAYAT SERVIS PELANGGAN */}
      {/* ============================================================== */}
      {selectedCustomerHistory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedCustomerHistory(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Riwayat Servis: {selectedCustomerHistory.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Total {selectedCustomerHistory.serviceHistory.length} kali kunjungan servis tercatat
                </p>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {selectedCustomerHistory.serviceHistory.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-400">{item.spkId}</span>
                    <span className="text-[11px] text-slate-400">{item.date}</span>
                  </div>
                  <div className="font-semibold text-white text-sm">{item.serviceName}</div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">Mekanik: <strong className="text-slate-200">{item.mechanic}</strong></span>
                    <span className="font-mono font-bold text-emerald-400">{formatRp(item.total)}</span>
                  </div>
                </div>
              ))}

              {selectedCustomerHistory.serviceHistory.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Belum ada catatan riwayat servis sebelumnya.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 mt-5 flex justify-end">
              <button
                onClick={() => setSelectedCustomerHistory(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CETAK STRUK KASIR & INVOICE PEMBAYARAN */}
      {/* ============================================================== */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white no-print"
            >
              <X className="w-5 h-5" />
            </button>

            {/* PRINTABLE RECEIPT CONTAINER (Formatted like professional thermal receipt 80mm) */}
            <div id="printable-receipt" className="bg-white text-slate-900 p-6 rounded-2xl shadow-inner font-mono text-xs">

              {/* Header Bengkel */}
              <div className="text-center pb-4 border-b border-dashed border-slate-400">
                <div className="font-black text-base tracking-tight uppercase">AUTOFIX PRO GARAGE</div>
                <div className="text-[10px] text-slate-600">Sistem Servis & Suku Cadang Resmi</div>
                <div className="text-[10px] text-slate-600">Jl. Raya Otista No. 88, Telp: (021) 8899-7711</div>
                <div className="text-[9px] text-slate-500 mt-1">NPWP: 01.882.912.4-012.000</div>
              </div>

              {/* Invoice Meta */}
              <div className="py-3 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>No. Faktur:</span>
                  <span className="font-bold">{selectedReceipt.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>No. SPK:</span>
                  <span>{selectedReceipt.spkId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>{selectedReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>{selectedReceipt.cashier}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span className="font-bold">{selectedReceipt.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>No. Plat / KM:</span>
                  <span className="font-bold">{selectedReceipt.vehiclePlate} ({selectedReceipt.odometer ? `${selectedReceipt.odometer} KM` : '-'})</span>
                </div>
              </div>

              {/* Items List */}
              <div className="py-3 border-b border-dashed border-slate-400 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex justify-between">
                  <span>Item / Jasa</span>
                  <span>Total</span>
                </div>
                {selectedReceipt.items.map((item, idx) => (
                  <div key={idx} className="text-[11px]">
                    <div className="flex justify-between font-semibold">
                      <span>{item.name}</span>
                      <span>{formatRp(item.total)}</span>
                    </div>
                    <div className="text-[10px] text-slate-600 flex justify-between">
                      <span>{item.qty} x {formatRp(item.price)} ({item.type})</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="py-3 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal Jasa:</span>
                  <span>{formatRp(selectedReceipt.subtotalServices)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal Sparepart:</span>
                  <span>{formatRp(selectedReceipt.subtotalParts)}</span>
                </div>
                {selectedReceipt.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Diskon Khusus:</span>
                    <span>-{formatRp(selectedReceipt.discount)}</span>
                  </div>
                )}
                {selectedReceipt.tax > 0 && (
                  <div className="flex justify-between">
                    <span>PPN (11%):</span>
                    <span>{formatRp(selectedReceipt.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-300">
                  <span>TOTAL AKHIR:</span>
                  <span>{formatRp(selectedReceipt.grandTotal)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Metode Bayar:</span>
                  <span className="font-bold uppercase">{selectedReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uang Diterima:</span>
                  <span>{formatRp(selectedReceipt.amountPaid)}</span>
                </div>
                {selectedReceipt.change > 0 && (
                  <div className="flex justify-between font-bold">
                    <span>Kembalian:</span>
                    <span>{formatRp(selectedReceipt.change)}</span>
                  </div>
                )}
              </div>

              {/* Footer / Warranty Terms */}
              <div className="text-center pt-3 text-[10px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">GARANSI SERVIS RESMI: 1 BULAN / 1.000 KM</div>
                <div>(Menunjukkan struk asli saat klaim garansi)</div>
                <div className="mt-2 font-medium text-slate-700">
                  Terima kasih atas kepercayaan Anda mempercayakan perawatan kendaraan di AutoFix Pro!
                </div>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="pt-4 flex items-center justify-between no-print">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Tutup
              </button>

              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>🖨️ Cetak Struk Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
