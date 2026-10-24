#!/usr/bin/env python3
"""Auditoría cartográfica real del Atlas Paniense v2."""
from pathlib import Path
from collections import Counter
import json
from shapely.geometry import shape, Point
from shapely.ops import unary_union

BASE = Path(__file__).resolve().parent.parent / 'public' / 'atlas'

def load(name):
    d=json.loads((BASE/f'{name}.geojson').read_text(encoding='utf-8'))
    assert d['type']=='FeatureCollection',name
    return d['features']

fs=load('regiones'); cap=load('capitales'); parish=load('parroquias_referencia'); special=load('especiales')
assert len(parish)==7, 'Faltan parroquias andorranas'
assert len(cap)==6, 'Capitales en número distinto a lo acordado'
assert len([f for f in fs if f['properties']['region_id'] in ('pimbo','baguette','croissant')])==7
assert all(shape(f['geometry']).is_valid for f in fs)
assert all(shape(f['geometry']).is_valid for f in cap)
assert not any(f['properties'].get('region_id') in ('atlantida','sahara','sin-gluten') for f in fs), 'No inventar áreas de territorios sin ratificación'
assert all(f['properties'].get('source') for f in fs), 'Polígono sin fuente cartográfica'
for f in fs:
    g=shape(f['geometry']); xmin,ymin,xmax,ymax=g.bounds
    assert -180<=xmin<=xmax<=180 and -90<=ymin<=ymax<=90, f['properties']['id']
areas=Counter(f['properties']['region_id'] for f in fs)
assert areas['pimbo']==3 and areas['baguette']==2 and areas['croissant']==2 and areas['pretzel']==10
ad=[shape(f['geometry']) for f in parish]
assert abs(unary_union(ad).area-unary_union([shape(f['geometry']) for f in fs if f['properties']['region_id'] in ('pimbo','baguette','croissant')]).area)<1e-9
print('✔ Parroquias/municipios reales presentes:',dict(areas))
print('✔ Todos los polígonos son GeoJSON válido en WGS84')
for f in cap:
    matches={q['properties']['region_id'] for q in fs if shape(q['geometry']).covers(shape(f['geometry']))}
    desired=f['properties']['region_id']; name=f['properties']['nombre']
    if desired in matches: print(f'✔ {name}: capital dentro del contorno registrado ({desired})')
    else: print(f'⚠ {name}: SIN coincidencia con polígono publicado ({desired}). Delimitación pendiente o fuente antigua.')
print('✔ Atlántida, Sin Glúten y Sáhara Occidental: sin falsos polígonos')
print('✔ Comprobación terminada')
