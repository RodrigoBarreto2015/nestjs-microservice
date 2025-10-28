/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Ajv from 'ajv';

export class SchemaValidator {
  private ajv = new Ajv({ removeAdditional: true, coerceTypes: true });

  compile(schemaStr?: string) {
    if (!schemaStr) return null;
    const schema = JSON.parse(schemaStr);
    return this.ajv.compile(schema);
  }
}
