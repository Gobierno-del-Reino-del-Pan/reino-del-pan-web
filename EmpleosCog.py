import json
from pathlib import Path
from typing import Any

import discord
from discord import app_commands
from discord.ext import commands


GUILD_ID = int(__import__("os").getenv("GUILD_ID", "0"))
SERVICE_EMPLOYMENT_CHANNEL_ID = 1538944585223508008
ADMIN_ROLE_ID = 1538934973548208239


def _load_jobs() -> list[dict[str, str]]:
    """Carga los empleos desde data/roles.json, sección roles.profesiones."""
    config_path = Path(__file__).resolve().parent / "data" / "roles.json"
    with config_path.open("r", encoding="utf-8") as file:
        data: dict[str, Any] = json.load(file)

    jobs = []
    for job in data.get("roles", {}).get("profesiones", []):
        try:
            role_id = int(job["discord_role_id"])
        except (KeyError, TypeError, ValueError):
            continue
        jobs.append(
            {
                "id": str(job.get("id", role_id)),
                "name": str(job.get("nombre", "Empleo")),
                "description": str(job.get("descripcion", "")),
                "emoji": str(job.get("emoji", "💼")),
                "role_id": role_id,
            }
        )
    return jobs


JOBS = _load_jobs()
JOB_BY_ID = {job["id"]: job for job in JOBS}


class EmpleoSelect(discord.ui.Select):
    def __init__(self):
        options = [
            discord.SelectOption(
                label=job["name"][:100],
                value=job["id"],
                description=job["description"][:100] or "Solicitar este empleo",
                emoji=job["emoji"] if job["emoji"] else None,
            )
            for job in JOBS[:25]
        ]
        super().__init__(
            custom_id="empleos:seleccion",
            placeholder="Selecciona tu empleo...",
            min_values=1,
            max_values=1,
            options=options,
        )

    async def callback(self, interaction: discord.Interaction):
        view: EmpleosView = self.view  # type: ignore[assignment]
        await view.procesar_eleccion(interaction, self.values[0])


class EmpleosView(discord.ui.View):
    """Vista persistente: sigue funcionando aunque el bot se reinicie."""

    def __init__(self):
        super().__init__(timeout=None)
        self.add_item(EmpleoSelect())

    async def procesar_eleccion(self, interaction: discord.Interaction, job_id: str):
        if not interaction.guild or not isinstance(interaction.user, discord.Member):
            await interaction.response.send_message(
                "⚠️ Este menú solo puede utilizarse dentro del servidor.", ephemeral=True
            )
            return

        job = JOB_BY_ID.get(job_id)
        if job is None:
            await interaction.response.send_message(
                "⚠️ Ese empleo ya no está disponible. Contacta con la administración.",
                ephemeral=True,
            )
            return

        guild = interaction.guild
        member = interaction.user
        role = guild.get_role(job["role_id"])
        channel = guild.get_channel(SERVICE_EMPLOYMENT_CHANNEL_ID)

        if role is None:
            await interaction.response.send_message(
                f"⚠️ No se encontró el rol de Discord para **{job['name']}**. Contacta con la administración.",
                ephemeral=True,
            )
            return
        if channel is None or not isinstance(channel, discord.TextChannel):
            await interaction.response.send_message(
                "⚠️ No se encontró el canal de Servicio de Empleo. Contacta con la administración.",
                ephemeral=True,
            )
            return

        assigned_job_roles = [
            configured_role
            for configured_role in (
                guild.get_role(item["role_id"]) for item in JOBS
            )
            if configured_role and configured_role in member.roles
        ]
        if assigned_job_roles:
            await interaction.response.send_message(
                f"⚠️ Ya tienes asignado el empleo **{assigned_job_roles[0].name}**. No puedes cambiarlo desde este menú.",
                ephemeral=True,
            )
            return

        await interaction.response.defer(ephemeral=True)
        try:
            await member.add_roles(role, reason=f"Elección de empleo mediante menú por {member}")

            # Se conserva el resto del overwrite del miembro y solo se bloquea
            # el acceso al canal de Servicio de Empleo.
            overwrite = channel.overwrites_for(member)
            overwrite.view_channel = False
            overwrite.send_messages = False
            overwrite.read_message_history = False
            await channel.set_permissions(
                member,
                overwrite=overwrite,
                reason="Ciudadano ya ha elegido un empleo",
            )
        except discord.Forbidden:
            # Si falla el ocultamiento, se revierte el rol para evitar un estado
            # inconsistente: empleo asignado pero canal todavía visible.
            if role in member.roles:
                try:
                    await member.remove_roles(
                        role, reason="Reversión: no se pudo ocultar Servicio de Empleo"
                    )
                except discord.HTTPException:
                    pass
            await interaction.followup.send(
                "🚫 No tengo permisos suficientes. El bot necesita **Gestionar roles** y **Gestionar canales**, y su rol debe estar por encima del empleo.",
                ephemeral=True,
            )
            return
        except discord.HTTPException:
            await interaction.followup.send(
                "⚠️ Discord rechazó la operación. No se ha podido completar la asignación; inténtalo de nuevo o contacta con la administración.",
                ephemeral=True,
            )
            return

        await interaction.followup.send(
            f"✅ Has elegido **{job['name']}** y se te ha asignado {role.mention}. Ya no podrás ver el canal de Servicio de Empleo.",
            ephemeral=True,
        )


class EmpleosCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    async def cog_load(self):
        # Registra el mismo menú después de reinicios para que los mensajes
        # antiguos continúen funcionando.
        self.bot.add_view(EmpleosView())

    @app_commands.command(
        name="publicarempleos",
        description="Publica el menú para que los ciudadanos elijan su empleo.",
    )
    @app_commands.guilds(discord.Object(id=GUILD_ID))
    @app_commands.checks.has_role(ADMIN_ROLE_ID)
    async def publicarempleos(self, interaction: discord.Interaction):
        if not JOBS:
            await interaction.response.send_message(
                "⚠️ No hay empleos configurados en data/roles.json.", ephemeral=True
            )
            return

        embed = discord.Embed(
            title="💼 Servicio de Empleo",
            description=(
                "Elige **un solo empleo** en el menú desplegable.\n\n"
                "Al confirmar tu elección recibirás automáticamente el rol correspondiente "
                "y perderás el acceso a este canal. **La elección no se puede cambiar desde el menú.**"
            ),
            color=discord.Color.gold(),
        )
        embed.set_footer(text="Revisa bien tu elección antes de confirmarla.")
        await interaction.channel.send(embed=embed, view=EmpleosView())
        await interaction.response.send_message(
            "✅ Menú de empleos publicado correctamente.", ephemeral=True
        )

    @publicarempleos.error
    async def publicarempleos_error(
        self, interaction: discord.Interaction, error: app_commands.AppCommandError
    ):
        if isinstance(error, app_commands.MissingRole):
            message = "🚫 Solo la administración puede publicar el menú de empleos."
        else:
            message = "⚠️ No se pudo publicar el menú de empleos."
        if interaction.response.is_done():
            await interaction.followup.send(message, ephemeral=True)
        else:
            await interaction.response.send_message(message, ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(EmpleosCog(bot))


__all__ = ["EmpleosCog", "setup"]
