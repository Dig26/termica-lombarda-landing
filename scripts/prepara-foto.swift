// Prepara una foto per il sito: ritaglia, sfoca un'area (es. un marchio), ridimensiona e salva in PNG.
// Il PNG poi si converte in WebP con cwebp. Usa solo Core Image di macOS: niente da installare.
//
// Uso:
//   swift scripts/prepara-foto.swift <entrata.jpg> <uscita.png> <larghezza> [ritaglio x,y,l,a] [sfocatura x,y,l,a]
// Coordinate in pixel dell'immagine originale, con l'origine in alto a sinistra. "-" = nessun ritaglio.
// Esempio:
//   swift scripts/prepara-foto.swift pompa.jpg pompa.png 1200 - 565,280,110,60

import CoreImage
import Foundation
import ImageIO
import UniformTypeIdentifiers

let argomenti = CommandLine.arguments
guard argomenti.count >= 4, let larghezza = Double(argomenti[3]) else {
    print("Uso: swift prepara-foto.swift <entrata> <uscita.png> <larghezza> [ritaglio x,y,l,a] [sfocatura x,y,l,a]")
    exit(1)
}

// "x,y,l,a" con origine in alto a sinistra -> CGRect di Core Image (origine in basso a sinistra)
func rettangolo(_ testo: String, altezzaImmagine: CGFloat) -> CGRect? {
    let n = testo.split(separator: ",").compactMap { Double($0) }
    guard n.count == 4 else { return nil }
    return CGRect(x: n[0], y: Double(altezzaImmagine) - n[1] - n[3], width: n[2], height: n[3])
}

guard var immagine = CIImage(contentsOf: URL(fileURLWithPath: argomenti[1])) else {
    print("Non riesco a leggere \(argomenti[1])")
    exit(1)
}
let altezzaOriginale = immagine.extent.height

// 1. Sfocatura di un'area: si sfoca tutta l'immagine e si ritaglia solo il pezzo che serve
if argomenti.count >= 6, let area = rettangolo(argomenti[5], altezzaImmagine: altezzaOriginale) {
    let sfocata = immagine.clampedToExtent()
        .applyingGaussianBlur(sigma: 14)
        .cropped(to: area)
    immagine = sfocata.composited(over: immagine)
}

// 2. Ritaglio
if argomenti.count >= 5, let area = rettangolo(argomenti[4], altezzaImmagine: altezzaOriginale) {
    immagine = immagine.cropped(to: area)
        .transformed(by: CGAffineTransform(translationX: -area.minX, y: -area.minY))
}

// 3. Ridimensionamento alla larghezza richiesta, mantenendo le proporzioni
let scala = larghezza / immagine.extent.width
immagine = immagine.transformed(by: CGAffineTransform(scaleX: scala, y: scala))

// 4. Salvataggio in PNG (senza perdita: la compressione la fa poi cwebp)
let contesto = CIContext()
guard let cg = contesto.createCGImage(immagine, from: immagine.extent),
      let destinazione = CGImageDestinationCreateWithURL(
          URL(fileURLWithPath: argomenti[2]) as CFURL, UTType.png.identifier as CFString, 1, nil)
else {
    print("Non riesco a scrivere \(argomenti[2])")
    exit(1)
}
CGImageDestinationAddImage(destinazione, cg, nil)
CGImageDestinationFinalize(destinazione)
print("Salvata \(argomenti[2]): \(cg.width) x \(cg.height)")
