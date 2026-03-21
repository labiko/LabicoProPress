# Brother PT-P710BT Raster Protocol Reference

## Documentation Officielle

Source: [Brother Raster Command Reference](https://download.brother.com/welcome/docp100064/cv_pte550wp750wp710bt_eng_raster_102.pdf)

## Connexion

### Web Serial API (Chrome 117+)

Le PT-P710BT utilise Bluetooth Classic (SPP), pas BLE. La Web Serial API permet d'acceder aux ports serie Bluetooth apres appairage manuel dans les parametres systeme.

```javascript
const port = await navigator.serial.requestPort();
await port.open({ baudRate: 9600 });
```

## Commandes Raster

### Initialisation

| Commande | Hex | Description |
|----------|-----|-------------|
| Invalidate | `0x00` x 100 | Clear buffer |
| Initialize | `0x1B 0x40` | Reset printer |
| Enter Raster | `0x1B 0x69 0x61 0x01` | Mode raster graphics |

### Configuration Media

```
ESC i z [PI] [WT] [ML] [MH] [PL] [PH] [P] 0x00

0x1B 0x69 0x7A
  PI = Print info (0x86 pour 24mm)
  WT = Media width (24 = 24mm)
  ML = Media length low byte
  MH = Media length high byte
  PL = Page low byte
  PH = Page high byte
  P = Starting page (0)
```

### Compression TIFF

```
0x4D 0x02  // Enable TIFF packbits compression
```

### Transfer Raster Line

```
0x47 [n1] [n2] [data...]

n1 = nombre d'octets (low byte)
n2 = nombre d'octets (high byte)
data = donnees raster compressees
```

### Print & Feed

```
0x1A  // Print buffer and feed
```

## Dimensions Etiquette

| Largeur ruban | Pixels hauteur | DPI |
|---------------|----------------|-----|
| 24mm | 128 pixels | 180 |
| 18mm | 96 pixels | 180 |
| 12mm | 64 pixels | 180 |

## Format Image

- **Orientation**: Verticale (rotation 90 degres)
- **Couleur**: Monochrome 1-bit
- **Compression**: TIFF packbits recommandee
- **Ordre bits**: MSB first

## Sequence Complete d'Impression

```
1. Invalidate (100 x 0x00)
2. Initialize (0x1B 0x40)
3. Enter Raster Mode (0x1B 0x69 0x61 0x01)
4. Set Media Info (0x1B 0x69 0x7A ...)
5. Set Margin (0x1B 0x69 0x64 0x00 0x00)
6. Enable Compression (0x4D 0x02)
7. For each line:
   - Transfer raster (0x47 n1 n2 data)
8. Print & Feed (0x1A)
```

## TIFF Packbits Compression

Algorithme simple:
- `n >= 0`: Copier les n+1 octets suivants
- `n < 0`: Repeter l'octet suivant |n|+1 fois
- `n = -128`: No-op

Exemple:
```
Input:  AA AA AA 42 43 44 44 44 44 44 44
Output: FE AA 02 42 43 44 F9 44
        ^repeat 3x  ^copy 3  ^repeat 8x
```

## References

- [Documentation officielle Brother](https://download.brother.com/welcome/docp100064/cv_pte550wp750wp710bt_eng_raster_102.pdf)
- [Web Serial API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
