"""Compact, offline AI-manager identity shared by CARBON report renderers."""
from functools import lru_cache
from pathlib import Path
import base64
import html
import json

ROOT = Path(__file__).resolve().parents[3]

@lru_cache(maxsize=1)
def profile():
    return json.loads((ROOT / "runtime/carbon/references/jay.json").read_text())

@lru_cache(maxsize=1)
def render_jay():
    p = profile()
    image = "data:image/webp;base64," + base64.b64encode((ROOT / p["portrait"]).read_bytes()).decode()
    esc = html.escape
    return f'''<style>
    .brand-cluster:has(.carbon-jay){{flex-wrap:wrap}}
    .carbon-jay{{position:relative;font:14px/1.5 system-ui,sans-serif;color:inherit;text-align:left;max-width:100%;letter-spacing:normal}}
    .carbon-jay summary{{display:flex;align-items:center;gap:10px;cursor:pointer;list-style:none;padding:6px 8px;border-radius:9px}}
    .carbon-jay summary::-webkit-details-marker{{display:none}}.carbon-jay summary:focus-visible{{outline:2px solid currentColor;outline-offset:3px}}
    .carbon-jay-face{{position:relative;flex:none;width:42px;height:42px}}.carbon-jay-face img{{width:100%;height:100%;object-fit:contain;border-radius:0;filter:grayscale(1)}}
    .carbon-jay-face b{{position:absolute;right:-3px;bottom:-2px;font:700 9px/1 system-ui;background:#eee;color:#111;border:1px solid #111;border-radius:4px;padding:3px}}
    .carbon-jay strong{{font-size:15px}}.carbon-jay small{{display:block;font-size:11px;opacity:.8}}
    .carbon-jay-profile{{position:absolute;top:100%;left:0;z-index:99;width:min(340px,calc(100vw - 48px));padding:20px;background:#171c1a;color:#e8eeeb;border:1px solid #64716a;border-radius:12px;box-shadow:0 16px 40px #0008}}
    .carbon-jay-profile p{{font-size:13px;margin:0 0 12px;line-height:1.6;color:inherit}}.carbon-jay-profile p:last-child{{margin-bottom:0}}
    @media print{{.carbon-jay-profile{{position:static;box-shadow:none}}}}
    </style><details class="carbon-jay" data-jay="manager"><summary aria-label="About Jay, AI test manager"><span class="carbon-jay-face"><img src="{image}" alt="Jay, AI persona" width="42" height="42"><b>AI</b></span><span><strong>Jay</strong><small>AI test manager · CARBON</small></span></summary><div class="carbon-jay-profile"><p><strong>Meet Jay.</strong> {esc(p['bio'])}</p><p>{esc(p['identity'])}</p><p>{esc(p['experience'])}</p><p>Coordinates specialists, presents recorded evidence, and helps the coding agent verify authorized fixes. Human judgment and existing permissions stay in control.</p></div></details>'''
