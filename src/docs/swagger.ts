import { readFileSync } from 'fs';
import path from 'path';
import YAML from 'yaml';

export function serveOpenApi() {
  const file = path.join(process.cwd(), 'openapi.yml');
  const spec = YAML.parse(readFileSync(file, 'utf8'));
  return { spec };
}

