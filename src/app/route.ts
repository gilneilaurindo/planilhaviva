import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transaction, sheetId } = body;

    // Configuração de autenticação com o Google Cloud (Service Account)
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Salva a nova linha na aba 'Fluxo' da planilha
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId || process.env.DEFAULT_SHEET_ID,
      range: 'Fluxo!A:E', // Colunas: Data, Descrição, Categoria, Tipo, Valor
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [
            transaction.date,
            transaction.description,
            transaction.category,
            transaction.type,
            transaction.amount
          ],
        ],
      },
    });

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({ error: 'Falha ao salvar na planilha' }, { status: 500 });
  }
}
