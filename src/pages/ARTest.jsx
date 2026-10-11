import "@google/model-viewer";
import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

function ARTest() {

    const [searchParams] = useSearchParams();
    const [modelError, setModelError] = useState(false);
    const [arStatus, setArStatus] = useState("not-presenting");
    const [arTracking, setArTracking] = useState("tracking");

    const modelViewerRef = useRef(null);

    useEffect(() => {
        const modelViewer = modelViewerRef.current;

        if (!modelViewer) return;

        const handleArStatus = (event) => {
            setArStatus(event.detail.status);

            const tracking =
                modelViewer.getAttribute("ar-tracking");

            if (tracking) {
                setArTracking(tracking);
            }
        };

        modelViewer.addEventListener(
            "ar-status",
            handleArStatus
        );

        return () => {
            modelViewer.removeEventListener(
                "ar-status",
                handleArStatus
            );
        };
    }, []);

    const model = searchParams.get("model");

    const name =
        searchParams.get("name") ||
        "Food";

    if (!model) {
        return (
            <div className="w-full h-screen bg-stone-100 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
                    <div className="text-5xl mb-4">
                        🍽️
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900">
                        3D Model Not Available
                    </h1>

                    <p className="text-gray-500 mt-2">
                        A 3D / AR model has not been added for this dish yet.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-stone-100 relative">

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-5">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl px-5 py-4 shadow-lg">
                    <h1 className="text-xl font-bold text-gray-900">
                        LUX
                    </h1>

                    <p className="text-sm text-gray-500">
                        {name}
                    </p>
                </div>
            </div>

            {/* 3D / AR Model */}
            <model-viewer
                ref={modelViewerRef}
                src={model}
                ar
                ar-modes="webxr scene-viewer quick-look"
                ar-scale="fixed"
                ar-placement="floor"
                camera-controls
                shadow-intensity="1"
                exposure="1"
                onError={() => setModelError(true)}
                style={{
                    width: "100%",
                    height: "100%"
                }}
            >

                {modelError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-100/90 z-20">
                        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md mx-6">
                            <div className="text-5xl mb-4">
                                ⚠️
                            </div>

                            <h2 className="text-xl font-bold text-gray-900">
                                Unable to Load 3D Model
                            </h2>

                            <p className="text-gray-500 mt-2">
                                The 3D model for {name} could not be loaded.
                            </p>
                        </div>
                    </div>
                )}

                {arStatus === "session-started" && (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2
                        bg-black/75 text-white px-5 py-3
                        rounded-full shadow-lg text-sm font-medium
                        whitespace-nowrap">
                        🔍 Finding a surface...
                    </div>
                )}

                {arStatus === "session-started" &&
                    arTracking === "not-tracking" && (
                        <div className="absolute top-24 left-1/2 -translate-x-1/2
                            bg-black/75 text-white px-5 py-3
                            rounded-full shadow-lg text-sm font-medium
                            whitespace-nowrap">
                            📱 Move your phone slowly over the surface
                        </div>
                )}

                {arStatus === "object-placed" && (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2
                        bg-green-600/90 text-white px-5 py-3
                        rounded-full shadow-lg text-sm font-medium
                        whitespace-nowrap">
                        ✓ Food placed
                    </div>
                )}

                {/* Information */}
                <div
                    className="absolute bottom-32 left-1/2 -translate-x-1/2
                    bg-white/90 backdrop-blur-md px-4 py-3
                    rounded-2xl shadow-lg text-center w-max max-w-xs"
                >
                    <p className="text-sm font-semibold text-gray-800">
                        📏 Real Size
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                        See how it looks on your table
                    </p>

                    <div className="border-t border-gray-200 mt-3 pt-3">
                        <p className="text-xs text-gray-500 mt-1">
                            Move your phone slowly across a table or floor
                        </p>

                        <p className="text-xs text-gray-500">
                            Keep the camera pointed at the surface
                        </p>

                        <p className="text-xs text-gray-500">
                            Once detected, tap to place your food
                        </p>
                    </div>
                </div>

                {/* AR Button */}
                <button
                    slot="ar-button"
                    className="absolute bottom-8 left-1/2
                    -translate-x-1/2
                    bg-black text-white
                    px-8 py-4
                    rounded-2xl
                    font-semibold
                    shadow-xl
                    active:scale-95
                    transition"
                >
                    📱 View in AR
                </button>

            </model-viewer>

        </div>
    );
}

export default ARTest;