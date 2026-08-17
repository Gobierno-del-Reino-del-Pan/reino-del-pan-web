# Sistema de empleos del bot

Se ha añadido `EmpleosCog.py`. El cog lee los empleos desde `data/roles.json`, dentro de `roles.profesiones`, y utiliza el `discord_role_id` de cada entrada para asignar el rol correspondiente.

## Integración

El cargador principal del bot debe cargar el cog como cualquier otro cog de Discord.py:

```python
await bot.load_extension("EmpleosCog")
```

El cog expone `setup(bot)` y registra automáticamente el menú persistente al iniciar el bot. Si el cargador ya descubre todos los archivos `*Cog.py`, no es necesario añadir una línea adicional.

## Uso

Una persona con el rol administrativo configurado puede ejecutar `/publicarempleos` en el canal de Servicio de Empleo. El bot publicará un embed con el menú desplegable de trabajos.

Cuando un ciudadano selecciona un empleo, el bot comprueba que no tenga ya otro empleo configurado, asigna el rol elegido y crea un permiso específico para denegarle `Ver canal`, `Enviar mensajes` y `Leer historial` en el canal `1538944585223508008`. La elección queda bloqueada desde el menú y el mensaje de confirmación se envía de forma privada.

## Permisos de Discord

El bot necesita `Gestionar roles` y `Gestionar canales`. El rol del bot debe estar situado por encima de todos los roles de empleo en la jerarquía del servidor. La cuenta que ejecute `/publicarempleos` debe tener el rol `1538934973548208239`.

Si Discord no permite una de las dos operaciones, el cog intenta revertir la asignación del empleo para no dejar al usuario con un rol asignado mientras todavía conserva acceso al canal.

## Empleos disponibles

Actualmente se cargan las profesiones presentes en `data/roles.json`, incluyendo Policía Panacional, Guardia Panadera, Militar, Médico, Profesor, Informático, Futbolista, Político, Reportero, Veterinario, Entrenador Pokémon y las demás entradas configuradas allí. Para añadir o retirar empleos, modifica esa sección manteniendo un `discord_role_id` válido.

El menú admite como máximo 25 opciones, que es el límite de Discord para un selector.
