#!/usr/bin/env python3
"""Valida archivos GeoJSON, relaciones y topología territorial del atlas.
Requisito: pip install shapely
"""
import json
from pathlib import Path
from shapely.geometry import shape, Point
from shapely.ops import unary_union

BASE = Path(__file__).resolve().parents[1] / 'public' / 'atlas'
NOMBRES = ['regiones','capitales','carreteras','ferrocarriles','infraestructuras','especiales']

colecciones = {}
for nombre in NOMBRES:
    ruta = BASE / (nombre + '.geojson')
    obj = json.loads(ruta.read_text(encoding='utf-8'))
    assert obj['type']=='FeatureCollection', ruta
    assert isinstance(obj['features'],list), ruta
    for f in obj['features']:
        assert f['type']=='Feature', ruta
        geom=shape(f['geometry'])
        assert geom.is_valid, f"Geometría inválida: {nombre} {f.get('id')}"
        assert not geom.is_empty, f"Geometría vacía: {nombre} {f.get('id')}"
    colecciones[nombre]=obj['features']

regiones={f['properties']['region_id']:f for f in colecciones['regiones']}
assert set(regiones)=={'baguette','pimbo','croissant','pretzel','sin-gluten','pan-plano-arepa'}
assert len(colecciones['capitales'])==6
for cap in colecciones['capitales']:
    rid=cap['properties']['region_id']
    assert rid in regiones, f"Capital de región desconocida: {rid}"
    assert shape(regiones[rid]['geometry']).covers(shape(cap['geometry'])), f"Capital fuera de la región: {cap['properties']['nombre']}"

andorra=[shape(regiones[x]['geometry']) for x in ('pimbo','baguette','croissant')]
suma=sum(g.area for g in andorra)
union=unary_union(andorra).area
assert abs(suma-union)<1e-11,'Solapamiento entre regiones de Andorra'

for f in colecciones['carreteras']:
    assert f['geometry']['type'] in ('LineString','MultiLineString')
    assert f['properties']['estado']=='esquematico', 'No marcar corredor ficticio como real'

assert any(f['properties']['categoria']=='territorio_en_negociaciones' for f in colecciones['especiales'])
assert any(f['properties']['region_id']=='atlantida' for f in colecciones['especiales'])

print('VALIDACIÓN OK')
for n,fs in colecciones.items(): print(f' {n}: {len(fs)} features')
print(' Capitales dentro de su región: 6/6')
print(' Solapamiento territorial Andorra: 0')
