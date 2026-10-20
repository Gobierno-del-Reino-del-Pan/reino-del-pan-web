"""Puente al motor ORIGINAL del bot: registro_civil.crear_pdf(tipo, datos).

El servidor Express comprueba la sesión y que el acta pertenece al ciudadano
antes de ejecutar este proceso. NO acepta datos directamente desde el usuario.
"""
import json
import sys


def main():
    payload = json.load(sys.stdin)
    tipo = payload["tipo"]
    if tipo not in ("nacimiento", "adopcion", "matrimonio", "divorcio"):
        raise ValueError("Tipo de certificado no reconocido")
    datos = payload["datos"]
    if not isinstance(datos, dict):
        raise ValueError("Acta no válida")
    from registro_civil import crear_pdf
    resultado = crear_pdf(tipo, datos, muestra=False)
    if not isinstance(resultado, bytes) or not resultado.startswith(b"%PDF"):
        raise ValueError("El generador no ha devuelto un PDF")
    sys.stdout.buffer.write(resultado)


if __name__ == "__main__":
    main()
