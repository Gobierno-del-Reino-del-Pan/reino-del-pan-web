# Auditoría de mensajes eliminados

La versión incluida de `ModAndSecurityCog.py` añade un registro detallado de mensajes eliminados. Para cada borrado individual se conserva el autor, el identificador del autor, el canal, el identificador del mensaje, el contenido, los adjuntos disponibles y la identidad del responsable obtenida desde los registros de auditoría de Discord. Cuando Discord no permite identificar al responsable, el registro lo indica explícitamente como sistema automático o responsable no identificable, en lugar de inventar una identidad.

El cog mantiene una caché temporal de los mensajes recibidos durante treinta minutos. Esta caché permite conservar contenido y metadatos cuando el mensaje se elimina inmediatamente, antes de que el CDN de Discord deje de servir sus adjuntos. La caché está limitada a 5.000 mensajes y se limpia junto con el historial antispam.

Las purgas masivas se registran como un único caso para evitar inundar el canal de auditoría. El contenido completo de todos los mensajes se incluye en un archivo `purga-caso-N.txt` adjunto al embed. El caso mantiene el número de mensajes, autores, canales y posible responsable de la purga.

## Requisitos de Discord

El bot debe conservar los intents de mensajes y miembros que ya utilice el proyecto. Además, para identificar quién ejecutó un borrado manual o una purga, el bot necesita permiso para **Ver el registro de auditoría**. El canal de auditoría debe permitir enviar mensajes, insertar enlaces, adjuntar archivos y usar enlaces externos. Si el permiso de auditoría no está disponible, el evento sigue registrándose, pero el responsable aparecerá como no identificable.

## Persistencia

Ejecuta `supabase_migration_auditoria_mensajes.sql` en el editor SQL de Supabase. La tabla `casos_auditoria` se utiliza para restaurar el contador de casos y guardar los datos básicos del evento. El contenido completo se conserva en el embed o transcript del canal de auditoría; la columna `detalles` guarda una copia truncada de hasta 500 caracteres para facilitar consultas.

## Limitación importante

Discord no expone el moderador directamente en `on_message_delete`. El cog hace una consulta breve a los audit logs y relaciona la entrada con el autor y el canal del mensaje. Por eso, en borrados extremadamente rápidos, entradas antiguas, purgas concurrentes o ausencia de permisos, la identidad puede no estar disponible. El sistema lo deja indicado en el registro y no bloquea la moderación.
