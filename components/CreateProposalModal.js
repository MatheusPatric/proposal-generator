'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';

// Imagens são armazenadas como data-URL no documento da proposta;
// o limite evita payloads gigantes no MongoDB e páginas lentas para o cliente.
const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export default function CreateProposalModal({ isOpen, onClose, proposal }) {
  const { toast } = useToast();
  // Template padrão para nova proposta
  const defaultTemplate = {
    clientName: '',
    companyName: '',
    clientLogo: '',
    title: 'Proposta de Gestão de Conteúdo para Mídias Digitais',
    description: 'Estratégia completa de posicionamento digital e crescimento nas redes sociais',
    coverImage: '',
    strategyOverview: `Nossa estratégia foi desenvolvida para maximizar sua presença digital e criar conexão genuína com seu público.

Focamos em três pilares fundamentais:

• Posicionamento Digital: Construir uma identidade forte e reconhecível no ambiente digital
• Otimização de Perfil: Garantir que seu perfil comunique valor desde o primeiro contato
• Estratégia de Conteúdo: Criar conteúdos que engajam, educam e convertem
• Crescimento da Marca: Aumentar autoridade e reconhecimento no seu nicho

Trabalhamos com metodologia comprovada, análise constante de métricas e ajustes estratégicos para garantir os melhores resultados.`,
    plans: [
      {
        name: 'Plano Essencial',
        price: 'R$ 2.500',
        features: [
          'Planejamento estratégico mensal',
          'Gestão do Instagram',
          '10 conteúdos mensais',
          'Até 4 vídeos editados',
          'Direcionamento de conteúdo para stories',
          'Acompanhamento de engajamento',
          'Reunião estratégica mensal',
        ],
      },
      {
        name: 'Plano Profissional',
        price: 'R$ 3.000',
        features: [
          'Tudo do plano Essencial',
          '12 conteúdos mensais',
          'Até 6 vídeos editados',
          'Desenvolvimento e posicionamento digital',
          'Estratégia e humanização da marca',
        ],
      },
    ],
    previewImage: '',
    mainCreative: '',
    carouselCreatives: [],
    expectedResults: '',
    customNotes: '',
    brandName: 'Zeri Solutions',
    brandDescription: 'A Agencia Zeri surgiu com o proposito de otimizar o tempo de empresários e trazer a tona a identidade dos seus negócios em nichos diversos!',
    contactEmail: 'zeriagencia@gmail.com',
    contactPhone: '84991151503',
    contactInstagram: '@zeriagencia',
    contactWhatsApp: '5584991151503',
  };

  const [formData, setFormData] = useState(defaultTemplate);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiFieldType, setAiFieldType] = useState(null);

  useEffect(() => {
    if (proposal) {
      setFormData(proposal);
    } else {
      // Reset para o template padrão quando criar nova proposta
      setFormData(defaultTemplate);
    }
    setErrors({});
  }, [proposal, isOpen]);

  // Fecha com Esc e trava o scroll da página enquanto o modal está aberto
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, saving, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: null } : prev));
  };

  const handlePlanChange = (index, field, value) => {
    const newPlans = [...formData.plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    setFormData((prev) => ({ ...prev, plans: newPlans }));
    if (field === 'name') {
      setErrors((prev) => (prev[`plan-${index}`] ? { ...prev, [`plan-${index}`]: null } : prev));
    }
  };

  const handlePlanFeatureChange = (planIndex, featureIndex, value) => {
    const newPlans = [...formData.plans];
    const newFeatures = [...(newPlans[planIndex].features || [])];
    newFeatures[featureIndex] = value;
    newPlans[planIndex] = { ...newPlans[planIndex], features: newFeatures };
    setFormData((prev) => ({ ...prev, plans: newPlans }));
  };

  const addPlan = () => {
    setFormData((prev) => ({
      ...prev,
      plans: [
        ...prev.plans,
        {
          name: 'Novo Plano',
          price: 'R$ 0',
          features: ['Feature 1'],
        },
      ],
    }));
  };

  const removePlan = (index) => {
    setFormData((prev) => ({
      ...prev,
      plans: prev.plans.filter((_, i) => i !== index),
    }));
  };

  const addFeature = (planIndex) => {
    const newPlans = [...formData.plans];
    newPlans[planIndex].features = [
      ...(newPlans[planIndex].features || []),
      'Nova funcionalidade',
    ];
    setFormData((prev) => ({ ...prev, plans: newPlans }));
  };

  const removeFeature = (planIndex, featureIndex) => {
    const newPlans = [...formData.plans];
    newPlans[planIndex].features = newPlans[planIndex].features.filter(
      (_, i) => i !== featureIndex
    );
    setFormData((prev) => ({ ...prev, plans: newPlans }));
  };

  const validateImage = (file) => {
    if (file.size > MAX_IMAGE_SIZE) {
      toast({
        variant: 'destructive',
        title: 'Imagem muito grande',
        description: `"${file.name}" excede ${MAX_IMAGE_SIZE_MB}MB. Comprima a imagem e tente novamente.`,
      });
      return false;
    }
    return true;
  };

  const handleImageUpload = (acceptedFiles, field) => {
    const file = acceptedFiles[0];
    if (file && validateImage(file)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const logoDropzone = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (files) => handleImageUpload(files, 'clientLogo'),
  });

  const coverDropzone = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (files) => handleImageUpload(files, 'coverImage'),
  });

  const previewDropzone = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (files) => handleImageUpload(files, 'previewImage'),
  });

  const mainCreativeDropzone = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (files) => handleImageUpload(files, 'mainCreative'),
  });

  const carouselCreativesDropzone = useDropzone({
    accept: { 'image/*': [] },
    multiple: true,
    onDrop: (acceptedFiles) => {
      acceptedFiles.filter(validateImage).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData((prev) => ({
            ...prev,
            carouselCreatives: [...(prev.carouselCreatives || []), e.target.result],
          }));
        };
        reader.readAsDataURL(file);
      });
    },
  });

  const removeCarouselCreative = (index) => {
    setFormData((prev) => ({
      ...prev,
      carouselCreatives: prev.carouselCreatives.filter((_, i) => i !== index),
    }));
  };

  const handleAIHelp = async (fieldType) => {
    setAiGenerating(true);
    setAiFieldType(fieldType);
    
    try {
      const prompt = fieldType === 'expectedResults'
        ? `Cliente: ${formData.companyName || 'empresa'}\nNicho: Marketing Digital\nGere resultados esperados profissionais e realistas para uma proposta de gestão de redes sociais (3-5 pontos)`
        : `Cliente: ${formData.companyName || 'empresa'}\nGere notas personalizadas profissionais para uma proposta comercial de marketing digital (2-3 parágrafos curtos)`;

      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, fieldType }),
      });

      const data = await response.json();
      
      if (data.text) {
        setFormData((prev) => ({
          ...prev,
          [fieldType]: data.text,
        }));
      }
    } catch (error) {
      console.error('Error generating AI text:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar texto com IA',
        description: 'Não foi possível gerar o texto. Tente novamente.',
      });
    } finally {
      setAiGenerating(false);
      setAiFieldType(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.clientName?.trim()) newErrors.clientName = 'Informe o nome do cliente';
    if (!formData.companyName?.trim()) newErrors.companyName = 'Informe o nome da empresa';
    if (!formData.title?.trim()) newErrors.title = 'Informe o título da proposta';
    formData.plans.forEach((plan, i) => {
      if (!plan.name?.trim()) newErrors[`plan-${i}`] = 'Informe o nome do plano';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Revise os campos destacados antes de salvar.',
      });
      return;
    }
    setSaving(true);

    try {
      const url = proposal
        ? `/api/proposals/${proposal.id}`
        : '/api/proposals';
      const method = proposal ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: proposal ? 'Proposta atualizada' : 'Proposta criada',
          description: `A proposta para ${formData.companyName} foi salva com sucesso.`,
        });
        onClose();
      } else {
        const data = await response.json().catch(() => ({}));
        toast({
          variant: 'destructive',
          title: 'Erro ao salvar proposta',
          description: data.error || 'O servidor não conseguiu salvar. Tente novamente.',
        });
      }
    } catch (error) {
      console.error('Error saving proposal:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar proposta',
        description: 'Falha de conexão. Verifique sua internet e tente novamente.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto bg-zinc-900 rounded-lg shadow-2xl border border-zinc-800">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <h2 className="text-2xl font-bold text-white">
              {proposal ? 'Editar Proposta' : 'Nova Proposta'}
            </h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-lime-400">Informações do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName" className="text-zinc-300">
                    Nome do Cliente
                  </Label>
                  <Input
                    id="clientName"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    aria-invalid={!!errors.clientName}
                    className={`bg-zinc-800 text-white ${errors.clientName ? 'border-red-500' : 'border-zinc-700'}`}
                  />
                  {errors.clientName && (
                    <p className="text-red-400 text-xs mt-1">{errors.clientName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="companyName" className="text-zinc-300">
                    Nome da Empresa
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    aria-invalid={!!errors.companyName}
                    className={`bg-zinc-800 text-white ${errors.companyName ? 'border-red-500' : 'border-zinc-700'}`}
                  />
                  {errors.companyName && (
                    <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>
                  )}
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <Label className="text-zinc-300 mb-2 block">Logo do Cliente</Label>
                <div
                  {...logoDropzone.getRootProps()}
                  className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center cursor-pointer hover:border-lime-400 transition-colors"
                >
                  <input {...logoDropzone.getInputProps()} />
                  {formData.clientLogo ? (
                    <img
                      src={formData.clientLogo}
                      alt="Logo"
                      className="w-32 h-32 object-contain mx-auto"
                    />
                  ) : (
                    <div className="text-zinc-400">
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      <p>Clique ou arraste a logo aqui</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Proposal Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-lime-400">Detalhes da Proposta</h3>
              <div>
                <Label htmlFor="title" className="text-zinc-300 flex items-center gap-2">
                  Título da Proposta
                  <span className="text-xs text-lime-400">(Já preenchido - pode editar)</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  aria-invalid={!!errors.title}
                  className={`bg-zinc-800 text-white ${errors.title ? 'border-red-500' : 'border-zinc-700'}`}
                  placeholder="Ex: Proposta de Gestão de Conteúdo para Mídias Digitais"
                />
                {errors.title && (
                  <p className="text-red-400 text-xs mt-1">{errors.title}</p>
                )}
              </div>
              <div>
                <Label htmlFor="description" className="text-zinc-300 flex items-center gap-2">
                  Descrição
                  <span className="text-xs text-lime-400">(Já preenchido - pode editar)</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Breve descrição sobre estratégia e crescimento"
                />
              </div>

              {/* Cover Image */}
              <div>
                <Label className="text-zinc-300 mb-2 block">Imagem de Capa (Opcional)</Label>
                <div
                  {...coverDropzone.getRootProps()}
                  className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center cursor-pointer hover:border-lime-400 transition-colors"
                >
                  <input {...coverDropzone.getInputProps()} />
                  {formData.coverImage ? (
                    <img
                      src={formData.coverImage}
                      alt="Cover"
                      className="max-h-48 mx-auto"
                    />
                  ) : (
                    <div className="text-zinc-400">
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      <p>Clique ou arraste a imagem de capa aqui</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Strategy Overview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-lime-400 flex items-center gap-2">
                Visão Geral da Estratégia
                <span className="text-xs text-lime-400/70 font-normal">(Template preenchido - personalize para o cliente)</span>
              </h3>
              <div>
                <Textarea
                  name="strategyOverview"
                  value={formData.strategyOverview}
                  onChange={handleChange}
                  rows={8}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Explique o posicionamento digital, otimização de perfil, estratégia de conteúdo..."
                />
              </div>
            </div>

            {/* Pricing Plans */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-lime-400 flex items-center gap-2">
                  Planos de Serviço
                  <span className="text-xs text-lime-400/70 font-normal">(2 planos padrão - edite preços e funcionalidades)</span>
                </h3>
                <Button
                  type="button"
                  onClick={addPlan}
                  size="sm"
                  className="bg-lime-400/20 hover:bg-lime-400/30 text-lime-400 border border-lime-400/50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Plano
                </Button>
              </div>

              {formData.plans.map((plan, planIndex) => (
                <Card key={planIndex} className="bg-zinc-800/50 border-zinc-700 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold">Plano {planIndex + 1}</h4>
                    {formData.plans.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removePlan(planIndex)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-zinc-400 text-xs mb-1">Nome do Plano</Label>
                      <Input
                        value={plan.name}
                        onChange={(e) => handlePlanChange(planIndex, 'name', e.target.value)}
                        placeholder="Nome do Plano"
                        aria-invalid={!!errors[`plan-${planIndex}`]}
                        className={`bg-zinc-900 text-white ${errors[`plan-${planIndex}`] ? 'border-red-500' : 'border-zinc-700'}`}
                      />
                      {errors[`plan-${planIndex}`] && (
                        <p className="text-red-400 text-xs mt-1">{errors[`plan-${planIndex}`]}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-lime-400 text-xs mb-1 font-semibold">💰 Preço (Editável)</Label>
                      <Input
                        value={plan.price}
                        onChange={(e) => handlePlanChange(planIndex, 'price', e.target.value)}
                        placeholder="Preço (ex: R$ 2.500)"
                        className="bg-zinc-900 border-lime-400/30 text-white font-semibold focus:border-lime-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-zinc-300">Funcionalidades</Label>
                      <Button
                        type="button"
                        onClick={() => addFeature(planIndex)}
                        size="sm"
                        variant="ghost"
                        className="text-lime-400 hover:text-lime-300 text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                    {plan.features?.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) =>
                            handlePlanFeatureChange(planIndex, featureIndex, e.target.value)
                          }
                          className="bg-zinc-900 border-zinc-700 text-white flex-1"
                        />
                        <Button
                          type="button"
                          onClick={() => removeFeature(planIndex, featureIndex)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {/* Preview Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-lime-400">Prévia Visual (Opcional)</h3>
              <div
                {...previewDropzone.getRootProps()}
                className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center cursor-pointer hover:border-lime-400 transition-colors"
              >
                <input {...previewDropzone.getInputProps()} />
                {formData.previewImage ? (
                  <img
                    src={formData.previewImage}
                    alt="Preview"
                    className="max-h-48 mx-auto"
                  />
                ) : (
                  <div className="text-zinc-400">
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <p>Adicione mockups ou exemplos criativos</p>
                  </div>
                )}
              </div>
            </div>

            {/* Main Creative (1080x1350) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-lime-400">Criativo Principal do Cliente (1080x1350)</h3>
              <div
                {...mainCreativeDropzone.getRootProps()}
                className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center cursor-pointer hover:border-lime-400 transition-colors"
              >
                <input {...mainCreativeDropzone.getInputProps()} />
                {formData.mainCreative ? (
                  <img
                    src={formData.mainCreative}
                    alt="Main Creative"
                    className="max-h-64 mx-auto rounded"
                  />
                ) : (
                  <div className="text-zinc-400">
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <p>Criativo principal do cliente (1080x1350)</p>
                    <p className="text-xs mt-1">Será exibido em destaque na proposta</p>
                  </div>
                )}
              </div>
            </div>

            {/* Carousel Creatives */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-lime-400">Exemplos de Criativos (Carousel)</h3>
              <p className="text-sm text-zinc-400">Adicione exemplos de trabalhos anteriores para exibir em carousel</p>
              <div
                {...carouselCreativesDropzone.getRootProps()}
                className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center cursor-pointer hover:border-lime-400 transition-colors"
              >
                <input {...carouselCreativesDropzone.getInputProps()} />
                <div className="text-zinc-400">
                  <Upload className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm">Clique ou arraste múltiplas imagens</p>
                </div>
              </div>
              
              {formData.carouselCreatives?.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {formData.carouselCreatives.map((creative, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={creative}
                        alt={`Carousel ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        type="button"
                        onClick={() => removeCarouselCreative(index)}
                        size="sm"
                        variant="ghost"
                        className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expected Results with AI */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-lime-400">Resultados Esperados (Opcional)</h3>
                <Button
                  type="button"
                  onClick={() => handleAIHelp('expectedResults')}
                  disabled={aiGenerating}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {aiGenerating && aiFieldType === 'expectedResults' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      IA Ajudar
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                name="expectedResults"
                value={formData.expectedResults}
                onChange={handleChange}
                rows={4}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Liste as expectativas de crescimento e resultados"
              />
            </div>

            {/* Custom Notes with AI */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-lime-400">Notas Personalizadas (Opcional)</h3>
                <Button
                  type="button"
                  onClick={() => handleAIHelp('customNotes')}
                  disabled={aiGenerating}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {aiGenerating && aiFieldType === 'customNotes' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      IA Ajudar
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                name="customNotes"
                value={formData.customNotes}
                onChange={handleChange}
                rows={3}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Adicione observações específicas para este cliente"
              />
            </div>

            {/* Footer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-lime-400">Informações de Contato</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleChange}
                  placeholder="Nome da sua marca"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                <Input
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="Email"
                  type="email"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                <Input
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="Telefone"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                <Input
                  name="contactInstagram"
                  value={formData.contactInstagram}
                  onChange={handleChange}
                  placeholder="@instagram"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                <Input
                  name="contactWhatsApp"
                  value={formData.contactWhatsApp}
                  onChange={handleChange}
                  placeholder="WhatsApp (com DDD)"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <Textarea
                name="brandDescription"
                value={formData.brandDescription}
                onChange={handleChange}
                rows={2}
                placeholder="Breve descrição da sua marca"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-lime-400 hover:bg-lime-500 text-black font-semibold"
              >
                {saving ? 'Salvando...' : proposal ? 'Atualizar' : 'Criar Proposta'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}