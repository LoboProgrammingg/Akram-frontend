"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clientUploadsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UploadCloud, Users, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";

export default function ClientUploadPage() {
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ message: string; success: boolean } | null>(null);

  const { data: uploads } = useQuery({
    queryKey: ["client-uploads"],
    queryFn: () => clientUploadsApi.list().then((r) => r.data),
  });

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file) return;
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["xlsx", "csv"].includes(ext || "")) {
        setResult({ message: "Apenas arquivos .xlsx e .csv são aceitos", success: false });
        return;
      }

      setUploading(true);
      setResult(null);

      try {
        const res = await clientUploadsApi.upload(file);
        setResult({ message: res.data.message, success: true });
        queryClient.invalidateQueries({ queryKey: ["client-uploads"] });
        queryClient.invalidateQueries({ queryKey: ["client-dashboard"] });
      } catch (err: any) {
        setResult({
          message: err.response?.data?.detail || "Erro ao processar arquivo",
          success: false,
        });
      } finally {
        setUploading(false);
      }
    },
    [queryClient]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Upload de Clientes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Envie arquivos .xlsx ou .csv para importar clientes
        </p>
      </div>

      {/* Upload Zone */}
      <Card className="glass-card border-0">
        <CardContent className="p-8">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              isDragging
                ? "border-purple-500 bg-purple-500/5"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">Processando arquivo de clientes...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Importando CSV → PostgreSQL
                </p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-sm font-medium mb-1">
                  Arraste um arquivo aqui ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground">
                  Aceita .xlsx e .csv • Planilha de clientes (Cod. Cliente, Razão Social, etc.)
                </p>
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={handleFileInput}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </>
            )}
          </div>

          {result && (
            <div
              className={`mt-4 flex items-center gap-2 p-3 rounded-lg text-sm ${
                result.success
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0" />
              )}
              {result.message}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload History */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Histórico de Uploads de Clientes
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-xs">Arquivo</TableHead>
                <TableHead className="text-xs">Clientes</TableHead>
                <TableHead className="text-xs">Enviado por</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uploads?.map((u: any) => (
                <TableRow key={u.id} className="border-white/5">
                  <TableCell className="text-xs flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    {u.original_name}
                  </TableCell>
                  <TableCell className="text-xs">{u.row_count?.toLocaleString("pt-BR")}</TableCell>
                  <TableCell className="text-xs">{u.uploaded_by || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        u.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-400 border-0"
                          : u.status === "failed"
                          ? "bg-red-500/20 text-red-400 border-0"
                          : "bg-amber-500/20 text-amber-400 border-0"
                      }
                    >
                      {u.status === "completed" ? "Concluído" : u.status === "failed" ? "Erro" : "Processando"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {u.created_at ? new Date(u.created_at).toLocaleString("pt-BR") : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {!uploads?.length && (
                <TableRow className="border-white/5">
                  <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">
                    Nenhum upload de clientes realizado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
