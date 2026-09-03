# 00 — Product Requirements

## The Problem

A social-media content team runs the same loop every week. Somebody watches
what is trending. Somebody decides which trends the brand can credibly join.
Somebody writes a brief that connects the trend to an actual product. Somebody
schedules it. Somebody checks whether it worked.

The middle step is where the loop breaks. Connecting a trend to a product is
not a lookup — it needs the trend's shape, the product's positioning, its
price, its unique selling points, and the things the brand has decided it will
not say. That knowledge exists, scattered across a notion page, a slack thread
and one person's head. So briefs get written from the trend alone, the product
angle is generic, and the content underperforms in a way nobody traces back to
the brief.

Teams already reach for an AI assistant here. What they do is copy the trend
into a chat window, paste in whatever product notes they can find, get a brief
back as prose, and paste it into a doc. The assistant has no idea what the
human is looking at, cannot see the product knowledge base, and cannot put the
result anywhere. Every hand-off is a copy-paste, and the context is rebuilt from
scratch each time.

## The Hypothesis

If the dashboard hands its own capabilities to the agent — the trend the human
has open, the product knowledge base, the ability to write a brief back into the
app — then the copy-paste loop disappears and the agent works on the same
surface the human does, at the same time.

This is what WebMCP is for, and it is why this app is a genuine fit rather than
a demo wrapped around a spec.

## Why WebMCP, Specifically

Three properties of the problem line up with three properties of the standard.

**The context is on screen, not in a database the agent could be given.** What
matters is which trend the human has open and which product they are thinking
about. That is view state. WebMCP exposes view state as tools; an API key and a
REST endpoint cannot.

**The output belongs in the app, not in the chat.** A brief that lands in a
chat transcript still has to be moved by hand. `save_brief` writes it into the
library, where it gets a status, a trend link and a product link.

**The work is collaborative, not delegated.** The human picks the trend because
they know the brand. The agent writes the brief because it is faster at drafting.
The human approves it because they are accountable for it. Neither side runs the
loop alone, which is exactly the "humans and agents interact, collaborate, and
create together" framing the challenge asks for.

## The Differentiator: A Tool Surface That Follows State

Most WebMCP demos register a fixed set of tools at page load. That is the
easy version and it produces the wrong behaviour: an agent is offered
`save_brief` while the user is on the settings page, calls it, and fails.

Here the surface is derived from app state. On the Trends route the agent sees
six tools. Open a trend and four more appear — one of them lets the agent start
the video the human is watching. Navigate away and all ten go.
Select a trend and a product together and the brief composer's tools register.
The set an agent can see is always exactly the set that can succeed.

`ToolSurfacePanel` renders this live, driven by the spec's `toolchange` event.
Tools flash in when they register and linger struck-through when they go. A
viewer watches the surface follow the human's selection rather than taking our
word for it — which matters, because this is the claim the project is making
and it is otherwise invisible.

## Users

**Content strategist — primary.** Owns which trends the brand joins. Lives in
the Trends table. Wants the agent to explain why something is rising and to
draft an angle, but keeps the yes/no.

**Content writer — primary.** Turns briefs into posts. Wants the brief to
already know the product's USP and its do-not-say list, so they are not
rewriting from zero.

**Social media manager — secondary.** Owns the calendar and reports on
performance. Wants to see which briefs came from which trends and how they did.

## Success Criteria

Judged on WebMCP leverage, execution, potential impact, and creativity, in
equal weight. Concretely, the build succeeds if all of the following hold at
submission:

1. **A live URL loads in the ChatGPT in-app browser** and the agent lists the
   app's tools without any setup by the visitor.
2. **The tool surface visibly changes** as the human navigates — demonstrable
   in one continuous shot, no cuts.
3. **An agent can complete the core loop end to end**: read the open trend,
   read the product knowledge, compose a brief, write it into the library, and
   the human sees it appear without reloading.
4. **The same loop is completable by hand** in a browser with no agent. Nothing
   is agent-only.
5. **Real, measured and mocked surfaces are visibly distinguished.** Invented
   numbers carry a `demo data` badge; numbers derived from files in the repo
   carry a `measured` badge. A viewer can tell which is which without asking.
6. **All four submission artifacts exist** and the Devpost entry is in before
   T+9:30.

## Fake Data, Real Processing

Every number and every video in this app is invented. None of it was scraped,
none of it was published anywhere, and no view count in it was ever observed.
That is stated up front because the alternative — a judge working it out on
their own — costs more than the admission does.

What is *not* invented is the processing. The trend analysis is produced by a
model reading the actual transcripts of the actual clips in this repo, at the
moment it is asked. The clip signals — duration, word count, speaking rate,
where the hook ends — are measured from the encoded files by a committed script
and can be re-derived by anyone who clones the repo. The tool surface, the
filters, the status machine and the brief library are ordinary working software.

So the honest one-line description is: **a real content workflow, operating on
a fictional dataset.** The fiction is in the inputs, deliberately and visibly.
It is not in the machinery, and it is not in the WebMCP integration, which is
what the entry is actually claiming.

## Non-Goals

Stated so they do not get re-litigated at hour eight.

- Not a scraper. Trend data is seeded. Building a real scraper would consume
  the entire window and is not the thing being judged.
- Not a video platform. The 12 clips are a fixed corpus that ships with the
  build. No upload, no transcoding, no CDN.
- Not an analytics product. Account metrics are seeded fixtures.
- Not multi-tenant. One user, `localStorage`, no accounts, no database.
- Not an LLM wrapper. The brief generator has no model behind it — the
  connected agent writes every brief, and there is no server path that does it
  instead. One tool, `analyze_trend`, calls a model server-side so that a judge
  with no agent still sees an analysis happen; it is a floor under the feature,
  not the feature. See `01-architecture.md`.
- Not a scheduler. The calendar records intent; it does not publish anything.

## The Core Loop, End to End

1. Human opens Trends, filters to TikTok, sorts by growth.
2. Human opens the top trend. Two more tools register.
3. Human asks the agent: *why is this rising, and can we use it?*
4. Agent calls `get_trend_detail`, reads the spike shape, related keywords and
   the full transcripts of the clips attached to the trend, calls `play_clip`
   to put the one it is citing on screen, and calls `write_trend_summary` — the
   summary appears on the page, in front of the human, not in the chat.
5. Human picks a product. The brief composer's tools register.
6. Human asks for a brief. Agent calls `get_brief_context`, which returns the
   trend and the full product record — USP, price, do-and-do-not list.
7. Agent calls `save_brief` with hook, outline, tone, CTA, hashtags and target
   audience. The brief appears in the library as a draft.
8. Human edits the hook by hand, sets the status to approved, and schedules it.

Steps 4 and 7 are the ones that only work because of WebMCP. Everything else is
an ordinary app, deliberately — an agent surface bolted onto something that does
not work on its own is not a product.
