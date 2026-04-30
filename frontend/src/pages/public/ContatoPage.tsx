import styled from 'styled-components';
import { useState, type FormEvent } from 'react';
import { MessageCircle, Instagram, Mail, Phone, Send, CheckCircle } from 'lucide-react';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { fadeInUp } from '../../styles/animations';

/* ── Hero ───────────────────────────────────────────── */

const HeroOuter = styled.section`
  background: ${({ theme }) => theme.colors.background};
  padding: 4rem 1.5rem 3rem;
`;

const HeroInner = styled.div`
  max-width: 1600px;
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
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  color: ${({ theme }) => theme.colors.secondary};
  line-height: 1.1;
  animation: ${fadeInUp} 0.5s ease-out 0.1s both;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 480px;
  line-height: 1.65;
  animation: ${fadeInUp} 0.5s ease-out 0.15s both;
`;

/* ── Content ────────────────────────────────────────── */

const ContentOuter = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: 0 1.5rem 5rem;
`;

const ContentInner = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 3rem;
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

/* ── Quick contacts ─────────────────────────────────── */

const ContactsCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const ContactsTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 0.5rem;
`;

const ContactCard = styled.a`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 1.25rem 1.5rem;
  text-decoration: none;
  transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-3px);
    border-color: ${({ theme }) => theme.colors.border};
  }
`;

const ContactIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ContactLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const ContactValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
`;

/* ── Form ───────────────────────────────────────────── */

const FormCol = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 2.5rem;
`;

const FormTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 1.75rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const FormGroupFull = styled(FormGroup)`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0.7rem 0.9rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.background};
  transition: border-color 0.2s;
  outline: none;
  width: 100%;

  &:focus { border-color: ${({ theme }) => theme.colors.secondary}; }
  &::placeholder { color: ${({ theme }) => theme.colors.textLight}; }
`;

const Textarea = styled.textarea`
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0.7rem 0.9rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.background};
  transition: border-color 0.2s;
  outline: none;
  width: 100%;
  resize: vertical;
  min-height: 130px;

  &:focus { border-color: ${({ theme }) => theme.colors.secondary}; }
  &::placeholder { color: ${({ theme }) => theme.colors.textLight}; }
`;

const SubmitBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: 0.9rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  margin-top: 0.5rem;

  &:hover { background: #a06d48; transform: translateY(-2px); }
  &:disabled { opacity: 0.6; cursor: default; transform: none; }
`;

const SuccessBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.secondary};

  h3 { font-size: ${({ theme }) => theme.fontSizes.xl}; font-weight: ${({ theme }) => theme.fontWeights.bold}; }
  p  { font-size: ${({ theme }) => theme.fontSizes.md}; color: ${({ theme }) => theme.colors.textSecondary}; }
`;

/* ── Component ──────────────────────────────────────── */

export function ContatoPage() {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', mensagem: '' });
  const [sent, setSent] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = `Olá! Me chamo *${form.nome}*.\n\n*Email:* ${form.email}\n*Telefone:* ${form.telefone || 'Não informado'}\n\n*Mensagem:*\n${form.mensagem}`;
    const url = `https://wa.me/5567981151525?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setSent(true);
  }

  return (
    <>
      <HeroOuter>
        <HeroInner>
          <Badge>Fale Conosco</Badge>
          <Title>Entre em contato<br />com a gente</Title>
          <Subtitle>
            Tem dúvidas, sugestões ou quer ser nosso parceiro? Escolha o canal que preferir e fale com a equipe TL em Par.
          </Subtitle>
        </HeroInner>
      </HeroOuter>

      <ContentOuter>
        <ContentInner>
          <ContactsCol>
            <ContactsTitle>Contatos rápidos</ContactsTitle>

            <ContactCard href="https://wa.me/5567981151525" target="_blank" rel="noopener noreferrer">
              <ContactIcon $color="#25D366">
                <MessageCircle size={22} />
              </ContactIcon>
              <ContactInfo>
                <ContactLabel>WhatsApp</ContactLabel>
                <ContactValue>(67) 98115-1525</ContactValue>
              </ContactInfo>
            </ContactCard>

            <ContactCard href="https://instagram.com/tl.em.par" target="_blank" rel="noopener noreferrer">
              <ContactIcon $color="#E1306C">
                <Instagram size={22} />
              </ContactIcon>
              <ContactInfo>
                <ContactLabel>Instagram</ContactLabel>
                <ContactValue>@tl.em.par</ContactValue>
              </ContactInfo>
            </ContactCard>

            <ContactCard href="mailto:contato@tlempar.com.br">
              <ContactIcon $color="#bc7f59">
                <Mail size={22} />
              </ContactIcon>
              <ContactInfo>
                <ContactLabel>E-mail</ContactLabel>
                <ContactValue>contato@tlempar.com.br</ContactValue>
              </ContactInfo>
            </ContactCard>
          </ContactsCol>

          <FormCol>
            {sent ? (
              <SuccessBox>
                <CheckCircle size={56} color="#22c55e" />
                <h3>Mensagem enviada!</h3>
                <p>Você será redirecionado para o WhatsApp. Responderemos em breve.</p>
              </SuccessBox>
            ) : (
              <>
                <FormTitle>Envie uma mensagem</FormTitle>
                <form onSubmit={handleSubmit}>
                  <FormGrid>
                    <FormGroup>
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        name="nome"
                        placeholder="Seu nome"
                        value={form.nome}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        name="telefone"
                        placeholder="(67) 9 9999-9999"
                        value={form.telefone}
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </FormGrid>

                  <FormGroupFull>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </FormGroupFull>

                  <FormGroupFull>
                    <Label htmlFor="mensagem">Mensagem</Label>
                    <Textarea
                      id="mensagem"
                      name="mensagem"
                      placeholder="Escreva sua mensagem..."
                      value={form.mensagem}
                      onChange={handleChange}
                      required
                    />
                  </FormGroupFull>

                  <SubmitBtn type="submit">
                    <Send size={18} />
                    Enviar pelo WhatsApp
                  </SubmitBtn>
                </form>
              </>
            )}
          </FormCol>
        </ContentInner>
      </ContentOuter>

      <PublicFooter />
    </>
  );
}
