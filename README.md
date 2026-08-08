# Visual Blueprint Engine

1. Decirle que analice las imágenes antes de escribir código

Es una de las cosas que más cambia el resultado.

Agregaría al inicio:

Before generating any code, analyze every attached reference image.

Extract:

- layout proportions
- object scale
- camera position
- typography hierarchy
- spacing
- lighting direction
- material response
- color palette
- animation timing
- scroll choreography
- transition rhythm
- composition
- negative space

Use this analysis as the implementation blueprint.

Do not approximate the design.

Así el modelo primero "lee" las imágenes y luego implementa.

2. Definir la composición

Las capturas tienen muchísimo aire.

El objeto nunca ocupa toda la pantalla.

Por ejemplo:

Composition rules:

The hero object occupies roughly 25–35% of the viewport.

Large negative space surrounds the object.

Typography dominates the composition.

The object never competes with the title.

Camera framing follows premium editorial layouts similar to Apple keynotes.

Always preserve asymmetrical balance.

Eso hace una diferencia enorme.

3. Tipografía

El prompt casi no habla de la tipografía.

Y en esa landing es el 50% del diseño.

Añadiría:

Typography:

Use a modern grotesk font similar to:

Neue Haas Grotesk

Suisse

PP Neue Montreal

Inter Tight

Weight:

300

400

500

Large optical sizes.

Very tight line-height.

Minimal letter spacing.

Titles should feel architectural.

Avoid bold weights unless present in the reference.

Typography must feel premium and understated.

4. Paleta exacta

No solo "verde oscuro".

Primary Background

#161F19

Secondary

#212B23

Stone

#8B8B84

Moss

#6F7F4A

Flowers

#C6B4E6

Text

#EAE6DF

Highlights

#D8D3C9

5. El ritmo del scroll

Aquí es donde muchas IA fallan.

No cambia de sección.

Todo parece una sola película.

Scrolling is not page navigation.

Scrolling is cinematic progression.

The user should feel like the camera travels through one continuous environment.

Never abruptly swap scenes.

Instead:

camera moves

objects transform

lighting evolves

text changes

new content enters

old content exits

Everything exists inside one uninterrupted world.

6. Animación de entrada

No aparece de golpe.

Initial Load:

Background fades in over 1200ms.

Planet slowly emerges from darkness.

Bloom gradually appears.

Title fades upward by 12px.

Micro particles begin drifting.

Camera slowly pushes in.

7. Animación del planeta

Aquí definiría mejor.

Idle Motion:

Very slow rotation.

Noise-driven oscillation.

Tiny breathing scale.

Occasional lighting shifts.

No obvious looping.

Feels alive rather than animated.

8. Cuando se rompe

Más preciso.

The fracture begins as a thin emissive crack.

The crack propagates naturally following stone topology.

Light intensity increases gradually.

Only after the crack reaches completion do both halves begin separating.

The halves drift apart with subtle magnetic resistance.

Small debris and dust fall naturally.

Each half continues its own slow rotation.

The crack glow slowly fades.

9. Postprocesado cinematográfico

Yo incluso pondría valores.

Post Processing

ACES Tone Mapping

Exposure

1.05

Bloom

0.12

DOF

Moderate

Film Grain

0.03

Lens Distortion

0.01

Chromatic Aberration

0.004

Soft Vignette

0.12

Ambient Occlusion

Enabled

Motion Blur

Only while scrolling

SSR

Enabled

TAA

Enabled

10. Movimiento del texto

Muy importante.

Typography Animation:

Headings slide vertically.

Opacity transitions are subtle.

No scaling.

No elastic easing.

Use cubic-bezier easing similar to Apple product pages.

Text always remains readable during camera movement.

11. Performance

Porque Lovable suele exagerar.

Target:

60 FPS desktop

45 FPS laptop

30 FPS mobile minimum

Use LOD.

GPU instancing.

Compressed textures.

Lazy loading.

Dynamic imports.

Suspend loading screens until critical assets are ready.

12. Arquitectura

Le diría exactamente qué stack usar.

Preferred stack:

React

Vite

React Three Fiber

Drei

GSAP

Lenis

Framer Motion

Leva

Theatre.js (optional)

Postprocessing

GLTF JSX

Meshopt

Draco Compression

KTX2 Textures

13. Estructura del proyecto

También ayuda muchísimo.

Structure:

/components

HeroScene

Planet

CameraRig

Lighting

Particles

Typography

Sections

/hooks

/useScrollTimeline

/useCameraRig

/useParallax

/shaders

Glow

Moss

Stone

/utils

Assets

Animation

Math

14. Dirección artística

Esto suele marcar la diferencia.

Art Direction

The aesthetic must communicate:

premium sustainability

nature reclaiming technology

quiet luxury

museum exhibition

editorial minimalism

Apple keynote quality

industrial design

Nothing should feel playful.

Nothing should resemble marketing illustrations.

Everything should feel physically photographed.

15. La regla final (la más importante)

Yo terminaría con algo todavía más fuerte que el original:

The attached reference images are the single source of truth.

Before writing any code, reverse engineer the visual language of the references.

Match:

• composition
• object scale
• typography hierarchy
• spacing
• camera angle
• camera movement
• lighting
• materials
• shadows
• atmospheric effects
• transitions
• pacing
• scroll choreography
• emotional tone
• cinematic quality

Do not generate a landing page inspired by the references.

Reconstruct the same visual experience using original assets and implementation.

If achieving a closer match requires videos, GLB models, HDRIs, shaders, post-processing pipelines, custom GLSL, React Three Fiber, GSAP timelines, Lenis scrolling, or any other open-source technology, use them automatically.

Visual fidelity is the highest priority.

The implementation may differ internally, but the perceived result should be indistinguishable in compositi

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7216a313-6563-4ed1-aa55-600e77d47feb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
