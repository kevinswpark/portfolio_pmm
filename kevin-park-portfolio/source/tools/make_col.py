"""Build the ZIP -> cost-of-living table for the financial planner.

Sources (all public):
  BEA Regional Price Parities, 2024 (SARPP state, MARPP metro), released Feb 19, 2026
  Census 2020 ZCTA-to-county relationship file (tab20_zcta520_county20_natl.txt)
  OMB 2023 CBSA delineation (list1_2023.xlsx)
  Census county population estimates, 2024 (co-est2024-alldata.csv)
Method: each ZCTA takes the county with the most land overlap. A county in a metro
area takes that metro's RPP. A county outside every metro takes its state's
nonmetro RPP, backed out of the state RPP using 2024 population weights.
Output: a compact JS module of ZIP runs (a new run starts where the area changes).
"""
import json, re, sys
import pandas as pd
from pathlib import Path

D = Path(sys.argv[1]); OUT = Path(sys.argv[2])
YEAR = "2024"

def fips(s): return s.strip().strip('"')
sa = pd.read_csv(D/"sa/SARPP_STATE_2008_2024.csv", dtype=str, encoding="latin1")
sa = sa[sa.LineCode.str.strip() == "1"]
state_rpp, state_name = {}, {}
for _, r in sa.iterrows():
    f = fips(r.GeoFIPS)
    if f == "00000" or f[2:] != "000": continue
    state_rpp[f[:2]] = float(r[YEAR]); state_name[f[:2]] = r.GeoName.strip().rstrip(" *")

ma = pd.read_csv(D/"ma/MARPP_MSA_2008_2024.csv", dtype=str, encoding="latin1")
ma = ma[ma.LineCode.str.strip() == "1"]
metro_rpp, metro_title = {}, {}
for _, r in ma.iterrows():
    f = fips(r.GeoFIPS)
    if f in ("00000", "00999"): continue
    try: metro_rpp[f] = float(r[YEAR])
    except (TypeError, ValueError): continue
    metro_title[f] = re.sub(r"\s*\(?Metropolitan Statistical Area\)?\s*\*?$", "", r.GeoName).strip()

dl = pd.read_excel(D/"list1_2023.xlsx", header=2, dtype=str)
dl = dl[dl["Metropolitan/Micropolitan Statistical Area"] == "Metropolitan Statistical Area"]
county_cbsa = {(r["FIPS State Code"] + r["FIPS County Code"]): r["CBSA Code"] for _, r in dl.iterrows()}
cbsa_title = {r["CBSA Code"]: r["CBSA Title"] for _, r in dl.iterrows()}
# Connecticut: the 2020 ZCTA file uses the old counties; map each to its main 2023 metro (Litchfield is nonmetro)
county_cbsa.update({"09001": "14860", "09003": "25540", "09007": "25540", "09009": "35300", "09011": "35980", "09013": "25540", "09015": "35980"})

pop = pd.read_csv(D/"copop.csv", dtype=str, encoding="latin1")
pop = pop[pop.SUMLEV == "050"]
cpop = {(r.STATE + r.COUNTY): int(r.POPESTIMATE2024) for r in pop.itertuples()}

# state nonmetro RPP: state = sum(w_metro * rpp_metro) + w_non * rpp_non
nonmetro = {}
for st, srpp in state_rpp.items():
    tot = metro_part = 0.0; wm = 0
    for c, p in cpop.items():
        if c[:2] != st: continue
        tot += p
        cb = county_cbsa.get(c)
        if cb and cb in metro_rpp:
            metro_part += p * metro_rpp[cb]; wm += p
    wn = tot - wm
    share = wm / max(tot, 1)
    if share > 0.99:                 # all metro (DC, NJ, RI): the state value
        nonmetro[st] = srpp
        continue
    est = (srpp * tot - metro_part) / wn
    # The back-out is unstable when almost everyone lives in a metro, or when it lands near the state value.
    # There, use 94% of the state value, the median gap between nonmetro and state where the back-out is stable.
    nonmetro[st] = srpp * 0.94 if (share > 0.88 or est > srpp - 1) else est

z = pd.read_csv(D/"zcta_county.txt", sep="|", dtype=str, encoding="utf-8-sig")
z = z[z.GEOID_ZCTA5_20.notna() & (z.GEOID_ZCTA5_20 != "")]
z["land"] = z.AREALAND_PART.astype(float)
z = z.sort_values(["GEOID_ZCTA5_20", "land"], ascending=[True, False]).drop_duplicates("GEOID_ZCTA5_20")

def short(title):
    city, st = title.rsplit(", ", 1)
    return city.split("-")[0].split("/")[0] + ", " + st.split("-")[0]

areas, idx = [], {}
def area_key(county):
    cb = county_cbsa.get(county)
    if cb and cb in metro_rpp:
        k = "m" + cb
        if k not in idx: idx[k] = len(areas); areas.append([short(cbsa_title.get(cb, metro_title[cb])) + " area", round(metro_rpp[cb], 1)])
    else:
        st = county[:2]
        if st not in state_rpp: return None
        k = "s" + st
        if k not in idx: idx[k] = len(areas); areas.append(["outside a metro area in " + state_name[st], round(nonmetro[st], 1)])
    return idx[k]

runs, last = [], None
for r in z.itertuples():
    a = area_key(r.GEOID_COUNTY_20)
    if a is None: continue
    if a != last:
        runs.append((int(r.GEOID_ZCTA5_20), a)); last = a

def b36(n):
    s = "0123456789abcdefghijklmnopqrstuvwxyz"; o = ""
    while True:
        n, r = divmod(n, 36); o = s[r] + o
        if n == 0: return o
parts, prev = [], 0
for zp, a in runs:
    parts.append(b36(zp - prev) + "." + b36(a)); prev = zp
js = ("/* ZIP to cost of living. Built by tools/make_col.py from BEA Regional Price Parities 2024 (released Feb 19, 2026), "
      "the Census 2020 ZCTA-to-county file, OMB 2023 metro delineations, and Census 2024 county population. US average = 100. */\n"
      "window.KP_COL={year:2024,areas:" + json.dumps(areas, separators=(",", ":")) + ",runs:\"" + " ".join(parts) + "\"};\n")
OUT.write_text(js)
print("runs", len(runs), "areas", len(areas), "bytes", len(js))
for k in ("CA", ): pass
print({state_name[s]: (state_rpp[s], round(nonmetro[s],1)) for s in ["06","28","36","15","11","34","05","48"]})
