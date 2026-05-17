import { createClient } from "@libsql/client";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const payload = req.body;
  console.log('[webhook]', JSON.stringify(payload));

  const orderNsu = payload.order_nsu;
  if (!orderNsu) return res.status(400).json({ error: 'order_nsu ausente' });

  const isApproved = payload.status === 'approved' || payload.status === 'paid'
    || payload.receipt_url || (payload.paid_amount && payload.paid_amount > 0);

  if (!isApproved) return res.status(200).json({ ok: true, msg: 'ignorado' });

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
  });

  await client.execute({
    sql: `UPDATE monjaro_pedidos SET payment_status='approved' WHERE order_nsu=? AND payment_status!='approved'`,
    args: [orderNsu]
  });

  return res.status(200).json({ success: true });
}
