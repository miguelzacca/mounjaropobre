import { createClient } from "@libsql/client";

export default async function handler(req, res) {
  const { nsu } = req.query;
  if (!nsu) return res.status(400).json({ error: 'nsu obrigatório' });

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
  });

  const result = await client.execute({
    sql: 'SELECT payment_status FROM mounjaro_pedidos WHERE order_nsu=?',
    args: [nsu]
  });

  if (!result.rows.length) return res.status(404).json({ error: 'Pedido não encontrado' });
  if (result.rows[0].payment_status !== 'approved') {
    return res.status(403).json({ error: 'Pagamento não confirmado' });
  }

  const pdfUrl = process.env.PDF_URL;
  if (!pdfUrl) return res.status(500).json({ error: 'PDF não configurado' });

  return res.redirect(302, pdfUrl);
}
