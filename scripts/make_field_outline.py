"""
segment.tif（撮影範囲マスク: 値255=圃場）から圃場の輪郭ポリゴンを生成し、
GeoJSON(EPSG:4326)として public/field-outline.geojson に出力する。

実行（conda geo 環境のGDALを使用）:
  $env:Path = "D:\\ProgramData\\Miniconda\\miniconda3\\envs\\geo\\Library\\bin;" + $env:Path
  & "D:\\ProgramData\\Miniconda\\miniconda3\\envs\\geo\\python.exe" scripts\\make_field_outline.py
"""
import os
from osgeo import gdal, ogr, osr

gdal.UseExceptions()

HERE = os.path.dirname(os.path.abspath(__file__))
SEG = os.path.normpath(os.path.join(HERE, "..", "..", "map", "segment.tif"))
OUT = os.path.normpath(os.path.join(HERE, "..", "public", "field-outline.geojson"))

# しきい値: 255(有効範囲) を 1、その他を 0 にした2値マスクを作る
src = gdal.Open(SEG)
band = src.GetRasterBand(1)
arr = band.ReadAsArray()
mask = (arr == 255).astype("uint8")

mem = gdal.GetDriverByName("MEM").Create("", src.RasterXSize, src.RasterYSize, 1, gdal.GDT_Byte)
mem.SetGeoTransform(src.GetGeoTransform())
# segment.tif は CRS 未埋め込みなので EPSG:4326 を明示
srs = osr.SpatialReference(); srs.ImportFromEPSG(4326)
mem.SetProjection(srs.ExportToWkt())
mem.GetRasterBand(1).WriteArray(mask)
mem.GetRasterBand(1).SetNoDataValue(0)

# ポリゴン化（値1の領域のみ）。GDAL3.x 統一API: gdal.GetDriverByName('Memory').Create
vds = gdal.GetDriverByName("Memory").Create("poly", 0, 0, 0, gdal.GDT_Unknown)
lyr = vds.CreateLayer("poly", srs=srs, geom_type=ogr.wkbPolygon)
lyr.CreateField(ogr.FieldDefn("dn", ogr.OFTInteger))
gdal.Polygonize(mem.GetRasterBand(1), mem.GetRasterBand(1), lyr, 0, [], None)

# dn=1 のポリゴンを集約 → 最大面積の外周だけ採用（小さなノイズ除去）、簡素化
union = None
for feat in lyr:
    if feat.GetField("dn") != 1:
        continue
    g = feat.GetGeometryRef().Clone()
    union = g if union is None else union.Union(g)
if union is None:
    raise SystemExit("値255の領域が見つかりませんでした")

# 約1m(=1e-5度)で簡素化して頂点を削減
union = union.SimplifyPreserveTopology(1e-5)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
if os.path.exists(OUT):
    os.remove(OUT)
out = gdal.GetDriverByName("GeoJSON").Create(OUT, 0, 0, 0, gdal.GDT_Unknown)
olyr = out.CreateLayer("field", srs=srs, geom_type=ogr.wkbMultiPolygon)
fdef = olyr.GetLayerDefn()
f = ogr.Feature(fdef)
f.SetGeometry(ogr.ForceToMultiPolygon(union))
olyr.CreateFeature(f)
out = None

area_m2 = union.GetArea() * (111320 ** 2) * 0.73  # 緯度43度の概算(cosφ補正)
print(f"OK -> {OUT}")
print(f"  rings/parts: {union.GetGeometryCount()}, approx area: {area_m2/10000:.2f} ha")
