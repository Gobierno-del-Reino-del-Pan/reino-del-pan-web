#!/usr/bin/env python3
"""Importar polígono oficial del ejido municipal de Ushuaia (IDETDF, WFS GeoServer).
Conectividad necesaria. Solo añade geometría SI contiene el punto acordado Arepa
 y la fuente tiene referencias al municipio; nunca fabrica límite de costa.
"""
from pathlib import Path
import json,requests,xml.etree.ElementTree as ET
from shapely.geometry import shape,Point,mapping
URL='https://tiles.tierradelfuego.gob.ar/geoserver/ows'
HERE=Path(__file__).resolve().parents[1]/'public'/'atlas'
AREPA=Point(-68.303,-54.8019)

def run():
    rr=requests.get(URL,params={'service':'WFS','request':'GetCapabilities','version':'1.1.0'},timeout=40)
    rr.raise_for_status();xml=ET.fromstring(rr.content)
    feature_types=[]
    for e in xml.iter():
        if e.tag.endswith('FeatureType'):
            for sub in e:
                if sub.tag.endswith('Name') and sub.text:
                    feature_types.append(sub.text.strip())
    candidates=[v for v in feature_types if any(term in v.lower() for term in ['ejido','municipio','gobierno_local'])]
    if not candidates:raise RuntimeError('WFS no publica una capa municipal identificable; revisa el catálogo IDETDF.')
    verified=[]
    for name in candidates:
        try:
            r=requests.get(URL,params={'service':'WFS','version':'1.1.0','request':'GetFeature',
                 'typeName':name,'outputFormat':'application/json','srsName':'EPSG:4326',
                 'bbox':'-69.2,-55.3,-67.9,-54.35,EPSG:4326'},timeout=70)
            if not r.ok:continue
            collection=r.json()
            for f in collection.get('features',[]):
                g=shape(f.get('geometry'))
                if g.geom_type not in {'Polygon','MultiPolygon'} or not g.is_valid or not g.covers(AREPA):continue
                # La característica debe estar identificada como Ushuaia, no solo contener la ciudad.
                d=' '.join(str(x) for x in f.get('properties',{}).values()).lower()
                if 'ushuaia' not in d:continue
                verified.append((name,g,f.get('properties',{})))
        except (requests.RequestException,ValueError,TypeError):continue
    if not verified:raise RuntimeError('No hay ejido oficial verificable que contenga Arepa. Atlas sin modificar.')
    # Preferencia por límite de ejido (más específico) frente a municipio general.
    verified.sort(key=lambda x:('ejido' not in x[0].lower(),x[1].area))
    name,g,attributes=verified[0]
    path=HERE/'regiones.geojson';data=json.loads(path.read_text(encoding='utf8'))
    data['features']=[f for f in data['features'] if f['properties'].get('region_id')!='pan-plano-arepa']
    data['features'].append({'type':'Feature','geometry':mapping(g),'properties':{
      'id':'pan-plano-arepa-ejido-ushuaia','nombre':'PAN PLANO / AREPA · ejido Ushuaia',
      'region_id':'pan-plano-arepa','estado_limite':'propuesta_paniense_sobre_ejido_real',
      'fuente_geo':'IDETDF WFS','tipo_capa':name,'source':URL,
      'atributos_fuente':attributes}})
    path.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'),default=str),encoding='utf8')
    print('Importada geometría del ejido:',name,'capital AREPA dentro: sí')

if __name__=='__main__':run()
