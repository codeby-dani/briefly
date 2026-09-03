# 99 — Demo Script

**Hard limit: 3:00. Target: 2:30.** Audio is required by the rules.

Record in the **ChatGPT desktop in-app browser**. It needs no flag, and it puts
the agent and the page in the same frame, which is the entire story.

## The Argument, In One Sentence

Most WebMCP apps hand an agent a fixed list of tools at page load; this one
derives the surface from what the human is looking at, so the agent is never
offered something that cannot work — and you can watch it happen.

Everything in the script serves that sentence. Cut anything that does not.

## Shot List

### 0:00–0:20 — The problem

Dashboard on screen, tool surface panel visible in the corner.

> "This is a content marketing workspace. Trends on one side, product knowledge
> on the other, and the briefs that connect them. Normally, to get AI help
> here, you copy the trend into a chat window, paste in whatever product notes
> you can find, and paste the answer back. Every hand-off rebuilds the context."

### 0:20–0:50 — The surface follows state

Navigate: Dashboard, then Trends. **Keep the panel in frame.**

> "The agent connected to this page sees two tools on the dashboard. On the
> Trends page it sees eight."

Open a trend.

> "Open a trend, and two more appear — because now there is a trend to read and
> a summary to write."

Close it. Let the ghosted rows show.

> "Close it, and they're gone. The agent is never offered a tool that can't
> succeed."

**This is the most important twenty seconds in the video.** One continuous
shot, no cuts. If a viewer misses this, nothing after it lands.

### 0:50–1:20 — The agent reads what you're looking at

Open the top trend. Ask in the chat panel:

> *"Why is this trending, and what angle could we take?"*

Agent calls `get_trend_detail`, then `write_trend_summary`.

> "It read the spike shape, the related keywords and the sample posts — and
> wrote the analysis onto the page, in front of me, not into a chat transcript
> I'd have to copy out."

### 1:20–2:05 — The payoff

Go to Product Knowledge. Show the do-and-do-not list on a product.

> "This is the part that never survives a copy-paste: what the brand will say,
> and what it won't."

Select that product. **Point at the panel — two tools appear.**

> "Now a trend and a product are both selected, so the brief tools register."

Ask:

> *"Write me a TikTok brief for this."*

Agent calls `get_brief_context`, then `save_brief`. Brief appears in the library.

> "It had the trend, the USP, the price and the do-not list. And it saved the
> brief into the library as a draft — it structurally can't publish. That stays
> a human decision."

Edit the hook by hand. Set status to approved.

### 2:05–2:30 — Honesty and close

> "Trend scraping and analytics are seeded fixtures — you can see them labelled.
> Product knowledge, search, filtering, the briefs and the summaries are real.
>
> And there's no model in this app. No API key, no backend. The page exposes
> what it knows and accepts what it's told; the agent you're already talking to
> does the writing. That's the bet: the web app supplies capability, the agent
> supplies reasoning, and the human stays in the loop because the app is built
> so they have to be."

## Rules For The Recording

- **Panel in frame the whole time.** The claim is visual; do not cut away from
  the evidence.
- **Do not narrate what is on screen.** Say why it matters. The viewer can read.
- **Two takes minimum.** Play back take one with headphones before take two.
- **Do not speed up the tool registration animations.** The 1.1s ghost is the
  proof.
- **No title cards.** Three minutes is short and a judge has watched forty
  videos.
- **Have the pickers pre-positioned.** Hunting for a dropdown on camera costs
  ten seconds you do not have.

## Pre-Flight

Run this list before the first take, not between takes:

- [ ] `localStorage` in a known state — reseed if the library is cluttered
- [ ] Chat panel and page both visible in the capture region
- [ ] Mic level checked with a playback, not a meter
- [ ] Notifications off
- [ ] The exact trend and product for the demo decided in advance
- [ ] One full silent rehearsal of the click path
