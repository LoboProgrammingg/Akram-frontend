"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bell, Send, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [sending, setSending] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [triggerResult, setTriggerResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list().then((r) => r.data),
  });

  const { data: scheduler } = useQuery({
    queryKey: ["scheduler-status"],
    queryFn: () => notificationsApi.schedulerStatus().then((r) => r.data),
    refetchInterval: 60000,
  });

  const handleTrigger = async (force: boolean) => {
    // Confirm removed for debugging user issue
    // if (!confirm(force 
    //   ? "Isso enviará alertas mesmo para quem JÁ recebeu hoje. Continuar?" 
    //   : "Isso enviará alertas manuais. Continuar?")) return;

    setSending(true);
    setTriggerResult(null);
    try {
      const res = await notificationsApi.trigger(force);
      setTriggerResult({
        type: 'success', 
        message: `✅ Processado! Enviado: ${res.data.sent} | Ignorado (já enviou): ${res.data.skipped} | Erros: ${res.data.errors?.length}`
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["scheduler-status"] });
    } catch (err: any) {
      setTriggerResult({ type: 'error', message: err.response?.data?.detail || "Erro ao enviar" });
    } finally {
      setSending(false);
    }
  };

  const handleTest = async () => {
    if (!testPhone) return alert("Digite um número");
    setTesting(true);
    try {
      await notificationsApi.test(testPhone);
      alert("Teste enviado! Verifique o WhatsApp.");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setTestPhone("");
    } catch (err: any) {
      alert("Erro no teste: " + (err.response?.data?.detail || err.message));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500">
            Central de Notificações
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie o envio de alertas automáticos e manuais
          </p>
        </div>
        
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="h-8 px-3 gap-2 bg-background/50 backdrop-blur">
             <div className={`w-2 h-2 rounded-full ${scheduler?.running ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
             {scheduler?.running ? "Scheduler Ativo" : "Parado"}
           </Badge>
           {scheduler?.jobs?.[0] && (
             <Badge variant="secondary" className="h-8">
               Próximo: {scheduler.jobs[0].next_run}
             </Badge>
           )}
        </div>
      </div>

      {triggerResult && (
        <div className={`p-4 rounded-xl border ${
          triggerResult.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {triggerResult.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card de Conexão WhatsApp */}
        <EvolutionConnectionCard />

        {/* Card de Controle Manual */}
        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-400" />
              Disparo Manual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Envie alertas de produtos "Muito Críticos" agora. 
              O sistema verifica automaticamente se já foi enviado hoje para evitar duplicidade.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => handleTrigger(false)} 
                disabled={sending}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Disparar (Padrão)"}
              </Button>
              <Button 
                onClick={() => handleTrigger(true)} 
                disabled={sending}
                variant="destructive"
                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50"
              >
                Forçar Reenvio
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card de Teste */}
        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Testar Conexão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="5565999999999"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="flex-1 bg-background/50 border border-white/10 rounded-md px-3 h-10 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
              <Button 
                onClick={handleTest} 
                disabled={testing}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Testar"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              * Digite o número com DDI e DDD (ex: 5565...)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Logs */}
      <Card className="glass-card border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Histórico de Envios
            <Badge variant="secondary" className="ml-2">{notifications?.total || 0}</Badge>
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead>Telefone</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-[300px]">Mensagem</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications?.items?.map((n: any) => (
                <TableRow key={n.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-mono text-xs">{n.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/10">
                      {n.direction === 'outbound' ? 'Saída' : 'Entrada'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      n.status === 'sent' ? 'bg-emerald-500/20 text-emerald-400' :
                      n.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-amber-500/20 text-amber-400'
                    }>
                      {n.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate" title={n.message}>
                    {n.message}
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {n.sent_at ? new Date(n.sent_at).toLocaleString('pt-BR') : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {!notifications?.items?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado
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

function EvolutionConnectionCard() {
  const { data: status } = useQuery({
    queryKey: ["evolution-status"],
    queryFn: () => notificationsApi.evolutionStatus().then((r) => r.data),
    refetchInterval: 5000,
  });

  const { data: qr } = useQuery({
    queryKey: ["evolution-qr"],
    queryFn: () => notificationsApi.evolutionQr().then((r) => r.data),
    enabled: status?.instance?.state !== "open", // Only fetch if not open
    refetchInterval: 5000,
  });

  const isConnected = status?.instance?.state === "open";
  // Evolution v1.8.2 returns just base64 or qrcode object
  const qrCodeBase64 = qr?.qrcode?.base64 || qr?.base64; 

  return (
    <Card className="glass-card border-white/5 col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-red-500 shadow-[0_0_10px_#ef4444]"}`} />
          Status da Conexão WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center gap-6">
        {!isConnected ? (
          <>
            <div className="bg-white p-2 rounded-lg">
              {qrCodeBase64 ? (
                <img src={qrCodeBase64} alt="QR Code" className="w-48 h-48 object-contain" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-zinc-900 text-xs">
                  {status?.state === 'close' ? 'Instância desconectada' : 'Carregando QR Code...'}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
               <h3 className="text-lg font-semibold text-white">Escaneie para conectar</h3>
               <p className="text-sm text-muted-foreground">
                 1. Abra o WhatsApp no seu celular<br/>
                 2. Toque em Menu (⋮) ou Configurações<br/>
                 3. Selecione <b>Aparelhos Conectados</b><br/>
                 4. Toque em <b>Conectar um Aparelho</b>
               </p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
             <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20">
               <CheckCircle2 className="w-8 h-8 text-emerald-400" />
             </div>
             <div>
               <h3 className="text-lg font-semibold text-emerald-400">Conectado com Sucesso!</h3>
               <p className="text-sm text-muted-foreground">
                 O sistema está pronto para enviar notificações e responder via IA.
               </p>
               <p className="text-xs text-muted-foreground mt-1">
                 Instância: <span className="text-white font-mono">{status?.instance?.instanceName}</span>
               </p>
             </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
