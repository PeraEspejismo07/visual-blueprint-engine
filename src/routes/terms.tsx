import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "./privacy";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Términos del servicio — Carbofile" },
      {
        name: "description",
        content:
          "Condiciones de uso de Carbofile: agente de limpieza de archivos, papelera reversible y límites de responsabilidad.",
      },
      { property: "og:title", content: "Términos del servicio — Carbofile" },
      {
        property: "og:description",
        content: "Condiciones de uso del agente de limpieza digital de Carbofile.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalShell title="Términos del servicio" eyebrow="Legal">
      <h2>El servicio</h2>
      <p>
        Carbofile es un agente que te ayuda a identificar y eliminar archivos redundantes en tu equipo
        y en tus servicios conectados, estimando el espacio y el CO₂ evitados.
      </p>
      <h2>Tu control</h2>
      <p>
        Ninguna acción destructiva ocurre sin tus reglas. Toda eliminación pasa por una papelera
        reversible durante la ventana que configures (7, 30 o 90 días).
      </p>
      <h2>Uso aceptable</h2>
      <p>
        No puedes usar Carbofile para acceder a datos de terceros sin autorización ni para eludir
        políticas de retención de tu organización.
      </p>
      <h2>Responsabilidad</h2>
      <p>
        El servicio se ofrece &quot;tal cual&quot; durante el piloto 2026. Recomendamos mantener copias de
        seguridad propias de la información crítica.
      </p>
      <h2>Contacto</h2>
      <p>
        <a href="mailto:hola@carbofile.com">hola@carbofile.com</a>
      </p>
    </LegalShell>
  );
}
