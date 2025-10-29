import { RootModule } from './interfaces/root.module';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import FastifyReply from '@fastify/reply-from';
import fastifyCors from '@fastify/cors';

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ProxyService } from '@infra/proxy/proxy.service';
import type { FastifyRequest, FastifyReply as Reply } from 'fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    RootModule,
    new FastifyAdapter({
      logger: false,
    }),
  );

  const fastify = app.getHttpAdapter().getInstance();

  await fastify.register(FastifyReply, {
    undici: {
      bodyTimeout: 30_000,
      headersTimeout: 30_000,
    },
  });

  await fastify.register(fastifyCors, {
    origin: true, // aceita qualquer origem
    credentials: true, // se precisar enviar cookies/autorização
  });

  const proxyService = app.get(ProxyService);

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  for (const method of methods) {
    fastify.route({
      method,
      url: '/*',
      handler: (req: FastifyRequest, reply: Reply) => {
        const url = req.raw.url || '/';

        if (url.startsWith('/admin') || url.startsWith('/metrics')) {
          return reply.callNotFound();
        }

        console.log('[fallback] hit', req.method, req.url);
        return proxyService.forward(req, reply);
      },
    });
  }

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);
  console.log(`[gateway-api] listening on http://${host}:${port}`);
}
bootstrap();
