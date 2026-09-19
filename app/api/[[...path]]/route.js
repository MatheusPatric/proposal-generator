import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const uri = process.env.MONGO_URL;
const dbName = process.env.DB_NAME || 'proposal_generator';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!uri) {
    const error = new Error('MONGO_URL não configurada. Defina a variável de ambiente (veja .env.example).');
    error.statusCode = 503;
    throw error;
  }

  const client = await MongoClient.connect(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });

  const db = client.db(dbName);
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Valida o payload de criação/edição de proposta; retorna a lista de problemas.
function validateProposal(body) {
  const issues = [];
  if (!body || typeof body !== 'object') {
    return ['Corpo da requisição inválido'];
  }
  if (!body.clientName?.trim()) issues.push('clientName é obrigatório');
  if (!body.companyName?.trim()) issues.push('companyName é obrigatório');
  if (!body.title?.trim()) issues.push('title é obrigatório');
  if (body.plans !== undefined) {
    if (!Array.isArray(body.plans)) {
      issues.push('plans deve ser uma lista');
    } else {
      body.plans.forEach((plan, i) => {
        if (!plan || typeof plan !== 'object' || !plan.name?.trim()) {
          issues.push(`plans[${i}].name é obrigatório`);
        }
      });
    }
  }
  return issues;
}

function errorStatus(error) {
  return error.statusCode || 500;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    const { pathname } = new URL(request.url);
    const path = pathname.replace('/api/', '');

    if (path === 'proposals') {
      const proposals = await db.collection('proposals').find({}).sort({ createdAt: -1 }).toArray();
      return NextResponse.json({ proposals }, { headers: corsHeaders() });
    }

    if (path.startsWith('proposals/')) {
      const id = path.split('/')[1];
      const proposal = await db.collection('proposals').findOne({ id });
      if (!proposal) {
        return NextResponse.json({ error: 'Proposal not found' }, { status: 404, headers: corsHeaders() });
      }
      return NextResponse.json({ proposal }, { headers: corsHeaders() });
    }

    return NextResponse.json({ error: 'Route not found' }, { status: 404, headers: corsHeaders() });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: errorStatus(error), headers: corsHeaders() });
  }
}

export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const { pathname } = new URL(request.url);
    const path = pathname.replace('/api/', '');
    const body = await request.json();

    if (path === 'proposals') {
      const issues = validateProposal(body);
      if (issues.length > 0) {
        return NextResponse.json(
          { error: `Dados inválidos: ${issues.join('; ')}` },
          { status: 400, headers: corsHeaders() }
        );
      }
      const proposal = {
        id: uuidv4(),
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.collection('proposals').insertOne(proposal);
      return NextResponse.json({ proposal }, { status: 201, headers: corsHeaders() });
    }

    if (path === 'upload-image') {
      return NextResponse.json({ imageUrl: body.imageData }, { headers: corsHeaders() });
    }

    if (path === 'ai-generate') {
      const { fieldType } = body;
      let text = '';
      if (fieldType === 'expectedResults') {
        text = `• Aumento de 30-50% no engajamento orgânico nas primeiras 8 semanas\n• Crescimento de 20-35% na base de seguidores mensalmente\n• Melhoria no posicionamento digital da marca no nicho\n• Maior reconhecimento e autoridade no mercado\n• Conversões aumentadas através de conteúdo estratégico`;
      } else if (fieldType === 'customNotes') {
        text = `Esta proposta foi elaborada considerando as necessidades específicas e o perfil do seu negócio. Todos os serviços são personalizáveis e adaptáveis conforme a evolução da parceria.\n\nNosso compromisso é com resultados reais e mensuráveis. Trabalhamos com transparência total, relatórios mensais e reuniões estratégicas para alinhamento contínuo.\n\nEstamos prontos para iniciar e transformar sua presença digital!`;
      }
      return NextResponse.json({ text }, { headers: corsHeaders() });
    }

    return NextResponse.json({ error: 'Route not found' }, { status: 404, headers: corsHeaders() });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: errorStatus(error), headers: corsHeaders() });
  }
}

export async function PUT(request) {
  try {
    const { db } = await connectToDatabase();
    const { pathname } = new URL(request.url);
    const path = pathname.replace('/api/', '');
    const body = await request.json();

    if (path.startsWith('proposals/')) {
      const id = path.split('/')[1];
      const issues = validateProposal(body);
      if (issues.length > 0) {
        return NextResponse.json(
          { error: `Dados inválidos: ${issues.join('; ')}` },
          { status: 400, headers: corsHeaders() }
        );
      }
      const updateData = { ...body, updatedAt: new Date().toISOString() };
      delete updateData.id;
      delete updateData.createdAt;

      const result = await db.collection('proposals').updateOne({ id }, { $set: updateData });
      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Proposal not found' }, { status: 404, headers: corsHeaders() });
      }

      const proposal = await db.collection('proposals').findOne({ id });
      return NextResponse.json({ proposal }, { headers: corsHeaders() });
    }

    return NextResponse.json({ error: 'Route not found' }, { status: 404, headers: corsHeaders() });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: error.message }, { status: errorStatus(error), headers: corsHeaders() });
  }
}

export async function DELETE(request) {
  try {
    const { db } = await connectToDatabase();
    const { pathname } = new URL(request.url);
    const path = pathname.replace('/api/', '');

    if (path.startsWith('proposals/')) {
      const id = path.split('/')[1];
      const result = await db.collection('proposals').deleteOne({ id });
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'Proposal not found' }, { status: 404, headers: corsHeaders() });
      }
      return NextResponse.json({ message: 'Proposal deleted successfully' }, { headers: corsHeaders() });
    }

    return NextResponse.json({ error: 'Route not found' }, { status: 404, headers: corsHeaders() });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: errorStatus(error), headers: corsHeaders() });
  }
}
