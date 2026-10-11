"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Soundboard } from "@/components/soundboard"
import { PortfolioNav } from "@/components/portfolio-nav"
import "./home-experience.css"

// Update this timestamp when the status changes; elapsed time keeps running across visits.
const lastSeenAt = "2026-10-11T07:08:50Z"

function timeSinceLastSeen(now: number) {
  const hours = Math.max(0, (now - Date.parse(lastSeenAt)) / 3_600_000)
  if (hours < 24) {
    const wholeHours = Math.max(1, Math.floor(hours))
    return `${wholeHours} ${wholeHours === 1 ? "hour" : "hours"} ago`
  }
  if (hours < 48) return "yesterday"
  const days = Math.floor(hours / 24)
  return `${days} days ago`
}

export function HomeExperience() {
  const [shown, setShown] = useState(false)
  const [boardRevealed, setBoardRevealed] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setBoardRevealed(true))
      return () => cancelAnimationFrame(frame)
    }
    const timer = window.setTimeout(() => setBoardRevealed(true), 1000)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const update = () => setNow(Date.now())
    document.addEventListener("visibilitychange", update)
    const timer = window.setInterval(update, 60_000)
    return () => { document.removeEventListener("visibilitychange", update); window.clearInterval(timer) }
  }, [])

  return (
    <div className="home-page">
      <PortfolioNav active="home" />
        <main id="main-content" tabIndex={-1} className="home-hero">
          <div className="home-soundboard-reveal t-panel-slide" data-open={shown} data-finished={boardRevealed}>
            <div className="home-soundboard-blueprint" aria-hidden="true">
              <div className="home-soundboard-blueprint-grid">
                <span className="home-blueprint-cell home-blueprint-speaker"><i /></span>
                <span className="home-blueprint-cell home-blueprint-display" />
                <span className="home-blueprint-cell home-blueprint-knob"><i /></span>
                {Array.from({ length: 16 }, (_, index) => <span className="home-blueprint-cell home-blueprint-pad" style={{ animationDelay: `${180 + index * 25}ms` }} key={index}><i /></span>)}
              </div>
            </div>
            <div className="home-soundboard-finished" aria-hidden={!boardRevealed} inert={!boardRevealed}>
              <Soundboard enabled={boardRevealed} />
            </div>
          </div>
          <div className={`home-hero-copy t-stagger ${shown ? "is-shown" : ""}`}>
            <h1 className="t-stagger-line t-stagger-line--1">Trung is a Product Designer at <a href="https://www.ibm.com/" target="_blank" rel="noopener noreferrer">IBM</a></h1>
            <p className="home-last-seen t-stagger-line t-stagger-line--2">Last seen in San Jose, <time dateTime={lastSeenAt} suppressHydrationWarning>{timeSinceLastSeen(now)}</time> playing poker.</p>
            <nav className="home-social-links t-stagger-line t-stagger-line--3" aria-label="Social links">
              <a href="https://www.linkedin.com/in/trung--vo" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <span className="home-social-dot" aria-hidden="true" />
              <a href="https://x.com/trungvo23" target="_blank" rel="noopener noreferrer">X</a>
              <span className="home-social-dot" aria-hidden="true" />
              <Link href="/email">Email</Link>
            </nav>
          </div>
        </main>
    </div>
  )
}
