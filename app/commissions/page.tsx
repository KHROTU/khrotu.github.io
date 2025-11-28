"use client"

import { useState, useMemo } from 'react'
import WebPreview from '@/components/previews/WebPreview'
import PythonPreview from '@/components/previews/PythonPreview'

const ProjectLink = ({ href, name }: { href: string; name: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors duration-300">
        {name}
        <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path></svg>
    </a>
);

type WebType = 'vanilla' | 'next' | 'vue';
type WebSize = 'small' | 'medium' | 'large';
type PyType = 'script' | 'gui' | 'ml';
type PyComplexity = 'basic' | 'intermediate' | 'advanced';

export default function CommissionsPage() {
    const [category, setCategory] = useState<'web' | 'python'>('web');
    
    const [webType, setWebType] = useState<WebType>('vanilla');
    const [webSize, setWebSize] = useState<WebSize>('small');
    const [webAddons, setWebAddons] = useState({
        database: false,
        auth: false,
        cms: false
    });

    const [pyType, setPyType] = useState<PyType>('script');
    const [pyComplexity, setPyComplexity] = useState<PyComplexity>('basic');

    const webTypeOptions: { id: WebType; label: string }[] = [
        { id: 'vanilla', label: 'HTML/JS' },
        { id: 'next', label: 'Next.js' },
        { id: 'vue', label: 'Vue.js' }
    ];
    const webSizeOptions: { id: WebSize; label: string; desc: string }[] = [
        { id: 'small', label: 'Small', desc: 'Single Page' },
        { id: 'medium', label: 'Medium', desc: '3-5 Pages' },
        { id: 'large', label: 'Large', desc: 'Complex App' }
    ];
    const pyTypeOptions: { id: PyType; label: string; desc: string }[] = [
        { id: 'script', label: 'Script', desc: 'Automation/Bots' },
        { id: 'gui', label: 'GUI App', desc: 'Desktop Interface' },
        { id: 'ml', label: 'AI Model', desc: 'Machine Learning' }
    ];
    const pyComplexityOptions: PyComplexity[] = ['basic', 'intermediate', 'advanced'];

    const estimate = useMemo(() => {
        let total = 0;
        if (category === 'web') {
            const basePrices = { vanilla: 15, next: 40, vue: 40 };
            const sizeMultipliers = { small: 1, medium: 2, large: 3.5 };
            const addonPrices = { database: 30, auth: 20, cms: 40 };

            total = basePrices[webType] * sizeMultipliers[webSize];
            if (webAddons.database) total += addonPrices.database;
            if (webAddons.auth) total += addonPrices.auth;
            if (webAddons.cms) total += addonPrices.cms;
        } else {
            const basePrices = { script: 10, gui: 25, ml: 45 };
            const complexMultipliers = { basic: 1, intermediate: 1.8, advanced: 2.6 };
            total = basePrices[pyType] * complexMultipliers[pyComplexity];
        }
        return Math.round(total);
    }, [category, webType, webSize, webAddons, pyType, pyComplexity]);

    const generateMailto = () => {
        const subject = `Commission Inquiry: ${category === 'web' ? 'Web Development' : 'Python Project'}`;
        let body = `Hi KHROTU,\n\nI'm interested in commissioning a project based on the following configuration:\n\n`;
        
        if (category === 'web') {
            body += `Type: Web Development\n`;
            body += `Tech Stack: ${webType}\n`;
            body += `Size: ${webSize}\n`;
            body += `Add-ons: ${Object.keys(webAddons).filter(k => webAddons[k as keyof typeof webAddons]).join(', ') || 'None'}\n`;
        } else {
            body += `Type: Python Development\n`;
            body += `Kind: ${pyType}\n`;
            body += `Complexity: ${pyComplexity}\n`;
        }

        body += `\nEstimated Budget: ~$${estimate}\n\nProject Details:\n[Please describe your project here]`;
        
        return `mailto:3o65iduqd@mozmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    return (
        <div className="bg-gray-800/50 min-h-screen">
            <div className="container mx-auto px-6 py-20">
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-white mb-4">Build Your Project</h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Interactive configurator with live previews and competitive pricing.
                    </p>
                </header>

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                             <div className="flex bg-gray-800 rounded-lg p-1">
                                <button 
                                    onClick={() => setCategory('web')}
                                    className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${category === 'web' ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Web Development
                                </button>
                                <button 
                                    onClick={() => setCategory('python')}
                                    className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${category === 'python' ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Python & AI
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-8 border border-gray-700">
                            {category === 'web' ? (
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-3">Technology</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {webTypeOptions.map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setWebType(opt.id)}
                                                    className={`py-3 px-2 rounded-lg border text-sm font-semibold transition-all ${webType === opt.id ? 'border-cyan-500 bg-cyan-900/20 text-cyan-400' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-3">Scale</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {webSizeOptions.map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setWebSize(opt.id)}
                                                    className={`py-3 px-3 rounded-lg border text-left transition-all ${webSize === opt.id ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`}
                                                >
                                                    <div className={`font-semibold text-sm ${webSize === opt.id ? 'text-cyan-400' : 'text-gray-300'}`}>{opt.label}</div>
                                                    <div className="text-[10px] text-gray-500">{opt.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-3">Add-ons</label>
                                        <div className="space-y-2">
                                            {[
                                                { id: 'database', label: 'Database (Supabase/SQL)' },
                                                { id: 'auth', label: 'User Auth' },
                                                { id: 'cms', label: 'CMS Integration' }
                                            ].map((addon) => (
                                                <label key={addon.id} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors border border-transparent hover:border-gray-600">
                                                    <input 
                                                        type="checkbox" 
                                                        className="w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 bg-gray-700"
                                                        checked={webAddons[addon.id as keyof typeof webAddons]}
                                                        onChange={(e) => setWebAddons({...webAddons, [addon.id]: e.target.checked})}
                                                    />
                                                    <span className="text-gray-300 text-sm">{addon.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-3">Project Type</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {pyTypeOptions.map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setPyType(opt.id)}
                                                    className={`py-3 px-4 rounded-lg border text-left flex justify-between items-center transition-all ${pyType === opt.id ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`}
                                                >
                                                    <div>
                                                        <div className={`font-semibold text-sm ${pyType === opt.id ? 'text-cyan-400' : 'text-gray-300'}`}>{opt.label}</div>
                                                        <div className="text-xs text-gray-500">{opt.desc}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-3">Complexity</label>
                                        <div className="flex gap-3">
                                            {pyComplexityOptions.map((lvl) => (
                                                <button
                                                    key={lvl}
                                                    onClick={() => setPyComplexity(lvl)}
                                                    className={`flex-1 py-2 capitalize rounded-lg border text-sm font-semibold transition-all ${pyComplexity === lvl ? 'border-cyan-500 bg-cyan-900/20 text-cyan-400' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'}`}
                                                >
                                                    {lvl}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 shadow-2xl h-80 relative">
                            <div className="absolute top-0 left-0 bg-cyan-600 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-10">
                                LIVE MOCKUP
                            </div>
                            <div className="w-full h-full flex items-center justify-center p-2">
                                {category === 'web' ? (
                                    <WebPreview type={webType} size={webSize} addons={webAddons} />
                                ) : (
                                    <PythonPreview type={pyType} complexity={pyComplexity} />
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-gray-400 text-sm">Total Estimate</span>
                                <span className="text-4xl font-bold text-cyan-400">${estimate}</span>
                            </div>
                            
                            <a 
                                href={generateMailto()}
                                className="block w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 px-6 rounded-lg text-center transition-all duration-300 mb-4"
                            >
                                Request Quote
                            </a>
                            <div className="text-center text-xs text-gray-500">
                                Or, fill out the <a href="https://tally.so/r/BzEZz1" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">detailed inquiry form</a>.
                            </div>
                        </div>
                    </div>
                </div>

                <section className="border-t border-gray-700 pt-20">
                    <h2 className="text-3xl font-bold text-center mb-12">Relevant Examples</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
                            <h3 className="text-xl font-bold text-cyan-400 mb-2">Dynamic Web</h3>
                            <ul className="space-y-2 text-sm mt-4">
                                <li><ProjectLink href="https://satdbfor.me" name="satdbfor.me" /></li>
                                <li><ProjectLink href="https://graphit.dev" name="graphit.dev" /></li>
                                <li><ProjectLink href="https://not-llm.vercel.app" name="not-llm.vercel.app" /></li>
                                <li><ProjectLink href="https://github.com/KHROTU/prism" name="PRISM (GitHub)" /></li>
                            </ul>
                        </div>
                         <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
                            <h3 className="text-xl font-bold text-cyan-400 mb-2">Static / Vanilla</h3>
                            <ul className="space-y-2 text-sm mt-4">
                                <li><ProjectLink href="https://bloxdforge.com" name="bloxdforge.com" /></li>
                            </ul>
                        </div>
                        <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
                            <h3 className="text-xl font-bold text-cyan-400 mb-2">Python & AI</h3>
                            <ul className="space-y-2 text-sm mt-4">
                                <li><ProjectLink href="https://github.com/KHROTU/kortex" name="Kortex" /></li>
                                <li><ProjectLink href="https://github.com/KHROTU/schematic-diffusion" name="Schematic Diffusion" /></li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}