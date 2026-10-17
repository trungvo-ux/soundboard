"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Soundboard } from "@/components/soundboard"
import { PortfolioNav } from "@/components/portfolio-nav"
import "./home-experience.css"

// Update these when the status changes; elapsed time keeps running across visits.
const lastSeen = {
  city: "Las Vegas",
  activity: "landing",
  at: "2026-10-17T03:07:50Z",
}

function timeSinceLastSeen(now: number) {
  const minutes = Math.max(0, (now - Date.parse(lastSeen.at)) / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) {
    const wholeMinutes = Math.floor(minutes)
    return `${wholeMinutes} ${wholeMinutes === 1 ? "minute" : "minutes"} ago`
  }
  const hours = minutes / 60
  if (hours < 24) {
    const wholeHours = Math.floor(hours)
    return `${wholeHours} ${wholeHours === 1 ? "hour" : "hours"} ago`
  }
  if (hours < 48) return "yesterday"
  const days = Math.floor(hours / 24)
  return `${days} days ago`
}

export function HomeExperience() {
  const [shown, setShown] = useState(false)
  const [boardRevealed, setBoardRevealed] = useState(false)
  // null until mount so SSR/prerender never bakes a stale relative string into HTML
  const [now, setNow] = useState<number | null>(null)
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
    update()
    const timer = window.setInterval(update, 30_000)
    const onFocus = () => update()
    document.addEventListener("visibilitychange", update)
    window.addEventListener("focus", onFocus)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", update)
      window.removeEventListener("focus", onFocus)
    }
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
            <p className="home-last-seen t-stagger-line t-stagger-line--2" data-ready={now != null ? "true" : "false"}>
              {now != null ? (
                <>Last seen {lastSeen.activity} in {lastSeen.city}, <time dateTime={lastSeen.at}>{timeSinceLastSeen(now)}</time></>
              ) : (
                <time dateTime={lastSeen.at} />
              )}
            </p>
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
