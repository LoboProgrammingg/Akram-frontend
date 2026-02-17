"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadsApi, productsApi } from "@/lib/api";
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
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Clock, Loader2, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [recalculating, setRecalculating] = useState(false);
  const [result, setResult] = useState<{ message: string; success: boolean } | null>(null);

  const { data: uploads } = useQuery({
    queryKey: ["uploads"],
    queryFn: () => uploadsApi.list().then((r) => r.data),
  });

  const handleRecalculate = useCallback(async () => {
    setRecalculating(true);
    setResult(null);

    try {
      const res = await productsApi.recalculateClasses();
      setResult({ 
        message: `${res.data.message} (Data: ${res.data.data_atual})`, 
        success: true 
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err: any) {
      setResult({
        message: err.response?.data?.detail || "Erro ao recalcular classificações",
        success: false,
      });
    } finally {
      setRecalculating(false);
    }
  }, [queryClient]);

  const handleDelete = useCallback(
    async (uploadId: number, uploadName: string) => {
      if (!confirm(`Tem certeza que deseja deletar "${uploadName}"?\n\nIsso irá remover todos os produtos associados a esta planilha.`)) {
        return;
      }

      setDeleting(uploadId);
      setResult(null);

      try {
        const res = await uploadsApi.delete(uploadId);
        setResult({ message: res.data.message, success: true });
        queryClient.invalidateQueries({ queryKey: ["uploads"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } catch (err: any) {
        setResult({
          message: err.response?.data?.detail || "Erro ao deletar upload",
          success: false,
        });
      } finally {
        setDeleting(null);
      }
    },
    [queryClient]
  );

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
        const res = await uploadsApi.upload(file);
        setResult({ message: res.data.message, success: true });
        queryClient.invalidateQueries({ queryKey: ["uploads"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Upload de Planilha</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Envie arquivos .xlsx ou .csv para importar produtos
          </p>
        </div>
        <Button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {recalculating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Recalcular Classes
        </Button>
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
                ? "border-blue-500 bg-blue-500/5"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">Processando arquivo...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Convertendo XLSX → CSV → PostgreSQL → RAG
                </p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-sm font-medium mb-1">
                  Arraste um arquivo aqui ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground">
                  Aceita .xlsx e .csv • Máximo 50MB
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
            <Clock className="w-4 h-4 text-blue-400" />
            Histórico de Uploads
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-xs">Arquivo</TableHead>
                <TableHead className="text-xs">Linhas</TableHead>
                <TableHead className="text-xs">Enviado por</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Data</TableHead>
                <TableHead className="text-xs text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uploads?.map((u: any) => (
                <TableRow key={u.id} className="border-white/5">
                  <TableCell className="text-xs flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
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
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => handleDelete(u.id, u.original_name)}
                      disabled={deleting === u.id}
                    >
                      {deleting === u.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!uploads?.length && (
                <TableRow className="border-white/5">
                  <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">
                    Nenhum upload realizado
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
