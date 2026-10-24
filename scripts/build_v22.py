#!/usr/bin/env python3
"""Atlas v2.2: disuelve siete parroquias en tres regiones y añade base municipal real de Torroella.
Entrada proviene de generate_sources_v21.py (contornos publicados) y del TopoJSON catalán publicado.
No dibuja límites artificiales para las islas Medas ni Ushuaia.
"""
from pathlib import Path
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
import json

BASE = Path(__file__).resolve().parents[1] / 'public' / 'atlas'
def load(name):
    return json.loads((BASE / f'{name}.geojson').read_text(encoding='utf8'))['features']
def save(name, features):
    out={'type':'FeatureCollection','features':features}
    (BASE / f'{name}.geojson').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':')),encoding='utf8')
    print(name,len(features))
def feat(geom,props):return {'type':'Feature','geometry':mapping(geom),'properties':props}

def poly_decode(s):
    """Decodifica Google Polyline a [longitud,latitud], con precisión de 1e-5."""
    i=0;a=0;b=0;out=[]
    while i<len(s):
        dif=[]
        for _ in range(2):
            result=0;shift=0
            while True:
                c=ord(s[i])-63;i+=1
                result |= (c&0x1f)<<shift;shift+=5
                if c<0x20:break
            dif.append(~(result>>1) if result&1 else (result>>1))
        a+=dif[0];b+=dif[1];out.append([round(b/1e5,5),round(a/1e5,5)])
    if out[0]!=out[-1]:out.append(out[0])
    return out

# Fuente explícita: sirisacademic/catalonia-cartography/cat-municipis.json
# TopoJSON cat-municipis, objeto Torroella de Montgrí (id 171997), polígono generalizado.
# Este polígono continental NO incluye las islas Medas y tampoco debe interpretarse como el límite de estas.
TORROELLA_POLYLINE=r'''{i}_G{ubR}z@akFxZgvAj{CgzAny@grAl_B|@zWjlAb~BvZneC{LsM~sB~d@hrAuJblBkuBpp@exAvsCsyAkjAucAt{ColAzNc_@sl@}AwoC}`B}H'''

def run():
    parroquias=load('parroquias_referencia')
    originales=load('regiones')
    # Regiones administrativas unitarias, geometrías exactas de las parroquias fuente.
    grupos={
      'pimbo':{'AD-05','AD-04','AD-06'},
      'baguette':{'AD-07','AD-08'},
      'croissant':{'AD-02','AD-03'},
    }
    regions=[]
    for nombre,codigos in grupos.items():
      ins=[shape(f['geometry']) for f in parroquias if f['properties']['id'] in codigos]
      assert len(ins)==len(codigos),f'Faltan piezas {nombre}'
      geom=unary_union(ins)
      assert geom.is_valid
      regions.append(feat(geom,{
        'id':nombre,'region_id':nombre,'nombre':nombre.upper(),
        'status':'propuesta_paniense_agrupacion_sobre_parroquias_reales',
        'estado_limite':'regiones_delimitadas_por_parroquias',
        'fuente_geo':'geoBoundaries AND ADM1, año 2007',
        'fuentes_unidades':sorted(codigos),
        'source':'https://github.com/robit-man/tiny-atlas/blob/main/elevation_model/geojson/ADM1/AND.geojson'
      }))
    # Pretzel: disolver diez municipios contiguos sin líneas internas visibles.
    fr=[shape(f['geometry']) for f in originales if f['properties']['region_id']=='pretzel']
    assert len(fr)==10
    pretzel=unary_union(fr)
    regions.append(feat(pretzel,{
      'id':'pretzel','region_id':'pretzel','nombre':'PRETZEL',
      'status':'propuesta_paniense_sobre_municipios_reales',
      'estado_limite':'seleccion_municipios_por_ratificar',
      'fuente_geo':'IGN Admin Express / france-geojson 2018',
      'source':'https://github.com/gregoiredavid/france-geojson'
    }))
    from shapely.geometry import Polygon
    torroella=Polygon(poly_decode(TORROELLA_POLYLINE))
    assert torroella.is_valid and torroella.area>0
    regions.append(feat(torroella,{
      'id':'sin-gluten-continental','region_id':'sin-gluten','nombre':'SIN GLÚTEN · sector continental',
      'estado_limite':'propuesta_continental_no_ratificada',
      'status':'solo_torroella_continental_falta_islas_medas',
      'fuente_geo':'TopoJSON municipios Cataluña; geometrias de Torroella de Montgrí, generalizadas',
      'source':'https://github.com/sirisacademic/catalonia-cartography/blob/master/cat-municipis.json',
      'codigo_fuente':'171997',
    }))
    save('regiones',regions)
    save('subdivisiones',parroquias)
    # El polígono anterior de Tierra del Fuego se mantiene únicamente como referencia,
    # no coloreado como frontera de la región paniense ni propuesto como ejido municipal.
    fueguinos=[f for f in originales if f['properties']['region_id']=='pan-plano-arepa']
    for f in fueguinos:
      f['properties'].update({'id':'provincia-fuego-contexto','region_id':'contexto','nombre':'Provincia argentina de Tierra del Fuego (referencia histórica)','estado_limite':'no_es_poligono_arepa','nota':'La costa generalizada no incluye la capital Arepa en Ushuaia','fuente_geo':'geoBoundaries ARG ADM1 (2006)'})
    save('contexto_fueguino',fueguinos)
    capitals=load('capitales')
    for c in capitals:
      if c['properties']['id']=='chinpan':
        c['geometry']['coordinates']=[3.22281,42.04744]  # Ubicación del islote OSM way 4791233
        c['properties']['estado']='isla_identificada_costa_pendiente'
      if c['properties']['id']=='arepa':
        c['properties']['estado']='ciudad_confirmada_ejido_pendiente'
    save('capitales',capitals)
    especiales=load('especiales')
    for f in especiales:
      if f['properties']['id']=='medes-referencia':
        f['properties']['nombre']='MEDA GRAN · COSTA INSULAR POR IMPORTAR'
        f['properties']['nota']='La capital ChinPan está en Meda Gran: solo falta importar un perímetro insular auténtico'
        f['geometry']['coordinates']=[3.22281,42.04744]
    save('especiales',especiales)
    metadata={
      'version':'2.2','crs':'EPSG:4326',
      'real_geometry':{'andorra':{'parish_count':7,'regions':list(grupos),'source':'geoBoundaries AND ADM1 (2007)'},
        'pretzel':{'municipal_units':10,'source':'IGN Admin Express 2018'},
        'sin_gluten_continental':{'source':'TopoJSON Catalunya municipio Torroella de Montgrí 171997','status':'propuesta'},
        'medes_islands':{'status':'sin_geometry','osm_way_id':4791233,'capital_verified_point':[3.22281,42.04744]},
        'arepa':{'status':'sin_municipal_geometry','source_to_import':'https://ide.tierradelfuego.gob.ar/descargas/'}},
      'fictional_assignment':True,
      'note':'El grupo de parroquias es una propuesta paniense. No implica reivindicación territorial real.'
    }
    (BASE/'estado_delimitacion_v22.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf8')

if __name__=='__main__':run()
