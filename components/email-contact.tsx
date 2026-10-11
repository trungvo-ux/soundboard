"use client"

import { useEffect, useRef, useState } from "react"
import localFont from "next/font/local"
import "./email-contact.css"

const garamond = localFont({ src: "../public/fonts/EBGaramond-VariableFont_wght.ttf", weight: "400", variable: "--font-card" })

export function EmailContact() {
  const [revealed, setRevealed] = useState(false)
  const hold = useRef<number | null>(null)
  const hide = useRef<number | null>(null)

  useEffect(() => () => {
    if (hold.current !== null) window.clearTimeout(hold.current)
    if (hide.current !== null) window.clearTimeout(hide.current)
  }, [])

  function clearHold() {
    if (hold.current !== null) window.clearTimeout(hold.current)
    hold.current = null
  }

  return <main id="main-content" tabIndex={-1} className={`email-page ${garamond.variable}`}>
    <div className="email-card-stage" data-revealed={revealed}>
      <article className="email-card" aria-label="Trung Vo's business card"
        onPointerDown={(event) => {
          if (event.pointerType === "mouse") return
          if (hide.current !== null) window.clearTimeout(hide.current)
          clearHold()
          hold.current = window.setTimeout(() => setRevealed(true), 500)
        }}
        onPointerUp={(event) => {
          if (event.pointerType === "mouse") return
          clearHold()
          hide.current = window.setTimeout(() => setRevealed(false), 1400)
        }}
        onPointerCancel={() => { clearHold(); setRevealed(false) }}
        onPointerLeave={(event) => { if (event.pointerType !== "mouse") clearHold() }}
      >
        <div className="email-card-top">
          <div className="email-card-contact">
            <a href="https://cal.com/trung-vo-dgkllv/15min">Book a call</a>
            <a href="mailto:hello@trung.xyz">hello@trung.xyz</a>
          </div>
          <div className="email-card-work">
            <span>International Business Machines</span>
            <span>Design Engineer</span>
          </div>
        </div>
        <div className="email-card-identity">
          <h1>Trung VO</h1>
          <p>Product Designer</p>
        </div>
        <p className="email-card-footer">Open to contract and full-time roles in SF or SJ, CA, USA</p>
        <span className="email-card-watermark" aria-hidden="true">TV</span>
      </article>
      <p className="email-card-secret" aria-hidden="true">You noticed the watermark.</p>
    </div>
  </main>
}
