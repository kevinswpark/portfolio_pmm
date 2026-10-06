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
    "view_zbd": "View on zbdpay.com",
    "proof": "Published on zbdpay.com",  # AUDIT M06
    "drawn": "Drawn for this site.",
    "next": "Next case study",
    "follows": "Follows",
    "first_try": "First try",
    "final_row": "Final",
    "storyboard": "Commercial storyboard",
    "storyboard_cap": "From a familiar routine to a confident first transfer.",  # caption text supplied by Kevin
    "commercial": "TV commercial",
    "watch": "Watch the commercial on YouTube",  # from Kevin's case study file
    "video_title": "WireBarley TV commercial",
    "media": "Media coverage",
    "sbs_cap": "Screenshot from SBS Evening News. The on-screen title reads “Kevin Park, WireBarley manager.”",
    "sbs_alt": "SBS Evening News segment with a lower-third title naming Kevin Park as a WireBarley manager, over close-up footage of US hundred-dollar bills.",
    "finished": "Finished case study",
    "education": "Education",                   # RESUME heading
    "skills": "Skills",                         # RESUME heading
    "to": "to",
}

META = {
    "home_title": "Kevin Park, Senior Product Marketing Manager",
    "home_desc": "Kevin Park is a Senior Product Marketing Manager working across fintech, payments, and gaming. Explore his work in positioning, messaging, and go-to-market.",  # AUDIT
    "ml_title": "Using a visual metaphor to explain ZBD’s role | Kevin Park",
    "ml_desc": "How I developed “The Money Layer for Games” to explain ZBD’s role between games and financial services.",  # AUDIT M01, matches the deck
    "lc_title": "The Money Lifecycle | Kevin Park",
    "wb_title": "Driving tech adoption | Kevin Park",
    "wb_desc": "Helping Korean American customers feel confident making their first digital money transfer.",
    "lc_desc": "Explaining how ZBD’s products work together by following money into, through, and out of a game.",  # AUDIT
    "nf_title": "Page not found | Kevin Park",
}

HERO = {  # BRIEF
    "h1_before": "There’s a ",
    "h1_em": "story",
    "h1_after": " inside your complex product.",
    "sub": "I develop positioning and messaging, then bring them into websites, sales decks, and product videos.",  # AUDIT H01
    "cta_work": "Explore the work",
    "cta_linkedin": "Connect on LinkedIn",
    "card_kicker": "Case study",
    "card_line": "The Money Layer for Games",
    "card_brand": "ZBD",
}

PHILOSOPHY = {  # BRIEF section 3 and 7
    "lead": "Product marketing connects what a company builds with a reason someone would care.",
    "body": "I start by understanding how a product works and why a customer would use it. From there, I develop the positioning and the materials needed to explain it.",  # AUDIT H02
}

WORK = {
    "h2": "Selected work",  # BRIEF
    "ml": {
        "title": "Using a visual metaphor to explain ZBD’s role",  # BRIEF
        "problem": "ZBD offered financial infrastructure for games, but we lacked a consistent way to explain its role. I developed “The Money Layer for Games” to give the company a shared description.",  # AUDIT H04
        "result": "The Money Layer for Games",
        "impact": "ZBD uses the line on its public website.",  # AUDIT H04, M06
    },
    "lc": {
        "title": "The Money Lifecycle",  # NOTION page title
        "desc": "Explaining how ZBD’s products work together by following money into, through, and out of a game.",  # AUDIT H05
        "result": ["Money In", "Money Through", "Money Out"],  # NOTION
        "impact": "Used in ZBD’s messaging framework, sales decks, and public website.",  # AUDIT H05
    },
    "wb": {  # WB case study file, verbatim
        "title": "Driving tech adoption (and how I changed customer behaviors)",
        "problem": "Help Korean American customers aged 50+ complete their first transfer with WireBarley. Only about 25% of sign-ups in this group reached that point.",
        "result": "Korean-language TV commercial",
        "impact": "In the period after the commercial aired, sign-up-to-first-transfer conversion in this group rose to nearly 50%.",
    },
}

STRENGTHS = {  # AUDIT H10
    "h2": "How I work",
    "items": [
        "I use customer conversations and data to understand where people hesitate and what might help them take the next step.",
        "I work through ideas with diagrams and rough drafts, then refine them with the people who will use the work.",
        "I stay involved through the finished website, deck, or video so the positioning carries through to what customers actually see.",
    ],
}

EXPERIENCE = {  # RESUME
    "h2": "Experience",
    "profile": "I’ve worked on product marketing for gaming payments, digital banking, and cross-border remittances.",  # AUDIT H06
    "roles": [
        {
            "title": "Senior Product Marketing Manager",
            "company": "ZBD",
            "place": "Remote",
            "start": "May 2025",
            "end": "Present",
            "focus": ["Gaming fintech infrastructure", "B2B product marketing", "payments and rewards platform"],
            "bullets": [
                ("Developed “The Money Layer for Games” positioning and the messaging framework for ZBD’s four-product suite.", []),  # AUDIT H07
                ("Led the website copy rewrite and product naming work, incorporating feedback from business development and industry events.", []),  # AUDIT H07
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
                ("Led go-to-market for digital banking and automated investing products, informed by 30+ customer interviews and six customer personas.", ["30+"]),  # AUDIT H08
                ("Created the messaging framework and sales materials for Finfare Rewards.", []),  # AUDIT H08, conservative line until the 3,000+ definition is confirmed
                ("Led a 20-page website redesign with Product and UX. Engagement rose 36% and conversion rose 24%.", ["36%", "24%"]),  # AUDIT H08
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
                ("Scaled North American operations to $5M+ in weekly transaction volume, with 300% year-over-year transaction growth across new corridors.", ["$5M+", "300%"]),  # AUDIT H09
                ("Led bilingual campaigns that drove $40M+ in holiday remittance volume. WireBarley reached the leading market position among Korean Americans by 2023.", ["$40M+"]),  # AUDIT H09
                ("Managed multi-channel budgets, producing 300% year-over-year revenue growth and 12% lower churn for three consecutive years.", ["300%", "12%"]),  # CHAT, YoY spelled out (logged)
                ("Built executive dashboards (Tableau, R) to guide product, retention, and expansion decisions.", []),
            ],
        },
    ],
    "education": ["Bachelor of Commerce, UBC Sauder School of Business, Vancouver, BC"],
    "skills": ["Product Marketing", "Go-to-Market Strategy", "Product Positioning", "Messaging Frameworks", "ICP Segmentation", "Sales Enablement", "Competitive Intelligence", "Product Launch", "Fintech and Payments", "Cross-Functional Leadership", "Tableau", "Excel", "R", "Notion", "Bilingual (English / Korean)"],
}

CLOSING = {"cta": "Connect on LinkedIn"}  # BRIEF

ML = {  # NOTION, verbatim; deck from BRIEF
    "h1": "Using a visual metaphor to explain ZBD’s role",
    "deck": "How I developed “The Money Layer for Games” to explain ZBD’s role between games and financial services.",  # AUDIT M01
    "facts": [("Company", "ZBD"), ("Role", "Senior Product Marketing Manager")],
    "tldr_h": "TL;DR",
    "tldr": [
        ("Challenge", "Explain ZBD’s role between game economies and financial systems."),
        ("Approach", "Use a visual metaphor to understand the gap before naming it."),
        ("Output", "“The Money Layer for Games” and the ZBD Platform messaging framework."),
    ],
    "sections": [
        {"id": "stuck", "h2": "Where money gets stuck", "blocks": [
            ("p", "In games, players can earn or buy items and currencies that have value within the game. Transferring that value to someone else or cashing it out can be difficult, so some trades happen through barter or off-platform arrangements. ZBD was building financial infrastructure to support money movement in games."),  # AUDIT M02
            ("p", "For a studio, adding these capabilities raises three issues:"),  # AUDIT M03
            ("issues", [
                ("Regulation", "Handling player funds can trigger different requirements across markets, including licenses."),
                ("Game economy", "Transfers and cash-out could change how an existing economy works."),
                ("Priorities", "A new title or feature may offer a faster return than building financial infrastructure."),
            ]),
            ("p", "ZBD offered infrastructure that would be costly for studios to build themselves. I needed a clear way to explain its role."),  # AUDIT M03
        ]},
        {"id": "layer", "h2": "From a barrier to a layer", "blocks": [
            ("p", "Every draft that tried to carry both the problem and ZBD’s ambition picked up another clause. I stepped away from the copy and pictured an Eva pushing against an AT Field in <i>Evangelion</i>."),
            ("fig", "pair"),
            ("p", "The AT Field was a layer that blocked passage between two spaces. Pushing harder would not get the Eva through, which made me think about the boundary itself. I pictured ZBD in a similar position between a game’s economy and the financial world, with infrastructure that could let value move across it."),
        ]},
        {"id": "line", "h2": "The line and the framework", "blocks": [
            ("p", "I used that image to develop “The Money Layer for Games.” The phrase described ZBD’s role across its products."),  # AUDIT M05
            ("fig", "line"),
            ("p", "I shared the concept with leadership and the marketing team, then developed the ZBD Platform messaging framework around it."),  # AUDIT M05
            ("fig", "proof"),
        ]},
        {"id": "learned", "h2": "What I learned", "blocks": [
            ("quote", "I had been trying to find the right words before I could see the relationship. Once I pictured the barrier and the layer that could bridge it, the line followed."),
        ]},
    ],
    "proof_rows": [  # ZBD, quoted
        ("Homepage headline", "The Money Layer for Games."),
        ("Page title", "ZBD - The Money Layer for Games"),
        ("Meta description", "ZBD is the money layer for games, the licensed financial infrastructure that turns money movement into a driver of engagement, revenue, and loyalty."),
    ],
}

LC = {  # NOTION "The Money Lifecycle"; deck from BRIEF. Edited lines are listed in EDITS.
    "h1": "The Money Lifecycle",
    "deck": "Explaining how ZBD’s products work together by following money into, through, and out of a game.",  # AUDIT L01
    "facts": [("Company", "ZBD"), ("Role", "Senior Product Marketing Manager")],
    "follows": "The Money Layer for Games",  # links back to the earlier case study
    "tldr_h": "TL;DR",
    "tldr": [
        ("Challenge", "STEP grouped ZBD’s products as Shop, Transfer, Earn, and Pay, but those categories overlapped as the platform grew."),
        ("Approach", "Follow how value enters a game, moves within it, and leaves it. Use that flow to explain the products together."),
        ("Output", "“Money In, Money Through, Money Out,” a lifecycle model now used in the ZBD Platform messaging framework, decks, and ZBD’s public website."),
    ],
    "sections": [
        {"id": "step", "h2": "Players moved across STEP categories", "blocks": [  # AUDIT L02
            ("p", "After developing {ML_LINK} to describe ZBD’s role, I needed a way to explain how the products beneath it worked together."),
            ("p", "The existing framework was STEP: Shop, Transfer, Earn, and Pay. Its four categories were easy to remember, but a player’s experience rarely stayed inside one of them. Earn, now Embedded Rewards, made the overlap clear. A player could receive a reward, hold the value, spend it back in the game, send it to someone else, or cash out. Explaining that path meant moving across several STEP categories."),
            ("fig", "step"),
            ("p", "As ZBD’s portfolio expanded, I found myself spending more time explaining the boundaries than the products. I began looking for a model that followed the player’s experience instead."),
        ]},
        {"id": "money", "h2": "Following the money", "blocks": [
            ("p", "I started with two terms I knew from fintech: pay-in and payout. They described where money entered and left a system, but missed much of what ZBD could enable inside a game. Between those endpoints, players could earn, hold, spend, trade, and transfer value."),
            ("p", "I tried calling the middle Pay Through, but “pay” made actions such as earning rewards and holding a balance sound like payments. “Money” covered those activities more naturally."),  # AUDIT L04
            ("p", "I settled on Money In, Money Through, Money Out. “Money Through” covered the activity within a game that STEP had spread across several categories."),  # AUDIT L04
            ("fig", "naming"),
        ]},
        {"id": "loop", "h2": "Money could stay in the game", "blocks": [  # AUDIT L02
            ("p", "Once I drew the flow, a straight line felt incomplete. Value could enter a game, become a reward or a balance, move between players, and be spent within the game again. Some journeys ended in cash-out; others continued inside the economy."),
            ("fig", "loop"),
            ("p", "I drew the three phases as a lifecycle to show how players could keep using value inside a game. A reward could become a balance, then a purchase or a transfer to another player."),  # AUDIT L05
        ]},
        {"id": "use", "h2": "Used across messaging, decks, and the website", "blocks": [  # AUDIT L02
            ("p", "I used the lifecycle in the ZBD Platform messaging framework and sales decks, and leadership began using the same language. We could explain the product suite without assigning each product to a single stage."),  # AUDIT L06
            ("p", "The same language appears on ZBD’s homepage, the Embedded Accounts page, and the August 2026 platform launch post. I also created the platform and product videos used across the site."),  # AUDIT L06
            ("fig", "proof"),
        ]},
        {"id": "learned", "h2": "What I learned", "blocks": [
            ("quote", "Following a player’s money gave me a way to explain several products together. Each product could serve more than one stage, so the model still made sense as the portfolio grew."),  # AUDIT L07
        ]},
    ],
    "naming": {  # the terms named in "Following the money"
        "tried": ["Pay-in", "Pay Through", "Payout"],
        "final": ["Money In", "Money Through", "Money Out"],
    },
    "proof_rows": [  # ZBD, quoted verbatim; checked 2026-09-27
        ("Homepage", "https://zbdpay.com/", "Power the full lifecycle of money in games"),
        ("Embedded Accounts page", "https://zbdpay.com/embedded-accounts", "Programmable financial infrastructure inside your game to power the full money lifecycle: money in, money through, and money out."),
        ("Platform launch post, Aug 24, 2026", "https://zbdpay.com/blog/introducing-zbds-embedded-financial-infrastructure-for-games", "We’re introducing our embedded financial infrastructure for games, giving studios a single platform to power the full money lifecycle."),
    ],
    "fig_source": "Stage names as published on zbdpay.com.",
}

WB = {  # WB: Kevin's case study file "WireBarley-Tech-Adoption-Case-Study.md" (2026-10-05), verbatim, no edits
    "h1": "Driving tech adoption (and how I changed customer behaviors)",
    "deck": "Helping Korean American customers feel confident making their first digital money transfer.",
    "facts": [("Company", "WireBarley"), ("Role", "Product Marketing Manager, first US marketing hire")],
    "tldr_h": "TL;DR",
    "tldr": [
        ("Challenge", "Help Korean American customers aged 50+ complete their first transfer with WireBarley. Only about 25% of sign-ups in this group reached that point."),
        ("Approach", "Use customer support call logs to understand where people needed reassurance, then show that support in a Korean-language TV commercial."),
        ("Result", "In the period after the commercial aired, sign-up-to-first-transfer conversion in this group rose to nearly 50%."),
    ],
    "sections": [
        {"id": "audience", "h2": "The most profitable audience had the lowest conversion rate", "blocks": [
            ("p", "As WireBarley’s first US marketing hire, I worked on bringing its digital remittance service to Korean American customers and adjacent Asian American communities. The service let people send money abroad without visiting a bank."),
            ("p", "COVID lockdowns had accelerated the move toward contactless services, creating an opportunity for digital remittance. Earning people’s trust remained a challenge, especially when asking them to change how they handled money."),
            ("p", "Internal data showed that customers aged 50+ were our most profitable audience, with average transfer amounts roughly $250 above the overall average. Yet many stopped early in identity verification, and only about 25% went on to make their first transfer. I wanted to understand what was holding them back."),
        ]},
        {"id": "support", "h2": "Qualitative data revealed the need for a “hand-holding” experience", "blocks": [
            ("p", "Before developing the commercial’s storyboard, I reviewed customer support call logs in Zendesk. Customers often mentioned that their sons or daughters would normally help them with this kind of task."),
            ("p", "The conversations showed that these customers could take a photo of their ID, enter their information, and follow the verification steps. They needed someone they trusted to guide them while they learned an unfamiliar process."),
            ("p", "WireBarley already had live customer support agents in the US who spoke Korean and English, alongside support in Thai, Mandarin, Vietnamese, Nepali, and other languages. I wanted the commercial to show how a Korean-speaking agent could help someone feel comfortable making their first transfer."),
        ]},
        {"id": "commercial", "h2": "What customers aged 50+ needed was reassurance", "blocks": [  # CHAT: one term for the audience (logged)
            ("p", "I developed a TV commercial for local Korean-language channels serving Koreatowns across the US. TV was a familiar medium for this audience and complemented our existing newspaper and other mass-media advertising."),
            ("p", "I wanted viewers to recognize their own situation and see how someone like them could complete a transfer with support. The commercial followed four steps:"),
            ("fig", "storyboard"),
            ("fig", "video"),
        ]},
        {"id": "results", "h2": "Results", "blocks": [
            ("results", [
                ("First-transfer conversion among customers aged 50+", "Roughly 25% → nearly 50% after the commercial aired.", ["Roughly 25%", "nearly 50%"]),
                ("Broader business milestone", "WireBarley led traditional Korean American banks in remittance volume to Korea during Chuseok, Korean Thanksgiving.", []),
                ("Media coverage", "Featured on SBS America, representing the Korean American segment.", []),
            ]),
            ("fig", "sbs"),
            ("h3", "Other results at WireBarley"),  # UI
            ("bullets", "wb_role"),  # the WireBarley role bullets from EXPERIENCE, same wording as the homepage (CHAT data points)
        ]},
        {"id": "learned", "h2": "What I learned", "blocks": [
            ("quote", "Finding the hesitation that prevents someone from acting can reveal a simple way to improve conversion. In fintech, showing customers that you understand their situation and have built an experience around their needs can give them a reason to trust you with their money."),
        ]},
    ],
    "steps": [
        ("The familiar routine", "An older man prepares to visit a bank to send money to his wife in Korea."),
        ("A new option", "His daughter introduces WireBarley as a fee-free, more economical alternative. She has to leave for work and offers to help him when she returns."),
        ("Someone to guide him", "He decides to try it himself and calls customer support. A Korean-speaking agent walks him through the transfer with the warmth of a helpful neighbor."),
        ("Confidence through completion", "He completes the transfer and realizes it was easier than he expected. The commercial closes with a happy family scene."),
    ],
    "video_id": "KDBksoj_wu8",
}


# Every on-page line that differs from its source, with the original. AUDIT replacements are not listed here:
# they are verbatim from Kevin's copy audit (.impeccable/sources/copy-audit-2026-10-05.md).
# verify.py checks each "from" against the saved sources and each "to" against the live copy.
EDITS = [
    {
        "where": "Money Lifecycle, TL;DR Output",
        "why": "Matches the framework name used in the Money Layer case study and the stage names used in the body and diagrams.",
        "from": "“Money In / Money Through / Money Out,” a lifecycle model now used in ZBD's platform messaging, decks, and public website.",
        "to": "“Money In, Money Through, Money Out,” a lifecycle model now used in the ZBD Platform messaging framework, decks, and ZBD’s public website.",
    },
    {
        "where": "Money Lifecycle, first section, paragraph 2",
        "why": "“Journey” appeared three times on the page; this one was the least needed.",
        "from": "Explaining that journey meant moving across several STEP categories.",
        "to": "Explaining that path meant moving across several STEP categories.",
    },
    {
        "where": "Money Lifecycle, Following the money, paragraph 1",
        "why": "Removes the repeated “left” in “entered and left a system, but left out”.",
        "from": "They described where money entered and left a system, but left out much of what ZBD could enable inside a game.",
        "to": "They described where money entered and left a system, but missed much of what ZBD could enable inside a game.",
    },
    {
        "where": "WireBarley, third section heading",
        "why": "Kevin asked for one term for the audience; the page already says “customers aged 50+” everywhere else.",
        "from": "What seniors needed was reassurance",
        "to": "What customers aged 50+ needed was reassurance",
    },
    {
        "where": "Homepage Experience and WireBarley results, budgets bullet",
        "why": "The audit sets year-over-year as the spelled-out default; the bullet above it already uses it. The claim itself is unchanged.",
        "from": "Managed multi-channel budgets, producing 300% YoY revenue growth and 12% lower churn for three consecutive years.",
        "to": "Managed multi-channel budgets, producing 300% year-over-year revenue growth and 12% lower churn for three consecutive years.",
    },
]

NF = {"h1": "Page not found", "home": "Go to the homepage"}  # UI

DIAGRAM = {  # UI labels inside original diagrams
    "game": "Game economy",
    "fin": "Financial systems",
    "zbd": "ZBD",
    "state_a": "A boundary that blocks passage",
    "state_b": "A layer that lets value cross",
    "pair_alt": "Two states of one diagram. First, a wall stops value moving from a game economy to financial systems. Second, the wall opens into a layer marked ZBD that value can cross.",
    "lc_alt": "A loop with three stages, Money In, Money Through, and Money Out, connected by arrows.",
    "step": ["Shop", "Transfer", "Earn", "Pay"],
    "step_alt": "STEP’s four categories, Shop, Transfer, Earn, and Pay, as side-by-side columns. One path starts in Earn and crosses into the other three.",
    "line_cap": "A straight line ends at cash-out",
    "loop_cap": "A lifecycle shows how value can keep moving in the game",  # AUDIT L08
    "loop_alt": "Two versions of the model. First, Money In, Money Through, and Money Out on a straight line that stops after Money Out. Second, the same three stages on a loop, so value can return to the game.",
}
