"""Emisor de certificados ficticios del Registro Civil del Reino del Pan.



No son documentos públicos oficiales ni sustituyen certificados españoles.

Requiere reportlab; acepta logos locales en ./src.

"""

from __future__ import annotations



from io import BytesIO

from pathlib import Path

from datetime import datetime, timezone

import re

import unicodedata

import uuid



from reportlab.pdfgen import canvas

from reportlab.lib import colors

from reportlab.lib.pagesizes import A4

from reportlab.pdfbase import pdfmetrics

from reportlab.pdfbase.ttfonts import TTFont



ROOT = Path(__file__).resolve().parent

ASSETS = ROOT / "src"

W, H = A4

INK = colors.HexColor('#192b38')

TEAL = colors.HexColor('#147d77')

MUTED = colors.HexColor('#526271')

BORDER = colors.HexColor('#dae3e4')





def _font_setup():

    if 'RC-Regular' in pdfmetrics.getRegisteredFontNames():

        return 'RC-Regular', 'RC-Bold'

    choices = [

        ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'),

        ('/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf', '/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf'),

        ('C:/Windows/Fonts/arial.ttf', 'C:/Windows/Fonts/arialbd.ttf'),

    ]

    for regular, bold in choices:

        if Path(regular).exists() and Path(bold).exists():

            pdfmetrics.registerFont(TTFont('RC-Regular', regular))

            pdfmetrics.registerFont(TTFont('RC-Bold', bold))

            return 'RC-Regular', 'RC-Bold'

    return 'Helvetica', 'Helvetica-Bold'





def _clean(s, limit=200):

    return re.sub(r'[\x00-\x1f\x7f]', ' ', str(s if s is not None else '—')).strip()[:limit] or '—'





def _normalize(s):

    s = unicodedata.normalize('NFKD', str(s or ''))

    return ''.join(c for c in s if not unicodedata.combining(c)).lower().replace('_', ' ').replace('-', ' ').strip()





REGION_ASSETS = {

    'baguette': ('baguette.png', 'region_baguette.png'),

    'pimbo': ('pimbo.png', 'region_pimbo.png'),

    'pretzel': ('pretzel.png', 'region_pretzel.png'),

    'croissant': ('croissant.png', 'region_croissant.png'),

    'sin gluten': ('singluten.png', 'sin_gluten.png', 'sin-gluten.png', 'region_singluten.png'),

    'pan plano': ('panplano.png', 'pan_plano.png', 'arepa.png', 'region_panplano.png'),

    'pan plano/arepa': ('panplano.png', 'pan_plano.png', 'arepa.png', 'region_panplano.png'),

    'capital': ('capital.png', 'region_capital.png'),

}





def region_logo(region):

    normalized = _normalize(region)

    for candidate in REGION_ASSETS.get(normalized, (f'{normalized.replace(" ", "_")}.png',)):

        path = ASSETS / candidate

        if path.is_file():

            return path

    return None





def _logo(c, path: Path, x: float, y: float, max_w: float, max_h: float):

    if not path.is_file():

        return False

    try:

        from reportlab.lib.utils import ImageReader

        reader = ImageReader(str(path))

        iw, ih = reader.getSize()

        scale = min(max_w / iw, max_h / ih)

        ww, hh = iw * scale, ih * scale

        c.drawImage(reader, x + (max_w - ww)/2, y + (max_h - hh)/2, ww, hh, mask='auto')

        return True

    except Exception:

        return False





def _text_lines(c, text, font, font_size, max_w):

    text = _clean(text, 900)

    result = []

    for line in text.split('\n'):

        words = line.split()

        acc = ''

        for word in words:

            candidate = (acc + ' ' + word).strip()

            if pdfmetrics.stringWidth(candidate, font, font_size) <= max_w:

                acc = candidate

            else:

                if acc:

                    result.append(acc)

                if pdfmetrics.stringWidth(word, font, font_size) > max_w:

                    piece = ''

                    for char in word:

                        if pdfmetrics.stringWidth(piece + char, font, font_size) > max_w:

                            if piece: result.append(piece)

                            piece = char

                        else:

                            piece += char

                    acc = piece

                else:

                    acc = word

        result.append(acc)

    return result





def _write(c, text, x, y, width, font, size, leading=16, color=INK):

    c.setFillColor(color)

    c.setFont(font, size)

    for line in _text_lines(c, text, font, size, width):

        c.drawString(x, y, line)

        y -= leading

    return y





def _field(c, key, value, x, y, width, font, bold):

    c.setFont(bold, 9)

    c.setFillColor(MUTED)

    c.drawString(x, y, _clean(key).upper())

    y -= 19

    y = _write(c, value, x, y, width, font, 11, 16)

    c.setStrokeColor(BORDER)

    c.line(x, y - 4, x + width, y - 4)

    return y - 24





def _date(value):

    if isinstance(value, str):

        try:

            value = datetime.fromisoformat(value.replace('Z', '+00:00'))

        except ValueError:

            return _clean(value)

    if isinstance(value, datetime):

        if value.tzinfo is None:

            value = value.replace(tzinfo=timezone.utc)

        return value.astimezone(timezone.utc).strftime('%d/%m/%Y %H:%M UTC')

    return datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M UTC')





def crear_pdf(tipo: str, datos: dict, *, muestra: bool = False) -> bytes:

    """Crea un PDF A4 en memoria. Tipos: nacimiento, adopcion, matrimonio, divorcio."""

    tipo = _normalize(tipo)

    if tipo not in ('nacimiento', 'adopcion', 'matrimonio', 'divorcio'):

        raise ValueError('Tipo de certificado no admitido')

    font, bold = _font_setup()

    buf = BytesIO()

    c = canvas.Canvas(buf, pagesize=A4, pageCompression=1)

    c.setTitle(f'Registro Civil ficticio - {tipo}')

    c.setAuthor('Registro Civil del Reino del Pan - Discord')

    margin = 53

    c.setStrokeColor(TEAL)

    c.setLineWidth(2)

    c.line(margin, H - 111, W - margin, H - 111)

    left_logo = ASSETS / 'gob.png'

    right_logo = ASSETS / 'reg.png'

    _logo(c, left_logo, margin, H - 98, 62, 63)

    _logo(c, right_logo, W - margin - 72, H - 98, 72, 63)

    c.setFont(bold, 13)

    c.setFillColor(INK)

    c.drawCentredString(W / 2, H - 57, 'REINO DEL PAN')

    c.setFont(font, 9)

    c.drawCentredString(W / 2, H - 74, 'REGISTRO CIVIL · SERVICIO DE INSCRIPCIONES')

    c.setFont(bold, 7.5)

    c.setFillColor(TEAL)

    c.drawCentredString(W / 2, H - 91, 'DOCUMENTO FICTICIO · USO INTERNO DEL SERVIDOR')



    titles = {

        'nacimiento': 'CERTIFICACIÓN DE INSCRIPCIÓN DE NACIMIENTO',

        'adopcion': 'CERTIFICACIÓN DE INSCRIPCIÓN DE ADOPCIÓN',

        'matrimonio': 'CERTIFICACIÓN DE INSCRIPCIÓN DE MATRIMONIO',

        'divorcio': 'CERTIFICACIÓN DE DISOLUCIÓN MATRIMONIAL',

    }

    c.setFont(bold, 14)

    c.setFillColor(INK)

    c.drawCentredString(W/2, H-154, titles[tipo])

    c.setFillColor(MUTED)

    c.setFont(font, 9)

    c.drawCentredString(W/2, H-176, f'Asiento: {_clean(datos.get("numero", "BORRADOR"), 38)}  ·  Emisión: {_date(datos.get("fecha_emision"))}')

    y = H - 212

    c.setStrokeColor(BORDER)

    c.roundRect(margin, 110, W - margin * 2, y - 110 + 19, 9, fill=0, stroke=1)

    x = margin + 18

    full = W - 2 * margin - 36

    if tipo == 'nacimiento':

        campos = [

            ('Persona inscrita', datos.get('nombre_hijo')),

            ('Tipo de inscripción', 'Nacimiento ficticio (creación de personaje)'),

            ('Progenitor/a solicitante', datos.get('nombre_progenitor')),

            ('DPI del progenitor/a', datos.get('dpi_progenitor')),

            ('Región del progenitor/a', datos.get('region')),

            ('Fecha de inscripción', _date(datos.get('fecha'))),

        ]

    elif tipo == 'adopcion':

        campos = [

            ('Persona adoptante', datos.get('nombre_progenitor')),

            ('DPI de la persona adoptante', datos.get('dpi_progenitor')),

            ('Persona adoptada', datos.get('nombre_hijo')),

            ('DPI de la persona adoptada', datos.get('dpi_hijo')),

            ('Región de inscripción', datos.get('region')),

            ('Fecha de adopción', _date(datos.get('fecha'))),

        ]

    elif tipo == 'matrimonio':

        campos = [

            ('Primer contrayente', datos.get('nombre_1')),

            ('DPI del primer contrayente', datos.get('dpi_1')),

            ('Segundo contrayente', datos.get('nombre_2')),

            ('DPI del segundo contrayente', datos.get('dpi_2')),

            ('Fecha del matrimonio', _date(datos.get('fecha'))),

        ]

    else:

        campos = [

            ('Solicitante', datos.get('nombre_1')),

            ('DPI del solicitante', datos.get('dpi_1')),

            ('Otro contrayente', datos.get('nombre_2')),

            ('DPI del otro contrayente', datos.get('dpi_2')),

            ('Región del solicitante', datos.get('region')),

            ('Fecha de disolución', _date(datos.get('fecha'))),

            ('Referencia matrimonial', datos.get('referencia_matrimonio', '—')),

        ]

    for key, value in campos:

        y = _field(c, key, value if value is not None else '—', x, y, full, font, bold)

    if tipo == 'divorcio':

        logo = region_logo(datos.get('region'))

        if logo:

            _logo(c, logo, W - margin - 118, 127, 85, 70)

        else:

            c.setFont(bold, 8)

            c.setFillColor(MUTED)

            c.drawRightString(W-margin-18, 156, 'REGIÓN: '+_clean(datos.get('region'), 25).upper())

    if y < 115:

        raise ValueError('El contenido excede el espacio disponible del certificado')

    c.setFont(font, 8)

    c.setFillColor(MUTED)

    c.drawString(margin + 2, 91, 'Certifica exclusivamente hechos ficticios registrados en la comunidad de Discord.')

    c.drawString(margin + 2, 78, 'No acredita identidad legal, filiación, estado civil ni resolución judicial.')

    c.setStrokeColor(BORDER)

    c.line(margin, 58, W-margin, 58)

    c.setFont(font, 7.5)

    c.drawString(margin, 43, 'REGISTRO CIVIL DEL REINO DEL PAN · EMISIÓN DIGITAL')

    c.drawRightString(W-margin, 43, 'MUESTRA / SIN VALIDEZ' if muestra else 'REGISTRO FICTICIO')

    if muestra:

        c.saveState()

        c.translate(W/2, H/2)

        c.rotate(35)

        c.setFont(bold, 44)

        c.setFillColor(colors.Color(0.83, 0.27, 0.27, alpha=0.12))

        c.drawCentredString(0, 0, 'PRUEBA · SIN VALIDEZ')

        c.restoreState()

    c.showPage()

    c.save()

    return buf.getvalue()





def numero_asiento(tipo):

    return f'RC-{tipo[:3].upper()}-{datetime.now(timezone.utc):%Y%m%d}-{uuid.uuid4().hex[:10].upper()}'





def datos_prueba(tipo):

    now = datetime.now(timezone.utc)

    base = {'numero': 'RC-DEMO-000001', 'fecha': now, 'fecha_emision': now,

            'region': 'Baguette'}

    if tipo == 'nacimiento':

        base.update(nombre_hijo='Miga de Pan', nombre_progenitor='Alicia Panadera', dpi_progenitor='DPI - 000101A')

    elif tipo == 'adopcion':

        base.update(nombre_hijo='Bruno Croissant', nombre_progenitor='Alicia Panadera', dpi_progenitor='DPI - 000101A', dpi_hijo='DPI - 000202B')

    elif tipo == 'matrimonio':

        base.update(nombre_1='Alicia Panadera', dpi_1='DPI - 000101A', nombre_2='Bruno Croissant', dpi_2='DPI - 000202B')

    elif tipo == 'divorcio':

        base.update(nombre_1='Alicia Panadera', dpi_1='DPI - 000101A', nombre_2='Bruno Croissant', dpi_2='DPI - 000202B', referencia_matrimonio='RC-MAT-000123')

    return base
