---
name: Instituto 166 Wiki
description: El Cuaderno de Cátedra - Wiki de Apuntes y Horarios (Dark Cyber-Academic)
colors:
  primary: "#6366f1"
  primary-dark: "#4f46e5"
  secondary: "#06b6d4"
  accent: "#f43f5e"
  success: "#10b981"
  warning: "#f59e0b"
  info: "#0ea5e9"
  light: "#090d16"
  dark: "#050811"
  text: "#f8fafc"
  text-light: "#94a3b8"
  border: "rgba(255, 255, 255, 0.06)"
  border-light: "rgba(255, 255, 255, 0.12)"
  code-bg: "#050811"
  code-text: "#38bdf8"
typography:
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  display:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 700
rounded:
  sm: "4px"
  md: "8px"
  lg: "10px"
  xl: "12px"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "0.65em 1.4em"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "2rem"
---

# Design System: Instituto 166 Wiki

## Overview

**Creative North Star: "El Cuaderno de Cátedra"**

Este sistema de diseño emula la experiencia táctil y organizada de un cuaderno físico de apuntes universitarios. Prioriza la lectura prolongada, el orden jerárquico y la rápida localización de información técnica por sobre los adornos excesivos. La interfaz actúa como hojas limpias de papel donde los bloques de contenido (notas, advertencias, tareas) destacan a través de márgenes coloreados, imitando resaltadores o marcadores de notas.

**Key Characteristics:**
- **Claridad de Lectura:** Fondos limpios y tipografía optimizada para código y texto educativo.
- **Resaltado Didáctico:** Uso de bordes gruesos coloreados en notas informativas y cajas de conceptos para guiar la atención.
- **Navegación Fluida:** Jerarquía visual nítida basada en carpetas y migas de pan (*breadcrumbs*).

## Colors

La paleta se inspira en elementos clásicos de librería universitaria: la tinta de bolígrafo, el papel limpio y los marcadores de notas.

### Primary
- **Azul Universitario** (#3498db): Utilizado para botones de acción primarios, enlaces y bordes de acento de notas informativas.
- **Azul Tinta** (#2980b9): Utilizado para la barra de navegación del encabezado, títulos principales (`h2`) y estados interactivos de hover.

### Secondary
- **Celeste Resaltador** (#4fc3f7): Utilizado para acentos secundarios y bordes sutiles en listas.

### Neutral
- **Gris Papel** (#f8f9fa): Fondo base del sitio, que reduce la fatiga visual del blanco puro.
- **Grafito** (#343a40): Color para texto principal y fondos oscuros en footers y consolas.
- **Gris de Borde** (#dee2e6): Líneas divisorias y contornos de tarjetas.

### Named Rules
**The Ink & Paper Rule.** El fondo principal debe ser siempre Gris Papel (#f8f9fa) o blanco. Nunca usar colores saturados como fondo de páginas completas.

## Typography

**Display Font:** 'Segoe UI', Tahoma, sans-serif
**Body Font:** 'Segoe UI', Tahoma, sans-serif
**Label/Mono Font:** Consolas, 'Courier New', monospace

### Hierarchy
- **Display** (600, 1.6rem, 1.2): Utilizado en el título principal del header.
- **Headline** (600, 1.8rem, 1.3): Utilizado para títulos de sección principal (`h2`).
- **Title** (600, 1.4rem, 1.3): Utilizado para subtítulos (`h3`).
- **Body** (400, 16px, 1.6): Utilizado en texto general, apuntes y contenido de lectura.
- **Label** (500, 0.95rem, 1.4): Utilizado para el texto de botones e información secundaria.

## Layout

El sitio utiliza una grilla fluida y responsiva para las tarjetas de contenido con anchos máximos acotados para garantizar una línea de lectura cómoda.

### Named Rules
**The Reading Limit Rule.** Las columnas de texto principal nunca deben superar un ancho máximo de 1100px para evitar líneas de lectura excesivamente largas.

## Elevation & Depth

El sistema es mayormente plano a nivel físico, apoyándose en bordes sutiles y sombreados muy suaves para separar elementos lógicos.

### Shadow Vocabulary
- **Flat Surface Shadow** (`0 4px 12px rgba(0, 0, 0, 0.08)`): Sombras suaves para separar tarjetas del fondo del papel.
- **Hover Lift Shadow** (`0 6px 16px rgba(0, 0, 0, 0.12)`): Aplicado durante interacciones de hover en tarjetas navegables para dar feedback físico.

## Shapes

Las formas son ligeramente suavizadas para balancear la rigidez de los datos técnicos con la calidez del cuaderno.

### Named Rules
**The Standard Corner Rule.** Todas las tarjetas y cajas destacadas deben poseer esquinas suavizadas con un radio de 8px. Los botones usan un radio de 5px.

## Components

### Buttons
- **Shape:** Radio de 5px.
- **Primary:** Fondo Azul Universitario (#3498db) con texto blanco. Relleno amplio (0.6em 1.2em).
- **Hover:** Fondo Azul Tinta (#2980b9) con una transición suave (0.15s).

### Cards / Containers
- **Corner Style:** Radio de 8px.
- **Background:** Blanco puro.
- **Border:** Gris de Borde (#dee2e6) de 1px.
- **Accent Border:** Borde superior de acento de 5px en color Azul Universitario (#3498db).

### Inputs / Fields
- **Style:** Bordes finos de 1px, fondo blanco y radio de 5px.

### Navigation
- **Style:** Header fijo superior en Azul Tinta (#2980b9). Breadcrumbs legibles con separadores sutiles en blanco semitransparente.

## Do's and Don'ts

### Do:
- **Do** usar siempre la tipografía monoespaciada para comandos de terminal y bloques de código.
- **Do** mantener el borde izquierdo coloreado de 4px en las notas informativas para destacar contenido didáctico.

### Don't:
- **Don't** usar sombras duras o colores oscuros como fondos de tarjetas de texto.
- **Don't** anidar más de tres niveles de breadcrumbs para evitar colapsar la barra de navegación en móviles.
