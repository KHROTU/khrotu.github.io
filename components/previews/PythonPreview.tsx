"use client"

type PyType = 'script' | 'gui' | 'ml';
type PyComplexity = 'basic' | 'intermediate' | 'advanced';

interface PythonPreviewProps {
    type: PyType;
    complexity: PyComplexity;
}

export default function PythonPreview({ type, complexity }: PythonPreviewProps) {
    if (type === 'gui') {
        return (
            <div className="w-full h-full bg-gray-200 rounded-lg overflow-hidden border border-gray-400 flex flex-col shadow-xl">
                <div className="h-6 bg-blue-600 flex justify-between items-center px-2">
                    <span className="text-[10px] text-white font-semibold">RAG Assistant</span>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white/50 rounded-sm"></div>
                        <div className="w-2 h-2 bg-red-400 rounded-sm"></div>
                    </div>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-3">
                    <div className="h-4 w-1/3 bg-gray-400 rounded"></div>
                    <div className="flex gap-2">
                         <div className="h-8 flex-1 bg-white border border-gray-300 rounded"></div>
                         <div className="h-8 w-16 bg-blue-500 rounded shadow-sm"></div>
                    </div>
                    {(complexity === 'intermediate' || complexity === 'advanced') && (
                        <div className="h-24 bg-white border border-gray-300 rounded p-2">
                            <div className="h-2 w-full bg-gray-100 mb-1"></div>
                            <div className="h-2 w-2/3 bg-gray-100"></div>
                        </div>
                    )}
                    {complexity === 'advanced' && (
                         <div className="grid grid-cols-2 gap-2 mt-auto">
                             <div className="h-8 bg-gray-300 rounded"></div>
                             <div className="h-8 bg-gray-300 rounded"></div>
                         </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full bg-black rounded-lg overflow-hidden border border-gray-800 flex flex-col shadow-2xl font-mono text-xs">
            <div className="h-6 bg-gray-800 border-b border-gray-700 flex items-center px-2">
                <span className="text-[10px] text-gray-400">Terminal</span>
            </div>
            <div className="p-3 text-green-400 space-y-1 flex-1 overflow-hidden">
                <div>&gt; python {type === 'ml' ? 'fine_tune_rag.py' : 's3_vector_sync.py'}</div>
               
                {type === 'ml' && (
                    <>
                        <div className="text-gray-500">Initializing Hugging Face Transformers & PEFT...</div>
                        <div>Loading RAG dataset (10k Q&A pairs)... [OK]</div>
                        <div className="text-blue-400">Applying LoRA adapters to Llama 3.1 8B...</div>
                        {(complexity === 'intermediate' || complexity === 'advanced') && (
                            <>
                                <div className="text-blue-400">Epoch 1/10: loss=1.23 perplexity=3.42</div>
                                <div className="text-blue-400">Epoch 2/10: loss=0.89 perplexity=2.45</div>
                            </>
                        )}
                        {complexity === 'advanced' && (
                            <div className="text-purple-400">Applying GGUF 4-bit quantization for inference...</div>
                        )}
                        <div className="text-gray-500">Fine-tuning complete. Model saved to `models/rag-llama-v1`</div>
                        <div className="animate-pulse">&gt;_</div>
                    </>
                )}

                {type === 'script' && (
                    <>
                        <div className="text-gray-500">Authenticating with AWS S3 & Pinecone... [OK]</div>
                        <div>Streaming documents from S3 bucket &apos;project-docs&apos;...</div>
                        {(complexity === 'intermediate' || complexity === 'advanced') && (
                             <div>Generated 2,500 embeddings with all-MiniLM-L6-v2.</div>
                        )}
                        {complexity === 'advanced' && (
                            <div className="text-yellow-400">Upserting batches via Kafka stream to Pinecone index...</div>
                        )}
                        <div className="text-gray-500">Vector sync complete (45s) - 98% similarity threshold met</div>
                        <div className="animate-pulse">&gt;_</div>
                    </>
                )}
            </div>
        </div>
    );
}