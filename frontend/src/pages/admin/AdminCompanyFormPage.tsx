import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button, Input, Card, Loading, Select } from '../../components/ui';
import { COMPANY_CATEGORIES } from '../../constants/categories';
import { getErrorMessage } from '../../utils/errorMessages';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, Image as ImageIcon, Upload } from 'lucide-react';
import type { Company, ApiResponse } from '../../types';

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  margin-bottom: 1.5rem;
  span { color: ${({ theme }) => theme.colors.primary}; }
`;

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  grid-column: 1 / 3;
`;

const Right = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  grid-column: 3 / 4;
  margin-left: 4rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    width: 100%;
    grid-column: 1 / -1;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const ImagePreview = styled.div<{ $wide?: boolean }>`
  width: ${({ $wide }) => $wide ? '100%' : '80px'};
  height: 80px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border: 2px dashed ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }

  img { width: 100%; height: 100%; object-fit: cover; }
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LogoInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const LogoLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const LogoHint = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const HiddenInput = styled.input`
  display: none;
`;

const QrSection = styled(Card)`
  max-width: 600px;
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
`;

const QrTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-align: center;
  span { color: ${({ theme }) => theme.colors.primary}; }
`;

const QrContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 2px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;

const QrCompanyName = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.dark};
  text-align: center;
`;

const QrBrand = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const QrActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const PrintableArea = styled.div`
  @media print {
    position: fixed;
    inset: 0;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }
`;

interface CompanyFormData {
  name: string;
  description: string;
  category: string;
  address: string;
  city: string;
  phone: string;
  instagram: string;
  logoUrl: string;
  coverUrl: string;
  benefitDescription: string;
  benefitRules: string;
}

export function AdminCompanyFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { data: company, isLoading } = useQuery({
    queryKey: ['admin-company', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Company>>(`/admin/companies/${id}`);
      return data.data;
    },
    enabled: isEditing,
  });

  const { data: qrData } = useQuery({
    queryKey: ['admin-company-qr', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ qrToken: string; companyName: string }>>(`/admin/companies/${id}/qr-token`);
      return data.data;
    },
    enabled: isEditing,
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CompanyFormData>();

  useEffect(() => {
    if (company) {
      reset({
        name: company.name,
        description: company.description ?? '',
        category: company.category ?? '',
        address: company.address ?? '',
        city: company.city ?? '',
        phone: company.phone ?? '',
        instagram: company.instagram ?? '',
        logoUrl: company.logoUrl ?? '',
        coverUrl: company.coverUrl ?? '',
        benefitDescription: company.benefitDescription ?? '',
        benefitRules: company.benefitRules ?? '',
      });
      if (company.logoUrl) setLogoPreview(company.logoUrl);
      if (company.coverUrl) setCoverPreview(company.coverUrl);
    }
  }, [company, reset]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local
    setLogoPreview(URL.createObjectURL(file));

    // Upload
    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('logo', file);
      const { data } = await api.post<ApiResponse<{ url: string }>>('/admin/upload/logo', formData);
      setValue('logoUrl', data.data.url);
      toast.success('Logo enviada!');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setLogoPreview(null);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverPreview(URL.createObjectURL(file));

    try {
      setUploadingCover(true);
      const formData = new FormData();
      formData.append('cover', file);
      const { data } = await api.post<ApiResponse<{ url: string }>>('/admin/upload/cover', formData);
      setValue('coverUrl', data.data.url);
      toast.success('Capa enviada!');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setCoverPreview(null);
    } finally {
      setUploadingCover(false);
    }
  };

  const onSubmit = async (formData: CompanyFormData) => {
    try {
      setLoading(true);
      if (isEditing) {
        await api.put(`/admin/companies/${id}`, formData);
        toast.success('Empresa atualizada!');
        queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
        navigate('/admin/empresas');
      } else {
        const { data } = await api.post<ApiResponse<Company>>('/admin/companies', formData);
        toast.success('Empresa criada! Veja o QR Code abaixo.');
        queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
        navigate(`/admin/empresas/${data.data.id}/editar`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (isEditing && isLoading) return <Loading />;

  // A5 dimensions in pixels at 150 DPI: 874 x 1240
  const A5_WIDTH = 874;
  const A5_HEIGHT = 1240;
  const QR_SIZE = 320;
  const TEMPLATE_SRC = '/qr-template.png';

  const drawQrOnCanvas = (ctx: CanvasRenderingContext2D, svg: SVGElement): Promise<void> => {
    return new Promise((resolve) => {
      const svgData = new XMLSerializer().serializeToString(svg);
      const qrImg = new Image();
      qrImg.onload = () => {
        const x = (A5_WIDTH - QR_SIZE) / 2;
        const y = (A5_HEIGHT - QR_SIZE) / 2;

        // Fundo branco atrás do QR para legibilidade
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 16, y - 16, QR_SIZE + 32, QR_SIZE + 32);

        ctx.drawImage(qrImg, x, y, QR_SIZE, QR_SIZE);
        resolve();
      };
      qrImg.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    });
  };

  const generateQrCanvas = (): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      const svg = qrRef.current?.querySelector('svg');
      if (!svg) return reject('SVG not found');

      const canvas = document.createElement('canvas');
      canvas.width = A5_WIDTH;
      canvas.height = A5_HEIGHT;
      const ctx = canvas.getContext('2d')!;

      // Carregar template de fundo
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.onload = async () => {
        ctx.drawImage(bgImg, 0, 0, A5_WIDTH, A5_HEIGHT);
        await drawQrOnCanvas(ctx, svg);
        resolve(canvas);
      };
      bgImg.onerror = async () => {
        // Sem template — fundo branco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, A5_WIDTH, A5_HEIGHT);
        await drawQrOnCanvas(ctx, svg);
        resolve(canvas);
      };
      bgImg.src = TEMPLATE_SRC;
    });
  };

  const handlePrintQr = async () => {
    try {
      const canvas = await generateQrCanvas();
      const dataUrl = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      printWindow.document.write(`
        <html>
        <head>
          <title>QR Code - ${qrData?.companyName}</title>
          <style>
            @page { size: 148mm 210mm; margin: 0; }
            body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; }
            img { width: 148mm; height: 210mm; display: block; }
          </style>
        </head>
        <body><img src="${dataUrl}" /></body>
        </html>
      `);
      printWindow.document.close();
      printWindow.onload = () => { printWindow.print(); printWindow.close(); };
    } catch {
      toast.error('Erro ao gerar impressão.');
    }
  };

  const handleDownloadQr = async () => {
    try {
      const canvas = await generateQrCanvas();
      const a = document.createElement('a');
      a.download = `qrcode-${qrData?.companyName?.replace(/\s+/g, '-').toLowerCase()}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch {
      toast.error('Erro ao baixar imagem.');
    }
  };

  return (
    <>
      <Left>
        <PageTitle>
        {isEditing ? 'Editar' : 'Nova'} <span>empresa</span>
      </PageTitle>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Nome da empresa"
          placeholder="Ex: Restaurante Sabor"
          error={errors.name?.message}
          {...register('name', { required: 'Nome obrigatório' })}
        />
        <Input
          label="Descrição"
          placeholder="Breve descrição"
          {...register('description')}
        />
        <LogoRow>
          <ImagePreview onClick={() => logoInputRef.current?.click()}>
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" />
            ) : (
              <ImageIcon size={28} color="#ccc" />
            )}
          </ImagePreview>
          <LogoInfo>
            <LogoLabel>{uploadingLogo ? 'Enviando...' : 'Logo da empresa'}</LogoLabel>
            <LogoHint>JPG, PNG ou WebP — máx. 2MB</LogoHint>
            <Button type="button" $variant="outline" $size="sm" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo} style={{ marginTop: '0.25rem', width: 'fit-content' }}>
              <Upload size={14} /> {logoPreview ? 'Trocar logo' : 'Escolher arquivo'}
            </Button>
          </LogoInfo>
          <HiddenInput
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleLogoChange}
          />
          <input type="hidden" {...register('logoUrl')} />
        </LogoRow>
        <div>
          <ImagePreview $wide onClick={() => coverInputRef.current?.click()}>
            {coverPreview ? (
              <img src={coverPreview} alt="Capa" />
            ) : (
              <ImageIcon size={28} color="#ccc" />
            )}
          </ImagePreview>
          <LogoRow style={{ marginTop: '0.5rem' }}>
            <LogoInfo>
              <LogoLabel>{uploadingCover ? 'Enviando...' : 'Imagem de capa'}</LogoLabel>
              <LogoHint>JPG, PNG ou WebP — máx. 5MB</LogoHint>
              <Button type="button" $variant="outline" $size="sm" onClick={() => coverInputRef.current?.click()} disabled={uploadingCover} style={{ marginTop: '0.25rem', width: 'fit-content' }}>
                <Upload size={14} /> {coverPreview ? 'Trocar capa' : 'Escolher arquivo'}
              </Button>
            </LogoInfo>
          </LogoRow>
          <HiddenInput
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleCoverChange}
          />
          <input type="hidden" {...register('coverUrl')} />
        </div>
        <Row>
          <Select
            label="Categoria"
            placeholder="Selecione a categoria"
            options={COMPANY_CATEGORIES}
            {...register('category')}
          />
          <Input
            label="Cidade"
            placeholder="Três Lagoas"
            {...register('city')}
          />
        </Row>
        <Input
          label="Endereço"
          placeholder="Rua, número"
          {...register('address')}
        />
        <Row>
          <Input
            label="Telefone"
            placeholder="(67) 99999-9999"
            {...register('phone')}
          />
          <Input
            label="Instagram"
            placeholder="@empresa"
            {...register('instagram')}
          />
        </Row>
        <Input
          label="Descrição do benefício"
          placeholder="Ex: Compre 1 pizza e ganhe outra"
          error={errors.benefitDescription?.message}
          {...register('benefitDescription', { required: 'Benefício obrigatório' })}
        />
        <Input
          label="Regras do benefício"
          placeholder="Ex: Válido de segunda a quinta"
          {...register('benefitRules')}
        />
        <ButtonRow>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar empresa'}
          </Button>
          <Button $variant="ghost" type="button" onClick={() => navigate('/admin/empresas')}>
            Cancelar
          </Button>
        </ButtonRow>
      </Form>
      </Left>

      <Right>

      {isEditing && qrData?.qrToken && (
        <QrSection variant="bordered">
          <QrTitle>QR Code da <span>empresa</span></QrTitle>
          <PrintableArea ref={qrRef}>
            <QrContainer>
              <QRCodeSVG
                value={qrData.qrToken}
                size={220}
                level="H"
                marginSize={2}
              />
              <QrCompanyName>{qrData.companyName}</QrCompanyName>
              <QrBrand>TL EM PAR</QrBrand>
            </QrContainer>
          </PrintableArea>
          <QrActions>
            <Button $variant="outline" $size="sm" onClick={handlePrintQr}>
              <Printer size={16} /> Imprimir
            </Button>
            <Button $variant="outline" $size="sm" onClick={handleDownloadQr}>
              <Download size={16} /> Baixar PNG
            </Button>
          </QrActions>
        </QrSection>
      )}
      </Right>
    </>
  );
}
