import { PrismaClient } from '../src/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tlempar?schema=public' });
const prisma = new PrismaClient({ adapter });

function generateSecurePassword(): string {
  return crypto.randomBytes(16).toString('base64url');
}

async function main() {
  console.log('🌱 Seeding database...');

  const adminPwd = process.env.ADMIN_PASSWORD || generateSecurePassword();
  const userPwd = process.env.TEST_USER_PASSWORD || generateSecurePassword();

  // Criar admin
  const adminPassword = await bcrypt.hash(adminPwd, 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tlempar.com.br' },
    update: {},
    create: {
      name: 'Admin TL',
      email: 'admin@tlempar.com.br',
      password: adminPassword,
      role: 'ADMIN',
      phone: '11999999999',
    },
  });
  console.log(`✅ Admin criado: ${admin.email}`);

  // Criar usuário de teste
  const userPassword = await bcrypt.hash(userPwd, 12);
  const user = await prisma.user.upsert({
    where: { email: 'usuario@teste.com' },
    update: {},
    create: {
      name: 'Usuário Teste',
      email: 'usuario@teste.com',
      password: userPassword,
      role: 'USER',
      phone: '11988887777',
      cpf: '12345678900',
    },
  });
  console.log(`✅ Usuário criado: ${user.email}`);

  // Criar assinatura de teste para o usuário
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date('2026-03-01'),
      currentPeriodEnd: new Date('2026-05-31'),
    },
  });
  console.log('✅ Assinatura de teste criada');

  // Criar edição
  const edition = await prisma.edition.create({
    data: {
      name: 'Edição Março-Maio 2026',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-05-31'),
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Edição criada: ${edition.name}`);

  // Criar empresas
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'Restaurante Sabor Italiano',
        description: 'O melhor da culinária italiana na cidade.',
        category: 'RESTAURANT',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        phone: '11999990001',
        instagram: '@saboritaliano',
        benefitDescription: 'Compre 1 pizza e ganhe outra',
        benefitRules: 'Válido de segunda a quinta. Pizza de até R$ 60.',
        status: 'ACTIVE',
      },
    }),
    prisma.company.create({
      data: {
        name: 'Hamburgueria The Burger',
        description: 'Hambúrgueres artesanais com ingredientes selecionados.',
        category: 'HAMBURGUERIA',
        address: 'Av. Paulista, 456',
        city: 'São Paulo',
        phone: '11999990002',
        instagram: '@theburger',
        benefitDescription: 'Compre 1 burger e ganhe outro',
        benefitRules: 'Válido todos os dias. Burgers do cardápio regular.',
        status: 'ACTIVE',
      },
    }),
    prisma.company.create({
      data: {
        name: 'Sushi Kawa',
        description: 'Culinária japonesa tradicional e contemporânea.',
        category: 'JAPONÊS',
        address: 'Rua Liberdade, 789',
        city: 'São Paulo',
        phone: '11999990003',
        instagram: '@sushikawa',
        benefitDescription: 'Compre 1 combinado e ganhe outro',
        benefitRules: 'Válido de terça a sábado. Combinados de até 20 peças.',
        status: 'ACTIVE',
      },
    }),
    prisma.company.create({
      data: {
        name: 'Café Aroma',
        description: 'Cafés especiais e doces artesanais.',
        category: 'CAFÉ',
        address: 'Rua Augusta, 321',
        city: 'São Paulo',
        phone: '11999990004',
        instagram: '@cafearoma',
        benefitDescription: 'Compre 1 café especial e ganhe outro',
        benefitRules: 'Válido todos os dias. Cafés até R$ 25.',
        status: 'ACTIVE',
      },
    }),
    prisma.company.create({
      data: {
        name: 'Churrascaria Fogo de Chão',
        description: 'Churrascaria premium com rodízio completo.',
        category: 'CHURRASCARIA',
        address: 'Av. Brasil, 555',
        city: 'São Paulo',
        phone: '11999990005',
        benefitDescription: 'Compre 1 rodízio e ganhe outro',
        benefitRules: 'Válido de segunda a quarta no almoço.',
        status: 'INACTIVE',
      },
    }),
  ]);

  console.log(`✅ ${companies.length} empresas criadas`);

  // Vincular empresas ativas à edição
  const activeCompanies = companies.filter((c) => c.status === 'ACTIVE');
  await prisma.companyEdition.createMany({
    data: activeCompanies.map((c) => ({
      companyId: c.id,
      editionId: edition.id,
    })),
  });
  console.log(`✅ ${activeCompanies.length} empresas vinculadas à edição`);

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\nCredenciais:');
  console.log(`  Admin: admin@tlempar.com.br / ${adminPwd}`);
  console.log(`  User:  usuario@teste.com / ${userPwd}`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log('\n⚠️  Senhas geradas aleatoriamente. Defina ADMIN_PASSWORD e TEST_USER_PASSWORD para usar senhas fixas.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
