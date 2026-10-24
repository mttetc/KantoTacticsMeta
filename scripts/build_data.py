#!/usr/bin/env python3
"""Build data.json for the site from the public Kanto Tactics Meta API.

Usage: python3 scripts/build_data.py [--no-sprites]

- Reads meta.json (last 7 days of Ranked) and data.json (game data) from the API.
- Writes ./data.json, a compact bundle the page loads with one fetch.
- Downloads any sprite the page will need and does not have yet (pk/sd/{dex}.gif,
  pk/thumb/{dex}.webp, pk/items/{id}.png, pk/types/{type}.png and -g.png).

The API asks to poll at most once an hour and to cache; the data changes daily at 03:40 UTC.
"""
import json
import os
import sys
import urllib.request

API = "https://einoow.com/api/meta/kanto/"
PK = "https://einoow.com/playables/kanto-tactics/pk/"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Units the meta knows but the game data file does not yet (rules 35 additions),
# with what the game changelog says about them: name, cost, types, stages (name, dex), note.
FALLBACK = {
    "koga": ("Koga's Weezing", 5, ["poison"], [("Koffing", 109), ("Koga's Weezing", 110)],
             "Character Pokémon with its own look: ninja smoke that poisons and makes attacks miss."),
    "giovanni": ("Giovanni's Persian", 5, ["normal"], [("Meowth", 52), ("Giovanni's Persian", 53)],
                 "Character Pokémon with its own look: Fury Swipes."),
    "samurai": ("Samurai's Pinsir", 5, ["bug"], [("Samurai's Pinsir", 127)],
                "Character Pokémon with its own look: Guillotine, a huge slash at its target."),
    "venomoth": ("Venomoth", 3, ["bug", "poison"], [("Venomoth", 49)], "Ranged attacker."),
    "porygon3": ("Porygon", 3, ["normal"], [("Porygon", 137)],
                 "Conversion changes its type to one that resists the last hit."),
    "omastar": ("Omastar", 3, ["rock", "water"], [("Omastar", 139)], "Throws rocks and hides in its shell."),
    "victreebel": ("Victreebel", 4, ["grass", "poison"], [("Victreebel", 71)], None),
    "tangela4": ("Tangela", 4, ["grass"], [("Tangela", 114)], "A tank that drains life."),
    "primeape": ("Primeape", 4, ["fighting"], [("Primeape", 57)], "An anti-tank specialist."),
    "nidoqueen": ("Nidoqueen", 4, ["poison", "ground"], [("Nidoqueen", 31)], "Tank."),
    "kabutops": ("Kabutops", 4, ["rock", "water"], [("Kabutops", 141)], "Leaps at the backmost enemy and slashes it."),
    "pikachu-partner": ("Partner Pikachu", None, ["electric"], [("Partner Pikachu", 25)],
                        "Hero Pikachu from the Partner Seal."),
}


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "kanto-tactics-meta-site (github.com/mttetc)"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def fetch(path, dest):
    if os.path.exists(dest):
        return False
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    try:
        open(dest, "wb").write(get(PK + path))
        return True
    except Exception as e:  # 404 for a sprite the game does not publish
        print(f"  skip {path}: {e}", file=sys.stderr)
        return False


def main():
    sprites = "--no-sprites" not in sys.argv
    m = json.loads(get(API + "meta.json"))
    d = json.loads(get(API + "data.json"))

    lines = {}
    for lid, l in d["lines"].items():
        last = l["stars"][-1]
        p = l.get("passive")
        p = p.get("en") if isinstance(p, dict) else (p if isinstance(p, str) else None)
        lines[lid] = {
            "c": l["c"], "t": l["t"], "range": l.get("range"), "n": l["n"], "s": l["s"],
            "stars": [{"name": s["name"], "dex": s["dex"]} for s in l["stars"]],
            "move": {"name": last["move"]["name"]["en"], "text": last["move"]["text"]["en"], "type": last["move"]["type"]},
            "passive": p,
        }
    for lid, (name, cost, types, stages, note) in FALLBACK.items():
        if lid not in lines:
            lines[lid] = {"c": cost, "t": types, "range": None, "n": [s[0] for s in stages], "s": [s[1] for s in stages],
                          "stars": [{"name": s[0], "dex": s[1]} for s in stages], "move": None, "passive": note, "new35": True}
    # any line the meta mentions that we still do not know: keep it visible with its id
    for u in m["units"]:
        lines.setdefault(u["line"], {"c": None, "t": [], "range": None, "n": [u["line"]], "s": [],
                                     "stars": [{"name": u["line"], "dex": None}], "move": None, "passive": None, "new35": True})

    items = {iid: {"name": i["en"], "k": i["k"], "stat": i.get("stat"), "recipe": i.get("recipe"),
                   "text": i["text"]["en"], "short": (i.get("short") or {}).get("en")} for iid, i in d["items"].items()}
    traits = {t: {"name": v["en"], "th": v["th"], "values": v["values"], "desc": v["desc"]["en"], "scope": v.get("scope")}
              for t, v in d["traits"].items()}
    comps = []
    for c in m["comps"]:
        cc = {k: c[k] for k in ("id", "tier", "name", "avg", "ic", "top4", "win", "use", "n", "ne", "units", "traits", "variants") if k in c}
        if "onlyRules" in c:
            cc["onlyRules"] = c["onlyRules"]
        if c.get("placement"):
            cc["placement"] = c["placement"]
        if c.get("guide"):
            cc["guide"] = {"stages": [{"stage": s["stage"], "n": s["n"], "units": s["units"]} for s in c["guide"]["stages"]]}
        comps.append(cc)
    seals = {sid: {"code": v.get("code"), "rarity": v["rarity"], "cat": v.get("cat"), "rounds": v.get("rounds", []), "hero": v.get("hero"),
                   "name": v["name"]["en"],
                   "text": [{"round": t.get("round"), "line": (t.get("line") or {}).get("en"), "detail": (t.get("detail") or {}).get("en")} for t in v.get("text", [])]}
             for sid, v in d.get("seals", {}).items()}
    pv = d["pvp"]
    out = {
        "meta": {k: m[k] for k in ("generated", "rules", "from", "to", "mode", "days", "versions", "seats", "ref", "thresholds")},
        "units": m["units"], "items": m["items"], "traits": m["traits"], "comps": comps,
        "lines": lines, "itemData": items, "traitData": traits, "recipes": d["recipes"],
        "pvp": {"odds": pv["odds"], "pool": pv["pool"], "xpToNext": pv["xpToNext"], "rerollCost": pv["rerollCost"],
                "interest": pv["interest"], "xpPerRound": pv.get("xpPerRound")},
        "seals": seals, "sealRules": pv.get("seals"),
        "dataRules": d["rules"],
    }
    s = json.dumps(out, separators=(",", ":"), ensure_ascii=False)
    open(os.path.join(ROOT, "data.json"), "w", encoding="utf-8").write(s)
    print(f"data.json: {len(s.encode()):,} bytes, rules v{m['rules']}, {m['from']} to {m['to']}, {len(comps)} comps")

    if not sprites:
        return
    n = 0
    dex = {x for l in lines.values() for x in l["s"] if x}
    for x in sorted(dex):
        n += fetch(f"sd/{x}.gif", os.path.join(ROOT, "sd", f"{x}.gif"))
        n += fetch(f"thumb/{x}.webp", os.path.join(ROOT, "thumb", f"{x}.webp"))
    for i in set(items) | {i["id"] for i in m["items"]}:
        n += fetch(f"items/{i}.png", os.path.join(ROOT, "items", f"{i}.png"))
    for t in traits:
        n += fetch(f"types/{t}.png", os.path.join(ROOT, "types", f"{t}.png"))
        n += fetch(f"types/{t}-g.png", os.path.join(ROOT, "types", f"{t}-g.png"))
    print(f"sprites: {n} new file(s)")


if __name__ == "__main__":
    main()
