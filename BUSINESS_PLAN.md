# Vael Hospitality — The Plan to Build a Billion Dollar Business

## The Thesis

Hotels spend $5.82 trillion globally. They run 15-20 disconnected software tools. 40% of their phone calls go unanswered. Their reviews go unresponded for days. Their guest data is fragmented. Their upselling is manual and generic.

**Vael Hospitality is the AI operating system for hotels.** One platform that replaces review management, guest CRM, upselling tools, and the front desk phone — all powered by AI that knows everything about the hotel.

The wedge is review management (immediate pain, easy to sell). The expansion is guest intelligence + upselling (revenue generation). The moat is the AI voice agent (sticky, hard to rip out, saves real headcount).

---

## CEO — Vision & Strategy

### Year 1: Prove it works (0 → 100 hotels)

**Q2 2026 (Now → June)**
- Get 5 pilot hotels using the product for free
- Target: independent boutique hotels, 50-200 rooms, US market
- Source pilots from: hotel owner LinkedIn communities, boutique hotel associations, personal network
- Goal: prove that AI review responses save time and that hotels actually use the dashboard daily

**Q3 2026 (July → September)**
- Turn pilots into paying customers ($99-249/mo)
- Get 20 more paying hotels through referrals + cold outreach
- Hire first employee: a hospitality industry person (not a dev) who can do sales + customer success
- Apply to Y Combinator (W27 batch, deadline ~October)

**Q4 2026 (October → December)**
- Hit 50-100 hotels
- Launch upselling module as paid upgrade
- Target $30K-50K MRR
- Close a design partner with a 5-10 property hotel group

### Year 2: Scale (100 → 2,000 hotels)

- Raise seed round ($2-4M) on the back of real revenue + retention data
- Hire: 2 engineers, 1 designer, 3 sales reps (hospitality background)
- Launch voice agent as premium tier
- Expand to UK + Europe (huge boutique hotel market)
- Build Opera Cloud integration (unlocks enterprise hotel chains)
- Target $500K-1M MRR by end of year

### Year 3: Dominate (2,000 → 10,000 hotels)

- Raise Series A ($15-25M)
- Add dynamic pricing module (the 5th product)
- Enterprise sales team for hotel chains (Marriott franchisees, IHG, Accor managed properties)
- International expansion: Middle East (Dubai hotel boom), Asia Pacific
- Target $5M+ MRR

### Fundraising Strategy

**Pre-seed (Now):** Bootstrap or raise $200-500K from angels. Hotel tech is hot — Mews raised $300M, Canary raised $80M. You have a working product, which puts you ahead of 90% of pre-seed companies.

**Target investors:**
- Thayer Ventures (hospitality-focused VC)
- Cambon Partners (hospitality M&A + investment)
- Bessemer Venture Partners (invested in Toast, Procore — vertical SaaS specialists)
- A16Z (AI fund)
- Y Combinator

**Pitch in one line:** "We're building the AI operating system for hotels — starting with review management, expanding into guest intelligence and a 24/7 AI phone concierge. 40% of hotel calls go unanswered. We fix that."

### Strategic Partnerships

1. **Mews** — They have 1000+ integrations and a marketplace. Getting listed there puts you in front of thousands of hotels. Their API is already integrated in our codebase.
2. **Hotel Tech Report** — The "G2 for hotels." Getting reviewed and ranked here is how hotels discover software. Apply for their awards.
3. **AHLA (American Hotel & Lodging Association)** — Industry body. Sponsor their events, get on their recommended vendor list.
4. **Boutique Hotel Owners Association** — Direct access to your ICP.

---

## CTO — Technical Roadmap

### What's Built (Today)

| Module | Status | Production-Ready? |
|--------|--------|-------------------|
| Review Management | Built | 85% — needs end-to-end testing with real CSV data |
| Guest Personalization | Built | 75% — needs PMS integration testing with real Mews account |
| Upsell Engine | Built | 70% — needs email sending integration |
| Voice Agent | Built | 60% — needs Twilio testing, latency optimization |
| Auth + Onboarding | Built | 90% — working with Supabase |
| Brand Voice Auto-Detection | Built | 90% — working with Claude |
| Database + Migrations | Built | 100% — 26 migrations, RLS, indexes |
| Security | Red-teamed 2x | 95% — all critical/high issues fixed |
| Tests | 38 unit tests | Needs integration + E2E tests |
| Landing Page + Demo | Built | 100% |

### Priority Technical Work (Next 30 Days)

**Week 1-2: Make the core loop bulletproof**
1. End-to-end test: sign up → add property → import CSV reviews → AI analysis → generate response → edit → publish
2. Fix any bugs that surface
3. Add error boundaries on all dashboard pages
4. Add Sentry for error monitoring
5. Add PostHog for product analytics (who's using what, where do they drop off)

**Week 3-4: Email sending + real integrations**
1. Integrate Resend or SendGrid for email delivery (upsell campaigns, guest messages)
2. Test Mews PMS integration with a sandbox account
3. Test Twilio voice agent with a real phone number
4. Add Stripe checkout flow for billing

### Architecture Decisions That Matter

**Why this architecture scales:**
- Supabase (Postgres) handles 100K+ hotels without architectural changes
- RLS policies mean multi-tenancy is enforced at the database level
- Vercel serverless means zero infrastructure management
- Claude API means AI improves without us retraining anything

**What we'd change at 1000+ hotels:**
- Move from Vercel to AWS (ECS) for the voice agent (WebSocket support)
- Add Redis for rate limiting and caching
- Add a job queue (Inngest or Trigger.dev) for background processing instead of fire-and-forget fetches
- Consider fine-tuning a smaller model for review analysis (cost reduction)

### Hiring Plan (Technical)

1. **First hire: Full-stack engineer** who has shipped a SaaS product before. They own the product while you focus on sales. $150-180K or equity-heavy if early.
2. **Second hire: DevOps / infrastructure** when you hit 500+ hotels and need to migrate off Vercel for the voice agent.
3. **Don't hire too early.** The codebase is clean enough that one good engineer can maintain and extend all 4 modules.

---

## CPO — Product Strategy

### The Product-Led Growth Loop

```
Hotel signs up (free trial)
  → Pastes website URL → AI auto-configures brand voice
  → Imports reviews via CSV → AI analyzes all of them instantly
  → Generates first AI response → Hotel is amazed ("this sounds like us!")
  → Hotel publishes response to Google → Sees time saved
  → Upgrades to paid → Invites team members
  → Tells other hotel owners → Referral loop
```

**Time to value must be under 5 minutes.** The URL auto-detection feature we just built is critical — it eliminates the biggest onboarding friction.

### Feature Priority (What Moves Revenue)

**Tier 1 — Ship This Month (Keeps Users)**
- CSV import working flawlessly (this is how 90% of early users will get data in)
- AI response generation quality (this is the "aha moment")
- Brand voice accuracy (if responses don't sound like the hotel, they churn)

**Tier 2 — Ship Next Month (Grows Revenue)**
- Stripe billing (you can't charge without this)
- Email delivery for upsell campaigns (this is where the revenue share model kicks in)
- Basic analytics dashboard (hotels love data)

**Tier 3 — Ship in 3 Months (Competitive Moat)**
- Google Business Profile auto-sync (eliminates CSV import friction)
- Voice agent live calls (massive differentiator — Canary is the only competitor doing this)
- PMS integration with real Mews account

**Tier 4 — Ship in 6 Months (Enterprise)**
- Multi-property management dashboard
- Opera Cloud integration (required for chains)
- API access for custom integrations
- White-label option for hotel management companies

### Pricing Strategy

**Starter — $99/property/month**
- AI review responses (unlimited)
- Brand voice + smart snippets
- CSV import
- Review analytics
- 1 user

**Professional — $249/property/month**
- Everything in Starter
- Guest profiles + segmentation
- Upsell engine + campaigns
- Knowledge base
- 5 users
- Email delivery

**Enterprise — $499/property/month + revenue share**
- Everything in Professional
- AI voice agent (24/7)
- PMS integration
- Unlimited users
- Priority support
- 10% commission on upsell revenue generated

**Why revenue share on upselling:** Hotels understand commission models (they pay OTAs 15-25%). A 10% cut on incremental upsell revenue is easy to justify. If you generate $5,000/month in upsell revenue for a hotel, you make $500. That's on top of the $499 subscription. At scale, revenue share could be 40-50% of total revenue.

### Key Metrics to Track

- **Activation rate:** % of signups that import reviews in first session
- **Time to first AI response:** How fast they generate their first response
- **Response publish rate:** % of AI responses that get published (quality signal)
- **Daily active properties:** How many hotels use it daily
- **Upsell revenue per property:** Revenue generated through the platform
- **Voice call resolution rate:** % of calls handled without human transfer
- **Net revenue retention:** Are hotels expanding usage over time?

---

## CMO — Go-To-Market

### Positioning

**Not "AI for hotels."** That's generic. Every startup claims AI.

**"The AI concierge that never sleeps."** This positions around the core value: 24/7 availability that a human staff can't provide.

**Alternative: "Your hotel's AI brain."** (Already on the landing page.) This positions as the central intelligence layer, not just another tool.

### Target Customer Profile (ICP)

**Primary: Independent boutique hotels, 50-200 rooms, US + UK + Europe**
- They have the pain (understaffed, can't afford 24/7 front desk coverage)
- They have the budget ($250-500/month is nothing vs. hiring another staff member)
- They make decisions fast (no corporate procurement process)
- They care about brand voice (boutiques differentiate on personality)

**Secondary: Small hotel groups (3-15 properties)**
- Higher contract value (3-15x per deal)
- Need multi-property management
- Often have a marketing manager who would champion the tool

**Avoid (for now): Big chains (Marriott, Hilton, IHG)**
- 12-18 month sales cycles
- Need SOC2, HIPAA, enterprise security audits
- Need Opera integration (we have it planned but not built)
- Come back to these in Year 2-3

### Channel Strategy

**1. Content Marketing (Free, Compounds Over Time)**
- Blog: "How to Respond to Negative Hotel Reviews (With AI Examples)"
- Blog: "The Hotel GM's Guide to AI in 2026"
- Blog: "We Analyzed 10,000 Hotel Reviews — Here's What Guests Really Care About"
- YouTube: Demo videos, hotel owner testimonials, product walkthroughs
- SEO play: rank for "hotel review management software", "AI review responses for hotels", "hotel voice agent"

**2. Hotel Tech Report (Critical Channel)**
- Create a profile on hoteltechreport.com
- Get 10+ reviews from pilot hotels
- Apply for their annual awards (HotelTechAwards)
- This is THE discovery platform for hotel software — 100K+ monthly visitors

**3. LinkedIn (Where Hotel Owners Live)**
- Chris (CEO) posts 3-5x/week about hotel tech, AI in hospitality, founder journey
- Share real results: "We helped [Hotel X] respond to 150 reviews in 10 minutes"
- Comment on hotel industry posts to build presence
- Direct outreach to hotel GMs and owners (personalized, not spammy)

**4. Industry Events**
- HITEC (Hospitality Industry Technology Exposition) — June 2026 in Minneapolis
- The Lodging Conference — September 2026
- AHLA events
- Start as an attendee, not a sponsor. Network, demo 1:1, collect contacts.

**5. Referral Program**
- Give hotels 1 month free for every referral that converts
- Give them a custom referral link they can share
- Hotels talk to each other — especially within the same city/market

### Launch Playbook (First 30 Days)

**Week 1:** Post the product on LinkedIn with a video demo. Share in hotel Facebook groups. Email your personal network. Goal: 50 signups.

**Week 2:** Cold outreach to 100 boutique hotels. Use a tool like Apollo.io to find hotel GM emails. Personalize: "I saw [Hotel Name] has 47 unresponded Google reviews — we can fix that in 10 minutes."

**Week 3:** Launch on Hotel Tech Report. Post on Product Hunt. Share results from first users.

**Week 4:** Follow up with all signups. Offer white-glove onboarding (you personally import their reviews and configure their brand voice). Convert free trials to paid.

---

## CRO — Revenue Strategy

### Revenue Model (Three Streams)

**1. SaaS Subscriptions (Core)**
- $99-499/property/month
- Predictable, recurring
- Target: 70% of revenue in Year 1

**2. Upsell Revenue Share (Growth)**
- 10% commission on upsell revenue generated through the platform
- If a hotel generates $5K/month in upsell revenue, you earn $500/month
- This scales with hotel performance — aligned incentives
- Target: 20% of revenue by Year 2

**3. Voice Agent Usage (Premium)**
- Per-minute pricing for AI voice calls (our cost is ~$0.15/min, charge $0.50-1.00/min)
- Or included in Enterprise tier as unlimited
- Target: 10% of revenue by Year 2

### Revenue Projections

| Metric | Month 3 | Month 6 | Month 12 | Month 24 |
|--------|---------|---------|----------|----------|
| Hotels | 25 | 75 | 250 | 1,000 |
| ARPU | $150 | $180 | $220 | $300 |
| MRR | $3,750 | $13,500 | $55,000 | $300,000 |
| ARR | $45K | $162K | $660K | $3.6M |

### Sales Process

**Self-serve (Starter tier):**
Hotel signs up → free trial → imports reviews → sees value → enters credit card

**Sales-assisted (Professional + Enterprise):**
1. Hotel GM sees LinkedIn post / HotelTechReport / referral
2. Books a demo (Calendly link on website)
3. You (Chris) do a 20-min screen share showing their actual hotel's reviews being analyzed
4. You import their reviews live during the demo (this is the killer move)
5. They see AI responses in their brand voice → "holy shit" moment
6. Close on the call or follow up within 48 hours
7. Offer: "First month free if you sign up this week"

**The demo script:**
1. "Can I have your hotel website URL?" → paste into brand voice analyzer
2. "Here's what our AI learned about your brand" → show extracted facts + tone
3. "Let me import your latest reviews" → grab 10 reviews from their Google listing
4. "Watch this" → generate AI response to their worst review
5. "That took 8 seconds. Your staff spends 15-20 minutes per response."
6. Close.

### Churn Prevention

Hotels churn when:
1. They stop seeing value → Fix: weekly email summary of what the AI did for them
2. They never fully onboarded → Fix: white-glove setup for first 100 hotels
3. A competitor undercuts on price → Fix: revenue share model means you're generating money for them, not just costing money
4. Staff turnover (the champion leaves) → Fix: make the product so embedded that multiple people use it daily

The voice agent is the ultimate anti-churn feature. Once a hotel routes their phone through your AI, the switching cost is enormous — they'd have to re-train a new system, risk missed calls, re-configure their phone tree. This is why voice should be the priority upgrade path for every hotel.

---

## The 90-Day Execution Plan

### Days 1-7: Get the product working end-to-end
- [ ] Test full signup → review import → AI response flow
- [ ] Fix any bugs that surface
- [ ] Add Stripe billing (even if just a checkout link to start)
- [ ] Set up a custom domain: hospitality.vaelcreative.com

### Days 8-14: Get 5 pilot hotels
- [ ] Reach out to 20 hotel owners you know or can get warm intros to
- [ ] Offer free setup + 3 months free in exchange for feedback
- [ ] Personally onboard each one (import their reviews, configure brand voice)
- [ ] Document everything that breaks

### Days 15-30: Iterate based on pilot feedback
- [ ] Fix the top 5 issues pilots report
- [ ] Build the features they ask for most
- [ ] Get testimonials and screenshots for marketing
- [ ] Set up Hotel Tech Report profile

### Days 31-60: Start charging
- [ ] Convert pilots to paid ($99/month for the first year as early adopter pricing)
- [ ] Launch LinkedIn content strategy (3 posts/week)
- [ ] Cold outreach to 200 hotels
- [ ] Target: 20 paying hotels

### Days 61-90: Prove the business model
- [ ] Hit $5K MRR
- [ ] Publish case study: "[Hotel Name] saved 40 hours/month with Vael Hospitality"
- [ ] Apply to Y Combinator / Thayer Ventures
- [ ] Hire first employee (hospitality background, sales + CS)

---

## Why This Wins

1. **Timing:** AI in hospitality is exploding right now. Investment surged 250% in 2025. Hotels are actively looking for AI solutions.

2. **Wedge:** Review management is a burning pain point with a 5-minute time-to-value. Easy to sell, easy to demonstrate.

3. **Expansion:** Once you're managing reviews, you have the hotel's trust + data to sell guest intelligence, upselling, and voice.

4. **Moat:** The voice agent is the moat. No one except Canary ($80M raised, enterprise-focused) is doing this well. You can own the independent/boutique segment.

5. **Unit economics:** AI cost per hotel is ~$20-50/month. Subscription is $99-499/month. That's 5-25x gross margin. At 1,000 hotels, that's $3M+ ARR on $240-600K in AI costs.

6. **You already have the product.** Most founders spend 6-12 months building. You have 3 AI modules, 26 database tables, a landing page, a demo, and it's deployed. The hard part is done. Now sell it.
