import express, { Router } from 'express';
import { createOrder,getOrders } from '../controllers/orderController.js';
import { stripeWebhooksBook } from '../controllers/webhooks.js';

const router = Router();


router.get('/', getOrders);

router.post('/', createOrder);
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),stripeWebhooksBook);

export default router;