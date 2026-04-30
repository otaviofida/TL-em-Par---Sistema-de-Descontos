import styled from 'styled-components';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { fadeInUp } from '../../styles/animations';

/* ── Hero ───────────────────────────────────────────── */

const HeroOuter = styled.section`
  background: ${({ theme }) => theme.colors.background};
  padding: 4rem 1.5rem 3rem;
`;

const HeroInner = styled.div`
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Badge = styled.span`
  display: inline-flex;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.dark};
  padding: 0.3rem 0.8rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 0.68rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.07em;
  text-transform: uppercase;
  width: fit-content;
  animation: ${fadeInUp} 0.5s ease-out both;
`;

const Title = styled.h1`
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  color: ${({ theme }) => theme.colors.secondary};
  line-height: 1.1;
  animation: ${fadeInUp} 0.5s ease-out 0.1s both;
`;

const UpdatedAt = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  animation: ${fadeInUp} 0.5s ease-out 0.15s both;
`;

/* ── Content ────────────────────────────────────────── */

const ContentOuter = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: 0 1.5rem 5rem;
`;

const ContentInner = styled.div`
  max-width: 860px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 1.5rem;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  color: ${({ theme }) => theme.colors.secondary};
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
`;

const SubTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-top: 0.5rem;
`;

const Text = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.75;
`;

const List = styled.ul`
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const ListItem = styled.li`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.65;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Th = styled.th`
  text-align: left;
  padding: 0.6rem 0.9rem;
  background: ${({ theme }) => theme.colors.primary}22;
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const Td = styled.td`
  padding: 0.6rem 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  line-height: 1.5;
`;

const ContactLink = styled.a`
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-decoration: none;

  &:hover { text-decoration: underline; }
`;

/* ── Component ──────────────────────────────────────── */

export function PrivacidadePage() {
  return (
    <>
      <HeroOuter>
        <HeroInner>
          <Badge>Legal</Badge>
          <Title>Política de Privacidade</Title>
          <UpdatedAt>Última atualização: abril de 2026</UpdatedAt>
        </HeroInner>
      </HeroOuter>

      <ContentOuter>
        <ContentInner>
          <Card>

            <Section>
              <SectionTitle>1. Identificação</SectionTitle>
              <Text>
                <strong>Razão Social:</strong> Moises Ribas Colmao<br />
                <strong>CNPJ:</strong> 48.076.175/0001-09<br />
                <strong>E-mail de contato:</strong>{' '}
                <ContactLink href="mailto:contato@tlempar.com.br">contato@tlempar.com.br</ContactLink><br />
                <strong>Site:</strong>{' '}
                <ContactLink href="https://tlempar.com.br" target="_blank" rel="noopener noreferrer">tlempar.com.br</ContactLink>
              </Text>
            </Section>

            <Section>
              <SectionTitle>2. Sobre este documento</SectionTitle>
              <Text>
                Esta Política de Privacidade descreve como o <strong>TL em Par</strong> coleta, usa, armazena e protege os dados pessoais dos usuários do aplicativo e do site. Ao utilizar nossos serviços, você concorda com as práticas descritas aqui, em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.
              </Text>
            </Section>

            <Section>
              <SectionTitle>3. Dados que coletamos</SectionTitle>

              <SubTitle>3.1 Dados fornecidos por você</SubTitle>
              <List>
                <ListItem><strong>Nome completo</strong> — para identificação na plataforma</ListItem>
                <ListItem><strong>Endereço de e-mail</strong> — para login e comunicações</ListItem>
                <ListItem><strong>CPF</strong> — para identificação fiscal na assinatura</ListItem>
                <ListItem><strong>Telefone</strong> — opcional, para contato</ListItem>
                <ListItem><strong>Foto de perfil</strong> — opcional, enviada por você</ListItem>
              </List>

              <SubTitle>3.2 Dados de uso</SubTitle>
              <List>
                <ListItem>Histórico de benefícios resgatados (restaurante, data, horário)</ListItem>
                <ListItem>Avaliações de restaurantes</ListItem>
              </List>

              <SubTitle>3.3 Dados de pagamento</SubTitle>
              <Text>
                Os pagamentos são processados exclusivamente pela plataforma <strong>Stripe</strong> (stripe.com). O TL em Par <strong>não armazena</strong> dados de cartão de crédito. Consultamos apenas o status da assinatura (ativa, inativa, cancelada) junto à Stripe.
              </Text>

              <SubTitle>3.4 Dados do dispositivo (somente no aplicativo)</SubTitle>
              <List>
                <ListItem><strong>Token de notificação push (FCM/APNs)</strong> — para envio de alertas sobre benefícios e novos restaurantes</ListItem>
                <ListItem><strong>Câmera</strong> — usada exclusivamente para leitura de QR Code nos restaurantes parceiros; nenhuma imagem é armazenada</ListItem>
              </List>
            </Section>

            <Section>
              <SectionTitle>4. Como usamos os dados</SectionTitle>
              <Table>
                <thead>
                  <tr>
                    <Th>Finalidade</Th>
                    <Th>Base legal (LGPD)</Th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <Td>Autenticação e acesso à conta</Td>
                    <Td>Execução de contrato (art. 7º, V)</Td>
                  </tr>
                  <tr>
                    <Td>Validação de benefícios via QR Code</Td>
                    <Td>Execução de contrato (art. 7º, V)</Td>
                  </tr>
                  <tr>
                    <Td>Envio de notificações push sobre benefícios</Td>
                    <Td>Legítimo interesse / consentimento (art. 7º, II e IX)</Td>
                  </tr>
                  <tr>
                    <Td>Comunicações por e-mail (confirmações, alertas)</Td>
                    <Td>Execução de contrato (art. 7º, V)</Td>
                  </tr>
                  <tr>
                    <Td>Melhoria da plataforma (dados de uso agregados)</Td>
                    <Td>Legítimo interesse (art. 7º, IX)</Td>
                  </tr>
                </tbody>
              </Table>
            </Section>

            <Section>
              <SectionTitle>5. Compartilhamento de dados</SectionTitle>
              <Text>
                Não vendemos nem cedemos seus dados a terceiros para fins comerciais. Compartilhamos apenas com:
              </Text>
              <List>
                <ListItem><strong>Stripe Inc.</strong> — processamento de pagamentos e gestão de assinatura</ListItem>
                <ListItem><strong>Resend</strong> — envio de e-mails transacionais</ListItem>
                <ListItem><strong>Cloudinary</strong> — armazenamento de fotos de perfil</ListItem>
                <ListItem><strong>Google Firebase</strong> — envio de notificações push (Android)</ListItem>
                <ListItem><strong>Apple APNs</strong> — envio de notificações push (iOS)</ListItem>
              </List>
              <Text>
                Todos os fornecedores operam com políticas de privacidade compatíveis com a LGPD e/ou GDPR.
              </Text>
            </Section>

            <Section>
              <SectionTitle>6. Retenção dos dados</SectionTitle>
              <Text>
                Seus dados são mantidos enquanto sua conta estiver ativa. Após o cancelamento da conta, os dados pessoais são excluídos em até <strong>90 dias</strong>, exceto quando houver obrigação legal de retenção (ex: dados fiscais por 5 anos conforme legislação tributária brasileira).
              </Text>
            </Section>

            <Section>
              <SectionTitle>7. Seus direitos (LGPD)</SectionTitle>
              <Text>Você pode, a qualquer momento, solicitar:</Text>
              <List>
                <ListItem><strong>Confirmação</strong> da existência de tratamento dos seus dados</ListItem>
                <ListItem><strong>Acesso</strong> aos dados que temos sobre você</ListItem>
                <ListItem><strong>Correção</strong> de dados incompletos ou desatualizados</ListItem>
                <ListItem><strong>Eliminação</strong> dos seus dados</ListItem>
                <ListItem><strong>Portabilidade</strong> dos seus dados</ListItem>
                <ListItem><strong>Revogação do consentimento</strong></ListItem>
              </List>
              <Text>
                Para exercer qualquer desses direitos, envie um e-mail para{' '}
                <ContactLink href="mailto:contato@tlempar.com.br">contato@tlempar.com.br</ContactLink>.
              </Text>
            </Section>

            <Section>
              <SectionTitle>8. Segurança</SectionTitle>
              <Text>
                Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo:
              </Text>
              <List>
                <ListItem>Comunicações criptografadas via HTTPS/TLS</ListItem>
                <ListItem>Senhas armazenadas com hash bcrypt</ListItem>
                <ListItem>Tokens de acesso JWT com expiração curta (15 minutos)</ListItem>
                <ListItem>Acesso ao banco de dados restrito à infraestrutura interna</ListItem>
              </List>
            </Section>

            <Section>
              <SectionTitle>9. Menores de idade</SectionTitle>
              <Text>
                O TL em Par é destinado a maiores de 18 anos. Não coletamos intencionalmente dados de menores. Se você acredita que um menor forneceu dados à plataforma, entre em contato pelo e-mail acima para exclusão imediata.
              </Text>
            </Section>

            <Section>
              <SectionTitle>10. Alterações nesta política</SectionTitle>
              <Text>
                Podemos atualizar esta Política de Privacidade periodicamente. Em caso de mudanças relevantes, você será notificado por e-mail ou por aviso dentro do aplicativo. O uso continuado após a notificação implica aceitação das alterações.
              </Text>
            </Section>

            <Section>
              <SectionTitle>11. Contato</SectionTitle>
              <Text>
                Dúvidas, solicitações ou reclamações relacionadas à privacidade:<br /><br />
                <strong>E-mail:</strong>{' '}
                <ContactLink href="mailto:contato@tlempar.com.br">contato@tlempar.com.br</ContactLink><br />
                <strong>Site:</strong>{' '}
                <ContactLink href="https://tlempar.com.br" target="_blank" rel="noopener noreferrer">tlempar.com.br</ContactLink>
              </Text>
            </Section>

          </Card>
        </ContentInner>
      </ContentOuter>

      <PublicFooter />
    </>
  );
}
