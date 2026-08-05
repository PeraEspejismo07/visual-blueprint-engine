import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacidad — Carbofile" },
      {
        name: "description",
        content:
          "Cómo Carbofile trata tus datos: el agente analiza metadatos de archivos localmente y nunca sube tu contenido.",
      },
      { property: "og:title", content: "Privacidad — Carbofile" },
      {
        property: "og:description",
        content: "El agente analiza metadatos localmente y nunca sube el contenido de tus archivos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalShell title="Política de privacidad" eyebrow="Legal">
      <h2>Qué datos tratamos</h2>
      <p>
        Carbofile trata únicamente <strong>metadatos</strong> de archivos: nombre, extensión, tamaño,
        origen (descarga, Drive, adjunto) y fecha. El contenido de tus archivos nunca sale de tu
        dispositivo ni se sube a nuestros servidores.
      </p>
      <h2>Extensión de navegador</h2>
      <p>
        La extensión observa eventos de descarga y sincronización para clasificar archivos redundantes.
        Se comunica con Carbofile mediante un código de vinculación y peticiones firmadas.
      </p>
      <h2>Almacenamiento</h2>
      <p>
        Guardamos tu cuenta, tus reglas del agente y el historial de acciones para que puedas revertirlas.
        Cada usuario solo puede acceder a sus propios registros.
      </p>
      <h2>Tus derechos</h2>
      <p>
        Puedes exportar o eliminar tu cuenta y todo su historial desde Ajustes, o escribiendo a{" "}
        <a href="mailto:hola@carbofile.com">hola@carbofile.com</a>.
      </p>
    </LegalShell>
  );
}

export function LegalShell({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[760px] px-6 py-24 md:px-10">
        <Link to="/" className="text-[12px] text-muted-foreground hover:text-foreground transition">
          ← Carbofile
        </Link>
        <p className="eyebrow mt-10">{eyebrow}</p>
        <h1 className="display mt-4 text-4xl md:text-5xl">{title}</h1>
        <div className="mt-10 space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:text-base [&_h2]:text-foreground [&_h2]:font-normal [&_h2]:mt-10 [&_a]:underline">
          {children}
        </div>
      </div>
    </main>
  );
}
