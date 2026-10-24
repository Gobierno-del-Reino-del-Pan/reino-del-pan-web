#!/usr/bin/env python3
"""Materializa geometrías GeoJSON reales desde contornos cartográficos publicados.
Orígenes: geoBoundaries ADM1 AND/ARG; IGN Admin Express a través de france-geojson.
Las fronteras políticas del Estado Paniense son una agrupación FICTICIA de unidades REALES.
La codificación polyline representa coordenadas WGS84 simplificadas a cinco decimales.
"""
import json
from pathlib import Path
from shapely.geometry import shape, mapping, Point
from shapely.ops import unary_union

OUT = Path(__file__).resolve().parent.parent / 'public' / 'atlas'
OUT.mkdir(parents=True, exist_ok=True)

def unpack(s):
    pos=0; lat=0; lon=0; out=[]
    while pos<len(s):
        vals=[]
        for _ in range(2):
            shift=0; value=0
            while True:
                b=ord(s[pos])-63; pos+=1; value|=(b & 31)<<shift; shift+=5
                if b <32: break
            vals.append(~(value>>1) if value&1 else (value>>1))
        lat+=vals[0]; lon+=vals[1]
        out.append([round(lon/1e5,5),round(lat/1e5,5)])
    assert out[0]==out[-1], 'Anillo no cerrado'
    return out

def polygon(s):
    return {'type':'Polygon','coordinates':[unpack(s)]}

def multi(polys):
    return {'type':'MultiPolygon','coordinates':[[unpack(s)] for s in polys]}

def feature(geom, **props):
    return {'type':'Feature','properties':props,'geometry':geom}

def save(name, fs):
    path=OUT / (name+'.geojson')
    path.write_text(json.dumps({'type':'FeatureCollection','features':fs},ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    print(f'{name}: {len(fs)} elementos / {path.stat().st_size} bytes')

AND = {
'AD-06': ('Sant Julià de Lòria', r'''kxdbG{boHikBxgKsxCpuE`Qpw@~f@xUpL~UdCxkB`s@jy@|JPxIg`Bth@_q@``AxBpXgb@rv@fNhS_Ypd@nL|i@g_AdE{o@eHoyAhMc|BvY{}AmOq`BbCmzCaXiWsl@qA{Rg^cm@bJqa@aX{^bn@A?''', 'pimbo'),
'AD-02': ('Canillo', r'''qjubGkzqIin@m`@_c@km@wFiXjEerAoi@ujB_UsZyVvGkNb\gSrjC}W~lAkPrgBwJrP{k@HcsA_gA{a@r@|Grl@eApvBac@ngA}Sr|BtW`ZbFhfB}f@jm@wSzr@Dfc@pRdy@f@jbAwHxz@|N`[|w@}PtGdg@ro@jn@ph@lmA~bAlUzd@bo@rSwH``AzCd{A_i@t^`PpTld@hADlBalA{F_VhHgTbH{xAkJw_BqRmZmsBcmAlvAwrNr@a~@tZyjA''', 'croissant'),
'AD-05': ('Ordino', r'''aidcGu`xHqBbYci@nc@_Nh|@u~@xp@cS`@aDt]{^vg@sB`lB`ZnbBxYvw@}AddAzGdi@aFjUap@nl@hShwAzeA`Mdd@dr@fd@aCj{A{n@jg@p`@deA_kDj_BsB~e@al@d[qDzQij@vk@ym@jh@eE`M_L~`@olAkPij@|Osc@iLie@nE{t@@SDaB_C{IqTmd@u^aPe{A~h@a`A{CsSvH{d@co@_cAmUqh@mmAso@kn@uGeg@}w@|P''', 'pimbo'),
'AD-04': ('La Massana', r'''at`cGuf~GvE~s@jQlb@d@~xAhf@?d^pPfUtgAh]~DhUkLdf@qsAbWeWfWlZbm@juBtmA|^nk@pa@tOyDoZiw@Oss@_Te_@pGer@dVil@|u@yG|~@_iAvq@qVpEi~@kZmbAtIw|@iXwlAsVqkAuAuGkK_g@nFw`@_A_hAIIu@_AkSsPmQxEen@eq@k|@ib@ARoEzt@hLhe@}Orc@jPhj@_a@nlAaM~Kkh@dEwk@xm@{Qhj@e[pD_f@`l@k_BrBeeA~jD''', 'pimbo'),
'AD-03': ('Encamp', r'''g|tbGm~pH~BzIE`Bj|@hb@dn@dq@lQyEjSrPt@~@nMoRtX{HfRua@mYgm@iBaw@``@mcAn_@qa@z{@izBfAoVmUwb@xy@g`GemAey@lGiO|p@_S~M{R_Dkt@jVghBuOwl@maAop@iHq`@ywAjTmfAaw@asBcDwEkLuZxjAs@`~@mvAvrNlsBbmApRlZjJv_BcHzxAiHfTzF~UmB`lAiAE''', 'croissant'),
'AD-08': ('Escaldes-Engordany', r'''mxcbG_rpHQgOfMqKxGk\h_@kK`Mae@q`@gF}`@kYoa@}|@Ec_@~OeU}IwhAbHosAuYqUfC{k@iGg]nIgv@gY{ViJab@sd@bNsuAbCyy@f`GlUvb@gAnV{{@hzBo_@pa@a`@lcAhB`w@lYfm@gRta@uXzHoMnRHH~@~gAoFv`@jK~f@tAtGfzH}oFbd@n_@V?@?z^cn@''', 'baguette'),
'AD-07': ('Andorra la Vella', r'''kxdbG{boHW?cd@o_@gzH|oFrVpkAhXvlAuIv|@jZlbAqEh~@b_@bs@rxCquEhkBygK''', 'baguette'),
}

FR = {
'64024': ('Anglet', r'''amghGl|jHeu@gEkdBpD}t@rxAgI}I}TmMgJeIoSqK{w@yn@uSoKoLyNuNcFmEiFyOoDqJqGqNeB~Dwe@dJ{jBzJkWrWcb@zPyFfg@jFn_@pBzUwKnZvTr\vFzZzHd_@jQc@vH`RjUdTQdEwo@vJq@yB_M}HiBMaHfIqIbUQ~DxKzGfB~JxTpNxAta@kEj[_K`MxEhK?jGvSmFd]kApRhBvg@qJtWkV`G}IzQ_Cze@}Kjq@'''),
'64102': ('Bayonne', r'''sqfhGr}`HnGRhBxb@jIxIxOjCoD`NiK?aMyEk[~Jua@jEqNyA_KyT{GgB_EyKcUPgIpIL`H|HhBxB~LwJp@eEvo@eTPaRkUb@wHe_@kQ{Z{Hs\wFoZwT{UvKo_@qBCsR_BoMkJcKvDeJiDyh@_EwRoKuYbB_QsNwb@tCkStKmMr@cm@|Meh@hB}P_CaIu@cR_CuIvIsLjRuQ|QqEzKcIgAqF~NgI`@}IzJf@fAcFvROlFvm@fEjP`MvN|MvX`Ulw@nApH|JcGlGlN~DwDbCxCvMsD~JtMtL~c@gUdOxAjJwM~KtMvQhKr[~EyF~L`ExFs@lA~PvKhBdLiHaBzl@u@fGhIpDAxJfHxGdIqFvK`BtG|FtEvSxJ{E'''),
'64122': ('Biarritz', r'''y_hhGresHiK}EsDnGiKoEaAyQeRgHsOuOwK{@wOsJoHhIaSeABqSoC_FeAoVeMqKqAcH}LaS{KiDyBhKsIv@s@iNpEmK}BkH|t@sxAjdBqDdu@fElWxLrJ|IzTzDbYoAd@lQwAlQf@jScA|XaCtUqPd]uJdJeNvGoFnIoKnDcHdKgKrl@oIfF'''),
'64125': ('Bidart', r'''y_hhGresHnIgFfKsl@bHeKnKoDnFoIdNwGtJeJpPe]`CuUbA}Xg@kSvAmQrh@fVQz_@kMxv@zHh@`XqH|IaHrOpi@tGoInLxEfF`V|Cl\t\tR~G~NfI`JxIfAzFrHl@`OaL`\fDzDdMjb@jBfVaA~Duk@n@}QxQyChOZtG_IrHqLiBgE}G|@sQcQgRmJ}BiQ{VoErEeEiOiLbFgJ_FcZsBuF{Qa@sMsJ}JyVuReU{KoErEcIiGiAuGeKyIZgE'''),
'64140': ('Boucau', r'''ykqhGzjbHgg@kF{PxFsWbb@{JjW_LuA@q]fBwKcJ_GaFsN}CnEqGaEv@qImOyLaQ}b@mDoN`AaIxJwHF{EhMO|FyKx@}LyCuD`Igi@pEwCrVrOfc@nDnMsBjSnHcB~PnKtY~DvRhDxh@wDdJjJbK~AnMBrR'''),
'64189': ('Ciboure', r'''{fygGx`eIvIwKYgPhQwMdG{MdGk`@}Dan@iCoPxGiE~FlDfPmH|NgPjVtF~Kz@|G}AvMuD`MOlQdCdCtVMfJrOhHdD~HVjd@gGeBcFfTgJ|HmBrK_JcJaEbEwKKsF`FiClLy_@lYoUkDePzXxBzDyE`PhBdKp@zTrExBaA`MiIhZ{KzMmEnJ{FeFuE{LgOoUgOByJlDgLdJuGxJwLco@dDiC|IlFxDuAhKbEtKoIzByL_Be\~Ii_@'''),
'64249': ('Guéthary', r'''a}`hGdjyH~HsH[uGxCiO|QyQtk@o@v@hPuFxm@cGnF_B`[oJ|PwSjIoIqBoK}HkB}F~CeY{EmX'''),
'64260': ('Hendaye', r'''y`xgGhsqIzHwGnJlGhIwBvQzRdItO|DlPwB|R~ClEzIoAvFtB~JiAg@~JjB~L}@hMrMkFbOzBjOrOfJvFbEtK@lItOjFnKoAvEvFL`QwFxCx@lJbM|FbG{H|FvGjEYb@m\jEcF|G~WbAvQgA~NkGzW}DjFkP|@mB~DPfOkDjSyMxSiSbLqLaCy_@mb@cEdDcAhNgExLmRbOqRpG{LaAwa@mS`A_K|WjLjC}]pAsa@G_W}OslAaF_NmHaKaDaNoDpP{E[gKqJiEnBkC}SkM{FeCqSrBoHvGS~NpGfAeNwDoLbQwYmFcRDqQ'''),
'64483': ('Saint-Jean-de-Luz', r'''{fygGx`eIkFgWsJeQ}LwJaUxB~@~PkShLgGgSwG_GuFU?{OaIiE_BqR}FeZzK}IMoQaJkRuGsUcImFUzKcPaFsFeWbGiQwCeSoIeBuGfPeIsG[qHfD}JyGoHqOn@qElDmAg\vSkInJ}P~Aa[bGoFtFym@w@iP`A_EjWnDt|@{HjDkDnLrFpYpZl\li@tJlS|Jba@rk@kI|QgEzMDbNkBbTbFpEjKbB~LkHp\{B|c@pFl[oEnNOnI}G|A_L{@kVuF}NfPgPlH_GmDyGhEhCnP|D`n@eGj`@eGzMiQvMXfPwIvK'''),
'64545': ('Urrugne', r'''_tpgGx|vIZjEkEbFc@l\kEX}FwGcGzHcM}Fy@mJvFyCMaQwEwFoKnAuOkFAmIcEuKgJwFkOsOcO{BsMjF|@iMkB_Mf@_K_KhAwFuB{InA_DmEvB}R}DmPeIuOwQ{RiIvBoJmG{HvGkE}Qp@mDgRmg@mDyX{Ge\eAwSuLuUSwGmHeZgFee@eDc@_Gga@r@kAtGyJfLeJxJmDfOCfOnUtEzLzFdFlEoJzK{MhIiZ`AaMsEyBq@{TiBeKxEaPyB{DdP{XnUjDx_@mYhCmLrFaFvKJ`EcE~IbJlBsKfJ}HbFgTfGdBzEf@tMcEtR`@te@eMhJyDvFtZYjWjKeGhJnI~A{Cje@t@vLyFlJsYlZyLlKi\lGuGnBwSOyLhr@a]vMnr@ObI}Sjl@wNlMmEdXEfa@gF~XfRjb@jBdUjEjL{@xR`HvOe@hM_I~P{AbOqDtFrO|^dAtSgE~Vyg@b[gOtMeFnXkW~BwCjGaq@mGse@|p@wc@tXyYv]Xvd@aAlCVfg@rP`AbMzHhAbFgDnQsAjVtFfN'''),
}

FUEGO = [
r'''zhtlI~plhKsxA}pPqeCebUcsAchSu`@iw[u|@k|VadBejOe|CybAmxDpgFgw@zpPgJ~hVzOb`Yv`@lyW`hAvtR~tBdbU~pCbmNx}DdlKblGucDfbA{sO?wvN''',
r'''lqnkIpnapKm|F`we@m~P~~`Aihi@h_xAixCpuUumNhki@ewa@dlmA}kXtce@}sJd`YknStm[yvOj~RubT~rL_cIhkH_mBt~H{oCpxTajC`rIy`Pn}CkoJkKebFynHmlJaqLikIxsC{uT`h\{yMrzWnhYbNr`^q{@n}[ggC|bbAigDlmh@ucDvzhAeqFjzjAooGzc`@oeD~MyfYwgAe{]gf@}kU?izZ~rAsm[rxAginAnxA{nu@|rAeeTr_CebUrbEi_VfwDi|V|dC_sLfq@obKgq@uyM_lDmcNsjCsaHyrA}wG_~As_m@klDw{I{jCkhI?cya@tcBarIbbAoeJugAegPwcBolb@w_CcoJsiIeoJ}qG}|BguLa\ynHfnGiw@nvX`l@vyM`yAhaR?|a_@uq@~jR'''
]

# Fuentes originales sin geometrías ficticias: AND 7 parroquias, 10 municipios FRA y TDF ADM1.
source_and='geoBoundaries AND ADM1 (2007), datos derivados de Wikimedia, public domain'
source_fr='IGN Admin Express 2018, france-geojson, Licence Ouverte 2.0'
source_arg='geoBoundaries ARG ADM1 (2006), CC BY 2.5'
regions=[];parishes=[]
for code,(name,s,reg) in AND.items():
    g=polygon(s)
    parishes.append(feature(g,id=code,region_id=reg,real_name=name,source=source_and,year=2007))
    regions.append(feature(g,id=f'{reg}-{code}',region_id=reg,unidad_origen=code,estado_limite='base_administrativa_real_agrupacion_provisional',source=source_and))

for code,(name,s) in FR.items():
    regions.append(feature(polygon(s),id=f'pretzel-{code}',region_id='pretzel',unidad_origen=code,estado_limite='base_administrativa_real_agrupacion_provisional',source=source_fr))

geom=multi(FUEGO)
print('Tierra del Fuego: bounding boxes de los componentes:')
for g in shape(geom).geoms:
    print(g.bounds,'area',g.area)
# Conservar componentes en el sector de Tierra del Fuego (sin extender la pretensión a la Antártida).
parts=[g for g in shape(geom).geoms if -57<g.centroid.y<-51 and -75<g.centroid.x<-60]
if parts:
    geom=mapping(unary_union(parts))
    regions.append(feature(geom,id='pan-plano-arepa-arg-v',region_id='pan-plano-arepa',estado_limite='base_provincial_real_alcance_provisional',source=source_arg))

save('regiones',regions)
save('parroquias_referencia',parishes)
save('capitales',[
    feature({'type':'Point','coordinates':[1.5218,42.5063]},id='pantopia',region_id='baguette',nombre='PANTOPÍA',categoria='capital',rango='capital_estado_y_region',estado='emplazamiento_provisional'),
    feature({'type':'Point','coordinates':[1.5332,42.5563]},id='pimbolandia',region_id='pimbo',nombre='PIMBOLANDIA',categoria='capital',rango='capital_regional',estado='emplazamiento_acordado'),
    feature({'type':'Point','coordinates':[1.5902,42.5547]},id='vila-croissant',region_id='croissant',nombre='VILA CROISSANT',categoria='capital',rango='capital_regional',estado='emplazamiento_aproximado'),
    feature({'type':'Point','coordinates':[-1.4748,43.4929]},id='pretzelopolis',region_id='pretzel',nombre='PRETZELOPÓLIS',categoria='capital',rango='capital_regional',estado='emplazamiento_aproximado'),
    feature({'type':'Point','coordinates':[3.2230,42.0481]},id='chinpan',region_id='sin-gluten',nombre='CHINPAN',categoria='capital',rango='capital_regional',estado='emplazamiento_aproximado'),
    feature({'type':'Point','coordinates':[-68.3030,-54.8019]},id='arepa',region_id='pan-plano-arepa',nombre='AREPA',categoria='capital',rango='capital_regional',estado='emplazamiento_aproximado'),
])

save('especiales',[
    feature({'type':'Point','coordinates':[-34.62,-77.87]},id='atlantida',region_id='atlantida',nombre='ATLÁNTIDA',categoria='territorio_ultramar',estado='perimetro_pendiente',nota='Localizador de referencia antártica, no delimitación política'),
    feature({'type':'Point','coordinates':[-13.21,24.21]},id='sahara',region_id='sahara',nombre='SÁHARA OCCIDENTAL · TERRITORIO EN NEGOCIACIONES',categoria='negociaciones',estado='sin_delimitacion_paniense'),
    feature({'type':'Point','coordinates':[3.2230,42.0481]},id='medes-referencia',region_id='sin-gluten',nombre='ISLAS MEDAS · LÍMITE PENDIENTE',categoria='perimetro_pendiente',estado='pendiente'),
])
for x in ['carreteras','ferrocarriles','aeropuertos','estaciones','puertos','otros']:
    save(x,[])

# QC: todos los polígonos válidos y coordinadas esperadas
bad=[]
for f in regions:
    geom=shape(f['geometry'])
    if not geom.is_valid or geom.is_empty: bad.append((f['properties']['id'],geom.is_valid))
print('Geometrías inválidas:',bad)
if bad: raise SystemExit('ERROR: revisar geometrías antes de publicar')
