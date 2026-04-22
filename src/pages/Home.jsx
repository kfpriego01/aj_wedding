import React from 'react'
import Navbar        from '../components/Navbar'
import Hero          from '../components/Hero'
import Clothesline   from '../components/Clothesline'
import AboutSection  from '../components/AboutSection'
import UploadSection from '../components/UploadSection'
import Footer        from '../components/Footer'

export default function Home() {
  return (
    <div className="grain">
      <Navbar />
      <main>
        <Hero />
        <Clothesline />
        <AboutSection />
        <UploadSection />
      </main>
      <Footer />
    </div>
  )
}