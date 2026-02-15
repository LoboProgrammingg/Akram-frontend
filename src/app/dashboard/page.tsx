"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  AlertTriangle,
  AlertOctagon,
  DollarSign,
  Building2,
  BarChart3,
  Clock,
  Users,
  UserX,
  HelpCircle,
  Bell,
  CheckCircle2,
  XCircle,
  Send,
  TrendingUp,
  ShieldAlert,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

/* =============================================
   COLORS & CONFIG
   ============================================= */
const CLASSE_COLORS: Record<string, string> = {
  "MUITO CRITICO": "#09090b",
  CRITICO: "#ef4444",
  "ATENÇÃO": "#eab308",
  ATENCION: "#eab308",
  ATENCAO: "#eab308",
  OUTROS: "#22c55e",
};

const INACTIVITY_COLORS: Record<string, string> = {
  "Ativo (< 30d)": "#22c55e",
  "Inativo 30-60d": "#eab308",
  "Inativo 60-90d": "#ef4444",
  "Inativo > 90d": "#09090b",
  "Sem Data": "#6b7280",
};

const CHART_COLORS = [
  "#3b82f6", "#8b5cf6", "#06b6d4", "#22c55e",
  "#eab308", "#ef4444", "#ec4899",
];

/* =============================================
   FORMATTERS
   ============================================= */
function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

/* =============================================
   CUSTOM TOOLTIP
   ============================================= */
function CustomTooltip({ active, payload, label, prefix }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-4 py-3 rounded-xl shadow-xl border bg-card text-card-foreground border-border backdrop-blur-xl">
      {label && <p className="text-xs font-medium text-muted-foreground mb-1.5">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-sm font-semibold">
            {prefix === "currency" ? formatCurrency(entry.value) : formatNumber(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* =============================================
   STAT CARD (compact, premium)
   ============================================= */
function StatCard({
  title, value, icon: Icon, gradientFrom, gradientTo, glow, suffix,
}: {
  title: string; value: string | number; icon: any;
  gradientFrom: string; gradientTo: string; glow: string; suffix?: string;
}) {
  return (
    <Card className={`glass-card border-0 ${glow} overflow-hidden relative`}>
      <div
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-[0.08]"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
      />
      <CardContent className="p-4 relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              {title}
            </p>
            <p className="text-xl font-bold mt-1 leading-tight">
              {value}
              {suffix && <span className="text-xs font-normal text-muted-foreground ml-1">{suffix}</span>}
            </p>
          </div>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* =============================================
   SECTION HEADER
   ============================================= */
function SectionHeader({ icon: Icon, title, subtitle, color }: {
  icon: any; title: string; subtitle: string; color: string;
}) {
  return (
    <div className="flex items-center gap-3 pt-4 pb-1">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h2 className="text-lg font-bold leading-tight">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

/* =============================================
   MAIN DASHBOARD PAGE
   ============================================= */
export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.summary().then((r) => r.data),
    refetchInterval: 60000,
  });

  /* Loading skeleton */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-[88px] rounded-2xl bg-muted/30 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-[360px] rounded-2xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <p className="text-muted-foreground">
            Erro ao carregar dados. Verifique se o backend está rodando.
          </p>
        </div>
      </div>
    );
  }

  // Product data
  const pStats = data?.products?.stats || data?.stats;
  const pCharts = data?.products?.charts || data?.charts;
  const classeData = pCharts?.by_classe || [];
  const totalProducts = classeData.reduce((s: number, d: any) => s + d.count, 0);

  // Client data
  const cStats = data?.clients?.stats;
  const cCharts = data?.clients?.charts;
  const inactivityData = cCharts?.inactivity_distribution || [];

  // Notification data
  const notif = data?.notifications;

  return (
    <div className="space-y-5 animate-fade-in-up pb-10">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Akram Monitor
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Painel unificado — Produtos · Clientes · Notificações
          </p>
        </div>
        <div className="flex gap-2 text-[10px] text-muted-foreground">
          <span className="px-2 py-1 rounded-lg bg-muted/30">Atualizado a cada 60s</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 1: TOP STAT CARDS (6 cols)
          ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard
          title="Total Produtos"
          value={formatNumber(pStats?.total_products || 0)}
          icon={Package}
          gradientFrom="#3b82f6" gradientTo="#2563eb" glow="glow-blue"
        />
        <StatCard
          title="⚫ Muito Crítico"
          value={formatNumber(pStats?.total_muito_critico || 0)}
          icon={AlertOctagon}
          gradientFrom="#09090b" gradientTo="#27272a" glow="glow-zinc"
        />
        <StatCard
          title="🔴 Crítico"
          value={formatNumber(pStats?.total_critico || 0)}
          icon={ShieldAlert}
          gradientFrom="#ef4444" gradientTo="#dc2626" glow="glow-red"
        />
        <StatCard
          title="🟡 Atenção"
          value={formatNumber(pStats?.total_atencao || 0)}
          icon={AlertTriangle}
          gradientFrom="#eab308" gradientTo="#ca8a04" glow="glow-yellow"
        />
        <StatCard
          title="💰 Custo MC"
          value={formatCurrency(pStats?.total_custo_muito_critico || 0)}
          icon={DollarSign}
          gradientFrom="#22c55e" gradientTo="#16a34a" glow="glow-green"
        />
        <StatCard
          title="👥 Clientes Total"
          value={formatNumber(cStats?.total_clients || 0)}
          icon={Users}
          gradientFrom="#8b5cf6" gradientTo="#7c3aed" glow="glow-purple"
        />
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 2: PRODUCT CHARTS
          ═══════════════════════════════════════════ */}
      <SectionHeader
        icon={Package}
        title="Produtos"
        subtitle="Classificação de risco e distribuição por filial"
        color="bg-blue-500/10 text-blue-400"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* DONUT — Classification */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Activity className="w-3 h-3 text-amber-400" />
              </div>
              Distribuição por Classe
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <defs>
                  {classeData.map((item: any, i: number) => {
                    const color = CLASSE_COLORS[item.classe] || CHART_COLORS[i % CHART_COLORS.length];
                    return (
                      <linearGradient key={i} id={`donut-grad-${i}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <Pie
                  data={classeData}
                  dataKey="count"
                  nameKey="classe"
                  cx="50%" cy="50%"
                  outerRadius={95} innerRadius={62}
                  paddingAngle={4} cornerRadius={4} strokeWidth={0}
                >
                  {classeData.map((_: any, i: number) => (
                    <Cell key={i} fill={`url(#donut-grad-${i})`} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <text x="50%" y="46%" textAnchor="middle" className="fill-foreground text-2xl font-bold" dy={0}>
                  {formatNumber(totalProducts)}
                </text>
                <text x="50%" y="55%" textAnchor="middle" className="fill-muted-foreground text-[11px]">
                  produtos
                </text>
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2 px-2">
              {classeData.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: CLASSE_COLORS[item.classe] || CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    {item.classe}{" "}
                    <span className="font-semibold text-foreground">{formatNumber(item.count)}</span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* BAR — By Filial */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Building2 className="w-3 h-3 text-blue-400" />
              </div>
              Produtos por Filial
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pCharts?.by_filial || []} barSize={36} barGap={4}>
                <defs>
                  <linearGradient id="bar-fill-filial" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-stroke)" vertical={false} />
                <XAxis
                  dataKey="filial"
                  tick={{ fill: "var(--tick-fill)", fontSize: 11, fontWeight: 500 }}
                  axisLine={{ stroke: "var(--axis-stroke)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--tick-fill)", fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="url(#bar-fill-filial)" radius={[8, 8, 0, 0]} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AREA — Expiry Timeline */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Clock className="w-3 h-3 text-cyan-400" />
              </div>
              Vencimentos — Próximos 30 dias
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={pCharts?.expiry_timeline || []}>
                <defs>
                  <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-stroke)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "var(--tick-fill)", fontSize: 10 }}
                  axisLine={{ stroke: "var(--axis-stroke)" }}
                  tickLine={false}
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                />
                <YAxis
                  tick={{ fill: "var(--tick-fill)", fontSize: 11 }}
                  axisLine={false} tickLine={false} allowDecimals={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  labelFormatter={(v) => new Date(v).toLocaleDateString("pt-BR")}
                />
                <Area
                  type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2.5}
                  fill="url(#area-fill)"
                  dot={{ fill: "#06b6d4", r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: "#06b6d4", r: 5, strokeWidth: 3, stroke: "var(--glass-bg)" }}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* BAR — Cost by Classe */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-3 h-3 text-emerald-400" />
              </div>
              Custo Total por Classe
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={classeData} barSize={48}>
                <defs>
                  {classeData.map((item: any, i: number) => {
                    const color = CLASSE_COLORS[item.classe] || CHART_COLORS[i % CHART_COLORS.length];
                    return (
                      <linearGradient key={i} id={`cost-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.85} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.35} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-stroke)" vertical={false} />
                <XAxis
                  dataKey="classe"
                  tick={{ fill: "var(--tick-fill)", fontSize: 10, fontWeight: 500 }}
                  axisLine={{ stroke: "var(--axis-stroke)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--tick-fill)", fontSize: 10 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`}
                />
                <Tooltip content={<CustomTooltip prefix="currency" />} />
                <Bar dataKey="total_cost" radius={[8, 8, 0, 0]} animationDuration={1200}>
                  {classeData.map((_: any, i: number) => (
                    <Cell key={i} fill={`url(#cost-grad-${i})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 3: CLIENTS
          ═══════════════════════════════════════════ */}
      <SectionHeader
        icon={Users}
        title="Clientes"
        subtitle="Atividade de compra e distribuição geográfica"
        color="bg-purple-500/10 text-purple-400"
      />

      {/* Client Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
        <StatCard
          title="Inativos +30d"
          value={formatNumber(cStats?.inactive_30d || 0)}
          icon={UserX}
          gradientFrom="#eab308" gradientTo="#ca8a04" glow="glow-yellow"
        />
        <StatCard
          title="Inativos +60d"
          value={formatNumber(cStats?.inactive_60d || 0)}
          icon={UserX}
          gradientFrom="#ef4444" gradientTo="#dc2626" glow="glow-red"
        />
        <StatCard
          title="Inativos +90d"
          value={formatNumber(cStats?.inactive_90d || 0)}
          icon={UserX}
          gradientFrom="#09090b" gradientTo="#27272a" glow="glow-zinc"
        />
        <StatCard
          title="Sem Data"
          value={formatNumber(cStats?.sem_data || 0)}
          icon={HelpCircle}
          gradientFrom="#6b7280" gradientTo="#4b5563" glow=""
        />
        <StatCard
          title="Estados"
          value={cStats?.estados?.length || 0}
          icon={TrendingUp}
          gradientFrom="#06b6d4" gradientTo="#0891b2" glow="glow-cyan"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* DONUT — Client Inactivity Distribution */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Activity className="w-3 h-3 text-purple-400" />
              </div>
              Distribuição por Atividade
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <defs>
                  {inactivityData.map((item: any, i: number) => {
                    const color = INACTIVITY_COLORS[item.faixa] || CHART_COLORS[i % CHART_COLORS.length];
                    return (
                      <linearGradient key={i} id={`clt-grad-${i}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <Pie
                  data={inactivityData}
                  dataKey="count"
                  nameKey="faixa"
                  cx="50%" cy="50%"
                  outerRadius={95} innerRadius={62}
                  paddingAngle={4} cornerRadius={4} strokeWidth={0}
                >
                  {inactivityData.map((_: any, i: number) => (
                    <Cell key={i} fill={`url(#clt-grad-${i})`} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <text x="50%" y="46%" textAnchor="middle" className="fill-foreground text-2xl font-bold" dy={0}>
                  {formatNumber(cStats?.total_clients || 0)}
                </text>
                <text x="50%" y="55%" textAnchor="middle" className="fill-muted-foreground text-[11px]">
                  clientes
                </text>
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2 px-2">
              {inactivityData.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: INACTIVITY_COLORS[item.faixa] || CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    {item.faixa}{" "}
                    <span className="font-semibold text-foreground">{formatNumber(item.count)}</span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* BAR — Clients by Estado */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <BarChart3 className="w-3 h-3 text-violet-400" />
              </div>
              Clientes por Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={cCharts?.by_estado || []} barSize={36} barGap={4}>
                <defs>
                  <linearGradient id="bar-fill-estado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-stroke)" vertical={false} />
                <XAxis
                  dataKey="estado"
                  tick={{ fill: "var(--tick-fill)", fontSize: 11, fontWeight: 500 }}
                  axisLine={{ stroke: "var(--axis-stroke)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--tick-fill)", fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="url(#bar-fill-estado)" radius={[8, 8, 0, 0]} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 4: NOTIFICATIONS
          ═══════════════════════════════════════════ */}
      <SectionHeader
        icon={Bell}
        title="Notificações"
        subtitle="Status de envio para vendedores e clientes"
        color="bg-emerald-500/10 text-emerald-400"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="glass-card border-0 overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-[0.06] bg-emerald-500" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Send className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Enviadas Hoje
                </p>
                <p className="text-xl font-bold">{formatNumber(notif?.sent_today || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-[0.06] bg-blue-500" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Enviadas (7 dias)
                </p>
                <p className="text-xl font-bold">{formatNumber(notif?.sent_7d || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-[0.06] bg-red-500" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Falhas (7 dias)
                </p>
                <p className="text-xl font-bold text-red-400">{formatNumber(notif?.failed_7d || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Type breakdown */}
        <Card className="glass-card border-0 overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-[0.06] bg-purple-500" />
          <CardContent className="p-4 relative">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">
              Por Tipo (7d)
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  Empresas
                </span>
                <span className="text-xs font-bold">{formatNumber(notif?.by_type?.vendor?.sent || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  Clientes
                </span>
                <span className="text-xs font-bold">{formatNumber(notif?.by_type?.client?.sent || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== INFORMATION FOOTER ===== */}
      <div className="text-center pt-2 pb-4">
        <p className="text-[10px] text-muted-foreground/50">
          Vendedores e clientes recebem a mesma notificação • 
          ⚫ MUITO CRÍTICO · 🔴 CRÍTICO · 🟡 ATENÇÃO
        </p>
      </div>
    </div>
  );
}
