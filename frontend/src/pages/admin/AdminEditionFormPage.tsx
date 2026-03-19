import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button, Input, Loading } from '../../components/ui';
import { getErrorMessage } from '../../utils/errorMessages';
import toast from 'react-hot-toast';
import type { Edition, ApiResponse } from '../../types';

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  margin-bottom: 1.5rem;
  span { color: ${({ theme }) => theme.colors.primary}; }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 500px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

interface EditionFormData {
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

export function AdminEditionFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: edition, isLoading } = useQuery({
    queryKey: ['admin-edition', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Edition>>(`/admin/editions/${id}`);
      return data.data;
    },
    enabled: isEditing,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditionFormData>();

  useEffect(() => {
    if (edition) {
      reset({
        name: edition.name,
        startDate: edition.startDate.split('T')[0],
        endDate: edition.endDate.split('T')[0],
        status: edition.status,
      });
    }
  }, [edition, reset]);

  const onSubmit = async (formData: EditionFormData) => {
    try {
      setLoading(true);
      if (isEditing) {
        await api.put(`/admin/editions/${id}`, formData);
        toast.success('Edição atualizada!');
      } else {
        await api.post('/admin/editions', formData);
        toast.success('Edição criada!');
      }
      queryClient.invalidateQueries({ queryKey: ['admin-editions'] });
      navigate('/admin/edicoes');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (isEditing && isLoading) return <Loading />;

  return (
    <>
      <PageTitle>
        {isEditing ? 'Editar' : 'Nova'} <span>edição</span>
      </PageTitle>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Nome da edição"
          placeholder="Ex: Edição Março-Maio 2026"
          error={errors.name?.message}
          {...register('name', { required: 'Nome obrigatório' })}
        />
        <Row>
          <Input
            label="Data de início"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate', { required: 'Data obrigatória' })}
          />
          <Input
            label="Data de fim"
            type="date"
            error={errors.endDate?.message}
            {...register('endDate', { required: 'Data obrigatória' })}
          />
        </Row>
        {isEditing && (
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }}>
              Status
            </label>
            <select
              {...register('status')}
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                border: '2px solid #e5ddd4', fontSize: '1rem', background: '#fff',
              }}
            >
              <option value="DRAFT">Rascunho</option>
              <option value="ACTIVE">Ativa</option>
              <option value="FINISHED">Encerrada</option>
            </select>
          </div>
        )}
        <ButtonRow>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar edição'}
          </Button>
          <Button $variant="ghost" type="button" onClick={() => navigate('/admin/edicoes')}>
            Cancelar
          </Button>
        </ButtonRow>
      </Form>
    </>
  );
}
