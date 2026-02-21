# 🏛️ AllArch — All Archaeologists

**Protegiendo el patrimonio arqueológico conectando ciudadanos con arqueólogos verificados.**

AllArch es una plataforma web (PWA) que permite a cualquier persona fotografiar y reportar posibles artefactos arqueológicos para que arqueólogos profesionales verificados evalúen su valor real.

## Problema que Resuelve

1. **Artefactos no reconocidos**: Personas sin formación arqueológica que no identifican el valor de elementos que poseen o encuentran.
2. **Daño irreversible**: Artefactos dañados durante excavaciones urbanas por manipulación inadecuada.

## Cómo Funciona

1. **Ciudadano** encuentra algo → toma foto → sube con descripción y ubicación
2. **Arqueólogo verificado** recibe el reporte → evalúa el valor (1-10) → emite veredicto
3. **Administrador** gestiona arqueólogos verificados → aprueba credenciales

## Tecnología

- **Frontend**: HTML + CSS + JavaScript (PWA instalable)
- **Backend/BD**: Supabase (PostgreSQL + Storage + REST API)
- **Despliegue**: GitHub Pages
- **Autenticación**: Sistema personalizado sin Supabase Auth

## Instalación Local

1. Clonar: `git clone https://github.com/artifextsp/ALLARCH.git`
2. Abrir `index.html` en un navegador (o usar Live Server)
3. Ejecutar `sql/schema.sql` en el SQL Editor de Supabase

## Cuentas de Demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@allarch.demo | demo2026 |
| Arqueólogo | roberto@allarch.demo | demo2026 |
| Arqueólogo | ana@allarch.demo | demo2026 |
| Público | maria@allarch.demo | demo2026 |
| Público | juan@allarch.demo | demo2026 |

## Proyecto FLL 2026

Desarrollado por el equipo de robótica para First Lego League 2026.
