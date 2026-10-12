"use client"

import dynamic from "next/dynamic"
import { Component, type ReactNode } from "react"
import { PortfolioNav } from "@/components/portfolio-nav"
import "@/components/home-experience.css"

const AboutMii = dynamic(() => import("@/components/about-mii").then((module) => module.AboutMii), { ssr: false })

class MiiBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed
      ? <div className="about-signature" role="img" aria-label="Trung Vo's signature" />
      : this.props.children
  }
}

export default function About() {
  return <div className="home-page">
    <PortfolioNav active="about" />
    <main id="main-content" tabIndex={-1} className="home-secondary home-about">
      <h1 className="sr-only">About Trung Vo</h1>
      <div className="about-mii-slot"><MiiBoundary><AboutMii /></MiiBoundary></div>
      <div className="home-about-copy">
        <section>
          <h2>About me</h2>
          <p>I&rsquo;m a product designer in San Jose, CA. For the past two years, design has been both my work and my favorite creative outlet.</p>
          <p>At IBM, I design systems for watsonx.data that help teams query, visualize, and act on complex data.</p>
        </section>
        <section>
          <h2>What&rsquo;s your niche?</h2>
          <p>I love crafting micro-interactions that make products feel intuitive.</p>
        </section>
        <section>
          <h2>Experience</h2>
          <p>Previously at Zeme, Snap Inc., Amazon Music, and PillarBiome.</p>
        </section>
        <section>
          <h2>Opportunities</h2>
          <p>I&rsquo;m open to contract and full-time roles. Get in touch <a href="/email">here</a>.</p>
        </section>
      </div>
    </main>
  </div>
}
