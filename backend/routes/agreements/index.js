/**
 * Agreement Routes Index
 * Aggregates all agreement sub-routes into a single router
 */
import express from 'express';

// Import sub-routers
import coreRouter from './core.js';
import signingRouter from './signing.js';
import deliverablesRouter from './deliverables.js';
import pdfRouter from './pdf.js';
import terminationRouter from './termination.js';
import paymentsRouter from './payments.js';
import razorpayRouter from './razorpay.js';

const router = express.Router();

// Mount core routes (POST /, GET /:id, GET /deal/:dealId, GET /my/club, GET /my/sponsor)
router.use('/', coreRouter);

// Mount signing routes (PUT /:id/sign)
router.use('/', signingRouter);

// Mount deliverables routes (PUT /:id/deliverables/:idx, POST /:id/deliverables/:idx/evidence)
router.use('/', deliverablesRouter);

// Mount PDF routes (GET /:id/pdf)
router.use('/', pdfRouter);

// Mount termination routes (PUT /:id/terminate)
router.use('/', terminationRouter);

// Mount payment routes (GET /:id/payments, POST /:id/payments/request, etc.)
router.use('/', paymentsRouter);

// Mount Razorpay routes (POST /:id/payments/:txId/create-order, etc.)
router.use('/', razorpayRouter);

export default router;
