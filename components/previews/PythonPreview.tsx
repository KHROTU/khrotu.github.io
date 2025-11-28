"use client"

type PyType = 'script' | 'gui' | 'ml';
type PyComplexity = 'basic' | 'intermediate' | 'advanced';

interface PythonPreviewProps {
    type: PyType;
    complexity: PyComplexity;
}

const ScriptPreview = ({ complexity }: { complexity: PyComplexity }) => {
    let filename = '';
    let content = null;

    if (complexity === 'basic') {
        filename = 'analyze_sales_data.py';
        content = (
            <>
                <div>&gt; python {filename}</div>
                <div className="text-gray-500">Loading `sales_report_q4.csv`...</div>
                <div>Calculating total revenue...</div>
                <div className="text-gray-500">Total Revenue: $152,891.55</div>
                <div>Report generated: `summary.txt`</div>
                <div className="animate-pulse">&gt;_</div>
            </>
        );
    } else if (complexity === 'intermediate') {
        filename = 'fetch_github_stats.py';
        content = (
            <>
                <div>&gt; python {filename} --user KHROTU</div>
                <div className="text-gray-500">Connecting to GitHub API...</div>
                <div>Fetching repo data... [OK]</div>
                <div className="text-blue-400">Found 25 public repositories.</div>
                <div className="text-gray-500">Aggregating commit data...</div>
                <div>Analysis complete.</div>
                <div className="animate-pulse">&gt;_</div>
            </>
        );
    } else {
        filename = 'realtime_stream_processor.py';
        content = (
            <>
                <div>&gt; python {filename}</div>
                <div className="text-gray-500">Connecting to Kafka topic `user-events`...</div>
                <div>Consumer group `analytics-pipeline` created.</div>
                <div className="text-yellow-400">Processing event batch (100 messages)...</div>
                <div className="text-purple-400">Upserting embeddings to Pinecone DB...</div>
                <div className="text-gray-500">Stream active, waiting for messages...</div>
                <div className="animate-pulse">_</div>
            </>
        );
    }
    return <Terminal filename={filename}>{content}</Terminal>;
};

const MLPreview = ({ complexity }: { complexity: PyComplexity }) => {
    let filename = '';
    let content = null;

    if (complexity === 'basic') {
        filename = 'train_classifier.py';
        content = (
            <>
                <div>&gt; python {filename}</div>
                <div className="text-gray-500">Loading Iris dataset from scikit-learn...</div>
                <div>Training Logistic Regression model...</div>
                <div className="text-blue-400">Model accuracy: 97.3%</div>
                <div className="text-gray-500">Exporting model to `model.joblib`.</div>
                <div className="animate-pulse">&gt;_</div>
            </>
        );
    } else if (complexity === 'intermediate') {
        filename = 'finetune_llm.py';
        content = (
            <>
                <div>&gt; python {filename}</div>
                <div className="text-gray-500">Loading `distilbert-base-uncased` from Hugging Face...</div>
                <div>Tokenizing custom dataset... [OK]</div>
                <div className="text-blue-400">Epoch 1/3: loss=0.54, validation_acc=0.88</div>
                <div className="text-blue-400">Epoch 2/3: loss=0.21, validation_acc=0.92</div>
                <div className="text-gray-500">Saving fine-tuned model adapter...</div>
                <div className="animate-pulse">&gt;_</div>
            </>
        );
    } else {
        filename = 'train_multimodal_agent.py';
        content = (
            <>
                <div>&gt; python {filename}</div>
                <div className="text-gray-500">Initializing multi-modal RAG pipeline...</div>
                <div className="text-blue-400">Aligning image & text modalities with CLIP...</div>
                <div className="text-yellow-400">Starting Reinforcement Learning (PPO)...</div>
                <div className="text-purple-400">Step 500/2000: mean_reward=0.89</div>
                <div className="text-gray-500">Agent training complete.</div>
                <div className="animate-pulse">&gt;_</div>
            </>
        );
    }
    return <Terminal filename={filename}>{content}</Terminal>;
}

const GuiPreview = ({ complexity }: { complexity: PyComplexity }) => {
    let title = '';
    let content = null;

    if (complexity === 'basic') {
        title = 'File Converter';
        content = (
            <>
                <div className="h-4 w-1/2 bg-gray-400 rounded"></div>
                <div className="h-8 w-full bg-blue-500 rounded text-center text-white text-[10px] flex items-center justify-center font-sans font-bold">SELECT FILE</div>
                <div className="w-full bg-gray-300 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{width: '45%'}}></div>
                </div>
            </>
        );
    } else if (complexity === 'intermediate') {
        title = 'Data Dashboard';
        content = (
            <>
                <div className="flex justify-between">
                    <div className="h-4 w-1/4 bg-gray-400 rounded"></div>
                    <div className="h-4 w-1/4 bg-gray-300 rounded"></div>
                </div>
                <div className="h-20 w-full bg-white border border-gray-300 rounded p-2 flex items-end">
                    <div className="w-1/4 h-1/2 bg-blue-300"></div>
                    <div className="w-1/4 h-3/4 bg-blue-400"></div>
                    <div className="w-1/4 h-1/3 bg-blue-300"></div>
                    <div className="w-1/4 h-full bg-blue-500"></div>
                </div>
            </>
        );
    } else {
        title = 'Local LLM Chat';
        content = (
            <>
                <div className="flex-1 w-full bg-white border border-gray-300 rounded p-2 space-y-2">
                    <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                    <div className="h-3 w-3/4 ml-auto bg-blue-100 rounded"></div>
                    <div className="h-2 w-1/4 bg-gray-300 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                    <div className="h-8 flex-1 bg-white border border-gray-300 rounded"></div>
                    <div className="h-8 w-16 bg-blue-500 rounded"></div>
                </div>
            </>
        );
    }

    return (
        <div className="w-full h-full bg-gray-200 rounded-lg overflow-hidden border border-gray-400 flex flex-col shadow-xl">
            <div className="h-6 bg-blue-600 flex justify-between items-center px-2">
                <span className="text-[10px] text-white font-semibold font-sans">{title}</span>
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/50 rounded-sm"></div>
                    <div className="w-2 h-2 bg-red-400 rounded-sm"></div>
                </div>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-3">
                {content}
            </div>
        </div>
    );
};

const Terminal = ({ filename, children }: { filename: string, children: React.ReactNode }) => (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden border border-gray-800 flex flex-col shadow-2xl font-mono text-xs">
        <div className="h-6 bg-gray-800 border-b border-gray-700 flex items-center px-2">
            <span className="text-[10px] text-gray-400">{filename}</span>
        </div>
        <div className="p-3 text-green-400 space-y-1 flex-1 overflow-hidden">
            {children}
        </div>
    </div>
);


export default function PythonPreview({ type, complexity }: PythonPreviewProps) {
    if (type === 'gui') {
        return <GuiPreview complexity={complexity} />;
    }
    if (type === 'ml') {
        return <MLPreview complexity={complexity} />;
    }
    return <ScriptPreview complexity={complexity} />;
}