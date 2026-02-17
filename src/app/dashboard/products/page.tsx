"use client";

import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { useFilterStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
} from "lucide-react";

function classeBadge(classe: string | null) {
  if (!classe) return <Badge variant="outline">-</Badge>;
  const upper = classe.toUpperCase();
  if (upper.includes("VENCIDO"))
    return <Badge className="bg-gray-600/50 text-gray-300 border-0">{classe}</Badge>;
  if (upper.includes("MUITO"))
    return <Badge className="bg-zinc-950 text-white border border-white/20 shadow-lg shadow-black/50">{classe}</Badge>;
  if (upper.includes("CRITICO"))
    return <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">{classe}</Badge>;
  if (upper.includes("ATENÇÃO") || upper.includes("ATENCAO"))
    return <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">{classe}</Badge>;
  return <Badge variant="outline">{classe}</Badge>;
}

export default function ProductsPage() {
  const filters = useFilterStore();

  const { data: filterOptions } = useQuery({
    queryKey: ["filter-options"],
    queryFn: () => productsApi.filters().then((r) => r.data),
  });

  const params: Record<string, string | number | undefined> = {
    page: filters.page,
    page_size: 30,
  };
  if (filters.filial) params.filial = filters.filial;
  if (filters.classe) params.classe = filters.classe;
  if (filters.uf) params.uf = filters.uf;
  if (filters.comprador) params.comprador = filters.comprador;
  if (filters.validade_start) params.validade_start = filters.validade_start;
  if (filters.validade_end) params.validade_end = filters.validade_end;

  const { data, isLoading } = useQuery({
    queryKey: ["products", params],
    queryFn: () => productsApi.list(params).then((r) => r.data),
  });

  const hasFilters =
    filters.filial || filters.classe || filters.uf || filters.comprador || filters.validade_start || filters.validade_end;

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.total?.toLocaleString("pt-BR") || 0} produtos encontrados
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-400" />
            Filtros
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={filters.resetFilters}
                className="text-xs text-muted-foreground hover:text-red-400 ml-auto h-7 cursor-pointer"
              >
                <X className="w-3 h-3 mr-1" />
                Limpar filtros
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Select value={filters.filial || "all"} onValueChange={(v) => filters.setFilter("filial", v === "all" ? "" : v)}>
              <SelectTrigger className="bg-white/5 border-white/10 h-9 text-xs">
                <SelectValue placeholder="Filial" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Filiais</SelectItem>
                {filterOptions?.filiais?.map((f: string) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.classe || "all"} onValueChange={(v) => filters.setFilter("classe", v === "all" ? "" : v)}>
              <SelectTrigger className="bg-white/5 border-white/10 h-9 text-xs">
                <SelectValue placeholder="Classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Classes</SelectItem>
                {filterOptions?.classes?.map((c: string) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.uf || "all"} onValueChange={(v) => filters.setFilter("uf", v === "all" ? "" : v)}>
              <SelectTrigger className="bg-white/5 border-white/10 h-9 text-xs">
                <SelectValue placeholder="UF" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas UFs</SelectItem>
                {filterOptions?.ufs?.map((u: string) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.comprador || "all"} onValueChange={(v) => filters.setFilter("comprador", v === "all" ? "" : v)}>
              <SelectTrigger className="bg-white/5 border-white/10 h-9 text-xs">
                <SelectValue placeholder="Comprador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Compradores</SelectItem>
                {filterOptions?.compradores?.map((c: string) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                type="date"
                value={filters.validade_start}
                onChange={(e) => filters.setFilter("validade_start", e.target.value)}
                className="bg-white/5 border-white/10 h-9 text-xs pl-7"
                placeholder="De"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                type="date"
                value={filters.validade_end}
                onChange={(e) => filters.setFilter("validade_end", e.target.value)}
                className="bg-white/5 border-white/10 h-9 text-xs pl-7"
                placeholder="Até"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass-card border-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-xs font-medium text-muted-foreground">Código</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground min-w-[200px]">Descrição</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Embalagem</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Estoque</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Qtd.</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Validade</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Classe</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Valor Unit.</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">UF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array(10)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i} className="border-white/5">
                        {Array(9)
                          .fill(0)
                          .map((_, j) => (
                            <TableCell key={j}>
                              <div className="h-4 bg-white/5 rounded animate-pulse" />
                            </TableCell>
                          ))}
                      </TableRow>
                    ))
                : data?.items?.map((p: any) => (
                    <TableRow key={p.id} className="border-white/5 hover:bg-white/3 transition-colors">
                      <TableCell className="text-xs font-mono">{p.codigo}</TableCell>
                      <TableCell className="text-xs max-w-[300px] truncate" title={p.descricao}>
                        {p.descricao}
                      </TableCell>
                      <TableCell className="text-xs">{p.embalagem || "-"}</TableCell>
                      <TableCell className="text-xs">{p.estoque?.toLocaleString("pt-BR") || "-"}</TableCell>
                      <TableCell className="text-xs">{p.quantidade?.toLocaleString("pt-BR") || "-"}</TableCell>
                      <TableCell className="text-xs">
                        {p.validade ? new Date(p.validade).toLocaleDateString("pt-BR") : "-"}
                      </TableCell>
                      <TableCell>{classeBadge(p.classe)}</TableCell>
                      <TableCell className="text-xs">
                        {p.preco_com_st != null
                          ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.preco_com_st)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-xs">{p.uf || "-"}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-muted-foreground">
              Página {data.page} de {data.total_pages} ({data.total} produtos)
            </p>
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                disabled={data.page <= 1}
                onClick={() => filters.setPage(data.page - 1)}
                className="h-8 w-8 p-0 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={data.page >= data.total_pages}
                onClick={() => filters.setPage(data.page + 1)}
                className="h-8 w-8 p-0 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
