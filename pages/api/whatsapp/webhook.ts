import type { NextApiRequest, NextApiResponse } from 'next';
import { WHATSAPP_INTEGRATION_STATUS } from '../../../lib/whatsapp-assistant';

/**
 * Reserved official WhatsApp Business Platform webhook endpoint.
 * Disabled by default: it intentionally does not verify, persist, or send provider traffic
 * until an approved account, webhook verification policy, and secret-manager integration exist.
 */
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  return res.status(503).json({
    enabled: false,
    status: WHATSAPP_INTEGRATION_STATUS,
    message: 'WhatsApp integration is not activated.',
  });
}
