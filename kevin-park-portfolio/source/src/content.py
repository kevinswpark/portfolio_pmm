"""Site copy, English only.

Sources, used word for word:
  BRIEF   Notion "Kevin Park Website" portfolio brief
  NOTION  Notion "The Money Layer for Games (EN)" case study
  RESUME  Kevin_Park_Resume (uploaded 2026-09-27)
  ZBD     zbdpay.com, checked 2026-09-27 (quoted, not ours)
  KEVIN   copy Kevin supplied in chat (.impeccable/sources/kevin-chat-*.txt)
Strings under UI are navigation, labels, and buttons added where no source
text exists. Keep them short and functional.
"""

LINKEDIN = "https://www.linkedin.com/in/kevinswpark"
LINKEDIN_DISPLAY = "linkedin.com/in/kevinswpark"  # BRIEF

UI = {
    "name": "Kevin Park",
    "skip": "Skip to content",
    "work": "Work",
    "about": "About",                           # KEVIN 2026-10-11
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
    "platform_video": "Platform video",  # UI
    "platform_video_title": "ZBD platform video: The Money Layer for Games",  # UI
    "platform_video_cap": "ZBD’s platform video, 2 min 16 s, with sound.",  # UI
    "platform_video_open": "Watch the video",  # UI
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
    "role": "Senior Product Marketer · Fintech, Payments & Gaming",  # KEVIN 2026-10-11, shown above the headline
    "h1_before": "There’s a ",
    "h1_em": "story",
    "h1_after": " inside your complex product.",
    "sub": "I get into how a product works, why someone would use it, and what it takes to get them there. Then I build what helps people get it, from campaigns and websites to demos and AI projects.",  # KEVIN 2026-11-10 (second pass: his 2026-10-11 statement line restored, joined to the 2026-10-11 supporting line)
    "cta_work": "Explore the work",
    "cta_linkedin": "Connect on LinkedIn",
    "card_kicker": "Case study",
    "card_line": "The Money Layer for Games",
    "card_brand": "ZBD",
}

PROOF = {  # KEVIN 2026-11-10: proof strip under the hero (replaced the PHILOSOPHY statement). Figures from the resume and case study.
    "label": "Selected results",
    "stats": [
        ("Series C", "fundraise supported by “The Money Layer for Games” positioning", "ZBD"),  # KEVIN 2026-11-10 (third pass: ZBD in, Finfare +24% out); claim as worded in the Money Layer case study
        ("20% → 50%", "first-transfer conversion, customers aged 50+", "WireBarley"),  # "~" removed at Kevin's request, 2026-11-10
        ("$40M", "holiday remittance volume from bilingual campaigns", "WireBarley"),
        ("300%", "year-over-year US growth on 40% of the prior budget", "WireBarley"),
    ],
}

WORK = {
    "h2": "Selected work",  # BRIEF
    "ml": {
        "title": "Giving ZBD one line to explain itself",  # KEVIN 2026-11-10 (outcome-led tile title; case study keeps its BRIEF title)
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
        "title": "Getting Korean Americans 50+ to their first transfer",  # KEVIN 2026-11-10 (outcome-led tile title; case study keeps its own)
        "problem": "Help Korean American customers aged 50+ complete their first transfer with WireBarley. Only about 20% of sign-ups in this group reached that point.",
        "result": "Korean-language TV commercial",
        "stat": ("20% → 50%", "sign-up-to-first-transfer conversion after the commercial aired"),  # KEVIN 2026-11-10, replaces the impact sentence; figures from the case study
    },
}

ABOUT = {  # KEVIN 2026-11-10, second pass ("the trim stripped a lot of what would define myself"): the 2026-10-11 About restored in his words, lightly tightened. "What you can expect" is back, verbatim.
    "h2": "About",
    "lead": ["I help people understand new technology.", "The more complicated, the better."],
    "intro": [
        "Hello, I’m Kevin. I’m a product marketer, startup junkie, 0-to-1 builder, and often the person connecting the dots when things are broken, both in and outside of work.",
        "I happened to start my career in fintech, and somehow, I’ve become a money person. How money works, what it means to people, and what gets in the way of making it work better in our lives.",
        "Like many families, mine had its share of money worries, and sometimes those worries took the joy out of things that should’ve been simple. I want to make the world a little more money-friendly.",
        "I find the greatest joy in making things easier for people. I’ll happily dig into the technical details of how money moves, why it moves, and who gets it. But I always come back to the same question: “So what? Why should anyone care?”",
    ],
    "beyond_h": "Beyond the work",
    "beyond": [
        "I’ve called South Korea, Canada, and the United States home at different points in my life. Lately, Tokyo has been making a pretty strong case for joining that list, and I’m picking up Japanese as my third language.",
        "I’m Canadian by nationality, Korean by nuance, American by drive, and Japanese by taste. I enjoy the blend, borrowing bits and pieces from different cultures and mixing them into my own melting pot of thoughts.",
        "I like being the person people come to when something doesn’t make sense or just isn’t working. There’s something pretty great about knowing I’ve made someone’s day a little easier.",
    ],
    "expect_h": "What you can expect",
    "expect": [  # three typographic lines; build.py sets each sentence as one unit
        ["Hard work.", "Long thought processes.", "Fastest execution."],
        ["Cool branding.", "Good conversations.", "Stellar ideas."],
        ["Diligence.", "A human touch.", "Vibe coding things that vibe."],
    ],
    "contrast": {"Long thought processes.": "slow", "Fastest execution.": "fast"},  # set in contrasting type widths
    # Portrait: None until a real photo of Kevin is added. To add one, put the file in assets-src/
    # and set, for example:
    #   "portrait": {"file": "kevin-park.jpg", "width": 1200, "height": 1500,
    #                "alt": "Kevin Park, smiling, in front of ..."},
    # width and height are the image's real pixel size. build.py copies the file to /assets/,
    # inlines it in the Artifact build, and switches the opening to a two-column layout.
    "portrait": None,
}

EXPERIENCE = {  # RESUME
    "h2": "Experience",
    # 2026-11-10 trim: intro line removed, one focus line per role, two bullets per role, skills shortened.
    # Second pass the same day: the ZBD Money Layer bullet is back, so ZBD shows three.
    "roles": [
        {
            "title": "Senior Product Marketing Manager",
            "company": "ZBD",
            "place": "Remote",
            "start": "May 2025",
            "end": "Present",
            "focus": "B2B · Gaming payments infrastructure",  # KEVIN 2026-11-10
            "bullets": [
                ("Developed “The Money Layer for Games” positioning and the messaging framework for ZBD’s four-product suite, with branding work that also supported its Series C fundraising.", []),  # KEVIN 2026-10-11, restored 2026-11-10; quote marks logged in EDITS
                ("Led the website copy rewrite and product naming work, incorporating feedback from business development and industry events.", []),  # AUDIT H07
                ("Created interactive demos and product videos to show how ZBD’s infrastructure works inside a game.", []),  # KEVIN 2026-10-11
            ],
        },
        {
            "title": "Product Marketing Manager",
            "company": "Finfare",
            "place": "Irvine, CA",
            "start": "Feb 2024",
            "end": "Jan 2025",
            "focus": "B2C · Digital banking and investing",  # KEVIN 2026-11-10
            "bullets": [
                ("Led go-to-market for digital banking and automated investing products, informed by 30+ customer interviews and six customer personas.", ["30+"]),  # AUDIT H08
                ("Led a 20-page website redesign with Product and UX. Engagement rose 36% and conversion rose 24%.", ["36%", "24%"]),  # AUDIT H08
            ],
        },
        {
            "title": "Product Marketing Manager",
            "company": "WireBarley",
            "place": "Los Angeles, CA",
            "start": "June 2020",
            "end": "Jan 2024",
            "focus": "B2C · Cross-border payments, 0 to 1",  # KEVIN 2026-11-10
            "bullets": [
                ("Led bilingual campaigns that drove $40M in holiday remittance volume. WireBarley reached the leading market position among Korean Americans by 2023.", ["$40M"]),  # KEVIN 2026-11-05
                ("Delivered 300% year-over-year US growth while operating within 40% of the previous year’s North American marketing budget.", ["300%", "40%"]),  # KEVIN 2026-11-05
            ],
        },
    ],
    "education": ["Bachelor of Commerce, UBC Sauder School of Business, Vancouver, BC"],
    "skills": ["Product Positioning", "Messaging Frameworks", "Go-to-Market Strategy", "Sales Enablement", "Competitive Intelligence", "Tableau", "R", "Bilingual (English / Korean)"],  # RESUME, trimmed 2026-11-10
}

CLOSING = {"h2": "Let’s talk.", "cta": "Connect on LinkedIn"}  # h2 KEVIN 2026-10-11 (replaced the LinkedIn URL); cta BRIEF

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
            ("p", "The work also supported ZBD’s Series C fundraising, which closed in January 2026. “The Money Layer for Games” and the broader branding work contributed to how the company presented itself as it raised its next round."),  # KEVIN 2026-10-11, quote marks logged in EDITS
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
            ("fig", "platform_video"),  # KEVIN 2026-11-10: ZBD_COMBO_V7.mp4, placed under the sentence that mentions the videos
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
    # Platform video supplied by Kevin 2026-11-10 (ZBD_COMBO_V7.mp4, 1080p, 2:16), re-encoded to 720p for the web.
    "video": {"file": "zbd-money-layer.mp4", "poster": "zbd-money-layer-poster.jpg", "width": 1280, "height": 720},
}

WB = {  # WB: Kevin's case study file "WireBarley-Tech-Adoption-Case-Study.md" (2026-10-05), verbatim, no edits
    "h1": "Driving tech adoption (and how I changed customer behaviors)",
    "deck": "Helping Korean American customers feel confident making their first digital money transfer.",
    "facts": [("Company", "WireBarley"), ("Role", "Product Marketing Manager, first US marketing hire")],
    "tldr_h": "TL;DR",
    "tldr": [
        ("Challenge", "Help Korean American customers aged 50+ complete their first transfer with WireBarley. Only about 20% of sign-ups in this group reached that point."),
        ("Approach", "Use customer support call logs to understand where people needed reassurance, then show that support in a Korean-language TV commercial."),
        ("Result", "In the period after the commercial aired, sign-up-to-first-transfer conversion in this group rose to nearly 50%."),
    ],
    "sections": [
        {"id": "audience", "h2": "The most profitable audience had the lowest conversion rate", "blocks": [
            ("p", "As WireBarley’s first US marketing hire, I worked on bringing its digital remittance service to Korean American customers and adjacent Asian American communities. The service let people send money abroad without visiting a bank."),
            ("p", "COVID lockdowns had accelerated the move toward contactless services, creating an opportunity for digital remittance. Earning people’s trust remained a challenge, especially when asking them to change how they handled money."),
            ("p", "Internal data showed that customers aged 50+ were our most profitable audience, with average transfer amounts roughly $250 above the overall average. Yet many stopped early in identity verification, and only about 20% went on to make their first transfer. I wanted to understand what was holding them back."),
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
                ("First-transfer conversion among customers aged 50+", "About 20% → nearly 50% after the commercial aired.", ["About 20%", "nearly 50%"]),
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
        "where": "Money Layer, The line and the framework, Series C paragraph",
        "why": "Single quotes in Kevin's message were nested inside his own quotation. On the page the line takes the double quotes it has everywhere else. Wording unchanged.",
        "from": "‘The Money Layer for Games’ and the broader branding work contributed to how the company presented itself as it raised its next round.",
        "to": "“The Money Layer for Games” and the broader branding work contributed to how the company presented itself as it raised its next round.",
    },
]

EDITS.append({
    "where": "Homepage Experience, ZBD first bullet",
    "why": "Same nested-quote fix as the Series C paragraph. Wording unchanged.",
    "from": "Developed ‘The Money Layer for Games’ positioning and the messaging framework for ZBD’s four-product suite, with branding work that also supported its Series C fundraising.",
    "to": "Developed “The Money Layer for Games” positioning and the messaging framework for ZBD’s four-product suite, with branding work that also supported its Series C fundraising.",
})

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


# ---------------------------------------------------------------------------
# Tools (added 2026-11-08). Copy tagged TOOL is drafted for Kevin to review in his voice;
# figures are sourced in FP["sources"]. Nav label "Tools" and the planner name come from Kevin's request.
# ---------------------------------------------------------------------------
TOOLS = {
    "nav": "Tools",                                   # KEVIN 2026-11-08
    "menu_label": "Tools menu",
    "items": [
        {"key": "fp", "title": "Financial planner",   # KEVIN 2026-11-08 ("a financial tool underneath")
         "desc": "A starter money plan in about 10 minutes"},  # TOOL
    ],
}

FP = {  # TOOL: the financial planner at /tools/financial-planner/
    "title": "Financial planner | Kevin Park",
    "meta": "A free starter financial plan for people who don’t think of themselves as money people. Build a budget, an emergency fund target, and a list of what to do next.",
    "h1": "A starter financial plan for people who aren’t money people",
    "deck": "Answer a few questions about your paycheck, your bills, and what you’re saving for. You’ll leave with a budget, an emergency fund target, and a short list of what to do next.",
    "facts": [("Time", "About 10 minutes"), ("Cost", "Free"), ("Your answers", "Stay in this browser")],
    "note": "I want money to feel less intimidating. This planner uses the rules of thumb most planners start with and shows the math behind each one. It’s for learning, so it never names a fund, a stock, or a brokerage.",
    "rail_h": "Your plan",
    "step_of": "Step {n} of {total}",
    "back": "Back",
    "next": "Next",
    "start_over": "Start over",
    "summary_h": "Your plan so far",
    "summary_empty": "Your numbers show up here as you go.",
    "steps": [
        {"key": "pay", "nav": "Paycheck", "h": "Start with your paycheck",
         "lead": "Everything in your plan is sized to the money that actually reaches your account."},
        {"key": "bills", "nav": "Bills", "h": "List the bills you can’t skip",
         "lead": "These are the costs you’d still pay if your income stopped tomorrow. Their total sets your emergency fund."},
        {"key": "budget", "nav": "Budget", "h": "Split your paycheck three ways",
         "lead": "The 50/30/20 rule puts half of take-home pay toward needs, 30% toward wants, and 20% toward savings. Where you live moves those numbers."},
        {"key": "safety", "nav": "Safety net", "h": "Build your safety net",
         "lead": "An emergency fund keeps one bad month from turning into credit card debt. Yours depends on how steady your income is."},
        {"key": "goals", "nav": "Goals", "h": "Plan for the big stuff",
         "lead": "Money you need within a few years should stay out of the stock market. Money you won’t touch for a long time can take more risk."},
        {"key": "retire", "nav": "Retirement", "h": "Find the free money first",
         "lead": "If your employer matches what you put into a retirement plan, that match is usually the best return you can get."},
        {"key": "invest", "nav": "Investing", "h": "Decide how much to invest",
         "lead": "A common target is 15% of your pay before taxes for retirement, counting your employer’s match."},
        {"key": "plan", "nav": "Your plan", "h": "Here’s your plan",
         "lead": "These are your next moves, in order. Do the first one this week."},
    ],
    "q": {
        "take_home": ("How much lands in your bank account each month?",
                      "Use take-home pay, after taxes and anything your employer takes out. Your paystub calls it net pay."),
        "pay_type": ("How steady is your pay?", ""),
        "pay_types": [("steady", "About the same every paycheck"), ("hourly", "Mostly steady, but hours change"), ("variable", "It changes a lot (tips, commission, freelance)")],
        "gross": ("What do you earn in a year before taxes?",
                  "Optional. It sets your tax bracket and your retirement account limits."),
        "filing": ("How do you file taxes?", ""),
        "filings": [("single", "Single"), ("joint", "Married, filing jointly")],
        "zip": ("What’s your ZIP code?", "We use it to compare prices where you live with the US average."),
        "tier": ("Cost of living", "Change this if it doesn’t match how expensive your area feels."),
        "tiers": [("low", "Lower cost"), ("mid", "Medium cost"), ("high", "Higher cost")],
        "bills": ("Monthly bills", "Enter $0 for anything that doesn’t apply. A three-month average works for bills that change."),
        "bill_rows": [
            ("rent", "Rent or mortgage", "Include HOA fees and renter’s insurance"),
            ("utilities", "Utilities", "Electric, gas, water, trash"),
            ("phone", "Phone and internet", ""),
            ("car", "Car payment and insurance", ""),
            ("transport", "Gas and transit", ""),
            ("health", "Health insurance", "Only if it isn’t already taken out of your paycheck"),
            ("groceries", "Groceries", "Food at home, not restaurants"),
            ("childcare", "Childcare and support", ""),
            ("debt_min", "Minimum debt payments", "Student loans, car loans, card minimums"),
            ("other", "Other must-pays", "Medication, pet care, anything you can’t pause"),
        ],
        "card": ("Do you carry a credit card balance from month to month?", ""),
        "card_balance": ("Balance", ""),
        "card_apr": ("Interest rate (APR)", "It’s on your statement, usually around 20% or more"),
        "split": ("Your split", "Drag to change it. Your three numbers always add up to 100%."),
        "incomes": ("How many paychecks support your household?", ""),
        "income_opts": [("1", "One"), ("2", "Two or more")],
        "dependents": ("Does anyone depend on your income?", "Kids, a partner, or a parent you help support"),
        "own": ("Do you own a home?", "Owners have more repair surprises"),
        "risk_job": ("Is your job hard to replace quickly?", "Layoffs are common in your field, or you have a health condition"),
        "yes_no": [("yes", "Yes"), ("no", "No")],
        "saved": ("How much do you have saved for emergencies right now?", "Cash you could reach in a day or two. Not retirement accounts."),
        "monthly_save": ("How much can you put toward it each month?", "We started with part of your savings budget. Adjust it to what feels real."),
        "goal_add": ("What are you saving for?", "Add anything you’ll need a lump sum for. Skip this if nothing comes to mind."),
        "goal_types": ["Wedding", "Home down payment", "Car", "School", "Baby", "Travel", "Starting a business", "Something else"],
        "goal_amount": "Amount",
        "goal_year": "Need it by",
        "goal_saved": "Saved so far",
        "goal_remove": "Remove",
        "risk_h": "How do you feel about risk?",
        "risk_lead": "Five quick questions about the money you won’t need for at least five years. There are no wrong answers.",
        "risk": [
            ("When will you need most of your long-term money?",
             ["In under 5 years", "In 5 to 10 years", "In 10 to 20 years", "In 20 years or more"]),
            ("If you lost your income, how long could you cover bills without selling investments?",
             ["Under 3 months", "3 to 6 months", "6 to 12 months", "More than a year"]),
            ("You invest $10,000. A month later it’s worth $7,000. What do you do?",
             ["Sell everything", "Sell some", "Wait it out", "Buy more"]),
            ("Which would you pick for one year?",
             ["$10,300, guaranteed", "Anywhere from $9,500 to $11,000", "Anywhere from $9,000 to $12,000", "Anywhere from $8,000 to $14,000"]),
            ("Have you invested before?",
             ["Never", "A little", "For a few years", "Yes, through a market crash"]),
        ],
        "plan_offered": ("Does your job offer a retirement plan?", "A 401(k), 403(b), 457(b), TSP, or SIMPLE IRA all count."),
        "plan_opts": [("yes", "Yes"), ("no", "No"), ("unsure", "Not sure")],
        "match": ("How does your employer match?", "Check your benefits site or ask HR for the plan summary."),
        "match_opts": [
            ("none", "No match", 0, 0),
            ("safe", "100% of the first 3%, then 50% of the next 2%", 5, 4),
            ("half6", "50% of the first 6%", 6, 3),
            ("full4", "100% of the first 4%", 4, 4),
            ("full5", "100% of the first 5%", 5, 5),
            ("full6", "100% of the first 6%", 6, 6),
            ("unsure", "Not sure", 0, 0),
        ],
        "contrib": ("How much of each paycheck goes in now?", "Enter it as a share of your pay, like 3 for 3%."),
        "vesting": ("When is the match fully yours?", "Your own contributions are always yours. The match can take time."),
        "vest_opts": [("now", "Right away"), ("cliff", "All at once after a few years"), ("graded", "A little more each year"), ("unsure", "Not sure")],
        "roth401k": ("Does the plan offer a Roth 401(k)?", ""),
        "hsa": ("Are you on a high-deductible health plan with an HSA?", ""),
        "learn_h": "Ways to invest",
        "learn_lead": "Once you know how much, you pick how. These are the main options, from least effort to most.",
    },
    "learn": [
        ("Target-date funds", "One fund holds a mix of stocks and bonds and gets more careful as its target year gets closer. It’s the default in many 401(k) plans.",
         "Lowest effort. Check the yearly fee, called the expense ratio, since it varies a lot."),
        ("Index funds and ETFs", "One fund holds hundreds or thousands of companies by tracking a market index, so no single company can sink you.",
         "Low effort, wide spread, and yearly fees that are often under 0.10%."),
        ("Robo-advisors", "An app asks about your goals, builds a portfolio of funds, and rebalances it for you.",
         "Low effort outside a 401(k). Expect a fee of about 0.25% a year on top of the funds’ own fees."),
        ("Individual stocks", "You buy shares of one company at a time. It’s a good way to learn and a risky way to save.",
         "High effort and little spread unless you own many. Many people keep this to a small slice, under 10%."),
    ],
    "learn_more": [
        ("Why fees matter", "A 1% yearly fee sounds small. On $500 a month for 30 years at a 6% return, you’d end up with about $80,000 less than with a 0.05% fee."),
        ("Investing on autopilot", "Putting the same amount in every payday, through ups and downs, means you buy more when prices drop. It also takes the guessing out."),
        ("Rebalancing", "Once a year, move money back to your target mix. If stocks had a great year, that means trimming them."),
    ],
    "hysa_h": "Where to keep it",
    "hysa_lead": "Keep your emergency fund in a high-yield savings account. The best ones pay more than 10 times the national average, and the money is still there when you need it.",
    "hysa_check": [
        "Insured by the FDIC (banks) or NCUA (credit unions), up to $250,000",
        "No monthly fee and no minimum balance to earn the rate",
        "A rate that lasts, not a six-month promo",
        "No direct deposit or monthly deposit requirement you can’t meet",
        "Transfers to checking in one or two business days",
    ],
    "hysa_table_cap": "Rates change often. Check the bank’s site before you open an account.",
    "hysa_cols": ["Account", "APY", "Minimum to earn it", "Fine print"],
    "email_h": "Take your plan with you",
    "email_lead": "Get everything above as a PDF you can print, save, or check off.",
    "email_label": "Email address",
    "email_cta": "Get my PDF",
    "email_busy": "Making your PDF…",
    "email_done": "Your PDF is downloading. If it doesn’t start, use the button below.",
    "email_again": "Download again",
    "email_error": "Enter an email address so I know where it came from.",
    "email_privacy": "Only your email is sent, and only to me. Your numbers stay in this browser and go straight into the PDF.",
    "disclaimer": "For learning only. This isn’t financial, tax, or legal advice, and I’m not a licensed advisor. The planner never recommends a specific fund, stock, or brokerage. Rules of thumb are a starting point, so check big decisions with a professional.",
    "sources_h": "Where the numbers come from",
    "sources": [
        ("Cost of living", "BEA Regional Price Parities, 2024 data, released February 19, 2026", "https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area"),
        ("ZIP codes to areas", "Census 2020 ZIP code to county file and OMB 2023 metro areas", "https://www.census.gov/geographies/reference-files/time-series/geo/relationship-files.2020.html"),
        ("Retirement limits", "IRS 2026 limits", "https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500"),
        ("Tax brackets", "IRS 2026 inflation adjustments", "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill"),
        ("Savings rates", "NerdWallet, rates as of November 6, 2026", "https://www.nerdwallet.com/banking/best/high-yield-online-savings-accounts"),
    ],
    # numbers the planner computes with
    "data": {
        "year": 2026,
        "limits": {"k401": 24500, "k401_50": 8000, "k401_60": 11250, "ira": 7500, "ira_50": 1100,
                   "hsa_self": 4400, "hsa_family": 8750, "hsa_55": 1000},
        "roth_phase": {"single": [153000, 168000], "joint": [242000, 252000]},
        "std_deduction": {"single": 16100, "joint": 32200},
        "bracket_24": {"single": 105700, "joint": 211400},   # taxable income where 24% starts
        "tiers": {"high": 105, "low": 95},                  # RPP cutoffs, US = 100
        "splits": {"high": [60, 20, 20], "mid": [50, 30, 20], "low": [45, 25, 30]},
        "high_apr": 8,
        "national_avg_savings": 0.38,
        "hysa_asof": "November 6, 2026",
        "hysa": [
            ["Pibank Savings", "4.40%", "$0", "No monthly fee"],
            ["Peak Bank", "4.27%", "$0", "$100 to open"],
            ["EverBank Performance Savings", "4.20%", "$0", "No requirements listed"],
            ["Happen Bank LevelUp Savings", "4.20%", "$0", "Needs $250 or more deposited each cycle, otherwise 3.00%"],
            ["SoFi Checking and Savings", "Up to 4.40%", "$0", "3.30% base needs direct deposit or $5,000 in deposits every 31 days"],
            ["Openbank High Yield Savings", "Up to 4.35%", "$500", "Six-month rate for new customers"],
            ["Marcus by Goldman Sachs", "3.50%", "$0", "No monthly fee"],
            ["Capital One 360 Performance Savings", "3.20%", "$0", "No monthly fee"],
        ],
        "mix": {"Conservative": [35, 65], "Moderate": [55, 45], "Growth": [75, 25], "Aggressive": [90, 10]},
        "mix_range": {"Conservative": "30 to 40%", "Moderate": "50 to 60%", "Growth": "70 to 80%", "Aggressive": "90 to 100%"},
        "formspree": "xrppvnyn",   # Formspree form ID (https://formspree.io/f/xrppvnyn). Empty: the PDF still downloads and nothing is sent.
        "site_url": "",    # filled from KP_SITE_URL at build time
    },
}
