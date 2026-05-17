import { createClient } from "@libsql/client";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) return res.status(500).json({ error: 'DB não configurado' });

  const client = createClient({ url, authToken });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS monjaro_pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_nsu TEXT UNIQUE NOT NULL,
      nome TEXT,
      email TEXT NOT NULL,
      telefone TEXT,
      cpf TEXT,
      imc REAL,
      imc_classe TEXT,
      quiz_data TEXT,
      payment_status TEXT DEFAULT 'pending',
      criado_em TEXT DEFAULT (datetime('now'))
    )
  `);

  try {
    const { name, email, phone, cpf, imc, imcClass, quizData } = req.body;
    if (!email) return res.status(400).json({ error: 'Email obrigatório' });

    const orderNsu = 'MNJ-' + Date.now() + Math.floor(Math.random() * 1000);
    const tag = process.env.INFINITEPAY_TAG || 'miguel-zacca';
    const host = req.headers.host || 'localhost:3000';
    const proto = host.includes('localhost') ? 'http' : 'https';

    const ipRes = await fetch('https://api.checkout.infinitepay.io/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle: tag,
        redirect_url: `${proto}://${host}/sucesso?nsu=${orderNsu}`,
        webhook_url: `${proto}://${host}/api/webhook`,
        order_nsu: orderNsu,
        items: [{ quantity: 1, price: 3700, description: 'Monjaro de Pobre — Receita Secreta' }],
        customer: {
          name: name || 'Cliente',
          email,
          phone_number: phone ? '+55' + phone.replace(/\D/g, '') : undefined
        }
      })
    });

    if (!ipRes.ok) {
      const err = await ipRes.text();
      console.error('InfinitePay error:', err);
      return res.status(400).json({ error: 'Erro ao gerar pagamento' });
    }

    const ipData = await ipRes.json();
    if (!ipData.url) return res.status(400).json({ error: 'URL de pagamento inválida' });

    await client.execute({
      sql: `INSERT INTO monjaro_pedidos (order_nsu, nome, email, telefone, cpf, imc, imc_classe, quiz_data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [orderNsu, name || null, email, phone || null, cpf || null,
             imc || null, imcClass || null, JSON.stringify(quizData || {})]
    });

    return res.status(201).json({ success: true, paymentUrl: ipData.url, orderNsu });
  } catch (err) {
    console.error('[checkout]', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
