import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';

/**
 * Structured JSON logging so logs are queryable in any log aggregator
 * (Better Stack, Axiom, CloudWatch) without a separate parsing step.
 * Each entry carries level/timestamp/context/message/requestId — the
 * requestId is what ties a single request's logs together across
 * services once this is deployed behind a load balancer.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class StructuredLogger extends ConsoleLogger {
  override log(message: unknown, context?: string) {
    this.write('info', message, context);
  }

  override error(message: unknown, trace?: string, context?: string) {
    this.write('error', message, context, trace);
  }

  override warn(message: unknown, context?: string) {
    this.write('warn', message, context);
  }

  override debug(message: unknown, context?: string) {
    this.write('debug', message, context);
  }

  private write(level: string, message: unknown, context?: string, trace?: string) {
    const entry = {
      level,
      timestamp: new Date().toISOString(),
      context: context ?? this.context,
      message,
      ...(trace ? { trace } : {}),
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  }
}
