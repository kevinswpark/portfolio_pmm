"""Site copy, English only.

Sources, used word for word:
  BRIEF   Notion "Kevin Park Website" portfolio brief
  NOTION  Notion "The Money Layer for Games (EN)" case study
  RESUME  Kevin_Park_Resume (uploaded 2026-09-27)
  ZBD     zbdpay.com, checked 2026-09-27 (quoted, not ours)
Strings under UI are navigation, labels, and buttons added where no source
text exists. Keep them short and functional.
"""

LINKEDIN = "https://www.linkedin.com/in/kevinswpark"
LINKEDIN_DISPLAY = "linkedin.com/in/kevinswpark"  # BRIEF

UI = {
    "name": "Kevin Park",
    "skip": "Skip to content",
    "work": "Work",
    "experience": "Experience",
    "all_work": "All work",
    "on_this_page": "On this page",
    "read": "Read the case study",
    "enlarge": "Enlarge diagram",
    "close": "Close",
    "new_tab": "(opens in a new tab)",
    "footer": "© 2026 Kevin Park",
    "in_progress": "Case study in progress",   # BRIEF: "honest coming-soon state"
    "concept": "Concept diagram",               # BRIEF label vocabulary
    "final": "Final work",
    "set": "Set in type for this site.",
    "proof": "External proof",
    "drawn": "Drawn for this site.",
    "next": "Next case study",
    "finished": "Finished case study",
    "education": "Education",                   # RESUME heading
    "skills": "Skills",                         # RESUME heading
    "to": "to",
}

META = {
    "home_title": "Kevin Park, Senior Product Marketing Manager",
    "home_desc": "There’s a story inside your complex product. I find the change your product makes and explain its value in a way people remember.",
    "ml_title": "Using a visual metaphor to explain ZBD’s role | Kevin Park",
    "ml_desc": "A communication problem solved through a visual metaphor.",
    "lc_title": "Money Lifecycle | Kevin Park",
    "lc_desc": "The later organizing model for how ZBD’s products move value.",
    "nf_title": "Page not found | Kevin Park",
}

HERO = {  # BRIEF
    "h1_before": "There’s a ",
    "h1_em": "story",
    "h1_after": " inside your complex product.",
    "sub": "I find the change your product makes and explain its value in a way people remember.",
    "cta_work": "Explore the work",
    "cta_linkedin": "Connect on LinkedIn",
    "card_kicker": "Case study",
    "card_line": "The Money Layer for Games",
    "card_brand": "ZBD",
}

PHILOSOPHY = {  # BRIEF section 3 and 7
    "lead": "Product marketing connects what a company builds with a reason someone would care.",
    "body": "The work starts with understanding the product, the people it serves, and the change it makes possible. The story should be simple enough to remember and specific enough to be useful.",
    "context": "My experience in fintech, payments, cross-border money movement, and gaming gives this point of view credibility.",
}

WORK = {
    "h2": "Selected work",  # BRIEF
    "ml": {
        "title": "Using a visual metaphor to explain ZBD’s role",  # BRIEF
        "problem": "ZBD was described in several ways, including as infrastructure and as a way to make money work for games. There was no consistent answer to what the company was.",  # BRIEF inventory
        "result": "The Money Layer for Games",
        "impact": "The phrase moved from an internal idea into ZBD’s public brand and appears on its website.",  # BRIEF inventory
    },
    "lc": {
        "title": "Money Lifecycle",  # BRIEF
        "desc": "The later organizing model for how ZBD’s products move value.",  # BRIEF
    },
}

STRENGTHS = {  # BRIEF section 3
    "h2": "My recurring strengths",
    "items": [
        ("compass", "Finding a clear direction when the product or market story is still ambiguous"),
        ("translate", "Understanding complicated technology and explaining its value in everyday language"),
        ("sparkle", "Connecting product thinking with a memorable story and a strong visual expression"),
        ("arrows-clockwise", "Building a useful first version of a system, then improving it with feedback"),
        ("magic-wand", "Using new tools, including AI, to explore ideas and make the work tangible"),
    ],
}

EXPERIENCE = {  # RESUME
    "h2": "Experience",
    "profile": "Senior Product Marketing Manager with deep experience building and scaling go-to-market systems across fintech, payments, and financial infrastructure. Proven track record in product positioning, messaging frameworks, ICP segmentation, and sales enablement that align product, risk, and commercial execution to measurable outcomes.",
    "roles": [
        {
            "title": "Senior Product Marketing Manager",
            "company": "ZBD",
            "place": "Remote",
            "start": "May 2025",
            "end": "Present",
            "focus": ["Gaming fintech infrastructure", "B2B product marketing", "payments and rewards platform"],
            "bullets": [
                ("Defined ZBD’s B2B positioning as the money layer for games and built the messaging frameworks, naming conventions, and full website copy revamp across a four-product suite (Embedded Rewards, Embedded Payouts, Embedded Accounts, Branded Debit Cards), owning it end-to-end through fast revisions from BD and event learnings.", []),
            ],
        },
        {
            "title": "Product Marketing Manager",
            "company": "Finfare",
            "place": "Irvine, CA",
            "start": "Feb 2024",
            "end": "Jan 2025",
            "focus": ["Digital Banking & Investments", "GTM Strategy", "Consumer & Merchant Growth"],
            "bullets": [
                ("Led go-to-market for digital banking and automated investing products, grounded in 30-plus customer interviews and six personas, with growth forecasts to reach 1M-plus users in four years.", ["30-plus", "1M-plus"]),
                ("Delivered a sales enablement package and messaging framework that secured 3,000-plus merchant partners for Finfare Rewards.", ["3,000-plus"]),
                ("Directed a 20-page website revamp with Product and UX, lifting engagement 36 percent and conversion 24 percent.", ["36 percent", "24 percent"]),
            ],
        },
        {
            "title": "Product Marketing Manager",
            "company": "WireBarley",
            "place": "Los Angeles, CA",
            "start": "June 2020",
            "end": "Jan 2024",
            "focus": ["Cross-Border Payments", "B2C Growth", "0 to 1"],
            "bullets": [
                ("Scaled North America operations to 5M-plus dollars weekly volume and 300 percent YoY transaction growth across new corridors.", ["5M-plus dollars", "300 percent"]),
                ("Led bilingual campaigns driving 40M-plus dollars in holiday remittance volume and achieved number one market share among Korean Americans by 2023.", ["40M-plus dollars", "number one"]),
                ("Managed multi-channel budgets, producing 300 percent YoY revenue growth and 12 percent lower churn for three consecutive years.", ["300 percent", "12 percent"]),
                ("Built executive dashboards (Tableau, R) to guide product, retention, and expansion decisions.", []),
            ],
        },
    ],
    "education": ["Bachelor of Commerce, UBC Sauder School of Business, Vancouver, BC", "Specialization: Marketing | Concentration: Business Analytics"],
    "skills": ["Product Marketing", "Go-to-Market Strategy", "Product Positioning", "Messaging Frameworks", "ICP Segmentation", "Sales Enablement", "Competitive Intelligence", "Product Launch", "Fintech and Payments", "Cross-Functional Leadership", "Tableau", "Excel", "R", "Notion", "Bilingual (English / Korean)"],
}

CLOSING = {"cta": "Connect on LinkedIn"}  # BRIEF

ML = {  # NOTION, verbatim; deck from BRIEF
    "h1": "Using a visual metaphor to explain ZBD’s role",
    "deck": "A communication problem solved through a visual metaphor.",
    "facts": [("Company", "ZBD"), ("Role", "Senior Product Marketing Manager")],
    "tldr_h": "TL;DR",
    "tldr": [
        ("Challenge", "Explain ZBD’s role between game economies and financial systems."),
        ("Approach", "Use a visual metaphor to understand the gap before naming it."),
        ("Output", "“The Money Layer for Games” and the ZBD Platform messaging framework."),
    ],
    "sections": [
        {"id": "stuck", "h2": "Where money gets stuck", "blocks": [
            ("p", "Financial services move money from A to B. In games, items and currencies can hold value for players, yet moving that value to another player or outside the game can be difficult. Some trades happen through barter or off-platform arrangements. Those examples pointed to a broader challenge: connecting game economies to financial systems."),
            ("p", "For a studio, building a bridge to the financial world raises three issues:"),
            ("issues", [
                ("Regulation", "Handling player funds can trigger different requirements across markets, including licenses."),
                ("Game economy", "Transfers and cash-out could change how an existing economy works."),
                ("Priorities", "A new title or feature may offer a faster return than building financial infrastructure."),
            ]),
            ("p", "ZBD saw an opportunity to focus on infrastructure that individual studios would find costly to build on their own. My challenge was to explain that role in one line."),
        ]},
        {"id": "layer", "h2": "From a barrier to a layer", "blocks": [
            ("p", "Every draft that tried to carry both the problem and ZBD’s ambition picked up another clause. I stepped away from the copy and pictured an Eva pushing against an AT Field in <i>Evangelion</i>."),
            ("fig", "pair"),
            ("p", "The AT Field was a layer that blocked passage between two spaces. Pushing harder would not get the Eva through, which made me think about the boundary itself. I pictured ZBD in a similar position between a game’s economy and the financial world, with infrastructure that could let value move across it."),
        ]},
        {"id": "line", "h2": "The line and the framework", "blocks": [
            ("p", "That image gave me “The Money Layer for Games.” The phrase made ZBD’s role easier to picture without tying the company to any one product."),
            ("fig", "line"),
            ("p", "I shared the concept with leadership and the marketing team, who responded positively. I then developed the ZBD Platform messaging framework to carry the idea into product messaging."),
            ("fig", "proof"),
        ]},
        {"id": "learned", "h2": "What I learned", "blocks": [
            ("quote", "I had been trying to find the right words before I could see the relationship. Once I pictured the barrier and the layer that could bridge it, the line followed."),
        ]},
    ],
    "evidence": [
        ("Team reception", "I shared the concept with leadership and the marketing team, who responded positively."),  # NOTION
        ("Public brand", "The phrase moved from an internal idea into ZBD’s public brand and appears on its website."),  # BRIEF
    ],
    "proof_rows": [  # ZBD, quoted
        ("Homepage headline", "The Money Layer for Games."),
        ("Page title", "ZBD - The Money Layer for Games"),
        ("Meta description", "ZBD is the money layer for games, the licensed financial infrastructure that turns money movement into a driver of engagement, revenue, and loyalty."),
    ],
    "proof_checked": "Checked September 27, 2026",
}

LC = {  # BRIEF
    "h1": "Money Lifecycle",
    "body": [
        "The later organizing model for how ZBD’s products move value.",
        "The Money Layer is the earlier story about defining ZBD’s role. The Money Lifecycle came later and explains how its products fit together.",
    ],
    "fig_source": "Stage names as published on zbdpay.com.",
}

NF = {"h1": "Page not found", "home": "Go to the homepage"}  # UI

DIAGRAM = {  # UI labels inside original diagrams
    "game": "Game economy",
    "fin": "Financial systems",
    "zbd": "ZBD",
    "state_a": "A boundary that blocks passage",
    "state_b": "A layer that lets value cross",
    "pair_alt": "Two states of one diagram. First, a wall stops value moving from a game economy to financial systems. Second, the wall opens into a layer marked ZBD that value can cross.",
    "lc_alt": "A loop with three stages, Money In, Money Through, and Money Out, connected by arrows.",
}
