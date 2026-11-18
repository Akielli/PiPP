# Realidad aumentada con QR (web)

Página web de un solo archivo (`index.html`) que:

1. Abre la cámara trasera del celular desde el navegador (sin instalar app).
2. Busca un código QR en cada cuadro con [jsQR](https://github.com/cozmo/jsQR).
3. Calcula la posición e inclinación del QR a partir de sus 4 esquinas.
4. Dibuja encima una animación 3D con [Three.js](https://threejs.org/) que sigue al QR.

Funciona con **cualquier código QR**. Para probar puedes usar `qr-prueba.png` (ábrelo en otra pantalla o imprímelo).

## Publicarla como liga (URL)

El navegador solo permite usar la cámara en páginas **HTTPS**. Opciones:

- **GitHub Pages**: Settings → Pages → rama y carpeta raíz. La liga queda como
  `https://<usuario>.github.io/<repo>/ar-qr/`.
- **Netlify Drop** (https://app.netlify.com/drop): arrastra la carpeta `ar-qr` y te da una liga HTTPS al instante.
- Cualquier hosting estático con HTTPS (Vercel, Cloudflare Pages, etc.).

Tip: genera un QR con la liga de la página. Así, quien lo escanee con la cámara normal abre la experiencia
y luego puede apuntar al **mismo QR** para ver la animación.

## Probar en la computadora

```bash
cd ar-qr
python3 -m http.server 8000
# abre http://localhost:8000 (localhost sí permite la cámara sin HTTPS)
```

## Personalizar

En `index.html`:

- **Animación**: la sección `--- La animación 3D ---` y la función `animateContent()`.
  Puedes cambiar geometrías y colores, o cargar un modelo `.glb` con `GLTFLoader` de Three.js.
  El QR mide 1 unidad de lado; dentro de `content`, el eje Y apunta hacia afuera del QR.
- **Contenido según el QR**: `code.data` trae el texto del QR; úsalo para mostrar animaciones distintas.
- `CAMERA_HFOV_DEG`: campo de visión de la cámara (≈60–70° en la mayoría de celulares). Ajústalo si el objeto
  se ve "flotando" o desalineado.
- `SMOOTHING`: suavizado del movimiento (más bajo = más estable pero con más retraso).

## Limitaciones

- Si el QR se sale de cuadro o se ve muy pequeño/borroso, la animación desaparece hasta que se vuelva a detectar.
- La alineación usa un campo de visión aproximado; no es tan precisa como ARKit/ARCore, pero es suficiente para una demo.
