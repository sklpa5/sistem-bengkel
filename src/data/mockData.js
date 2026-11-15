export const initialInventory = [
  {
    id: 'PRT-001',
    sku: 'SKU-OIL-01',
    name: 'Shell Helix HX7 10W-40 (4L)',
    category: 'Oli & Pelumas',
    buyPrice: 260000,
    sellPrice: 350000,
    stock: 2, // Low stock!
    minStock: 5,
    unit: 'Galon',
    shelf: 'Rak A-01',
    compatibility: 'Toyota Avanza, Xenia, Mobilio, Ertiga',
  },
  {
    id: 'PRT-002',
    sku: 'SKU-BRK-01',
    name: 'Kampas Rem Depan Bendix GCT',
    category: 'Sistem Rem',
    buyPrice: 210000,
    sellPrice: 320000,
    stock: 1, // Low stock!
    minStock: 4,
    unit: 'Set',
    shelf: 'Rak B-03',
    compatibility: 'Avanza 2012-2021, Veloz, Rush, Terios',
  },
  {
    id: 'PRT-003',
    sku: 'SKU-FLT-01',
    name: 'Filter Oli Original Toyota Denso',
    category: 'Filter',
    buyPrice: 32000,
    sellPrice: 50000,
    stock: 18,
    minStock: 8,
    unit: 'Pcs',
    shelf: 'Rak A-04',
    compatibility: 'Avanza, Rush, Calya, Agya, Yaris',
  },
  {
    id: 'PRT-004',
    sku: 'SKU-SPK-01',
    name: 'Busi Denso Iridium Power IK20',
    category: 'Mesin & Pengapian',
    buyPrice: 85000,
    sellPrice: 125000,
    stock: 3, // Low stock!
    minStock: 8,
    unit: 'Pcs',
    shelf: 'Rak C-02',
    compatibility: 'Innova bensin, Fortuner, Honda Jazz/City',
  },
  {
    id: 'PRT-005',
    sku: 'SKU-OIL-02',
    name: 'Motul 3100 Silver 4T 10W-40 (1L)',
    category: 'Oli & Pelumas',
    buyPrice: 65000,
    sellPrice: 90000,
    stock: 24,
    minStock: 10,
    unit: 'Botol',
    shelf: 'Rak A-02',
    compatibility: 'Vario 150/160, NMAX, Aerox, PCX',
  },
  {
    id: 'PRT-006',
    sku: 'SKU-ACC-01',
    name: 'Aki GS Astra Hybrid NS40ZL',
    category: 'Kelistrikan',
    buyPrice: 680000,
    sellPrice: 850000,
    stock: 6,
    minStock: 3,
    unit: 'Unit',
    shelf: 'Area Baterai-01',
    compatibility: 'Honda Brio, Jazz, Mobilio, Suzuki Ertiga',
  },
  {
    id: 'PRT-007',
    sku: 'SKU-SUS-01',
    name: 'Shockbreaker Belakang Kayaba Excel-G',
    category: 'Suspensi & Kaki-kaki',
    buyPrice: 480000,
    sellPrice: 650000,
    stock: 4,
    minStock: 2,
    unit: 'Pasang',
    shelf: 'Rak D-01',
    compatibility: 'Toyota Innova Reborn 2016-2022',
  },
  {
    id: 'PRT-008',
    sku: 'SKU-FLT-02',
    name: 'Filter Udara Ferrox Stainless',
    category: 'Filter',
    buyPrice: 380000,
    sellPrice: 480000,
    stock: 8,
    minStock: 3,
    unit: 'Pcs',
    shelf: 'Rak C-05',
    compatibility: 'Mitsubishi Pajero Sport / Strada Triton',
  },
  {
    id: 'PRT-009',
    sku: 'SKU-BRK-02',
    name: 'Minyak Rem Prestone DOT 4 (300ml)',
    category: 'Sistem Rem',
    buyPrice: 28000,
    sellPrice: 42000,
    stock: 15,
    minStock: 6,
    unit: 'Botol',
    shelf: 'Rak B-01',
    compatibility: 'Universal Mobil & Motor',
  },
  {
    id: 'PRT-010',
    sku: 'SKU-BLT-01',
    name: 'Fan Belt / Vanbelt Gates 6PK1810',
    category: 'Mesin & Pengapian',
    buyPrice: 110000,
    sellPrice: 175000,
    stock: 5,
    minStock: 3,
    unit: 'Pcs',
    shelf: 'Rak C-03',
    compatibility: 'Grand Livina 1.5, Nissan Juke',
  }
];

export const initialServices = [
  { id: 'SRV-01', name: 'Tune Up Injeksi & Gurah Mesin (Carbon Clean)', price: 250000, estimatedHours: 1.5 },
  { id: 'SRV-02', name: 'Jasa Servis Rem 4 Roda & Bleeding', price: 150000, estimatedHours: 1 },
  { id: 'SRV-03', name: 'Jasa Ganti Oli Mesin & Filter Oli', price: 40000, estimatedHours: 0.5 },
  { id: 'SRV-04', name: 'Spooring 3D & Balancing 4 Roda', price: 180000, estimatedHours: 1 },
  { id: 'SRV-05', name: 'Servis AC Berkala & Cuci Evaporator', price: 300000, estimatedHours: 2 },
  { id: 'SRV-06', name: 'Kuras Radiator & Flushing Coolant', price: 75000, estimatedHours: 0.5 },
  { id: 'SRV-07', name: 'Overhaul Kopling (Turun Kopling)', price: 550000, estimatedHours: 4 },
  { id: 'SRV-08', name: 'Pengecekan Komprehensif 50 Titik (General Check)', price: 100000, estimatedHours: 1 }
];

export const mechanicsList = [
  { id: 'MEK-01', name: 'Agus Pratama', specialty: 'Mesin & Diagnosa ECU', activeOrders: 2, status: 'Aktif' },
  { id: 'MEK-02', name: 'Budi Santoso', specialty: 'Kaki-kaki & Suspensi', activeOrders: 1, status: 'Aktif' },
  { id: 'MEK-03', name: 'Hendra Wijaya', specialty: 'Kelistrikan & AC', activeOrders: 1, status: 'Aktif' },
  { id: 'MEK-04', name: 'Rian Fahrezi', specialty: 'Servis Rem & Tune Up', activeOrders: 0, status: 'Siap' }
];

export const initialCustomers = [
  {
    id: 'CUST-001',
    name: 'Bambang Sudibyo',
    phone: '0812-3456-7890',
    email: 'bambang.s@gmail.com',
    address: 'Jl. Melati Raya No. 12, Kebon Jeruk, Jakbar',
    vehicles: [
      { plate: 'B 1982 KZA', brand: 'Toyota', model: 'Avanza 1.3 G M/T', year: 2020, color: 'Hitam Metalik', lastKm: 48500 }
    ],
    serviceHistory: [
      {
        date: '2026-11-15',
        spkId: 'SPK-202611-001',
        serviceName: 'Tune Up & Servis Rem',
        total: 720000,
        mechanic: 'Agus Pratama',
        status: 'Lunas'
      },
      {
        date: '2026-08-20',
        spkId: 'SPK-202608-019',
        serviceName: 'Ganti Oli & Filter',
        total: 440000,
        mechanic: 'Rian Fahrezi',
        status: 'Lunas'
      }
    ]
  },
  {
    id: 'CUST-002',
    name: 'Dr. Diana Kusuma',
    phone: '0818-8765-4321',
    email: 'diana.kusuma@klinik.id',
    address: 'Apartemen Taman Anggrek Tower 3, Jakbar',
    vehicles: [
      { plate: 'B 2341 SIK', brand: 'Honda', model: 'HR-V 1.5 E CVT', year: 2021, color: 'Putih Mutiara', lastKm: 32000 }
    ],
    serviceHistory: [
      {
        date: '2026-11-14',
        spkId: 'SPK-202611-002',
        serviceName: 'General Check & Servis AC',
        total: 400000,
        mechanic: 'Hendra Wijaya',
        status: 'Lunas'
      }
    ]
  },
  {
    id: 'CUST-003',
    name: 'H. Suryadi Mandiri',
    phone: '0813-9988-7766',
    email: 'suryadi.logistik@gmail.com',
    address: 'Komp. Duta Indah No. 44, Cengkareng',
    vehicles: [
      { plate: 'B 9081 PQR', brand: 'Toyota', model: 'Innova Reborn 2.4 V Diesel', year: 2019, color: 'Silver', lastKm: 86400 },
      { plate: 'B 5542 TXR', brand: 'Yamaha', model: 'NMAX 155 Connected', year: 2022, color: 'Matte Blue', lastKm: 18200 }
    ],
    serviceHistory: [
      {
        date: '2026-11-15',
        spkId: 'SPK-202611-003',
        serviceName: 'Ganti Shock Belakang & Kampas Rem',
        total: 1045000,
        mechanic: 'Budi Santoso',
        status: 'Dikerjakan'
      }
    ]
  },
  {
    id: 'CUST-004',
    name: 'Kevin Jonathan',
    phone: '0857-1122-3344',
    email: 'kevin.j@techstartup.co',
    address: 'Green Ville Blok B No. 8',
    vehicles: [
      { plate: 'B 7712 VCD', brand: 'Mitsubishi', model: 'Pajero Sport Dakar 4x2', year: 2020, color: 'Deep Black', lastKm: 61000 }
    ],
    serviceHistory: [
      {
        date: '2026-11-15',
        spkId: 'SPK-202611-004',
        serviceName: 'Ganti Filter Udara Ferrox & Flushing Coolant',
        total: 555000,
        mechanic: 'Agus Pratama',
        status: 'Siap Bayar'
      }
    ]
  }
];

export const initialWorkOrders = [
  {
    id: 'SPK-202611-001',
    customerName: 'Bambang Sudibyo',
    customerPhone: '0812-3456-7890',
    vehiclePlate: 'B 1982 KZA',
    vehicleModel: 'Toyota Avanza 1.3 G M/T',
    odometer: 48500,
    entryDate: '2026-11-15 08:30',
    mechanic: 'Agus Pratama',
    complaints: 'Mesin agak pincang saat dingin, getar saat ngerem dari kecepatan tinggi',
    services: [
      { id: 'SRV-01', name: 'Tune Up Injeksi & Gurah Mesin (Carbon Clean)', price: 250000 },
      { id: 'SRV-02', name: 'Jasa Servis Rem 4 Roda & Bleeding', price: 150000 }
    ],
    partsUsed: [
      { partId: 'PRT-002', sku: 'SKU-BRK-01', name: 'Kampas Rem Depan Bendix GCT', qty: 1, price: 320000 }
    ],
    status: 'Selesai',
    paymentStatus: 'Lunas',
    notes: 'Kampas rem belakang masih tebal 70%. Disarankan kuras minyak rem bulan depan.'
  },
  {
    id: 'SPK-202611-002',
    customerName: 'Dr. Diana Kusuma',
    customerPhone: '0818-8765-4321',
    vehiclePlate: 'B 2341 SIK',
    vehicleModel: 'Honda HR-V 1.5 E CVT',
    odometer: 32000,
    entryDate: '2026-11-15 09:15',
    mechanic: 'Hendra Wijaya',
    complaints: 'AC kurang dingin saat siang terik, bau apek sedikit',
    services: [
      { id: 'SRV-05', name: 'Servis AC Berkala & Cuci Evaporator', price: 300000 },
      { id: 'SRV-08', name: 'Pengecekan Komprehensif 50 Titik', price: 100000 }
    ],
    partsUsed: [],
    status: 'Selesai',
    paymentStatus: 'Lunas',
    notes: 'Freon normal, evaporator kotor sudah dibersihkan dan difogging anti bakteri.'
  },
  {
    id: 'SPK-202611-003',
    customerName: 'H. Suryadi Mandiri',
    customerPhone: '0813-9988-7766',
    vehiclePlate: 'B 9081 PQR',
    vehicleModel: 'Toyota Innova Reborn 2.4 V Diesel',
    odometer: 86400,
    entryDate: '2026-11-15 10:00',
    mechanic: 'Budi Santoso',
    complaints: 'Bunyi gluduk-gluduk dari suspensi belakang saat lewat jalan berlubang',
    services: [
      { id: 'SRV-02', name: 'Jasa Servis Rem 4 Roda & Bleeding', price: 150000 },
      { id: 'SRV-04', name: 'Spooring 3D & Balancing 4 Roda', price: 180000 }
    ],
    partsUsed: [
      { partId: 'PRT-007', sku: 'SKU-SUS-01', name: 'Shockbreaker Belakang Kayaba Excel-G', qty: 1, price: 650000 },
      { partId: 'PRT-009', sku: 'SKU-BRK-02', name: 'Minyak Rem Prestone DOT 4 (300ml)', qty: 1, price: 42000 }
    ],
    status: 'Dikerjakan',
    paymentStatus: 'Belum Bayar',
    notes: 'Shockbreaker belakang kanan rembes oli parah, ganti sepasang.'
  },
  {
    id: 'SPK-202611-004',
    customerName: 'Kevin Jonathan',
    customerPhone: '0857-1122-3344',
    vehiclePlate: 'B 7712 VCD',
    vehicleModel: 'Mitsubishi Pajero Sport Dakar 4x2',
    odometer: 61000,
    entryDate: '2026-11-15 11:20',
    mechanic: 'Agus Pratama',
    complaints: 'Tarikan rada berat, ganti filter udara dan kuras coolant radiator',
    services: [
      { id: 'SRV-06', name: 'Kuras Radiator & Flushing Coolant', price: 75000 }
    ],
    partsUsed: [
      { partId: 'PRT-008', sku: 'SKU-FLT-02', name: 'Filter Udara Ferrox Stainless', qty: 1, price: 480000 }
    ],
    status: 'Siap Bayar',
    paymentStatus: 'Belum Bayar',
    notes: 'Pekerjaan selesai, siap ditagihkan ke kasir.'
  },
  {
    id: 'SPK-202611-005',
    customerName: 'Rudi Hermawan',
    customerPhone: '0812-9911-2233',
    vehiclePlate: 'B 3829 WQ',
    vehicleModel: 'Toyota Calya 1.2 G',
    odometer: 25400,
    entryDate: '2026-11-15 13:10',
    mechanic: 'Rian Fahrezi',
    complaints: 'Ganti oli berkala 25.000 KM + filter oli',
    services: [
      { id: 'SRV-03', name: 'Jasa Ganti Oli Mesin & Filter Oli', price: 40000 }
    ],
    partsUsed: [
      { partId: 'PRT-001', sku: 'SKU-OIL-01', name: 'Shell Helix HX7 10W-40 (4L)', qty: 1, price: 350000 },
      { partId: 'PRT-003', sku: 'SKU-FLT-01', name: 'Filter Oli Original Toyota Denso', qty: 1, price: 50000 }
    ],
    status: 'Menunggu Antrean',
    paymentStatus: 'Belum Bayar',
    notes: 'Pelanggan menunggu di ruang tunggu VIP'
  }
];

export const initialInvoices = [
  {
    invoiceNo: 'INV-202611-001',
    spkId: 'SPK-202611-001',
    date: '2026-11-15 10:15',
    customerName: 'Bambang Sudibyo',
    customerPhone: '0812-3456-7890',
    vehiclePlate: 'B 1982 KZA',
    vehicleModel: 'Toyota Avanza 1.3 G M/T',
    odometer: 48500,
    mechanic: 'Agus Pratama',
    items: [
      { type: 'Jasa', name: 'Tune Up Injeksi & Gurah Mesin (Carbon Clean)', qty: 1, price: 250000, total: 250000 },
      { type: 'Jasa', name: 'Jasa Servis Rem 4 Roda & Bleeding', qty: 1, price: 150000, total: 150000 },
      { type: 'Part', name: 'Kampas Rem Depan Bendix GCT', qty: 1, price: 320000, total: 320000 }
    ],
    subtotalServices: 400000,
    subtotalParts: 320000,
    subtotal: 720000,
    discount: 20000,
    tax: 0,
    grandTotal: 700000,
    paymentMethod: 'QRIS',
    amountPaid: 700000,
    change: 0,
    cashier: 'Siti Rahma',
    status: 'Lunas'
  },
  {
    invoiceNo: 'INV-202611-002',
    spkId: 'SPK-202611-002',
    date: '2026-11-15 11:30',
    customerName: 'Dr. Diana Kusuma',
    customerPhone: '0818-8765-4321',
    vehiclePlate: 'B 2341 SIK',
    vehicleModel: 'Honda HR-V 1.5 E CVT',
    odometer: 32000,
    mechanic: 'Hendra Wijaya',
    items: [
      { type: 'Jasa', name: 'Servis AC Berkala & Cuci Evaporator', qty: 1, price: 300000, total: 300000 },
      { type: 'Jasa', name: 'Pengecekan Komprehensif 50 Titik', qty: 1, price: 100000, total: 100000 }
    ],
    subtotalServices: 400000,
    subtotalParts: 0,
    subtotal: 400000,
    discount: 0,
    tax: 0,
    grandTotal: 400000,
    paymentMethod: 'Transfer BCA',
    amountPaid: 400000,
    change: 0,
    cashier: 'Siti Rahma',
    status: 'Lunas'
  }
];

export const revenueTrends = [
  { day: 'Senin', services: 1850000, parts: 2400000, total: 4250000 },
  { day: 'Selasa', services: 2100000, parts: 3100000, total: 5200000 },
  { day: 'Rabu', services: 1650000, parts: 2200000, total: 3850000 },
  { day: 'Kamis', services: 2450000, parts: 3600000, total: 6050000 },
  { day: 'Jumat', services: 2900000, parts: 4100000, total: 7000000 },
  { day: 'Sabtu', services: 4200000, parts: 5900000, total: 10100000 },
  { day: 'Minggu (Hari Ini)', services: 3450000, parts: 4850000, total: 8300000 }
];
