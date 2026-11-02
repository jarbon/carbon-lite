"""Small report identity usable by free and Pro runtimes without test engines."""
import html
from carbon_jay import render_jay

REPORT_FAVICON = (
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E"
    "%3Crect width='256' height='256' fill='%23000000'/%3E"
    "%3Cpath fill='%23ffffff' d='M56 34h112l48 48-48 48V96l-16-16H94c-15 0-22 7-22 22v52c0 15 7 22 22 22h104v46H56c-21 0-32-11-32-32V66c0-21 11-32 32-32Z'/%3E%3C/svg%3E"
)


def carbon_lockup(product):
    return f'''<div class="brand-cluster"><a class="brand-lockup" href="https://testers.ai" aria-label="CARBON — Engineering Confidence"><svg class="brand-mark" viewBox="0 0 256 256" aria-hidden="true"><rect width="256" height="256" fill="#000"/><path fill="#fff" d="M56 34h112l48 48-48 48V96l-16-16H94c-15 0-22 7-22 22v52c0 15 7 22 22 22h104v46H56c-21 0-32-11-32-32V66c0-21 11-32 32-32Z"/></svg><span class="brand-copy"><span class="brand-wordmark">CARBON</span><span class="brand-tagline">ENGINEERING CONFIDENCE</span></span></a><span class="product-divider" aria-hidden="true">/</span><span class="product-name">{html.escape(product)}</span>{render_jay()}</div>'''
