---
target: smart-home-dashboard showcase
total_score: 26
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
target_identity: "url:http://localhost:3000/showcase/smart-home-dashboard"
timestamp: 2026-11-08T07-34-55Z
slug: localhost-showcase-smart-home-dashboard
---
Method: dual-agent (A: design review · B: detector + browser). Score 26/32 (7 and 10 n/a), Good.

Priority issues:
1. [P1] Phone camera tiles collide (LIVE pill over camera name, mute crowds the pill). Fix: one column on narrow screens. /impeccable adapt
2. [P1] Dial handle has no visible keyboard focus and a 26px hit area. /impeccable harden
3. [P2] Laptop preview: closed slab with no cue, open is an unreadable scaled duplicate, tiny thumbnail on phones. /impeccable delight
4. [P2] Not everything follows the one brand input (success/warning hex, red LIVE dot, avatar gradient); "7 devices active" 4.3:1 on lime. /impeccable colorize then audit
5. [P2] Hierarchy and content: greeting is loudest with least information; analytics lack totals/period; dashboard has no edge in dark. /impeccable layout

Detector: CLI 0 findings. Browser overlay 11 (nested-cards x8 by design, gradient-text on page title outside demo, dark-glow signature, pulsing-dot intentional, low-contrast x1 real 4.3:1).
Fixed during review: leftover ring-offset-canvas on laptop preview.
