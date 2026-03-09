
import type { APIRoute } from 'astro';
import { MedicalHistoryService } from '../../../../../lib/medical-history-service';
import { requireAuth, hasRole } from '../../../../../lib/auth';

export const GET: APIRoute = async ({ params, cookies }) => {
  const user = requireAuth(cookies);
  if (!hasRole(user, 'doctor') && !hasRole(user, 'admin')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response('Missing ID', { status: 400 });
  }

  try {
    const pdfBuffer = await MedicalHistoryService.renderPDF(parseInt(id));
    
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="historia-medica-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response('Error generating PDF', { status: 500 });
  }
};
