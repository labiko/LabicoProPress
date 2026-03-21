/**
 * Brother PT-P710BT Printer Service
 * Utilise Web Serial API pour impression directe via Bluetooth
 *
 * Prerequis: L'imprimante doit etre appairee dans les parametres Bluetooth du systeme
 */

// Configuration pour PT-P710BT avec ruban 24mm
const CONFIG = {
  TAPE_WIDTH_MM: 24,
  TAPE_HEIGHT_PX: 128,  // 128 pixels pour 24mm
  DPI: 180,
  BYTES_PER_LINE: 16,   // 128 bits = 16 bytes
};

// Commandes Brother Raster
const CMD = {
  INVALIDATE: new Uint8Array(100).fill(0x00),
  INITIALIZE: new Uint8Array([0x1B, 0x40]),
  ENTER_RASTER: new Uint8Array([0x1B, 0x69, 0x61, 0x01]),
  COMPRESSION_TIFF: new Uint8Array([0x4D, 0x02]),
  PRINT_FEED: new Uint8Array([0x1A]),
  MARGIN_ZERO: new Uint8Array([0x1B, 0x69, 0x64, 0x00, 0x00]),
};

// Variable globale pour la connexion
let serialPort = null;
let writer = null;

/**
 * Verifie si Web Serial API est supportee
 */
export function isSupported() {
  return 'serial' in navigator;
}

/**
 * Connecte a l'imprimante Brother via Web Serial
 * L'utilisateur doit selectionner le port dans la boite de dialogue
 */
export async function connect() {
  if (!isSupported()) {
    throw new Error('Web Serial API non supportee. Utilisez Chrome 117+ ou Edge.');
  }

  try {
    // Demande a l'utilisateur de selectionner le port serie
    serialPort = await navigator.serial.requestPort();

    // Ouvre le port avec les parametres Brother
    await serialPort.open({
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none',
    });

    writer = serialPort.writable.getWriter();

    return true;
  } catch (error) {
    console.error('Erreur connexion imprimante:', error);
    throw error;
  }
}

/**
 * Deconnecte l'imprimante
 */
export async function disconnect() {
  try {
    if (writer) {
      writer.releaseLock();
      writer = null;
    }
    if (serialPort) {
      await serialPort.close();
      serialPort = null;
    }
  } catch (error) {
    console.error('Erreur deconnexion:', error);
  }
}

/**
 * Verifie si l'imprimante est connectee
 */
export function isConnected() {
  return serialPort !== null && writer !== null;
}

/**
 * Envoie des donnees a l'imprimante
 */
async function sendData(data) {
  if (!writer) {
    throw new Error('Imprimante non connectee');
  }
  await writer.write(data);
}

/**
 * Compression TIFF Packbits
 */
function packBits(data) {
  const result = [];
  let i = 0;

  while (i < data.length) {
    let runStart = i;
    let runLength = 1;

    // Cherche une sequence repetitive
    while (i + runLength < data.length &&
           data[i + runLength] === data[i] &&
           runLength < 128) {
      runLength++;
    }

    if (runLength > 1) {
      // Sequence repetitive: encode avec n negatif
      result.push(-(runLength - 1) & 0xFF);
      result.push(data[i]);
      i += runLength;
    } else {
      // Sequence litterale
      let literalStart = i;
      let literalLength = 0;

      while (i + literalLength < data.length && literalLength < 128) {
        // Verifie s'il y a une repetition de 3+ a venir
        if (i + literalLength + 2 < data.length &&
            data[i + literalLength] === data[i + literalLength + 1] &&
            data[i + literalLength] === data[i + literalLength + 2]) {
          break;
        }
        literalLength++;
      }

      if (literalLength > 0) {
        result.push(literalLength - 1);
        for (let j = 0; j < literalLength; j++) {
          result.push(data[i + j]);
        }
        i += literalLength;
      }
    }
  }

  return new Uint8Array(result);
}

/**
 * Genere la commande media info pour 24mm
 */
function getMediaInfoCommand(pageLength) {
  const pageLow = pageLength & 0xFF;
  const pageHigh = (pageLength >> 8) & 0xFF;

  return new Uint8Array([
    0x1B, 0x69, 0x7A,  // ESC i z
    0x86,              // Print info (24mm tape)
    0x00,              // Media type
    24,                // Media width (24mm)
    0x00,              // Media length low
    0x00,              // Media length high
    pageLow,           // Page length low
    pageHigh,          // Page length high
    0x00,              // Starting page
    0x00               // Reserved
  ]);
}

/**
 * Genere une image d'etiquette a partir des donnees
 * @param {Object} data - Donnees de l'etiquette
 * @param {string} data.pressingName - Nom du pressing
 * @param {string} data.orderNumber - Numero de commande complet (ex: 2026-0001-K7)
 * @param {string} data.clientName - Nom du client
 * @param {string} data.date - Date de la commande
 * @returns {ImageData} Image monochrome de l'etiquette
 */
export function generateLabelImage(data) {
  const { pressingName, orderNumber, clientName, date } = data;

  // Extrait les 3 derniers caracteres pour l'affichage principal
  const shortCode = orderNumber.slice(-4); // ex: "1-K7"

  // Calcule la largeur basee sur le contenu
  const labelWidth = 400; // pixels (environ 56mm)
  const labelHeight = CONFIG.TAPE_HEIGHT_PX; // 128 pixels

  // Cree un canvas temporaire
  const canvas = document.createElement('canvas');
  canvas.width = labelWidth;
  canvas.height = labelHeight;
  const ctx = canvas.getContext('2d');

  // Fond blanc
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, labelWidth, labelHeight);

  // Texte noir
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Nom du pressing (haut) - plus gros et gras
  ctx.font = 'bold 18px Arial';
  ctx.fillText(pressingName.toUpperCase(), labelWidth / 2, 16);

  // Ligne de separation - plus epaisse
  ctx.beginPath();
  ctx.moveTo(10, 32);
  ctx.lineTo(labelWidth - 10, 32);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Code court (gros, centre) - BEAUCOUP plus gros
  ctx.font = 'bold 56px Arial';
  ctx.fillText(shortCode, labelWidth / 2, 70);

  // Numero complet - plus gros
  ctx.font = 'bold 14px Arial';
  ctx.fillText(orderNumber, labelWidth / 2, 100);

  // Client - plus gros et gras
  ctx.font = 'bold 14px Arial';
  const clientText = clientName.length > 18 ? clientName.substring(0, 18) + '...' : clientName;
  ctx.fillText(clientText, labelWidth / 2, 115);

  // Date - plus gros
  ctx.font = '12px Arial';
  ctx.fillText(date, labelWidth / 2, 128);

  // Recupere les donnees de l'image
  return ctx.getImageData(0, 0, labelWidth, labelHeight);
}

/**
 * Convertit ImageData en donnees raster monochromes
 * L'image doit etre pivotee de 90 degres pour l'impression Brother
 *
 * Brother PT-P710BT:
 * - Chaque ligne raster = 128 bits (16 bytes) = hauteur du ruban 24mm
 * - Bit 7 (MSB) = haut du ruban
 * - Les lignes sont envoyees de gauche a droite (sens de sortie du ruban)
 */
function imageToRaster(imageData) {
  const { width, height, data } = imageData;
  const rasterLines = [];

  // Pour chaque colonne de l'image (de DROITE a GAUCHE pour corriger l'effet miroir)
  for (let x = width - 1; x >= 0; x--) {
    const lineBytes = new Uint8Array(CONFIG.BYTES_PER_LINE);

    // Pour chaque pixel de la colonne (de bas en haut pour orientation correcte)
    for (let y = 0; y < height && y < CONFIG.TAPE_HEIGHT_PX; y++) {
      // Lire depuis le bas de l'image (height - 1 - y)
      const srcY = height - 1 - y;
      const idx = (srcY * width + x) * 4;

      // Convertit en niveau de gris
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

      // Seuil pour noir/blanc (noir = 1, blanc = 0)
      const isBlack = gray < 128;

      if (isBlack) {
        const byteIndex = Math.floor(y / 8);
        const bitIndex = 7 - (y % 8);
        lineBytes[byteIndex] |= (1 << bitIndex);
      }
    }

    rasterLines.push(lineBytes);
  }

  return rasterLines;
}

/**
 * Imprime une etiquette
 * @param {Object} labelData - Donnees de l'etiquette
 * @param {number} copies - Nombre de copies (defaut: 1)
 */
export async function printLabel(labelData, copies = 1) {
  if (!isConnected()) {
    throw new Error('Imprimante non connectee. Appelez connect() d\'abord.');
  }

  // Genere l'image
  const imageData = generateLabelImage(labelData);

  // Convertit en raster
  const rasterLines = imageToRaster(imageData);
  const pageLength = rasterLines.length;

  for (let copy = 0; copy < copies; copy++) {
    // Sequence d'initialisation
    await sendData(CMD.INVALIDATE);
    await sendData(CMD.INITIALIZE);
    await sendData(CMD.ENTER_RASTER);
    await sendData(getMediaInfoCommand(pageLength));
    await sendData(CMD.MARGIN_ZERO);
    await sendData(CMD.COMPRESSION_TIFF);

    // Envoie chaque ligne raster
    for (const line of rasterLines) {
      const compressed = packBits(line);
      const header = new Uint8Array([
        0x47,
        compressed.length & 0xFF,
        (compressed.length >> 8) & 0xFF
      ]);

      // Combine header et donnees
      const packet = new Uint8Array(header.length + compressed.length);
      packet.set(header);
      packet.set(compressed, header.length);

      await sendData(packet);
    }

    // Print et feed
    await sendData(CMD.PRINT_FEED);

    // Pause entre les copies
    if (copy < copies - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

/**
 * Imprime une etiquette de test
 */
export async function printTestLabel() {
  const testData = {
    pressingName: 'PRESSING TEST',
    orderNumber: '2026-0001-K7',
    clientName: 'Client Test',
    date: new Date().toLocaleDateString('fr-FR')
  };

  await printLabel(testData);
}

/**
 * Previsualise l'etiquette sans imprimer
 * @returns {string} URL data: de l'image PNG
 */
export function previewLabel(labelData) {
  const imageData = generateLabelImage(labelData);

  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL('image/png');
}

export default {
  isSupported,
  connect,
  disconnect,
  isConnected,
  printLabel,
  printTestLabel,
  previewLabel,
  generateLabelImage,
};
