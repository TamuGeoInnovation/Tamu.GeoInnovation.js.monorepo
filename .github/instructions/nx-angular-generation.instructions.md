---
applyTo: '**'
---

When generating Angular components, never use inline styles or inline templates. Always use external files for styles and templates to ensure better maintainability and separation of concerns.

When generating components, modules, services, pipes, or directives, never generate barrel files and instead prefer to export the component, module, service, pipe, or directive directly from the file where it is defined in the nearest module and library index file. This helps in keeping the codebase clean and avoids unnecessary complexity.
