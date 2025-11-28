"use client"

import { useEffect, useState } from "react"

type WebType = 'vanilla' | 'next' | 'vue';
type WebSize = 'small' | 'medium' | 'large';

interface WebPreviewProps {
    type: WebType;
    size: WebSize;
    addons: {
        database: boolean;
        auth: boolean;
        cms: boolean;
    };
}

export default function WebPreview({ type, size, addons }: WebPreviewProps) {
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 400);
        return () => clearTimeout(timer);
    }, [type, size, addons]);

    const isModern = type !== 'vanilla';

    return (
        <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-700 flex flex-col shadow-2xl transition-all duration-300">
            <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>
                <div className="flex-1 ml-4 bg-gray-900 h-5 rounded text-[10px] text-gray-500 flex items-center px-2 font-mono">
                    {type === 'vanilla' ? 'index.html' : 'localhost:3000'}
                </div>
            </div>

            <div className={`relative flex-1 bg-white overflow-hidden p-4 ${loading ? 'opacity-90' : 'opacity-100'} transition-opacity duration-300`}>
                <div className={`flex justify-between items-center mb-6 ${isModern ? 'border-b pb-2' : ''}`}>
                    <div className={`h-4 w-20 bg-gray-800 rounded ${isModern ? '' : 'rounded-none'}`}></div>
                    <div className="flex gap-3">
                        <div className="h-2 w-10 bg-gray-300 rounded"></div>
                        <div className="h-2 w-10 bg-gray-300 rounded"></div>
                        {addons.auth && (
                            <div className="h-4 w-12 bg-cyan-500 rounded-sm"></div>
                        )}
                    </div>
                </div>

                <div className={`${size === 'large' ? 'grid grid-cols-4 gap-4' : ''}`}>
                    {size === 'large' && (
                        <div className="col-span-1 space-y-2 border-r pr-2 border-gray-100">
                            <div className="h-2 w-full bg-gray-100 rounded"></div>
                            <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
                            <div className="h-2 w-5/6 bg-gray-100 rounded"></div>
                            {addons.cms && <div className="h-2 w-full bg-purple-100 rounded mt-4"></div>}
                        </div>
                    )}

                    <div className={`${size === 'large' ? 'col-span-3' : 'w-full'}`}>
                        <div className={`mb-6 ${isModern ? 'text-center' : 'text-left'}`}>
                            <div className={`h-6 w-3/4 bg-gray-800 mb-3 mx-auto ${isModern ? 'rounded-lg' : 'rounded-none'}`}></div>
                            <div className={`h-3 w-1/2 bg-gray-400 mx-auto ${isModern ? 'rounded' : 'rounded-none'}`}></div>
                        </div>

                        <div className="space-y-4">
                            {(size === 'medium' || size === 'large') && (
                                <div className="grid grid-cols-3 gap-2">
                                    <div className={`aspect-square bg-gray-100 p-2 ${isModern ? 'rounded-lg' : 'border border-gray-300'}`}>
                                        <div className="h-2 w-full bg-gray-300 mb-1"></div>
                                        <div className="h-1 w-2/3 bg-gray-200"></div>
                                    </div>
                                    <div className={`aspect-square bg-gray-100 p-2 ${isModern ? 'rounded-lg' : 'border border-gray-300'}`}>
                                        <div className="h-2 w-full bg-gray-300 mb-1"></div>
                                        {addons.database && <div className="h-1 w-full bg-green-200"></div>}
                                    </div>
                                    <div className={`aspect-square bg-gray-100 p-2 ${isModern ? 'rounded-lg' : 'border border-gray-300'}`}>
                                        <div className="h-2 w-full bg-gray-300 mb-1"></div>
                                    </div>
                                </div>
                            )}

                            {addons.database && (
                                <div className="flex items-center gap-2 mt-4 p-2 bg-gray-50 rounded border border-gray-100">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <div className="h-2 w-24 bg-gray-300 rounded"></div>
                                </div>
                            )}

                             {addons.cms && (
                                <div className="space-y-2 mt-4">
                                    <div className="h-20 w-full bg-purple-50 border-dashed border-2 border-purple-200 rounded flex items-center justify-center text-[8px] text-purple-300 uppercase tracking-widest font-bold">
                                        Dynamic CMS Content
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}