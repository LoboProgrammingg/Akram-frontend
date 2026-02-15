"use client";

import { useQuery } from "@tanstack/react-query";
import { clientsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserX,
  AlertTriangle,
  MapPin,
  BarChart3,
  PieChart as PieIcon,
  Clock,
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
} from "recharts";

/* =============================================
   CHART COLORS
   ============================================= */
const INACTIVITY_COLORS: Record<string, string> = {
  "Ativo (< 30d)": "#22c55e",
  "Inativo 30-60d": "#eab308",
  "Inativo 60-90d": "#ef4444",
  "Inativo > 90d": "#09090b",
};

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#22c55e", "#eab308", "#ef4444", "#ec4899"];

/* =============================================
   FORMATTERS
   ============================================= */
function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

/* =============================================
   CUSTOM TOOLTIP
   ============================================= */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-4 py-3 rounded-xl shadow-xl border bg-card text-card-foreground border-border backdrop-blur-xl">
      {label && <p className="text-xs font-medium text-muted-foreground mb-1.5">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-sm font-semibold">{formatNumber(entry.value)}</span>
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
  gradientFrom,
  gradientTo,
  glow,
  suffix,
}: {
  title: string;
  value: string | number;
  icon: any;
  gradientFrom: string;
  gradientTo: string;
  glow: string;
  suffix?: string;
}) {
  return (
    <Card className={`glass-card border-0 ${glow} overflow-hidden relative`}>
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
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
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
   MAIN CLIENT DASHBOARD
   ============================================= */
export default function ClientsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["client-dashboard"],
    queryFn: () => clientsApi.summary().then((r) => r.data),
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
          {Array(3).fill(0).map((_, i) => (
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
  const inactivityData = charts?.inactivity_distribution || [];
  const byEstadoData = charts?.by_estado || [];
  const byCidadeData = charts?.by_cidade || [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitoramento de clientes e atividade de compras
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Clientes"
          value={formatNumber(stats?.total_clients || 0)}
          icon={Users}
          gradientFrom="#3b82f6"
          gradientTo="#2563eb"
          glow="glow-blue"
        />
        <StatCard
          title="Inativos +30 Dias"
          value={formatNumber(stats?.inactive_30d || 0)}
          icon={UserX}
          gradientFrom="#eab308"
          gradientTo="#ca8a04"
          glow="glow-yellow"
        />
        <StatCard
          title="Inativos +60 Dias"
          value={formatNumber(stats?.inactive_60d || 0)}
          icon={UserX}
          gradientFrom="#ef4444"
          gradientTo="#dc2626"
          glow="glow-red"
        />
        <StatCard
          title="Inativos +90 Dias"
          value={formatNumber(stats?.inactive_90d || 0)}
          icon={UserX}
          gradientFrom="#09090b"
          gradientTo="#27272a"
          glow="glow-zinc"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ===== DONUT CHART — Inactivity Distribution ===== */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <PieIcon className="w-3.5 h-3.5 text-amber-400" />
              </div>
              Distribuição por Atividade
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <defs>
                  {inactivityData.map((item: any, i: number) => {
                    const color = INACTIVITY_COLORS[item.faixa] || CHART_COLORS[i % CHART_COLORS.length];
                    return (
                      <linearGradient key={i} id={`inact-grad-${i}`} x1="0" y1="0" x2="1" y2="1">
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
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={62}
                  paddingAngle={4}
                  cornerRadius={4}
                  strokeWidth={0}
                >
                  {inactivityData.map((_: any, i: number) => (
                    <Cell key={i} fill={`url(#inact-grad-${i})`} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <text x="50%" y="46%" textAnchor="middle" className="fill-foreground text-2xl font-bold" dy={0}>
                  {formatNumber(stats?.total_clients || 0)}
                </text>
                <text x="50%" y="55%" textAnchor="middle" className="fill-muted-foreground text-[11px]">
                  clientes
                </text>
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3 px-2">
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

        {/* ===== BAR CHART — Clients by Estado ===== */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
              </div>
              Clientes por Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byEstadoData} barSize={36} barGap={4}>
                <defs>
                  <linearGradient id="bar-fill-estado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
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
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill="url(#bar-fill-estado)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ===== BAR CHART — Top Cidades ===== */}
        <Card className="glass-card border-0 lg:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
              </div>
              Top 10 Cidades
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byCidadeData} barSize={36} layout="vertical">
                <defs>
                  <linearGradient id="bar-fill-cidade" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-stroke)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "var(--tick-fill)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="cidade"
                  tick={{ fill: "var(--tick-fill)", fontSize: 10, fontWeight: 500 }}
                  axisLine={{ stroke: "var(--axis-stroke)" }}
                  tickLine={false}
                  width={120}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill="url(#bar-fill-cidade)"
                  radius={[0, 8, 8, 0]}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
