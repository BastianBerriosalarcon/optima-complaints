import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function GET(request: Request) {
  // Ejemplo de un log estructurado
  logger.info({ 
    source: 'api/health', 
    message: 'Health check endpoint was called.' 
  });

  return NextResponse.json({ status: 'ok' });
}
