"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, AlertTriangle, Shield, Users, 
  CheckCircle2, PlusCircle, RefreshCw, FileSpreadsheet, Sparkles, 
  SlidersHorizontal, Calendar, BarChart3, TrendingUp as InvestmentIcon, Trash2, Search
} from 'lucide-react';

const CATEGORIES = ['Receita', 'Dízimo', 'Fixos', 'Pessoal', 'Saúde', 'Dívidas', 'Investimento', 'Outros'];

export default function App() {
  const [activeView, setActiveView] = useState('client');
  const [clientTab, setClientTab] = useState('fluxo');
  
  // Estados do Formulário
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState('in');
  const [newCategory, setNewCategory] = useState('Receita');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  
  // Carrega dados iniciais do navegador para a tela não ficar vazia
  useEffect(() => {
    const saved = localStorage.getItem('@saas_fluxo:transactions');
    if (saved) setTransactions(JSON.parse(saved));
  }, []);

  // Integração Real com o Backend (Next.js API -> Google Sheets)
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim() || !newAmount) return;

    const val = parseFloat(newAmount);
    const newTx = {
      id: Date.now().toString(),
      date: newDate,
      description: newDesc.trim(),
      category: newCategory,
      type: newType,
      amount: val,
      status: 'syncing'
    };

    // 1. Atualiza a tela imediatamente (UI Otimista)
    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    localStorage.setItem('@saas_fluxo:transactions', JSON.stringify(updatedTx));
    
    setNewDesc('');
    setNewAmount('');
    setIsSyncing(true);

    try {
      // 2. Envia para o Vercel Serverless Function
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId: 'COLE_O_ID_DA_SUA_PLANILHA_AQUI',
          transaction: newTx
        })
      });

      if (!response.ok) throw new Error('Falha na sincronização');
      
      // 3. Marca como sincronizado se sucesso
      setTransactions(prev => prev.map(t => t.id === newTx.id ? { ...t, status: 'synced' } : t));
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar na nuvem, mas salvo localmente.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem('@saas_fluxo:transactions', JSON.stringify(updated));
  };

  // Cálculos Financeiros
  const totalIn = useMemo(() => transactions.filter(t => t.type === 'in').reduce((acc, t) => acc + t.amount, 0), [transactions]);
  const totalOut = useMemo(() => transactions.filter(t => t.type === 'out').reduce((acc, t) => acc + t.amount, 0), [transactions]);
  const currentBalance = totalIn - totalOut;

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 font-sans pb-12">
      {/* Topbar Simplificada */}
      <div className="sticky top-0 z-40 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500 flex items-center justify-center text-slate-900 font-bold">FC</div>
            <span className="font-bold text-white tracking-wide">FluxoCaixa<span className="text-cyan-400">Pro</span></span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-8 space-y-8">
        
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl">
            <span className="text-xs text-slate-400 uppercase">Saldo Atual</span>
            <div className="text-3xl font-bold text-white mt-2">{formatCurrency(currentBalance)}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl">
            <span className="text-xs text-slate-400 uppercase">Entradas</span>
            <div className="text-3xl font-bold text-emerald-400 mt-2">{formatCurrency(totalIn)}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl">
            <span className="text-xs text-slate-400 uppercase">Saídas</span>
            <div className="text-3xl font-bold text-rose-400 mt-2">{formatCurrency(totalOut)}</div>
          </div>
        </div>

        {/* Layout Principal: Formulário e Tabela */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Formulário */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 h-fit">
            <h3 className="font-bold text-white mb-6 flex items-center"><PlusCircle className="w-5 h-5 mr-2 text-cyan-400"/> Novo Registro</h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <input type="text" required placeholder="Descrição" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-400 outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" required placeholder="Valor R$" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-400 outline-none" />
                <select value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none">
                  <option value="in">Entrada (+)</option>
                  <option value="out">Saída (-)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none">
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <input type="date" required value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none" />
              </div>
              <button type="submit" disabled={isSyncing} className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl text-sm flex items-center justify-center">
                {isSyncing ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Salvar na Planilha'}
              </button>
            </form>
          </div>

          {/* Tabela de Dados */}
          <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-6">Últimos Lançamentos</h3>
            {transactions.length === 0 ? (
              <div className="text-center py-10 text-slate-500">Nenhum lançamento registrado.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="py-3 px-4">Data</th>
                      <th className="py-3 px-4">Descrição</th>
                      <th className="py-3 px-4 text-right">Valor</th>
                      <th className="py-3 px-4 text-center">Excluir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-white/[0.03]">
                        <td className="py-4 px-4 text-slate-400">{tx.date.split('-').reverse().join('/')}</td>
                        <td className="py-4 px-4 text-white">{tx.description}</td>
                        <td className={`py-4 px-4 text-right font-bold ${tx.type === 'in' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tx.type === 'in' ? '+' : '-'} {formatCurrency(tx.amount)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button onClick={() => handleDeleteTransaction(tx.id)} className="text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4 mx-auto" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
