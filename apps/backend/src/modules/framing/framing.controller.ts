import type { RequestHandler } from 'express';
import { z } from 'zod';
import { WorrySchema } from '@shared/schemas/api';
import { generateFraming } from '@modules/framing/framing.service';

export const generateFramingController: RequestHandler = async (req, res) => {
  const body = z.object({ worry: WorrySchema }).parse(req.body);
  const anonId = String(res.locals.anonId || '').trim();
  const { framing, contextId } = await generateFraming(body.worry, anonId);
  return res.status(200).json({ isSuccess: true, data: { framing, contextId } });
};
