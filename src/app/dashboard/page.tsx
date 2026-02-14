"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  AlertTriangle,
  AlertOctagon,
  DollarSign,
  TrendingUp,
  Clock,
  BarChart3,
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* =============================================
   CHART COLOR SCHEME
   ============================================= */
const CLASSE_COLORS: Record<string, string> = {
  "MUITO CRÍTICO": "#09090b", // Preto (Zinc-950) para destaque máximo
  "CRITICO": "#ef4444",       // Vermelho
  "ATENÇÃO": "#eab308",       // Amarelo
  "VENCIDO": "#6b7280",       // Cinza
};

const CHART_COLORS = ["#09090b", "#ef4444", "#eab308", "#22c55e", "#a855f7", "#ec4899", "#06b6d4"];

const GRADIENT_IDS = ["grad-red", "grad-amber", "grad-blue", "grad-green", "grad-purple", "grad-pink", "grad-cyan"];

/* =============================================
   FORMATTERS
   ============================================= */
function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
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
          {entry.name && entry.name !== "count" && entry.name !== "total_cost" && (
            <span className="text-xs text-muted-foreground">{entry.name}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* =============================================
   STAT CARD
   ============================================= */
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  gradientFrom,
  gradientTo,
  glow,
  suffix,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  glow: string;
  suffix?: string;
}) {
  return (
    <Card className={`glass-card border-0 ${glow} overflow-hidden relative`}>
      {/* Background decoration */}
      <div
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-[0.08]"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
      />
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              {title}
            </p>
            <p className="text-[26px] font-bold mt-1.5 animate-count-up leading-tight">
              {value}
              {suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
            </p>
          </div>
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg`}
            style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* =============================================
   DONUT CENTER LABEL
   ============================================= */
function DonutCenterLabel({ viewBox, total }: any) {
  const { cx, cy } = viewBox;
  return (
    <g>
      <text x={cx} y={cy - 6} textAnchor="middle" className="fill-foreground text-2xl font-bold">
        {formatNumber(total)}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="fill-muted-foreground text-[11px]">
        produtos
      </text>
    </g>
  );
}

/* =============================================
   CUSTOM LEGEND
   ============================================= */
function ChartLegend({ data }: { data: any[] }) {
  const total = data.reduce((sum: number, d: any) => sum + d.count, 0);
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3 px-2">
      {data.map((item: any, i: number) => {
        const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
        return (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: CLASSE_COLORS[item.classe] || CHART_COLORS[i % CHART_COLORS.length] }}
            />
            <span className="text-[11px] text-muted-foreground">
              {item.classe}{" "}
              <span className="font-semibold text-foreground">{pct}%</span>
            </span>
          </div>
        );
      })}
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-[110px] rounded-2xl bg-muted/30 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-[380px] rounded-2xl bg-muted/30 animate-pulse" />
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

  const stats = data?.stats;
  const charts = data?.charts;
  const classeData = charts?.by_classe || [];
  const totalProducts = classeData.reduce((s: number, d: any) => s + d.count, 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral do monitoramento de validade
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Produtos"
          value={formatNumber(stats?.total_products || 0)}
          icon={Package}
          color="blue"
          gradientFrom="#3b82f6"
          gradientTo="#2563eb"
          glow="glow-blue"
        />
        <StatCard
          title="Muito Crítico"
          value={formatNumber(stats?.total_muito_critico || 0)}
          icon={AlertOctagon}
          color="zinc"
          gradientFrom="#09090b"
          gradientTo="#27272a"
          glow="glow-zinc"
        />
        <StatCard
          title="Crítico"
          value={formatNumber(stats?.total_critico || 0)}
          icon={AlertTriangle}
          color="red"
          gradientFrom="#ef4444"
          gradientTo="#dc2626"
          glow="glow-red"
        />
        <StatCard
          title="Atenção"
          value={formatNumber(stats?.total_atencao || 0)} // Assuming there is a total_atencao field, or reusing critico field if logic differs, but here aligning with visual update
          icon={AlertTriangle}
          color="yellow"
          gradientFrom="#eab308"
          gradientTo="#ca8a04"
          glow="glow-yellow"
        />
        <StatCard
          title="Custo Muito Crítico"
          value={formatCurrency(stats?.total_custo_muito_critico || 0)}
          icon={DollarSign}
          color="green"
          gradientFrom="#22c55e"
          gradientTo="#16a34a"
          glow="glow-green"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ===== DONUT CHART — Distribution by Classe ===== */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <PieIcon className="w-3.5 h-3.5 text-amber-400" />
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
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={62}
                  paddingAngle={4}
                  cornerRadius={4}
                  strokeWidth={0}
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
            <ChartLegend data={classeData} />
          </CardContent>
        </Card>

        {/* ===== BAR CHART — Products by Filial ===== */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
              </div>
              Produtos por Filial
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts?.by_filial || []} barSize={36} barGap={4}>
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
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill="url(#bar-fill-filial)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ===== AREA CHART — Expiry Timeline ===== */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              Vencimentos por Dia
            </CardTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">Próximos 30 dias</p>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={charts?.expiry_timeline || []}>
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
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  labelFormatter={(v) => {
                    const d = new Date(v);
                    return d.toLocaleDateString("pt-BR");
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fill="url(#area-fill)"
                  dot={{ fill: "#06b6d4", r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: "#06b6d4", r: 5, strokeWidth: 3, stroke: "var(--glass-bg)" }}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ===== BAR CHART — Cost by Classe ===== */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              Custo Total por Classe
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={300}>
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
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => {
                    if (v >= 1000) return `R$${(v / 1000).toFixed(0)}k`;
                    return `R$${v}`;
                  }}
                />
                <Tooltip content={<CustomTooltip prefix="currency" />} />
                <Bar
                  dataKey="total_cost"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {classeData.map((_: any, i: number) => (
                    <Cell key={i} fill={`url(#cost-grad-${i})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
