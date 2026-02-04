import { generateAnalysisResult } from '@modules/analysis/analysis.service';
import {
  AxisSchema,
  LabelsSchema,
  QuestionSchema,
  ResponseSchema,
  WorrySchema,
} from '@shared/schemas/api';
import type { RequestHandler } from 'express';
import { z } from 'zod';

export const analyzeController: RequestHandler = async (req, res) => {
  const body = z
    .object({
      worry: WorrySchema,
      questions: z.array(QuestionSchema),
      responses: z.array(ResponseSchema),
      labels: LabelsSchema,
      axis: AxisSchema,
    })
    .parse(req.body);

  const result = await generateAnalysisResult({
    worry: body.worry,
    questions: body.questions,
    responses: body.responses,
    labels: body.labels,
    axis: body.axis,
  });
  return res.status(200).json({ isSuccess: true, data: { result } });
};
