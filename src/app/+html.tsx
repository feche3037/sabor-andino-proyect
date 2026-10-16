import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

// HTML raíz para web: se ejecuta solo en el servidor/exportación estática
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        {/* Quita el contorno azul de foco en los inputs */}
        <style dangerouslySetInnerHTML={{ __html: inputFocusStyle }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const inputFocusStyle = `
input:focus-visible,
textarea:focus-visible {
  outline-color: transparent !important;
  outline-style: none !important;
}`;
