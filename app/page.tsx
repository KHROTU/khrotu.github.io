import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <section id="hero" className="min-h-screen flex items-center bg-gray-900">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4">
            Hi, I&apos;m <span className="text-cyan-400">KHROTU</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            A Full Stack Developer and AI/ML enthusiast, turning complex problems into elegant software solutions. Passionate about high-performance code and algorithmic problem solving.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#projects"
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 inline-block"
            >
              View My Work
            </a>
            <Link
              href="/commissions"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 inline-block"
            >
              Start a Commission
            </Link>
            <a
              href="https://github.com/KHROTU"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 inline-block"
            >
              GitHub Profile
            </a>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-gray-800/50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">About Me</h2>
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/3">
              <Image
                src="https://avatars.githubusercontent.com/u/161682265?v=4"
                alt="A profile photo of KHROTU"
                width={320}
                height={320}
                className="rounded-full shadow-lg mx-auto w-64 h-64 md:w-80 md:h-80 object-cover"
              />
            </div>
            <div className="md:w-2/3 text-lg text-gray-300">
              <p className="mb-4">
                Hello! I&apos;m a passionate developer with a strong foundation in both full-stack web development and artificial intelligence. My journey into programming started with competitive programming, which honed my problem-solving skills and my love for efficient, optimized algorithms.
              </p>
              <p className="mb-4">
                On the web front, I specialize in building dynamic, responsive applications using the latest technologies like Next.js, React, and Tailwind CSS. I&apos;m comfortable working across the entire stack, from crafting beautiful user interfaces to designing robust back-end systems with databases like Supabase and MongoDB.
              </p>
              <p>
                My fascination with AI has led me to explore PyTorch and the world of machine learning. I&apos;m excited by the potential to integrate intelligent features into applications and am always looking for new challenges that allow me to bridge the gap between web and AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="skills" className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">My Tech Stack</h2>
          <div className="max-w-4xl mx-auto">
            <div className="mb-10">
              <h3 className="text-2xl font-semibold text-center text-cyan-400 mb-6">Full Stack Development</h3>
              <div className="flex justify-center flex-wrap gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://skillicons.dev/icons?i=html,css,js,ts,react,nextjs,nodejs,express,jquery,tailwind&perline=5" alt="Full Stack Skills" />
              </div>
            </div>
            <div className="mb-10">
              <h3 className="text-2xl font-semibold text-center text-cyan-400 mb-6">AI/ML & Data</h3>
              <div className="flex justify-center flex-wrap gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://skillicons.dev/icons?i=anaconda,python,pytorch,tensorflow,sklearn,opencv&perline=6" alt="AI/ML Skills" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-center text-cyan-400 mb-6">Databases & Tools</h3>
              <div className="flex justify-center flex-wrap gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://skillicons.dev/icons?i=mongodb,postgres,supabase,firebase,git,github,docker&perline=7" alt="Database and Tool Skills" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="py-20 bg-gray-800/50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2 text-white">Kortex</h3>
                <p className="text-gray-400 mb-4">
                  A desktop voice assistant for Windows powered by local LLMs. Features include tool use, STT/TTS, and a PyQt5 GUI.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-cyan-900 text-cyan-300 text-sm font-medium px-2.5 py-0.5 rounded">Python</span>
                  <span className="bg-cyan-900 text-cyan-300 text-sm font-medium px-2.5 py-0.5 rounded">PyQt5</span>
                  <span className="bg-cyan-900 text-cyan-300 text-sm font-medium px-2.5 py-0.5 rounded">Ollama</span>
                  <span className="bg-cyan-900 text-cyan-300 text-sm font-medium px-2.5 py-0.5 rounded">SQLite</span>
                </div>
                <div className="flex items-center space-x-4">
                  <a
                    href="https://github.com/KHROTU/kortex"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.492.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" /></svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2 text-white">PRISM</h3>
                <p className="text-gray-400 mb-4">
                  An open-source, self-hosted tool that automates research using a team of specialized AI agents. Go from a single question to a comprehensive, transparent report.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-cyan-900 text-cyan-300 text-sm font-medium px-2.5 py-0.5 rounded">Next.js</span>
                  <span className="bg-cyan-900 text-cyan-300 text-sm font-medium px-2.5 py-0.5 rounded">React</span>
                  <span className="bg-cyan-900 text-cyan-300 text-sm font-medium px-2.5 py-0.5 rounded">Python</span>
                  <span className="bg-cyan-900 text-cyan-300 text-sm font-medium px-2.5 py-0.5 rounded">FastAPI</span>
                  <span className="bg-cyan-900 text-cyan-300 text-sm font-medium px-2.5 py-0.5 rounded">Docker</span>
                </div>
                <div className="flex items-center space-x-4">
                  <a
                    href="https://github.com/KHROTU/prism"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.492.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" /></svg>
                  </a>
                  <a
                    href="https://graphit.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}