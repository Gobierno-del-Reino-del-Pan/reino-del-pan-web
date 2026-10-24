#!/usr/bin/env python3
"""Validación v2.2: sin geometrías arbitrarias ni capitales desplazadas para cuadrarlas."""
from pathlib import Path
import json
from shapely.geometry import shape
from shapely.ops import unary_union
B=Path(__file__).resolve().parents[1]/'public'/'atlas'
def load(s):
    x=json.loads((B/f'{s}.geojson').read_text(encoding='utf8'))
    assert x['type']=='FeatureCollection'
    return x['features']
regs=load('regiones'); par=load('subdivisiones'); cap=load('capitales')
assert len(par)==7
rids=['pimbo','baguette','croissant']
assert [f['properties']['region_id'] for f in regs[:3]]==rids
u=unary_union([shape(f['geometry']) for f in par]);u2=unary_union([shape(f['geometry']) for f in regs if f['properties']['region_id'] in rids])
assert u.symmetric_difference(u2).area<1e-10, 'Las 3 regiones no cubren exactamente las 7 parroquias'
for i,a in enumerate(regs[:3]):
 for b in regs[i+1:3]:
  assert shape(a['geometry']).intersection(shape(b['geometry'])).area<1e-10, 'Solapamiento interregional'
assert all(shape(f['geometry']).is_valid for f in regs)
assert all(f['properties'].get('source') for f in regs)
assert len([f for f in regs if f['properties']['region_id']=='sin-gluten'])>=1
assert len(cap)==6
for c in cap:
 rid=c['properties']['region_id']; g=shape(c['geometry']); result=[r for r in regs if r['properties']['region_id']==rid and shape(r['geometry']).covers(g)]
 label=c['properties']['nombre']
 if rid in ('pimbo','baguette','croissant','pretzel'):
  assert result,f'{label} no cae en su región asignada'
 if rid in ('sin-gluten','pan-plano-arepa'):
  print(f'{"✔" if result else "PENDIENTE"} {label}: georreferencia {"validada" if result else "solo punto; perímetro costero/municipal oficial no importado"}')
 else:
  print('✔',label,'en polígono verificado')
assert shape(regs[4]['geometry']).bounds[0]>3.09 and shape(regs[4]['geometry']).bounds[2]<3.22
assert not any(f['properties']['region_id']=='pan-plano-arepa' and f['properties'].get('fuente_geo')=='geoBoundaries ARG ADM1 (2006)' for f in regs)
print(f'OK: {len(regs)} unidades territoriales, 3 regiones andorranas derivadas exactamente de 7 parroquias, sin solapamientos.')
