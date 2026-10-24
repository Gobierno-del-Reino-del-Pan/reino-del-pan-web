#!/usr/bin/env python3
"""Recorta las 3 regiones ficticias contra la frontera de Andorra tomada de un GeoJSON.

Uso: pip install requests shapely
  python scripts/refinar_andorra.py --entrada frontera_oficial.geojson
  python scripts/refinar_andorra.py --descargar

El límite nacional pasa a seguir el archivo de origen; los límites INTERIORES
son el proyecto político del Estado Paniense, no parroquias oficiales.

No se modifican otras regiones. Hace copia de seguridad antes de escribir.
"""
import argparse
import json
from pathlib import Path
from urllib.parse import urlsplit

from shapely.geometry import shape, mapping
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'public' / 'atlas' / 'regiones.geojson'
MASKS = ROOT / 'scripts' / 'plantillas_andorra.geojson'
API = 'https://www.geoboundaries.org/api/current/gbOpen/AND/ADM1/'

def leer(path):
    with open(path, encoding='utf-8') as f: return json.load(f)

def descargar_geojson():
    import requests
    metadata = requests.get(API, timeout=30)
    metadata.raise_for_status()
    url = metadata.json()['gjDownloadURL']
    response = requests.get(url, timeout=60)
    response.raise_for_status()
    if response.text.startswith('version https://git-lfs.github.com'):
        raise RuntimeError('Git LFS devolvió un puntero, no el GeoJSON. Descárgalo manualmente desde: ' + url)
    geojson = response.json()
    print('Fuente:', url)
    return geojson

def ejecutar():
    parser = argparse.ArgumentParser()
    origen = parser.add_mutually_exclusive_group(required=True)
    origen.add_argument('--entrada', help='GeoJSON ADM0/ADM1 de Andorra ya descargado')
    origen.add_argument('--descargar', action='store_true', help='Descargar geoBoundaries ADM1')
    args = parser.parse_args()
    oficial = leer(args.entrada) if args.entrada else descargar_geojson()
    if oficial.get('type') != 'FeatureCollection': raise ValueError('Se espera FeatureCollection')
    piezas = [shape(f['geometry']) for f in oficial['features'] if f.get('geometry')]
    if not piezas: raise ValueError('No contiene ninguna geometría')
    territorio = unary_union(piezas).buffer(0)
    # Cortafuegos geográfico: no aceptar por error la geometría de otro país.
    cx, cy = territorio.centroid.x, territorio.centroid.y
    if not (1.4 < cx < 1.8 and 42.4 < cy < 42.7): raise ValueError('La geometría no parece representar Andorra')
    modelos = leer(MASKS)['features']
    mascaras = {f['properties']['region_id']: shape(f['geometry']) for f in modelos}
    croissant = territorio.intersection(mascaras['croissant'])
    baguette = territorio.difference(croissant).intersection(mascaras['baguette'])
    pimbo = territorio.difference(unary_union([croissant, baguette]))
    piezas_nuevas = {'croissant': croissant,'baguette': baguette,'pimbo': pimbo}
    atlas = leer(DATA)
    for feature in atlas['features']:
        rid = feature.get('properties', {}).get('region_id')
        if rid not in piezas_nuevas: continue
        feature['geometry'] = mapping(piezas_nuevas[rid])
        feature['properties']['estado_limite'] = 'frontera_nacional_ajustada'
        feature['properties']['precision'] = 'contorno_geoBoundaries_y_subdivision_ficticia'
        feature['properties']['nota'] = 'Frontera tomada de GeoJSON externo; subdivisiones ficticias aún provisionales.'
    if not all(g.is_valid for g in piezas_nuevas.values()): raise ValueError('Geometría no válida')
    if abs(unary_union(list(piezas_nuevas.values())).area - territorio.area)>1e-10: raise ValueError('Huecos en Andorra')
    backup = DATA.with_suffix('.bak.geojson')
    backup.write_bytes(DATA.read_bytes())
    DATA.write_text(json.dumps(atlas,ensure_ascii=False,indent=2),encoding='utf-8')
    print('Atlas actualizado.', 'Backup:', backup)

if __name__ == '__main__': ejecutar()
