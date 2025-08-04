const express = require('express');
const { google } = require('googleapis');
const app = express();
app.use(express.json());

const SHEET_ID = '1F3cINckMo05QjeuV8NRPMf27C0xzfTYcsdU1WVhgc8g';
const RANGE = 'Sheet1!A1:D44'; // Ajusta según el nombre de tu hoja y rango

async function obtenerMenu() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json', // archivo con tus credenciales
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE
  });

  const filas = res.data.values;
  let textoMenu = '🍽️ *Menú del restaurante:*\n\n';

  filas.forEach(fila => {
    const [categoria, nombre, descripcion, precio] = fila;
    textoMenu += `*${categoria}*: ${nombre} - ${descripcion} ($${precio})\n`;
  });

  return textoMenu;
}

app.post('/webhook', async (req, res) => {
  try {
    const menu = await obtenerMenu();
    res.json({ fulfillmentText: menu });
  } catch (error) {
    console.error(error);
    res.json({ fulfillmentText: 'Lo siento, no pude obtener el menú en este momento.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Webhook escuchando en puerto ${PORT}`));


