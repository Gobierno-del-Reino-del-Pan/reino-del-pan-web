#!/usr/bin/env python3
"""Importa límites costeros REALES del archipiélago Medes vía OpenStreetMap/Overpass.
No genera polígonos sintéticos: aborta si no puede verificar que ChinPan está en Meda Gran.
Requiere red, requests, shapely. Al actualizar, conserva la geometría continental real de Torroella.
Licencia de datos: OpenStreetMap contributors, ODbL.
"""
from pathlib import Path
import argparse,json,requests
from shapely.geometry import Polygon,Point,shape,mapping
from shapely.ops import unary_union
HERE=Path(__file__).resolve().parents[1]/'public'/'atlas'
CAPITAL=Point(3.22281,42.04744)
QUERY='''[out:json][timeout:70];(way["place"="islet"](42.038,3.215,42.056,3.233);way["place"="island"](42.038,3.215,42.056,3.233);way["natural"="coastline"](42.038,3.215,42.056,3.233););out geom;'''

def importar(endpoint):
    response=requests.post(endpoint,data={'data':QUERY},timeout=100)
    response.raise_for_status();items=response.json().get('elements',[])
    encontrados={}
    for w in items:
        if w.get('type')!='way':continue
        raw=w.get('geometry',[])
        if len(raw)<4:continue
        coords=[(v['lon'],v['lat']) for v in raw]
        if coords[0]!=coords[-1]:continue
        poly=Polygon(coords)
        if not poly.is_valid or poly.area<1e-9 or poly.area>0.002:continue
        if not (3.215<poly.centroid.x<3.234 and 42.038<poly.centroid.y<42.056):continue
        encontrados[w['id']]={'poly':poly,'nombre':w.get('tags',{}).get('name','Islote de las Medas')}
    assert encontrados,'No se han obtenido islas con costa cerrada: no se modifica el atlas.'
    union=unary_union([v['poly'] for v in encontrados.values()])
    assert union.covers(CAPITAL),'ChinPan no cae dentro del contorno descargado: no se modifica el atlas.'
    file=HERE/'regiones.geojson';data=json.loads(file.read_text(encoding='utf8'))
    # Sustituir solo las partes insulares previamente importadas.
    data['features']=[f for f in data['features'] if f['properties'].get('fuente_geo')!='OpenStreetMap ways coastline']
    for osm_id,v in encontrados.items():
        data['features'].append({'type':'Feature','geometry':mapping(v['poly']), 'properties':{
            'id':f'sin-gluten-medas-osm-{osm_id}', 'region_id':'sin-gluten',
            'nombre':'SIN GLÚTEN · archipiélago', 'isla_referencia':v['nombre'],
            'fuente_geo':'OpenStreetMap ways coastline', 'source':f'https://www.openstreetmap.org/way/{osm_id}',
            'licencia':'ODbL 1.0', 'estado_limite':'geometria_fisica_real_atribucion_paniense_ficticia'}})
    file.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf8')
    print('Importadas islas:',len(encontrados),'ChinPan dentro de costa real: sí')

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--endpoint',default='https://overpass.kumi.systems/api/interpreter');args=p.parse_args()
    importar(args.endpoint)
