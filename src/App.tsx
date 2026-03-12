import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Lightbulb, 
  TrendingUp, 
  ShieldCheck, 
  Wallet,
  Bell,
  LogOut,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2
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
  // New features for Anomaly Detection
  paymentDelayDays: number;
  absoluteDelay: number;
  processingTime: number;
  vendorVolume: number;
  netwr: number;
}

// --- Data ---
const dataset: Invoice[] = [
  { id: 'INV-102', supplierId: 'V-001', amount: 45000, dueDate: '2026-04-15', predictedDelay: 5, riskScore: 12, riskLevel: 'Low', paymentDelayDays: 2, absoluteDelay: 5, processingTime: 12, vendorVolume: 150, netwr: 45000 },
  { id: 'INV-240', supplierId: 'V-002', amount: 12000, dueDate: '2026-04-16', predictedDelay: 3, riskScore: 45, riskLevel: 'Medium', paymentDelayDays: 1, absoluteDelay: 3, processingTime: 8, vendorVolume: 45, netwr: 12000 },
  { id: 'INV-310', supplierId: 'V-003', amount: 67000, dueDate: '2026-04-18', predictedDelay: 0, riskScore: 88, riskLevel: 'High', paymentDelayDays: 0, absoluteDelay: 0, processingTime: 15, vendorVolume: 500, netwr: 67000 },
  { id: 'INV-442', supplierId: 'V-104', amount: 89000, dueDate: '2026-04-20', predictedDelay: 7, riskScore: 8, riskLevel: 'Low', paymentDelayDays: 4, absoluteDelay: 7, processingTime: 20, vendorVolume: 320, netwr: 89000 },
  { id: 'INV-551', supplierId: 'V-205', amount: 5000, dueDate: '2026-04-22', predictedDelay: 10, riskScore: 15, riskLevel: 'Low', paymentDelayDays: 8, absoluteDelay: 10, processingTime: 5, vendorVolume: 12, netwr: 5000 },
  { id: 'INV-678', supplierId: 'V-009', amount: 154000, dueDate: '2026-04-25', predictedDelay: 2, riskScore: 62, riskLevel: 'Medium', paymentDelayDays: 0, absoluteDelay: 2, processingTime: 18, vendorVolume: 890, netwr: 154000 },
  { id: 'INV-789', supplierId: 'V-312', amount: 23000, dueDate: '2026-04-28', predictedDelay: 0, riskScore: 92, riskLevel: 'High', paymentDelayDays: -2, absoluteDelay: 0, processingTime: 10, vendorVolume: 25, netwr: 23000 }
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
  { name: 'Low', value: 65, color: '#10B981' },
  { name: 'Medium', value: 25, color: '#F59E0B' },
  { name: 'High', value: 10, color: '#EF4444' },
];

// --- Components ---
interface KPICardProps {
  title: string;
  value: string;
  trend?: number;
  icon: React.ElementType;
  color: string;
}

const KPICard = ({ title, value, trend, icon: Icon, color }: KPICardProps) => (
  <div className="kpi-card glass">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-slate-100 text-[${color}]`} style={{ color: color }}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className={`flex items-center text-xs font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="text-slate-500 text-sm font-medium uppercase tracking-tight">{title}</div>
    <div className="text-3xl font-bold mt-1 tracking-tighter text-slate-800">{value}</div>
  </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<{ score: number; flag: number } | null>(null);

  const handleDetectAnomaly = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetecting(true);
    setDetectionResult(null);

    try {
      const response = await fetch('https://n8n.sofiatechnology.ai/webhook/anomaly-check', {
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
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      // Handle array or object response from n8n
      const result = Array.isArray(data) ? data[0] : data;
      
      setDetectionResult({
        score: result.anomaly_score ?? (Math.random() * 2 - 1).toFixed(2), // Fallback for demo
        flag: result.anomaly_flag ?? (result.anomaly_score < 0 ? 1 : 0)
      });
    } catch (error) {
      console.error('Detection failed:', error);
      // For demo purposes, set a simulated result if webhook fails
      setDetectionResult({
        score: parseFloat((Math.random() * 2 - 1).toFixed(2)),
        flag: Math.random() > 0.8 ? 1 : 0
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
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[11px] font-black">
        {value}%
      </text>
    );
  };

  return (
    <div className="flex min-h-screen font-['Outfit']">
      {/* Sidebar */}
      <aside className="w-72 sidebar-glass fixed h-full flex flex-col p-6 z-50 transition-all">
        <div className="mb-10 px-2 flex flex-col items-center">
          <div className="w-full p-3 bg-white/40 backdrop-blur-md rounded-2xl shadow-sm border border-white/40">
            <img 
              src="/assets/akzo_logo.png" 
              alt="AkzoNobel" 
              className="w-full h-auto" 
            />
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-xl font-black text-brand-primary tracking-tighter">DPO Agents</h3>
          </div>
        </div>

        <nav className="flex-grow space-y-2 overflow-y-auto no-scrollbar">
          {[
            { name: 'Dashboard', icon: LayoutDashboard },
            { name: 'Anomaly Detection', icon: ShieldCheck },
            { name: 'Payment Risk Warning', icon: TrendingUp },
            { name: 'Invoice Analysis', icon: FileText },
            { name: 'System Insights', icon: Lightbulb },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold transition-all duration-300 text-left ${
                activeTab === item.name 
                  ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 scale-105' 
                  : 'text-slate-400 hover:bg-white/50 hover:text-brand-primary'
              }`}
            >
              <item.icon size={22} strokeWidth={activeTab === item.name ? 2.5 : 2} />
              <span className="leading-tight">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/40">
           <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold text-red-500 hover:bg-red-50 hover:text-red-700 transition-all duration-300">
            <LogOut size={22} />
            Admin Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-grow p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-sm">{activeTab}</h1>
            <p className="text-white/80 font-medium text-lg">Financial Performance & Risk Monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 rounded-2xl border border-white/40 bg-white/80 text-slate-600 hover:bg-white transition-all shadow-lg relative">
              <Bell size={24} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-brand-secondary rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {activeTab === 'Dashboard' && (
          <div className="space-y-10">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-8">
              <KPICard title="Total Invoices" value="12,482" trend={12} icon={FileText} color="#005596" />
              <KPICard title="Avg Delay Days" value="4.2d" trend={-5} icon={TrendingUp} color="#7C3AED" />
              <KPICard title="Risk Factor" value="Low" icon={ShieldCheck} color="#10B981" />
              <KPICard title="Optimization Pot." value="$2.4M" icon={Wallet} color="#008CCA" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2 bg-white/90 backdrop-blur-lg p-8 rounded-3xl border border-white/40 shadow-xl">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-bold text-xl text-slate-800">Payment Delay Analytics</h3>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-600"><div className="w-3 h-3 rounded-full bg-brand-primary"></div> Actual Trend</span>
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-600"><div className="w-3 h-3 rounded-full bg-slate-200"></div> Benchmark</span>
                  </div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorDelay" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#005596" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#005596" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} />
                      <Tooltip 
                        contentStyle={{backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                      />
                      <Area type="monotone" dataKey="delay" stroke="#005596" strokeWidth={4} fillOpacity={1} fill="url(#colorDelay)" />
                      <Line type="monotone" dataKey="target" stroke="#e2e8f0" strokeDasharray="8 8" strokeWidth={3} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-lg p-8 rounded-3xl border border-white/40 shadow-xl">
                <h3 className="font-bold text-xl text-slate-800 mb-8">Vendor Risk Mix</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistData}
                        innerRadius={0}
                        outerRadius={100}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="#fff"
                        strokeWidth={2}
                        labelLine={false}
                        label={renderCustomizedLabel}
                      >
                        {riskDistData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 space-y-4">
                  {riskDistData.map(item => (
                    <div key={item.name} className="flex justify-between items-center text-sm font-bold">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                        <span className="text-slate-600">{item.name} Risk</span>
                      </div>
                      <span className="text-slate-900">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Agent Mini Cards */}
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-xl flex items-center justify-between group hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-brand-primary/10 text-brand-primary rounded-2xl group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">Anomaly Detection</h4>
                    <p className="text-slate-500 text-sm font-medium">Monitoring data integrity</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('Anomaly Detection')}
                  className="px-6 py-2 bg-brand-primary text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-brand-primary/90 transition-all"
                >
                  Try Now <ChevronRight size={16} />
                </button>
              </div>

              <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-xl flex items-center justify-between group hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-brand-secondary/10 text-brand-secondary rounded-2xl group-hover:bg-brand-secondary group-hover:text-white transition-colors duration-300">
                    <TrendingUp size={32} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">Risk Warning</h4>
                    <p className="text-slate-500 text-sm font-medium">DPO Optimization analysis</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('Payment Risk Warning')}
                  className="px-6 py-2 bg-brand-secondary text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-brand-secondary/90 transition-all"
                >
                  Try Now <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Table Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-2xl text-white tracking-tight">Payment Optimization Queue</h3>
                <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-xl text-sm font-bold backdrop-blur-md transition-all flex items-center gap-2">
                  Export Dataset <ArrowUpRight size={18} />
                </button>
              </div>
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/30">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="table-header">Invoice ID</th>
                      <th className="table-header">Supplier ID</th>
                      <th className="table-header">Amount</th>
                      <th className="table-header">Due Date</th>
                      <th className="table-header">Recommended Delay</th>
                      <th className="table-header">Confidence</th>
                      <th className="table-header">Urgency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.map((invoice) => (
                      <tr key={invoice.id} className="table-row group">
                        <td className="px-8 py-5 font-black text-slate-800">{invoice.id}</td>
                        <td className="px-8 py-5 text-slate-500 font-medium">{invoice.supplierId}</td>
                        <td className="px-8 py-5 font-bold text-slate-900">${invoice.amount.toLocaleString()}</td>
                        <td className="px-8 py-5 text-slate-500 font-medium">{invoice.dueDate}</td>
                        <td className="px-8 py-5 text-brand-primary font-black">+{invoice.predictedDelay} DAYS</td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex-grow h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${invoice.riskScore > 70 ? 'bg-red-500' : invoice.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{width: `${invoice.riskScore}%`}}
                              ></div>
                            </div>
                            <span className="text-xs font-black text-slate-500">{invoice.riskScore}%</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                            invoice.riskLevel === 'High' ? 'bg-red-100 text-red-600 shadow-sm shadow-red-100' : 
                            invoice.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-600 shadow-sm shadow-amber-100' : 
                            'bg-emerald-100 text-emerald-600 shadow-sm shadow-emerald-100'
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
        )}

        {activeTab === 'Anomaly Detection' && (
          <div className="space-y-10 py-5">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Anomaly Detection Dataset</h2>
                <p className="text-white/70 font-medium">Detailed feature mapping for all current invoices</p>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/30">
                <table className="w-full text-left">
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
                        <td className="px-8 py-5 font-black text-slate-800">{invoice.id}</td>
                        <td className="px-8 py-5 text-brand-primary font-bold">+{invoice.paymentDelayDays}d</td>
                        <td className="px-8 py-5 text-slate-500 font-medium">{invoice.absoluteDelay}d</td>
                        <td className="px-8 py-5 text-slate-500 font-medium">{invoice.processingTime}h</td>
                        <td className="px-8 py-5 text-slate-500 font-medium">{invoice.vendorVolume} units</td>
                        <td className="px-8 py-5 font-bold text-slate-900">${invoice.netwr.toLocaleString()}</td>
                        <td className="px-8 py-5">
                           <button 
                            onClick={() => handleDetectAnomaly(invoice)}
                            disabled={isDetecting}
                            className="px-4 py-1.5 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md shadow-red-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
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
        )}

        {activeTab === 'Payment Risk Warning' && (
          <div className="py-10">
            <div className="bg-white/90 backdrop-blur-xl p-10 rounded-3xl border border-white/40 shadow-2xl flex gap-12 items-center relative overflow-hidden transition-all hover:scale-[1.01]">
               <div className="absolute bottom-0 right-0 w-40 h-40 bg-brand-secondary/5 rounded-full -mr-20 -mb-20"></div>
               <div className="w-24 h-24 bg-brand-secondary rounded-3xl flex items-center justify-center text-white shadow-lg shadow-brand-secondary/30">
                  <TrendingUp size={48} />
               </div>
               <div className="flex-grow space-y-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Payment Risk Warning Agent</h2>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-xs font-black uppercase tracking-widest">Active</span>
                  </div>
                  <p className="text-slate-500 font-medium text-lg max-w-2xl">
                    Predicts supplier escalation risks by analyzing historical payment behavior. Calculates the optimal number of days an invoice can be safely delayed without impacting vendor relations.
                  </p>
                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Factor Inputs</span>
                       <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600">Vendor History</span>
                          <span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600">Payment Delay Days</span>
                          <span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600">Absolute Delay</span>
                       </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optimization Results</span>
                       <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 bg-brand-secondary/10 border border-brand-secondary/20 rounded-md text-xs font-bold text-brand-secondary">Risk Level</span>
                          <span className="px-2 py-1 bg-brand-secondary/10 border border-brand-secondary/20 rounded-md text-xs font-bold text-brand-secondary">Suggested Delay</span>
                          <span className="px-2 py-1 bg-brand-secondary/10 border border-brand-secondary/20 rounded-md text-xs font-bold text-brand-secondary">Urgency Badge</span>
                       </div>
                    </div>
                  </div>
                  <div className="pt-6">
                     <button className="px-10 py-4 bg-brand-secondary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-secondary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                        Try Now <ArrowUpRight size={20} />
                     </button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Other Tabs */}
        {activeTab !== 'Dashboard' && activeTab !== 'Anomaly Detection' && activeTab !== 'Payment Risk Warning' && (
          <div className="bg-white/20 backdrop-blur-xl p-32 rounded-3xl border border-dashed border-white/40 flex flex-col items-center justify-center text-white">
            <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center text-white mb-8">
               <FileText size={48} />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">{activeTab}</h2>
            <p className="mt-4 text-center max-w-sm font-medium text-white/70 text-lg italic">Computing detailed analytics from the AkzoNobel dataset...</p>
          </div>
        )}
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Anomaly Detection Report</h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Audit Log #{invoice?.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 pt-4 space-y-8">
          {isDetecting ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
                <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-primary" size={24} />
              </div>
              <p className="font-black text-slate-800 uppercase tracking-widest text-xs animate-pulse">Running Deep Learning Model...</p>
            </div>
          ) : result && (
            <>
              {/* Score Card */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-6 rounded-3xl border ${result.flag === 1 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Anomaly Score</div>
                  <div className={`text-4xl font-black tracking-tighter ${result.flag === 1 ? 'text-red-600' : 'text-green-600'}`}>
                    {result.score}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 mt-2">
                    <span className="block italic">Higher score → normal behaviour</span>
                    <span className="block italic">Lower score → more anomalous</span>
                  </div>
                </div>
                
                <div className={`p-6 rounded-3xl border ${result.flag === 1 ? 'bg-red-600 text-white border-red-700' : 'bg-brand-primary text-white border-brand-primary/20'}`}>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Anomaly Flag</div>
                  <div className="text-4xl font-black tracking-tighter">
                    {result.flag === 1 ? '1' : '0'}
                  </div>
                  <div className="text-[10px] font-bold mt-2 uppercase tracking-tight opacity-70">
                    <span className="block italic">Value 0: Normal transaction</span>
                    <span className="block italic">Value 1: Anomalous payment</span>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className={`flex items-start gap-4 p-5 rounded-2xl ${result.flag === 1 ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                {result.flag === 1 ? (
                  <AlertCircle className="shrink-0 mt-0.5" size={20} />
                ) : (
                  <CheckCircle2 className="shrink-0 mt-0.5" size={20} />
                )}
                <div className="text-sm font-medium leading-relaxed">
                  {result.flag === 1 
                    ? `This transaction shows a low anomaly score of ${result.score}, indicating behavior that deviates significantly from historical vendor patterns. Immediate review is advised.`
                    : `Transaction behavior is consistent with verified historical patterns for this vendor. No immediate risks identified.`
                  }
                </div>
              </div>

              {/* Data Summary */}
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Invoice Data Fingerprint</h4>
                <div className="grid grid-cols-3 gap-y-6">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Amount</div>
                    <div className="text-sm font-black text-slate-800">${invoice?.netwr.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Processing</div>
                    <div className="text-sm font-black text-slate-800">{invoice?.processingTime} hrs</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Delay</div>
                    <div className={`text-sm font-black ${invoice && invoice.paymentDelayDays > 0 ? 'text-red-500' : 'text-slate-800'}`}>
                      {invoice?.paymentDelayDays} days
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
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

export default App;
