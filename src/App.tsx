import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Lightbulb,
  TrendingUp,
  ShieldCheck,
  Wallet,

  LogOut,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2,
  Menu
} from 'lucide-react';
import {
  Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// --- Types ---
interface Invoice {
  id: string;
  supplierId: string;
  amount: number;
  dueDate: string;
  predictedDelay: number;
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  // Anomaly Detection features
  paymentDelayDays: number;
  absoluteDelay: number;
  processingTime: number;
  vendorVolume: number;
  netwr: number;
  // Payment Risk Warning features
  avgVendorDelay: number;
  vendorDelayVariance: number;
  vendorIdEncoded: number;
}

interface PaymentResult {
  invoice_id: string;
  suggested_delay_days: number;
  risk_score: number;
  risk_level: string;
}

// --- Data ---
const dataset: Invoice[] = [
  { id: 'INV-102', supplierId: 'V-001', amount: 45000, dueDate: '2026-04-15', predictedDelay: 5, riskScore: 12, riskLevel: 'Low', paymentDelayDays: 2, absoluteDelay: 5, processingTime: 12, vendorVolume: 150, netwr: 45000, avgVendorDelay: 3.2, vendorDelayVariance: 1.1, vendorIdEncoded: 101 },
  { id: 'INV-240', supplierId: 'V-002', amount: 12000, dueDate: '2026-04-16', predictedDelay: 3, riskScore: 45, riskLevel: 'Medium', paymentDelayDays: 1, absoluteDelay: 3, processingTime: 8, vendorVolume: 45, netwr: 12000, avgVendorDelay: 5.8, vendorDelayVariance: 3.4, vendorIdEncoded: 202 },
  { id: 'INV-310', supplierId: 'V-003', amount: 67000, dueDate: '2026-04-18', predictedDelay: 0, riskScore: 88, riskLevel: 'High', paymentDelayDays: 0, absoluteDelay: 0, processingTime: 15, vendorVolume: 500, netwr: 67000, avgVendorDelay: 0.5, vendorDelayVariance: 0.2, vendorIdEncoded: 303 },
  { id: 'INV-442', supplierId: 'V-104', amount: 89000, dueDate: '2026-04-20', predictedDelay: 7, riskScore: 8, riskLevel: 'Low', paymentDelayDays: 4, absoluteDelay: 7, processingTime: 20, vendorVolume: 320, netwr: 89000, avgVendorDelay: 4.1, vendorDelayVariance: 2.0, vendorIdEncoded: 104 },
  { id: 'INV-551', supplierId: 'V-205', amount: 5000, dueDate: '2026-04-22', predictedDelay: 10, riskScore: 15, riskLevel: 'Low', paymentDelayDays: 8, absoluteDelay: 10, processingTime: 5, vendorVolume: 12, netwr: 5000, avgVendorDelay: 9.3, vendorDelayVariance: 4.7, vendorIdEncoded: 205 },
  { id: 'INV-678', supplierId: 'V-009', amount: 154000, dueDate: '2026-04-25', predictedDelay: 2, riskScore: 62, riskLevel: 'Medium', paymentDelayDays: 0, absoluteDelay: 2, processingTime: 18, vendorVolume: 890, netwr: 154000, avgVendorDelay: 1.8, vendorDelayVariance: 0.9, vendorIdEncoded: 9 },
  { id: 'INV-789', supplierId: 'V-312', amount: 23000, dueDate: '2026-04-28', predictedDelay: 0, riskScore: 92, riskLevel: 'High', paymentDelayDays: -2, absoluteDelay: 0, processingTime: 10, vendorVolume: 25, netwr: 23000, avgVendorDelay: 0.3, vendorDelayVariance: 0.1, vendorIdEncoded: 312 }
];

const trendData = [
  { month: 'Jan', delay: 3.2, target: 4.0 },
  { month: 'Feb', delay: 3.8, target: 4.0 },
  { month: 'Mar', delay: 3.5, target: 4.0 },
  { month: 'Apr', delay: 4.2, target: 5.0 },
  { month: 'May', delay: 4.0, target: 5.0 },
  { month: 'Jun', delay: 4.5, target: 5.5 },
];

const riskDistData = [
  { name: 'Low', value: 65, color: '#CCA23E' },
  { name: 'Medium', value: 25, color: '#ffffff' },
  { name: 'High', value: 10, color: '#000000' },
];

// --- Components ---
interface KPICardProps {
  title: string;
  value: string;
  trend?: number;
  icon: React.ElementType;
  color: string;
  gradient: string;
  accentColor: string;
}

const KPICard = ({ title, value, trend, icon: Icon, color, gradient, accentColor }: KPICardProps) => (
  <div
    className="group relative bg-black/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#CCA23E]/20 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden"
  >
    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl opacity-80 group-hover:opacity-100 transition-opacity" style={{ background: gradient }} />
    <div
      className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500 blur-2xl"
      style={{ background: color }}
    />

    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4 sm:mb-5">
        <div
          className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300"
          style={{ background: gradient, boxShadow: `0 8px 24px ${accentColor}30` }}
        >
          <Icon size={18} className="text-white sm:hidden" strokeWidth={2.5} />
          <Icon size={20} className="text-white hidden sm:block" strokeWidth={2.5} />
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[11px] font-black ${
            trend > 0
              ? 'bg-[#CCA23E]/10 text-[#CCA23E] border border-[#CCA23E]/20'
              : 'bg-white/10 text-white border border-white/20'
          }`}>
            {trend > 0 ? <ArrowUpRight size={13} strokeWidth={3} /> : <ArrowDownRight size={13} strokeWidth={3} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-white/50 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">{title}</div>
      <div className="text-lg sm:text-xl font-black tracking-tighter text-white">{value}</div>
    </div>
  </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<{ score: number; flag: number } | null>(null);
  const [selectedPaymentInvoice, setSelectedPaymentInvoice] = useState<Invoice | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  const handleTabChange = (name: string) => {
    setActiveTab(name);
    setSidebarOpen(false);
  };

  const handleRunOptimization = async (invoice: Invoice) => {
    setSelectedPaymentInvoice(invoice);
    setIsOptimizing(true);
    setPaymentResult(null);

    const minDelay = new Promise(resolve => setTimeout(resolve, 2500));

    try {
      const [response] = await Promise.all([
        fetch('https://n8n.sofiatechnology.ai/webhook/anomaly-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Invoice_ID: invoice.id,
            NETWR: invoice.netwr,
            Invoice_Processing_Time: invoice.processingTime,
            Vendor_Invoice_Volume: invoice.vendorVolume,
            Avg_Vendor_Delay: invoice.avgVendorDelay,
            Vendor_Delay_Variance: invoice.vendorDelayVariance,
            Vendor_ID_Encoded: invoice.vendorIdEncoded
          })
        }),
        minDelay
      ]);

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const result = Array.isArray(data) ? data[0] : data;

      setPaymentResult({
        invoice_id: result.invoice_id ?? invoice.id,
        suggested_delay_days: result.suggested_delay_days ?? Math.round(invoice.avgVendorDelay + 1),
        risk_score: result.risk_score ?? parseFloat((invoice.avgVendorDelay / 10).toFixed(2)),
        risk_level: result.risk_level ?? (invoice.avgVendorDelay > 5 ? 'High' : invoice.avgVendorDelay > 2 ? 'Medium' : 'Low')
      });
    } catch (error) {
      console.error('Optimization failed:', error);
      await minDelay;
      const riskScore = parseFloat((invoice.avgVendorDelay / 10).toFixed(2));
      setPaymentResult({
        invoice_id: invoice.id,
        suggested_delay_days: Math.round(invoice.avgVendorDelay + 1),
        risk_score: riskScore,
        risk_level: invoice.avgVendorDelay > 5 ? 'High' : invoice.avgVendorDelay > 2 ? 'Medium' : 'Low'
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDetectAnomaly = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetecting(true);
    setDetectionResult(null);

    const minDelay = new Promise(resolve => setTimeout(resolve, 2500));

    try {
      const [response] = await Promise.all([
        fetch('https://n8n.sofiatechnology.ai/webhook/anomaly-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Invoice_ID: invoice.id,
            Payment_Delay_Days: invoice.paymentDelayDays,
            Absolute_Delay: invoice.absoluteDelay,
            Invoice_Processing_Time: invoice.processingTime,
            Vendor_Invoice_Volume: invoice.vendorVolume,
            NETWR: invoice.netwr
          })
        }),
        minDelay
      ]);

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const result = Array.isArray(data) ? data[0] : data;

      setDetectionResult({
        score: result.anomaly_score ?? parseFloat(((invoice.paymentDelayDays - invoice.absoluteDelay) / 5).toFixed(2)),
        flag: result.anomaly_flag ?? (invoice.paymentDelayDays > 5 ? 1 : 0)
      });
    } catch (error) {
      console.error('Detection failed:', error);
      await minDelay;
      const score = parseFloat(((invoice.paymentDelayDays - invoice.absoluteDelay) / 5).toFixed(2));
      setDetectionResult({
        score: score,
        flag: invoice.paymentDelayDays > 5 ? 1 : 0
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text x={x} y={y} fill="#000000" textAnchor="middle" dominantBaseline="central" className="text-[11px] font-black">
        {value}%
      </text>
    );
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Anomaly Detection', icon: ShieldCheck },
    { name: 'Payment Risk Warning', icon: TrendingUp },
    { name: 'Payment Term Negotiation Intelligence', icon: Lightbulb },
  ];

  return (
    <div className="flex min-h-screen font-['Outfit']">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-56 sm:w-60 sidebar-glass fixed h-full flex flex-col p-4 z-50 transition-all duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="mb-8 sm:mb-10 px-2 flex flex-col items-center">
          <div className="w-full p-3 bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-[#CCA23E]/20">
            <img
              src="/assets/ofi logo (2).png"
              alt="OFI"
              className="w-full h-auto"
            />
          </div>
          <div className="mt-3 sm:mt-4 text-center">
            <h3 className="text-lg sm:text-xl font-black text-[#CCA23E] tracking-tighter">DPO Agents</h3>
          </div>
        </div>

        <nav className="flex-grow space-y-1.5 sm:space-y-2 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleTabChange(item.name)}
              className={`w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-300 text-left text-sm sm:text-base ${
                activeTab === item.name
                  ? 'bg-[#CCA23E] text-black shadow-xl shadow-[#CCA23E]/20 scale-[1.03] sm:scale-105'
                  : 'text-white/50 hover:bg-white/5 hover:text-[#CCA23E]'
              }`}
            >
              <item.icon size={20} strokeWidth={activeTab === item.name ? 2.5 : 2} className="shrink-0" />
              <span className="leading-tight">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 sm:pt-8 border-t border-[#CCA23E]/20">
          <button className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl font-semibold text-white/50 hover:bg-white/5 hover:text-white transition-all duration-300 text-sm sm:text-base">
            <LogOut size={20} className="shrink-0" />
            Admin Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="w-full lg:ml-60 flex-grow p-4 sm:p-5 md:p-6">
        <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6 sm:mb-8 lg:mb-10 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 rounded-xl border border-[#CCA23E]/20 bg-black text-white hover:bg-[#CCA23E]/10 transition-all shadow-lg shrink-0"
            >
              <Menu size={22} />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#CCA23E] tracking-tighter drop-shadow-sm truncate">{activeTab}</h1>
              <p className="text-white/60 font-medium text-xs sm:text-sm lg:text-base hidden sm:block">Financial Performance & Risk Monitoring</p>
            </div>
          </div>
        </header>

        {activeTab === 'Dashboard' && (
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              <KPICard title="Total Invoices" value="12,482" trend={12} icon={FileText} color="#CCA23E" gradient="linear-gradient(135deg, #CCA23E, #000000)" accentColor="#CCA23E" />
              <KPICard title="Avg Delay Days" value="4.2d" trend={-5} icon={TrendingUp} color="#ffffff" gradient="linear-gradient(135deg, #ffffff, #CCA23E)" accentColor="#ffffff" />
              <KPICard title="Risk Factor" value="Low" icon={ShieldCheck} color="#CCA23E" gradient="linear-gradient(135deg, #CCA23E, #000000)" accentColor="#CCA23E" />
              <KPICard title="Optimization Pot." value="$2.4M" icon={Wallet} color="#CCA23E" gradient="linear-gradient(135deg, #000000, #CCA23E)" accentColor="#CCA23E" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
              <div className="xl:col-span-2 bg-black/80 backdrop-blur-lg p-5 sm:p-8 rounded-3xl border border-[#CCA23E]/20 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3">
                  <h3 className="font-bold text-lg sm:text-xl text-[#CCA23E]">Payment Delay Analytics</h3>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white/60"><div className="w-3 h-3 rounded-full bg-[#CCA23E]"></div> Actual Trend</span>
                    <span className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white/60"><div className="w-3 h-3 rounded-full bg-white/30"></div> Benchmark</span>
                  </div>
                </div>
                <div className="h-56 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorDelay" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#CCA23E" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#CCA23E" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#CCA23E', fontSize: 12, fontWeight: 600}} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#ffffff', fontSize: 12, fontWeight: 600}} width={35} />
                      <Tooltip
                        contentStyle={{backgroundColor: '#000000', color: '#ffffff', borderRadius: '16px', border: '1px solid #CCA23E', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'}}
                      />
                      <Area type="monotone" dataKey="delay" stroke="#CCA23E" strokeWidth={3} fillOpacity={1} fill="url(#colorDelay)" />
                      <Line type="monotone" dataKey="target" stroke="#ffffff" strokeDasharray="8 8" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-black/80 backdrop-blur-lg p-5 sm:p-8 rounded-3xl border border-[#CCA23E]/20 shadow-xl">
                <h3 className="font-bold text-lg sm:text-xl text-[#CCA23E] mb-6 sm:mb-8">Vendor Risk Mix</h3>
                <div className="h-56 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistData}
                        innerRadius={0}
                        outerRadius={90}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="#CCA23E"
                        strokeWidth={2}
                        labelLine={false}
                        label={renderCustomizedLabel}
                      >
                        {riskDistData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{backgroundColor: '#000000', color: '#ffffff', borderRadius: '12px', border: '1px solid #CCA23E'}}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                  {riskDistData.map(item => (
                    <div key={item.name} className="flex justify-between items-center text-sm font-bold">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full border border-[#CCA23E]/30" style={{backgroundColor: item.color}}></div>
                        <span className="text-white/70">{item.name} Risk</span>
                      </div>
                      <span className="text-[#CCA23E]">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Agent Mini Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              <div className="bg-black/80 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-[#CCA23E]/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="p-3 sm:p-4 bg-[#CCA23E]/10 text-[#CCA23E] rounded-2xl group-hover:bg-[#CCA23E] group-hover:text-black transition-colors duration-300 shrink-0">
                    <ShieldCheck size={28} className="sm:hidden" />
                    <ShieldCheck size={32} className="hidden sm:block" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base sm:text-lg">Anomaly Detection</h4>
                    <p className="text-white/50 text-xs sm:text-sm font-medium">Monitoring data integrity</p>
                  </div>
                </div>
                <button
                  onClick={() => handleTabChange('Anomaly Detection')}
                  className="px-5 sm:px-6 py-2 bg-[#CCA23E] text-black rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-all shrink-0 w-full sm:w-auto justify-center sm:justify-start"
                >
                  Try Now <ChevronRight size={16} />
                </button>
              </div>

              <div className="bg-black/80 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-[#CCA23E]/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="p-3 sm:p-4 bg-white/10 text-white rounded-2xl group-hover:bg-white group-hover:text-black transition-colors duration-300 shrink-0">
                    <TrendingUp size={28} className="sm:hidden" />
                    <TrendingUp size={32} className="hidden sm:block" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base sm:text-lg">Risk Warning</h4>
                    <p className="text-white/50 text-xs sm:text-sm font-medium">DPO Optimization analysis</p>
                  </div>
                </div>
                <button
                  onClick={() => handleTabChange('Payment Risk Warning')}
                  className="px-5 sm:px-6 py-2 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#CCA23E] transition-all shrink-0 w-full sm:w-auto justify-center sm:justify-start"
                >
                  Try Now <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Table Section */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="font-bold text-xl sm:text-2xl text-[#CCA23E] tracking-tight">Database at a Glance</h3>
              </div>
              <div className="bg-black/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-[#CCA23E]/20">
                <div className="table-responsive-wrapper">
                  <table className="w-full text-left min-w-[900px]">
                    <thead>
                      <tr>
                        <th className="table-header">Invoice ID</th>
                        <th className="table-header">Supplier ID</th>
                        <th className="table-header">Amount (NETWR)</th>
                        <th className="table-header">Due Date</th>
                        <th className="table-header">Delay Days</th>
                        <th className="table-header">Processing Time</th>
                        <th className="table-header">Vendor Volume</th>
                        <th className="table-header">Avg Vendor Delay</th>
                        <th className="table-header">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataset.map((invoice) => (
                        <tr key={invoice.id} className="table-row group">
                          <td className="px-4 sm:px-6 py-3 sm:py-3.5 font-black text-white whitespace-nowrap">{invoice.id}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-3.5 text-white/60 font-medium whitespace-nowrap">{invoice.supplierId}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-3.5 font-bold text-[#CCA23E] whitespace-nowrap">${invoice.netwr.toLocaleString()}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-3.5 text-white/60 font-medium whitespace-nowrap">{invoice.dueDate}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-3.5 text-[#CCA23E] font-black whitespace-nowrap">+{invoice.paymentDelayDays}d</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-3.5 text-white/70 font-semibold whitespace-nowrap">{invoice.processingTime}h</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-3.5 text-white/70 font-semibold whitespace-nowrap">{invoice.vendorVolume} units</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-3.5 text-white/70 font-semibold whitespace-nowrap">{invoice.avgVendorDelay}d</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-3.5">
                            <span className={`px-3 sm:px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                              invoice.riskLevel === 'High' ? 'bg-white text-black' :
                              invoice.riskLevel === 'Medium' ? 'bg-[#CCA23E] text-black' :
                              'bg-[#CCA23E]/20 text-[#CCA23E]'
                            }`}>
                              {invoice.riskLevel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Anomaly Detection' && (
          <div className="space-y-6 sm:space-y-8 lg:space-y-10 py-3 sm:py-5">
            <div className="bg-black/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-[#CCA23E]/20">
              <div className="table-responsive-wrapper">
                <table className="w-full text-left min-w-[750px]">
                  <thead>
                    <tr>
                      <th className="table-header">Invoice ID</th>
                      <th className="table-header">Payment Delay Days</th>
                      <th className="table-header">Absolute Delay</th>
                      <th className="table-header">Processing Time</th>
                      <th className="table-header">Vendor Volume</th>
                      <th className="table-header">NETWR (Amount)</th>
                      <th className="table-header">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.map((invoice) => (
                      <tr key={invoice.id} className="table-row group">
                        <td className="px-4 sm:px-6 py-4 sm:py-5 font-black text-white whitespace-nowrap">{invoice.id}</td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-[#CCA23E] font-bold whitespace-nowrap">+{invoice.paymentDelayDays}d</td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-white/60 font-medium whitespace-nowrap">{invoice.absoluteDelay}d</td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-white/60 font-medium whitespace-nowrap">{invoice.processingTime}h</td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-white/60 font-medium whitespace-nowrap">{invoice.vendorVolume} units</td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5 font-bold text-[#CCA23E] whitespace-nowrap">${invoice.netwr.toLocaleString()}</td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5">
                           <button
                            onClick={() => handleDetectAnomaly(invoice)}
                            disabled={isDetecting}
                            className="px-3 sm:px-4 py-1.5 bg-[#CCA23E] text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                              {isDetecting && selectedInvoice?.id === invoice.id ? (
                                <>Detecting <Loader2 size={12} className="animate-spin" /></>
                              ) : (
                                <>Detect Anomaly <ShieldCheck size={12} /></>
                              )}
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Payment Risk Warning' && (
          <div className="space-y-6 sm:space-y-8 py-3 sm:py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {dataset.map((invoice) => (
                <div key={invoice.id} className="bg-black/80 backdrop-blur-xl p-5 sm:p-7 rounded-3xl border border-[#CCA23E]/20 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4 sm:mb-5">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-[#CCA23E] tracking-tight">{invoice.id}</h3>
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Supplier: {invoice.supplierId}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5">
                    {[
                      { label: 'NETWR', value: `$${invoice.netwr.toLocaleString()}` },
                      { label: 'Processing Time', value: `${invoice.processingTime}h` },
                      { label: 'Vendor Volume', value: `${invoice.vendorVolume}` },
                      { label: 'Avg Vendor Delay', value: `${invoice.avgVendorDelay}d` },
                      { label: 'Delay Variance', value: `${invoice.vendorDelayVariance}` },
                      { label: 'Vendor ID Encoded', value: `${invoice.vendorIdEncoded}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white/5 p-2.5 sm:p-3 rounded-xl border border-[#CCA23E]/10">
                        <div className="text-[9px] font-bold text-white/50 uppercase tracking-wider">{label}</div>
                        <div className="text-xs sm:text-sm font-black text-white">{value}</div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleRunOptimization(invoice)}
                    disabled={isOptimizing}
                    className="w-full py-2.5 sm:py-3 bg-[#CCA23E] text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-white hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isOptimizing && selectedPaymentInvoice?.id === invoice.id ? (
                      <>Optimizing <Loader2 size={14} className="animate-spin" /></>
                    ) : (
                      <>Run Optimization <TrendingUp size={14} /></>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Term Negotiation Intelligence */}
        {activeTab === 'Payment Term Negotiation Intelligence' && (
          <div className="bg-black/60 backdrop-blur-xl p-16 sm:p-24 lg:p-32 rounded-3xl border border-dashed border-[#CCA23E]/30 flex flex-col items-center justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#CCA23E]/10 border border-[#CCA23E]/30 rounded-3xl flex items-center justify-center text-[#CCA23E] mb-6 sm:mb-8">
               <Lightbulb size={40} className="sm:hidden" />
               <Lightbulb size={48} className="hidden sm:block" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-center text-[#CCA23E]">Payment Term Negotiation Intelligence</h2>
            <p className="mt-3 sm:mt-4 text-center max-w-sm font-medium text-white/60 text-base sm:text-lg italic">Advanced negotiation insights coming soon...</p>
          </div>
        )}
        </div>
      </main>

      <DetectionModal
        invoice={selectedInvoice}
        result={detectionResult}
        isDetecting={isDetecting}
        onClose={() => {
          setSelectedInvoice(null);
          setDetectionResult(null);
        }}
      />

      <PaymentDelayModal
        invoice={selectedPaymentInvoice}
        result={paymentResult}
        isOptimizing={isOptimizing}
        onClose={() => {
          setSelectedPaymentInvoice(null);
          setPaymentResult(null);
        }}
      />
    </div>
  );
};

// --- Detection Modal ---
const DetectionModal = ({ invoice, result, isDetecting, onClose }: {
  invoice: Invoice | null;
  result: { score: number; flag: number } | null;
  isDetecting: boolean;
  onClose: () => void;
}) => {
  if (!invoice && !isDetecting) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-black rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-[#CCA23E]/30 overflow-hidden max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-5 sm:p-8 pb-3 sm:pb-4 flex justify-between items-start border-b border-[#CCA23E]/10">
          <div className="min-w-0 pr-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#CCA23E] tracking-tighter">Anomaly Detection Report</h2>
            <p className="text-white/50 font-bold uppercase text-[10px] tracking-widest mt-1">Audit Log #{invoice?.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 shrink-0">
            <X size={22} />
          </button>
        </div>

        <div className="p-5 sm:p-8 pt-3 sm:pt-4 space-y-6 sm:space-y-8">
          {isDetecting ? (
            <div className="py-8 sm:py-12 flex flex-col items-center justify-center space-y-4 sm:space-y-5">
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-[#CCA23E]/20 border-t-[#CCA23E] rounded-full animate-spin"></div>
                <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#CCA23E]" size={22} />
              </div>
              <p className="font-black text-white uppercase tracking-widest text-[10px] sm:text-xs animate-pulse text-center">Connecting to n8n engine...</p>
              <p className="text-white/50 text-[10px] font-bold tracking-wide text-center">Running anomaly detection model on invoice data</p>
            </div>
          ) : result && (
            <>
              {/* Score Card */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border ${result.flag === 1 ? 'bg-white/5 border-white/20' : 'bg-[#CCA23E]/10 border-[#CCA23E]/20'}`}>
                  <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/50 mb-1.5 sm:mb-2">Anomaly Score</div>
                  <div className={`text-3xl sm:text-4xl font-black tracking-tighter ${result.flag === 1 ? 'text-white' : 'text-[#CCA23E]'}`}>
                    {result.score}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-white/40 mt-1.5 sm:mt-2">
                    <span className="block italic">Higher score → normal behaviour</span>
                    <span className="block italic">Lower score → more anomalous</span>
                  </div>
                </div>

                <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border ${result.flag === 1 ? 'bg-white text-black border-white/20' : 'bg-[#CCA23E] text-black border-[#CCA23E]/20'}`}>
                  <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-60 mb-1.5 sm:mb-2">Anomaly Flag</div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tighter">
                    {result.flag === 1 ? '1' : '0'}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold mt-1.5 sm:mt-2 uppercase tracking-tight opacity-60">
                    <span className="block italic">Value 0: Normal transaction</span>
                    <span className="block italic">Value 1: Anomalous payment</span>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className={`flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl ${result.flag === 1 ? 'bg-white/5 text-white' : 'bg-[#CCA23E]/10 text-[#CCA23E]'}`}>
                {result.flag === 1 ? (
                  <AlertCircle className="shrink-0 mt-0.5" size={18} />
                ) : (
                  <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
                )}
                <div className="text-xs sm:text-sm font-medium leading-relaxed">
                  {result.flag === 1
                    ? `This transaction shows a low anomaly score of ${result.score}, indicating behavior that deviates significantly from historical vendor patterns. Immediate review is advised.`
                    : `Transaction behavior is consistent with verified historical patterns for this vendor. No immediate risks identified.`
                  }
                </div>
              </div>

              {/* Data Summary */}
              <div>
                <h4 className="text-[10px] font-black text-[#CCA23E] uppercase tracking-widest mb-3 sm:mb-4">Invoice Data Fingerprint</h4>
                <div className="grid grid-cols-3 gap-y-4 sm:gap-y-6">
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-white/50 uppercase tracking-tight">Amount</div>
                    <div className="text-xs sm:text-sm font-black text-white">${invoice?.netwr.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-white/50 uppercase tracking-tight">Processing</div>
                    <div className="text-xs sm:text-sm font-black text-white">{invoice?.processingTime} hrs</div>
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-white/50 uppercase tracking-tight">Delay</div>
                    <div className="text-xs sm:text-sm font-black text-white">
                      {invoice?.paymentDelayDays} days
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 sm:py-4 bg-[#CCA23E] text-black rounded-2xl font-black uppercase text-[10px] sm:text-[11px] tracking-widest shadow-xl hover:bg-white hover:scale-[1.02] active:scale-95 transition-all mt-3 sm:mt-4"
              >
                Clear Audit Log
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Payment Delay Modal ---
const PaymentDelayModal = ({ invoice, result, isOptimizing, onClose }: {
  invoice: Invoice | null;
  result: PaymentResult | null;
  isOptimizing: boolean;
  onClose: () => void;
}) => {
  if (!invoice && !isOptimizing) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return { bg: 'bg-white/5', border: 'border-white/20', text: 'text-white', badge: 'bg-white', badgeText: 'text-black' };
      case 'Medium': return { bg: 'bg-[#CCA23E]/10', border: 'border-[#CCA23E]/30', text: 'text-[#CCA23E]', badge: 'bg-[#CCA23E]', badgeText: 'text-black' };
      default: return { bg: 'bg-[#CCA23E]/5', border: 'border-[#CCA23E]/20', text: 'text-[#CCA23E]', badge: 'bg-[#CCA23E]', badgeText: 'text-black' };
    }
  };

  const riskColors = result ? getRiskColor(result.risk_level) : getRiskColor('Low');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-black rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-[#CCA23E]/30 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 sm:p-8 pb-3 sm:pb-4 flex justify-between items-start border-b border-[#CCA23E]/10">
          <div className="min-w-0 pr-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#CCA23E] tracking-tighter">Payment Optimization Report</h2>
            <p className="text-white/50 font-bold uppercase text-[10px] tracking-widest mt-1">Invoice #{invoice?.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 shrink-0">
            <X size={22} />
          </button>
        </div>

        <div className="p-5 sm:p-8 pt-3 sm:pt-4 space-y-6 sm:space-y-8">
          {isOptimizing ? (
            <div className="py-8 sm:py-12 flex flex-col items-center justify-center space-y-4 sm:space-y-5">
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-[#CCA23E]/20 border-t-[#CCA23E] rounded-full animate-spin"></div>
                <TrendingUp className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#CCA23E]" size={22} />
              </div>
              <p className="font-black text-white uppercase tracking-widest text-[10px] sm:text-xs animate-pulse text-center">Connecting to n8n engine...</p>
              <p className="text-white/50 text-[10px] font-bold tracking-wide text-center">Running payment delay optimization model</p>
            </div>
          ) : result && (
            <>
              {/* Result Cards */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#CCA23E] text-black border border-[#CCA23E]/20">
                  <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-70 mb-1.5 sm:mb-2">Suggested Delay</div>
                  <div className="text-2xl sm:text-4xl font-black tracking-tighter">{result.suggested_delay_days}</div>
                  <div className="text-[9px] sm:text-[10px] font-bold mt-1 opacity-70">Days</div>
                </div>

                <div className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border ${riskColors.bg} ${riskColors.border}`}>
                  <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/50 mb-1.5 sm:mb-2">Risk Score</div>
                  <div className={`text-2xl sm:text-4xl font-black tracking-tighter ${riskColors.text}`}>{result.risk_score}</div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-white/40 mt-1">0 to 1.0</div>
                </div>

                <div className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl ${riskColors.badge} ${riskColors.badgeText} border border-[#CCA23E]/20`}>
                  <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-70 mb-1.5 sm:mb-2">Risk Level</div>
                  <div className="text-lg sm:text-2xl font-black tracking-tighter">{result.risk_level}</div>
                  <div className="text-[9px] sm:text-[10px] font-bold mt-1 opacity-70">Assessment</div>
                </div>
              </div>

              {/* Interpretation */}
              <div className={`flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl ${
                result.risk_level === 'High' ? 'bg-white/5 text-white' :
                result.risk_level === 'Medium' ? 'bg-[#CCA23E]/10 text-[#CCA23E]' :
                'bg-[#CCA23E]/5 text-[#CCA23E]'
              }`}>
                {result.risk_level === 'High' ? (
                  <AlertCircle className="shrink-0 mt-0.5" size={18} />
                ) : (
                  <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
                )}
                <div className="text-xs sm:text-sm font-medium leading-relaxed">
                  {result.risk_level === 'High'
                    ? `High risk detected for ${result.invoice_id}. Delaying payment beyond ${result.suggested_delay_days} days may escalate vendor relations. Immediate processing recommended.`
                    : result.risk_level === 'Medium'
                    ? `Moderate risk for ${result.invoice_id}. Payment can be safely delayed up to ${result.suggested_delay_days} days. Monitor vendor communication closely.`
                    : `Low risk for ${result.invoice_id}. Payment can be safely delayed up to ${result.suggested_delay_days} days without impacting vendor relations.`
                  }
                </div>
              </div>

              {/* Invoice Summary */}
              <div>
                <h4 className="text-[10px] font-black text-[#CCA23E] uppercase tracking-widest mb-3 sm:mb-4">Invoice Summary</h4>
                <div className="grid grid-cols-3 gap-y-4 sm:gap-y-5">
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-white/50 uppercase tracking-tight">Amount</div>
                    <div className="text-xs sm:text-sm font-black text-white">${invoice?.netwr.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-white/50 uppercase tracking-tight">Supplier</div>
                    <div className="text-xs sm:text-sm font-black text-white">{invoice?.supplierId}</div>
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-white/50 uppercase tracking-tight">Avg Delay</div>
                    <div className="text-xs sm:text-sm font-black text-white">{invoice?.avgVendorDelay}d</div>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 sm:py-4 bg-[#CCA23E] text-black rounded-2xl font-black uppercase text-[10px] sm:text-[11px] tracking-widest shadow-xl hover:bg-white hover:scale-[1.02] active:scale-95 transition-all mt-3 sm:mt-4"
              >
                Close Report
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
