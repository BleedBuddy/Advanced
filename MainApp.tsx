// @ts-nocheck
import React, { useState, useMemo, ChangeEvent, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { startPdfAnalysis, startBleedGeneration, resetApp } from './store/appSlice';
import { loginProUser, logoutProUser, openLoginModal, closeLoginModal } from './store/authSlice';

import { PreflightResult, WorkflowStep } from './types';
import Spinner from './components/Spinner';
import Icon from './components/Icon';


const Header = ({ isAuthenticated, onLoginClick, onLogoutClick }: {
    isAuthenticated: boolean;
    onLoginClick: () => void;
    onLogoutClick: () => void;
}) => (
  <header className="bg-white shadow-sm">
    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <div className="flex items-center">
        <Icon name="logo" className="w-8 h-8 mr-3" />
        <div>
            <h1 className="text-2xl font-bold text-brand-key">BleedBuddy.com</h1>
            <p className="text-gray-500 text-sm hidden sm:block">Automated PDF Bleed Correction</p>
        </div>
      </div>
      <div>
        {isAuthenticated ? (
             <button onClick={onLogoutClick} className="text-sm font-medium text-gray-600 hover:text-brand-blue-600">
                Logout
            </button>
        ) : (
            <button onClick={onLoginClick} className="text-sm font-medium text-white bg-brand-blue-600 hover:bg-brand-blue-700 px-4 py-2 rounded-md shadow-sm">
                Pro Login
            </button>
        )}
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-gray-800 text-white mt-16">
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
       <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
        <div className="flex space-x-6 md:order-2">
          <a href="#" className="text-gray-400 hover:text-gray-300">Terms of Service</a>
          <a href="#" className="text-gray-400 hover:text-gray-300">Privacy Policy</a>
          <a href="#" className="text-gray-400 hover:text-gray-300">Refund Policy</a>
          <a href="mailto:hello@bleedbuddy.com" className="text-gray-400 hover:text-gray-300">hello@bleedbuddy.com</a>
        </div>
        <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
          &copy; {new Date().getFullYear()} BleedBuddy.com. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

const LoginModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean; onClose: () => void; onLogin: () => void; }) => {
    if (!isOpen) return null;

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <Icon name="close" className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold text-center text-gray-900">Welcome Back</h2>
                <p className="text-center text-gray-500 text-sm mt-2">Log in to your Pro account to process your file.</p>
                <form onSubmit={handleLogin} className="mt-6 space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                        <div className="mt-1">
                            <input id="email" name="email" type="email" autoComplete="email" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-gray-700">Password</label>
                        <div className="mt-1">
                            <input id="password" name="password" type="password" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm" />
                        </div>
                    </div>
                     <div>
                        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue-600 hover:bg-brand-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500">
                            Login to Pro Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const FileUpload = ({ onFileSelect, loading }: { onFileSelect: (file: File) => void; loading: boolean }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            if (e.dataTransfer.files[0].type === "application/pdf") {
                 onFileSelect(e.dataTransfer.files[0]);
            } else {
                alert("Please upload a valid PDF file.");
            }
            e.dataTransfer.clearData();
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileSelect(e.target.files[0]);
        }
    };
    
    return (
        <div className="max-w-2xl mx-auto text-center">
             <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Ready to Perfect Your Print File?</h2>
             <p className="mt-4 text-lg text-gray-500">Upload your PDF to automatically detect and fix common prepress errors in seconds.</p>
            <div 
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`mt-8 p-8 border-4 border-dashed rounded-xl transition-colors duration-300 ${isDragging ? 'border-brand-blue-500 bg-brand-blue-50' : 'border-gray-300 hover:border-brand-blue-400'}`}
            >
                {loading ? (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <Spinner />
                        <p className="text-gray-600">Analyzing your file...</p>
                    </div>
                ) : (
                    <>
                    <Icon name="upload" className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-lg font-medium text-gray-700">Drag & drop your PDF here</p>
                    <p className="mt-1 text-sm text-gray-500">or</p>
                    <label htmlFor="file-upload" className="relative cursor-pointer mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue-600 hover:bg-brand-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500">
                        <span>Select a file</span>
                        <input id="file-upload" name="file-upload" type="file" accept="application/pdf" className="sr-only" onChange={handleFileChange} />
                    </label>
                    <p className="mt-4 text-xs text-gray-500">Maximum file size: 100MB</p>
                    </>
                )}
            </div>
        </div>
    );
};

const PdfPreview = ({ fileUrl }: { fileUrl: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!fileUrl || !canvasRef.current) return;
        
        const renderPdf = async () => {
            try {
                setLoading(true);
                const pdf = await pdfjsLib.getDocument(fileUrl).promise;
                const page = await pdf.getPage(1);
                const canvas = canvasRef.current;
                if (!canvas) return;

                const container = canvas.parentElement as HTMLElement;
                const context = canvas.getContext('2d');
                
                const viewport = page.getViewport({ scale: 1 });
                // Dynamically set the aspect ratio of the container to match the PDF page
                container.style.aspectRatio = `${viewport.width} / ${viewport.height}`;

                const desiredWidth = container.clientWidth;
                const scale = desiredWidth / viewport.width;
                const scaledViewport = page.getViewport({ scale });
                
                canvas.height = scaledViewport.height;
                canvas.width = scaledViewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: scaledViewport,
                };
                await page.render(renderContext).promise;
            } catch (error) {
                console.error("Error rendering PDF:", error);
            } finally {
                setLoading(false);
            }
        };

        renderPdf();
    }, [fileUrl]);
    
    return (
        <div className="bg-gray-200 rounded-lg shadow-inner overflow-hidden w-full relative flex items-center justify-center">
            {loading && <div className="text-sm text-gray-500">Loading Preview...</div>}
            <canvas ref={canvasRef} className={`w-full transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`} />
        </div>
    );
};


const PreflightReport = ({ result }: { result: PreflightResult }) => {
    const statusIcons = {
        pass: <Icon name="checkCircle" className="w-6 h-6 text-green-500" />,
        warn: <Icon name="warnCircle" className="w-6 h-6 text-yellow-500" />,
        fail: <Icon name="failCircle" className="w-6 h-6 text-red-500" />,
    };

    const statusColors = {
        pass: 'bg-green-100 text-green-800',
        warn: 'bg-yellow-100 text-yellow-800',
        fail: 'bg-red-100 text-red-800',
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <h3 className="text-lg font-medium text-gray-900">Original File Preview</h3>
                <div className="mt-4">
                    <PdfPreview fileUrl={result.previewUrl} />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                    <p><strong>File:</strong> {result.fileName}</p>
                    <p><strong>Pages:</strong> {result.pageCount}</p>
                    <p><strong>Dimensions:</strong> {result.dimensions.inches} ({result.dimensions.metric})</p>
                </div>
            </div>
            <div className="lg:col-span-2">
                 <h3 className="text-lg font-medium text-gray-900">Preflight Analysis</h3>
                 <p className="text-sm text-gray-500">Your file has been checked against commercial print standards.</p>
                 <ul className="mt-4 space-y-3">
                    {result.checks.map(check => (
                        <li key={check.id} className={`p-4 rounded-lg flex items-start space-x-4 ${statusColors[check.status]}`}>
                           <div className="flex-shrink-0">{statusIcons[check.status]}</div>
                           <div>
                                <p className="font-semibold">{check.name}</p>
                                <p className="text-sm">{check.details}</p>
                           </div>
                        </li>
                    ))}
                 </ul>
            </div>
        </div>
    );
};

const PaymentOptions = ({ onPayment }: { onPayment: () => void }) => {
    const [agreed, setAgreed] = useState(false);
    
    return (
        <div className="mt-10 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-center text-gray-900">Choose Your Plan</h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6 text-center flex flex-col">
                    <h3 className="text-lg font-medium text-gray-900">Single File</h3>
                    <p className="mt-4 text-4xl font-extrabold text-gray-900">$5.99</p>
                    <p className="mt-2 text-sm text-gray-500">One-time correction</p>
                    <button onClick={onPayment} disabled={!agreed} className="mt-auto w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue-600 hover:bg-brand-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500">
                        Pay & Correct File
                    </button>
                </div>
                <div className="border-2 border-brand-blue-500 rounded-lg p-6 text-center relative flex flex-col">
                     <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-brand-blue-500 text-white">Most Popular</span>
                    </div>
                    <h3 className="text-lg font-medium text-brand-blue-600">Pro Plan</h3>
                    <p className="mt-4 text-4xl font-extrabold text-gray-900">$19.95<span className="text-base font-medium text-gray-500">/mo</span></p>
                    <p className="mt-2 text-sm text-gray-500">Unlimited corrections</p>
                    <button onClick={onPayment} disabled={!agreed} className="mt-auto w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue-600 hover:bg-brand-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500">
                        Subscribe & Correct
                    </button>
                </div>
            </div>
            <div className="mt-6">
                 <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="terms"
                            aria-describedby="terms-description"
                            name="terms"
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="focus:ring-brand-blue-500 h-4 w-4 text-brand-blue-600 border-gray-300 rounded"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="terms" className="font-medium text-gray-700">
                            I agree to the <a href="#" className="text-brand-blue-600 hover:underline">Terms of Service</a>.
                        </label>
                        <p id="terms-description" className="text-gray-500">
                            I understand that this is a non-returnable digital service and I explicitly waive my right to a refund upon download.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LoggedInAction = ({ onProcess }: { onProcess: () => void }) => {
    return (
        <div className="mt-10 bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
            <Icon name="magicStars" className="mx-auto h-12 w-12 text-brand-blue-500" />
            <h2 className="text-2xl font-bold text-center text-gray-900 mt-4">Welcome Back, Pro User!</h2>
            <p className="mt-2 text-gray-600">Your Pro Plan includes unlimited file corrections.</p>
            <div className="mt-6">
                <button 
                    onClick={onProcess}
                    className="w-full max-w-xs mx-auto py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-blue-600 hover:bg-brand-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500"
                >
                    Correct File
                </button>
            </div>
        </div>
    );
};


const ProcessingView = ({ fileName }: { fileName: string }) => {
    const messages = useMemo(() => [
        "Analyzing PDF structure...",
        "Rendering page to high-resolution image...",
        "Checking for edge complexity...",
        "Generating bleed using copy-mirror technique...",
        "Constructing new print-ready page...",
        "Drawing vector crop marks (100% registration black)...",
        "Finalizing corrected PDF...",
    ], []);
    const [message, setMessage] = useState(messages[0]);

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % messages.length;
            setMessage(messages[index]);
        }, 2500);
        return () => clearInterval(interval);
    }, [messages]);

    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <Spinner />
            <h2 className="mt-6 text-2xl font-bold text-gray-800">Perfecting Your File...</h2>
            <p className="mt-2 text-gray-600">Processing: <strong>{fileName}</strong></p>
            <div className="mt-4 text-brand-blue-700 bg-brand-blue-100 rounded-md p-3 w-full max-w-md">
                <p className="font-mono text-sm transition-opacity duration-500">{message}</p>
            </div>
        </div>
    );
};

const DownloadSection = ({ originalFile, correctedFileUrl, onReset }: { originalFile: File; correctedFileUrl: string; onReset: () => void }) => {
    const correctedFileName = `Bleed_Buddy_${originalFile.name.endsWith('.pdf') ? originalFile.name : originalFile.name + '.pdf'}`;

    const handleDownload = () => {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = correctedFileUrl;
        a.download = correctedFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    
    return (
        <div className="text-center">
            <Icon name="checkCircle" className="mx-auto w-16 h-16 text-green-500" />
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Correction Complete!</h2>
            <p className="mt-2 text-lg text-gray-600">Your print-ready file is now available for download.</p>
            <div className="mt-8 max-w-lg mx-auto bg-white p-6 rounded-xl shadow-md border">
                 <h3 className="text-lg font-medium text-gray-900 mb-4">Corrected File Preview</h3>
                 <PdfPreview fileUrl={correctedFileUrl} />
                 <p className="mt-4 font-medium text-gray-800">{correctedFileName}</p>
                 <button 
                    onClick={handleDownload}
                    className="mt-6 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-blue-600 hover:bg-brand-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500"
                 >
                    Download Corrected PDF
                </button>
            </div>
            <button onClick={onReset} className="mt-8 text-sm text-brand-blue-600 hover:underline">
                Process another file
            </button>
        </div>
    );
};

const MainApp = () => {
    const dispatch: AppDispatch = useDispatch();
    const {
        workflowStep,
        currentFile,
        preflightResult,
        correctedFileUrl,
        error,
        loading,
    } = useSelector((state: RootState) => state.app);
    
    const { isProUserAuthenticated, isLoginModalOpen } = useSelector((state: RootState) => state.auth);


    const handleFileSelect = (file: File) => {
        dispatch(startPdfAnalysis(file));
    };

    const handleProcessRequest = () => {
        if (currentFile) {
            dispatch(startBleedGeneration(currentFile));
        }
    };

    const handleReset = () => {
        dispatch(resetApp());
    };
    
    const renderContent = () => {
        switch (workflowStep) {
            case 'upload':
                return <FileUpload onFileSelect={handleFileSelect} loading={loading} />;
            case 'preflight':
                return preflightResult && (
                    <div>
                        <PreflightReport result={preflightResult} />
                        {isProUserAuthenticated ? (
                            <LoggedInAction onProcess={handleProcessRequest} />
                        ) : (
                            <PaymentOptions onPayment={handleProcessRequest} />
                        )}
                    </div>
                );
            case 'processing':
                return currentFile && <ProcessingView fileName={currentFile.name} />;
            case 'complete':
                return currentFile && correctedFileUrl && (
                    <DownloadSection originalFile={currentFile} correctedFileUrl={correctedFileUrl} onReset={handleReset} />
                );
            case 'error':
                 return (
                    <div className="text-center">
                        <Icon name="failCircle" className="mx-auto w-12 h-12 text-red-500" />
                        <h2 className="mt-4 text-2xl font-bold text-gray-800">An Error Occurred</h2>
                        <p className="mt-2 text-gray-600">{error}</p>
                        <button onClick={handleReset} className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue-600 hover:bg-brand-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500">
                            Try Again
                        </button>
                    </div>
                );
            default:
                return <FileUpload onFileSelect={handleFileSelect} loading={loading} />;
        }
    };

    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header 
            isAuthenticated={isProUserAuthenticated} 
            onLoginClick={() => dispatch(openLoginModal())}
            onLogoutClick={() => dispatch(logoutProUser())}
        />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
           {renderContent()}
        </main>
        <Footer />
        <LoginModal 
            isOpen={isLoginModalOpen}
            onClose={() => dispatch(closeLoginModal())}
            onLogin={() => dispatch(loginProUser())}
        />
      </div>
    );
};

export default MainApp;