'use client';

import { useState, useEffect } from 'react';
import { Plus, FileText, Pencil, Trash2, ExternalLink, Link2, RefreshCw, CalendarDays, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import CreateProposalModal from '@/components/CreateProposalModal';
import Link from 'next/link';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

function formatDate(isoString) {
  if (!isoString) return null;
  const date = new Date(isoString);
  return isNaN(date) ? null : dateFormatter.format(date);
}

export default function Dashboard() {
  const { toast } = useToast();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await fetch('/api/proposals');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setProposals(data.proposals || []);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (proposal) => {
    if (!confirm(`Excluir a proposta de ${proposal.companyName}? Essa ação não pode ser desfeita.`)) return;

    try {
      const response = await fetch(`/api/proposals/${proposal.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      toast({
        title: 'Proposta excluída',
        description: `A proposta de ${proposal.companyName} foi removida.`,
      });
      fetchProposals();
    } catch (error) {
      console.error('Error deleting proposal:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a proposta. Tente novamente.',
      });
    }
  };

  const handleCopyLink = async (proposal) => {
    const url = `${window.location.origin}/proposal/${proposal.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copiado',
        description: `Link da proposta de ${proposal.companyName} pronto para enviar ao cliente.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível copiar',
        description: url,
      });
    }
  };

  const handleEdit = (proposal) => {
    setEditingProposal(proposal);
    setShowCreateModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingProposal(null);
    fetchProposals();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Gerador de <span className="text-lime-400">Propostas</span>
              </h1>
              <p className="text-zinc-400 mt-1">
                Crie e gerencie propostas comerciais profissionais
                {!loading && !loadError && proposals.length > 0 && (
                  <span className="text-lime-400 ml-2">
                    · {proposals.length} {proposals.length === 1 ? 'proposta' : 'propostas'}
                  </span>
                )}
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-lime-400 hover:bg-lime-500 text-black font-semibold"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Proposta
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <Skeleton className="w-12 h-12 rounded mb-3 bg-zinc-800" />
                  <Skeleton className="h-5 w-2/3 bg-zinc-800" />
                  <Skeleton className="h-4 w-1/2 bg-zinc-800" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-4 bg-zinc-800" />
                  <Skeleton className="h-9 w-full bg-zinc-800" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : loadError ? (
          <Card className="bg-zinc-900/50 border-zinc-800 text-center py-16">
            <CardContent>
              <RefreshCw className="w-16 h-16 mx-auto text-zinc-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Não foi possível carregar as propostas</h3>
              <p className="text-zinc-400 mb-6">Verifique sua conexão ou o servidor e tente novamente</p>
              <Button
                onClick={fetchProposals}
                className="bg-lime-400 hover:bg-lime-500 text-black font-semibold"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        ) : proposals.length === 0 ? (
          <Card className="bg-zinc-900/50 border-zinc-800 text-center py-16">
            <CardContent>
              <FileText className="w-16 h-16 mx-auto text-zinc-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma proposta criada</h3>
              <p className="text-zinc-400 mb-6">Comece criando sua primeira proposta comercial</p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-lime-400 hover:bg-lime-500 text-black font-semibold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar Primeira Proposta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proposals.map((proposal) => (
              <Card
                key={proposal.id}
                className="bg-zinc-900/50 border-zinc-800 hover:border-lime-400/50 transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {proposal.clientLogo && (
                        <img
                          src={proposal.clientLogo}
                          alt={proposal.companyName}
                          className="w-12 h-12 object-contain mb-3 rounded"
                        />
                      )}
                      <CardTitle className="text-white text-lg mb-1">
                        {proposal.companyName}
                      </CardTitle>
                      <CardDescription className="text-zinc-400">
                        {proposal.clientName}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-300 mb-3 line-clamp-2">
                    {proposal.title}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                    {formatDate(proposal.createdAt) && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {formatDate(proposal.createdAt)}
                      </span>
                    )}
                    {proposal.plans?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        {proposal.plans.length} {proposal.plans.length === 1 ? 'plano' : 'planos'}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/proposal/${proposal.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-lime-400/50 text-lime-400 hover:bg-lime-400/10"
                        size="sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(proposal)}
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      title="Copiar link para o cliente"
                    >
                      <Link2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(proposal)}
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      title="Editar proposta"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(proposal)}
                      className="border-red-900/50 text-red-400 hover:bg-red-950/50"
                      title="Excluir proposta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateProposalModal
          isOpen={showCreateModal}
          onClose={handleModalClose}
          proposal={editingProposal}
        />
      )}
    </div>
  );
}