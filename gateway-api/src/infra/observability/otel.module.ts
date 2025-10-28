import { OnModuleInit } from '@nestjs/common';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeSDK } from '@opentelemetry/sdk-node';

export class OtelModule implements OnModuleInit {
  onModuleInit() {
    if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) return;
    const sdk = new NodeSDK({
      traceExporter: new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      }),
    });
    sdk.start();
  }
}
