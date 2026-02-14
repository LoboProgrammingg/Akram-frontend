"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { phoneNumbersApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Phone, Plus, Trash2, ToggleLeft, ToggleRight, Brain, Pencil } from "lucide-react";

export default function PhoneNumbersPage() {
  const queryClient = useQueryClient();
  
  // Add State
  const [newNumber, setNewNumber] = useState("");
  const [newName, setNewName] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["MUITO CRÍTICO"]);
  const [adding, setAdding] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNumber, setEditNumber] = useState("");
  const [editName, setEditName] = useState("");
  const [editTypes, setEditTypes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: numbers } = useQuery({
    queryKey: ["phone-numbers"],
    queryFn: () => phoneNumbersApi.list().then((r) => r.data),
  });

  const availableTypes = ["MUITO CRÍTICO", "CRITICO", "ATENÇÃO", "VENCIDO"];

  // Helpers
  const tryParseTypes = (jsonStr: string | null): string[] => {
    if (!jsonStr) return ["MUITO CRÍTICO"];
    try {
      // Handle single quotes if present (Python str() dump)
      const cleanStr = jsonStr.replace(/'/g, '"');
      const parsed = JSON.parse(cleanStr);
      return Array.isArray(parsed) ? parsed : ["MUITO CRÍTICO"];
    } catch {
      return ["MUITO CRÍTICO"];
    }
  };

  const toggleType = (type: string, isEdit = false) => {
    if (isEdit) {
      setEditTypes((prev) =>
        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      );
    } else {
      setSelectedTypes((prev) =>
        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      );
    }
  };

  // Handlers
  const handleAdd = async () => {
    if (!newNumber.trim()) return;
    setAdding(true);
    try {
      await phoneNumbersApi.create({
        number: newNumber.trim(),
        name: newName.trim() || undefined,
        notification_types: JSON.stringify(selectedTypes),
      });
      setNewNumber("");
      setNewName("");
      setSelectedTypes(["MUITO CRÍTICO"]);
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao cadastrar número");
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = (n: any) => {
    setEditingId(n.id);
    setEditNumber(n.number);
    setEditName(n.name || "");
    setEditTypes(tryParseTypes(n.notification_types));
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await phoneNumbersApi.update(editingId, {
        name: editName.trim() || undefined,
        notification_types: JSON.stringify(editTypes),
      });
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao atualizar");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number, field: string, current: boolean) => {
    try {
      await phoneNumbersApi.update(id, { [field]: !current });
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
    } catch (err) {
      alert("Erro ao atualizar");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remover este número?")) return;
    try {
      await phoneNumbersApi.delete(id);
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
    } catch (err) {
      alert("Erro ao remover");
    }
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Telefones WhatsApp</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie os números que recebem notificações e os tipos de alerta
        </p>
      </div>

      {/* Add number */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-400" />
            Adicionar Recorrente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Input
                placeholder="5565999999999"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                className="bg-white/5 border-white/10 h-10 max-w-[200px]"
              />
              <Input
                placeholder="Nome (opcional)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-white/5 border-white/10 h-10 max-w-[200px]"
              />
              <Button
                onClick={handleAdd}
                disabled={adding || !newNumber.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 cursor-pointer h-10"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Alertas:</span>
              {availableTypes.map((type) => (
                <Badge
                  key={type}
                  variant={selectedTypes.includes(type) ? "default" : "outline"}
                  className={`cursor-pointer select-none ${
                    selectedTypes.includes(type) 
                      ? type === "MUITO CRÍTICO" ? "bg-zinc-800 hover:bg-zinc-700"
                      : type === "CRITICO" ? "bg-red-600 hover:bg-red-500"
                      : type === "ATENÇÃO" ? "bg-yellow-600 hover:bg-yellow-500"
                      : "bg-gray-600 hover:bg-gray-500"
                      : "opacity-50 hover:opacity-100"
                  }`}
                  onClick={() => toggleType(type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Numbers table */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            Números Cadastrados ({numbers?.length || 0})
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-xs">Número</TableHead>
                <TableHead className="text-xs">Nome</TableHead>
                <TableHead className="text-xs">Alertas Configurados</TableHead>
                <TableHead className="text-xs">Ativo</TableHead>
                <TableHead className="text-xs">IA</TableHead>
                <TableHead className="text-xs text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {numbers?.map((n: any) => {
                const types = tryParseTypes(n.notification_types);
                
                return (
                <TableRow key={n.id} className="border-white/5 hover:bg-white/3">
                  <TableCell className="text-xs font-mono">{n.number}</TableCell>
                  <TableCell className="text-xs">{n.name || "-"}</TableCell>
                  <TableCell className="text-xs">
                    <div className="flex flex-wrap gap-1">
                      {types.map((t) => (
                        <span key={t} className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                           t === "MUITO CRÍTICO" ? "border-zinc-500/50 bg-zinc-500/10 text-zinc-300"
                         : t === "CRITICO" ? "border-red-500/50 bg-red-500/10 text-red-300"
                         : t === "ATENÇÃO" ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-300"
                         : "border-gray-500/50 bg-gray-500/10 text-gray-300"
                        }`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggle(n.id, "is_active", n.is_active)}
                      className="cursor-pointer"
                    >
                      {n.is_active ? (
                        <ToggleRight className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggle(n.id, "can_query_ai", n.can_query_ai)}
                      className="cursor-pointer"
                    >
                      <Brain
                        className={`w-4 h-4 ${n.can_query_ai ? "text-purple-400" : "text-muted-foreground"}`}
                      />
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(n)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-blue-400 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(n.id)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )})}
              {!numbers?.length && (
                <TableRow className="border-white/5">
                  <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">
                    Nenhum número cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Editar Contato</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">Número (apenas leitura)</span>
              <Input
                value={editNumber}
                disabled
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">Nome</span>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">Alertas</span>
              <div className="flex flex-wrap gap-2">
                {availableTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={editTypes.includes(type) ? "default" : "outline"}
                    className={`cursor-pointer select-none ${
                        editTypes.includes(type)
                        ? type === "MUITO CRÍTICO" ? "bg-zinc-800 hover:bg-zinc-700"
                        : type === "CRITICO" ? "bg-red-600 hover:bg-red-500"
                        : type === "ATENÇÃO" ? "bg-yellow-600 hover:bg-yellow-500"
                        : "bg-gray-600 hover:bg-gray-500"
                        : "opacity-50 hover:opacity-100 border-white/20"
                    }`}
                    onClick={() => toggleType(type, true)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)} className="border-white/10 hover:bg-white/5">
              Cancelar
            </Button>
            <Button 
                onClick={handleSaveEdit} 
                className="bg-purple-600 hover:bg-purple-500"
                disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
