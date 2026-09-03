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

> "Open a trend, and four more appear — because now there is a trend to read, a
> video to play, and a summary to write."

Close it. Let the rows drop out of the list.

> "Close it, and they're gone. The agent is never offered a tool that can't
> succeed."

**This is the most important twenty seconds in the video.** One continuous
shot, no cuts. If a viewer misses this, nothing after it lands.

### 0:50–1:20 — The agent reads what you're looking at

Open the top trend. Ask in the chat panel:

> *"Why is this trending, and what angle could we take?"*

Agent calls `get_trend_detail`, then `play_clip`, then `write_trend_summary`.

**Let the video actually play for two seconds before speaking.**

> "It read the spike, the keywords and the full transcripts of the clips on this
> trend — then started the one it wanted to cite. That's my player. I could have
> clicked it myself. And the analysis landed on the page, in front of me, not in
> a chat transcript I'd have to copy out."

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

> "The dataset is fiction, and it says so. Trend volumes and analytics are
> invented — badged `demo data`. The clips are ours, generated, never published
> anywhere, so they have no view counts to fake; what you see on them is
> measured off the files — badged `measured`.
>
> The processing is not fiction. That summary came from a model reading the
> actual transcript of the clip you just watched.
>
> And nothing wrote that brief except the agent you're already talking to.
> There's no model behind the brief generator — no server path, no fallback.
> The page exposes what it knows and accepts what it's told. That's the bet:
> the web app supplies capability, the agent supplies reasoning, and the human
> stays in the loop because the app is built so they have to be."

## Rules For The Recording

- **Panel in frame the whole time.** The claim is visual; do not cut away from
  the evidence.
- **Do not narrate what is on screen.** Say why it matters. The viewer can read.
- **Two takes minimum.** Play back take one with headphones before take two.
- **Keep the panel's footer count in frame.** The panel has no registration
  animation — a tool appears and disappears with the state it belongs to — so
  the count moving from 2 to 8 to 12 and back is the whole proof. Frame it, and
  pause on each number long enough to read.
- **Let `play_clip` play.** Two seconds of the agent driving your video player
  is worth more than two sentences describing it.
- **Do not demo `analyze_trend`.** It needs a key and a round-trip, and it
  competes with the point. It exists for the judge who opens the URL without an
  agent; the video is the agent path.
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
