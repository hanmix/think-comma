import type { RequestHandler } from 'express';
import { z } from 'zod';
import { WorrySchema } from '@shared/schemas/api';
import { generateQuestions } from '@modules/questions/questions.service';

export const generateQuestionsController: RequestHandler = async (req, res) => {
  const body = z.object({ worry: WorrySchema }).parse(req.body);
  const questions = await generateQuestions(body.worry);
  return res.status(200).json({ isSuccess: true, data: { questions } });
};
