"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header id="header" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-gray-900 shadow-lg' : ''}`}>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="block" aria-label="Go to homepage">
            <Image
                src="https://avatars.githubusercontent.com/u/161682265?v=4"
                alt="KHROTU Profile Picture"
                width={40}
                height={40}
                className="rounded-full transition-transform duration-300 hover:scale-110"
            />
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/#about" className="hover:text-cyan-400 transition-colors duration-300">About</Link>
          <Link href="/#skills" className="hover:text-cyan-400 transition-colors duration-300">Skills</Link>
          <Link href="/#projects" className="hover:text-cyan-400 transition-colors duration-300">Projects</Link>
          <Link href="/commissions" className="hover:text-cyan-400 transition-colors duration-300">Commissions</Link>
          <Link href="/#contact" className="hover:text-cyan-400 transition-colors duration-300">Contact</Link>
        </nav>
        <Link
          href="/#contact"
          className="hidden md:inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
        >
          Get In Touch
        </Link>
      </div>
    </header>
  )
}