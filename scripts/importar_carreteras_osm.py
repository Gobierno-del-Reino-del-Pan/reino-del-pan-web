#!/usr/bin/env python3
"""Importación OPCIONAL de vías existentes desde OpenStreetMap (no inventa rutas).
Uso: pip install requests shapely; python scripts/importar_carreteras_osm.py
Almacena LineStrings reales recortadas al límite andorrano base. Requiere internet.
"""
import json
from pathlib import Path
from collections import defaultdict
import requests
from shapely.geometry import shape, LineString, mapping
from shapely.ops import unary_union

BASE=Path(__file__).resolve().parent.parent/'public'/'atlas'
parishes=json.loads((BASE/'parroquias_referencia.geojson').read_text())['features']
perimetro_andorra=unary_union([shape(f['geometry']) for f in parishes])
query='''[out:json][timeout:70];
way["highway"~"^(trunk|primary|secondary|tertiary)$"](42.42,1.40,42.67,1.79);
out geom;'''
print('Consultando vías reales en OpenStreetMap/Overpass...')
r=requests.post('https://overpass-api.de/api/interpreter',data={'data':query},timeout=110,headers={'User-Agent':'AtlasPaniense/2.0 (cartography educational project)'})
r.raise_for_status()
result=[]
for row in r.json()['elements']:
    geo=row.get('geometry')
    if not geo or len(geo)<2:continue
    line=LineString([(n['lon'],n['lat']) for n in geo]); part=line.intersection(perimetro_andorra)
    if part.is_empty:continue
    tracks=[part] if part.geom_type=='LineString' else list(getattr(part,'geoms',[]))
    for i,g in enumerate(tracks):
        if g.geom_type!='LineString' or g.length<.00003:continue
        tags=row.get('tags',{})
        result.append({'type':'Feature','properties':{'id':f"osm-{row['id']}-{i}",'nombre':tags.get('ref') or 'Vía existente (sin denominación paniense)','categoria':'carretera','clase':tags.get('highway'),'estado':'existente','ref_osm':row['id'],'source':'OpenStreetMap contributors / ODbL'},'geometry':mapping(g)})
if not result:raise SystemExit('No se han descargado carreteras, no se modifica ningún archivo.')
path=BASE/'carreteras.geojson'
path.write_text(json.dumps({'type':'FeatureCollection','features':result},ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print('Importadas',len(result),'geometrías de carreteras reales en',path)
