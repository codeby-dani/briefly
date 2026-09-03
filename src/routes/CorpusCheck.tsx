/**
 * The deploy smoke test for the media corpus, on screen rather than in a
 * checklist: if a poster and an mp4 both load from the deployed origin, this
 * renders and plays.
 *
 * It is Phase 0 scaffolding and it is still here because Phase 0's sixth exit
 * criterion — "a clip poster and its mp4 both load from the deployed origin" —
 * has not been checked yet. Phase 2 replaces it with the real trend detail
 * drawer, at which point it goes.
 */

import { useState } from 'react'
import { MeasuredBadge } from '../components/Badge'
import { CLIPS } from '../fixtures/clips'

export function CorpusCheck() {
  const [index, setIndex] = useState(0)
  const clip = CLIPS[index]
  if (!clip) return null

  return (
    <section className="card" data-testid="corpus-check">
      <div className="card-head">
        <h2>Clip corpus</h2>
        <MeasuredBadge what="Every signal below" />
      </div>

      <p className="muted">
        {CLIPS.length} clips ship with the build. Every number below is derived from the
        encoded file by a committed script, which is what the <em>measured</em> badge
        means — as opposed to <em>demo data</em>, which marks the invented trend volumes
        and the analytics above.
      </p>

      <div className="clip">
        <video
          className="clip-player"
          data-testid="clip-player"
          src={clip.src}
          poster={clip.poster}
          preload="none"
          controls
          playsInline
        >
          {clip.captionTrack && (
            <track kind="captions" srcLang="en" label="English" src={clip.captionTrack} default />
          )}
        </video>

        <div className="clip-meta">
          <h3>{clip.title}</h3>
          <p className="muted">
            {clip.creator} · {clip.category} · {clip.license}
          </p>
          <dl className="signals" data-testid={`clip-signals-${clip.id}`}>
            <div><dt>duration</dt><dd>{clip.signals.durationS}s</dd></div>
            <div><dt>words</dt><dd>{clip.signals.words}</dd></div>
            <div><dt>words / min</dt><dd>{clip.signals.wordsPerMinute}</dd></div>
            <div><dt>hook ends</dt><dd>{clip.signals.hookEndS}s</dd></div>
            <div><dt>segments</dt><dd>{clip.signals.segments}</dd></div>
            <div><dt>transcript</dt><dd>{clip.signals.transcriptSource}</dd></div>
          </dl>
          <p className="source-note">{clip.sourceNote}</p>
        </div>
      </div>

      <div className="clip-picker">
        {CLIPS.map((candidate, i) => (
          <button
            key={candidate.id}
            type="button"
            className={`chip${i === index ? ' is-current' : ''}`}
            onClick={() => setIndex(i)}
          >
            {candidate.id}
          </button>
        ))}
      </div>
    </section>
  )
}
