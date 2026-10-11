import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import {
    ArToolkitSource,
    ArToolkitContext,
    ArMarkerControls
} from "@ar-js-org/ar.js/three.js/build/ar-threex.js";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";


function MarkerAR() {

    const containerRef = useRef(null);

    const [detected, setDetected] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [arReady, setArReady] = useState(false);
    const [modelError, setModelError] = useState(false);


    useEffect(() => {

        if (!containerRef.current) {
            return;
        }


        // =========================================================
        // THREE.JS SCENE
        // =========================================================

        const scene = new THREE.Scene();


        // =========================================================
        // LIGHTING
        // =========================================================

        const ambientLight =
            new THREE.AmbientLight(
                0xffffff,
                1.5
            );

        scene.add(ambientLight);


        const directionalLight =
            new THREE.DirectionalLight(
                0xffffff,
                2
            );

        directionalLight.position.set(
            2,
            4,
            3
        );

        scene.add(directionalLight);


        // =========================================================
        // CAMERA
        // =========================================================

        const camera =
            new THREE.Camera();

        scene.add(camera);


        // =========================================================
        // RENDERER
        // =========================================================

        const renderer =
            new THREE.WebGLRenderer({

                antialias: true,

                alpha: true
            });


        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
        );


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );


        renderer.setClearColor(
            new THREE.Color("black"),
            0
        );


        renderer.outputColorSpace =
            THREE.SRGBColorSpace;


        renderer.domElement.style.position =
            "absolute";

        renderer.domElement.style.top =
            "0";

        renderer.domElement.style.left =
            "0";

        renderer.domElement.style.width =
            "100%";

        renderer.domElement.style.height =
            "100%";

        renderer.domElement.style.zIndex =
            "1";


        containerRef.current.appendChild(
            renderer.domElement
        );


        // =========================================================
        // AR CAMERA SOURCE
        // =========================================================

        const source =
            new ArToolkitSource({

                sourceType: "webcam",

                sourceWidth: 640,

                sourceHeight: 480,

                displayWidth: 640,

                displayHeight: 480,

                facingMode: "environment"
            });


        // =========================================================
        // AR CONTEXT
        // =========================================================

        const context =
            new ArToolkitContext({

                cameraParametersUrl:
                    "/ar-data/camera_para.dat",

                detectionMode:
                    "mono",

                maxDetectionRate:
                    30,

                canvasWidth:
                    640,

                canvasHeight:
                    480
            });


        // =========================================================
        // RESIZE AR
        // =========================================================

        const resizeAr = () => {

            if (
                !source.ready ||
                !source.domElement
            ) {
                return;
            }


            const video =
                source.domElement;


            if (
                video.videoWidth === 0 ||
                video.videoHeight === 0
            ) {

                console.warn(
                    "⚠️ resizeAr skipped: video dimensions unavailable"
                );

                return;
            }


            source.onResizeElement();


            source.copyElementSizeTo(
                renderer.domElement
            );


            if (
                context.arController &&
                context.arController.canvas
            ) {

                source.copyElementSizeTo(
                    context.arController.canvas
                );
            }


            console.log(
                "📐 AR resized:",
                {
                    videoWidth:
                        video.videoWidth,

                    videoHeight:
                        video.videoHeight,

                    displayWidth:
                        video.clientWidth,

                    displayHeight:
                        video.clientHeight
                }
            );
        };


        // =========================================================
        // CAMERA INITIALIZATION
        // =========================================================

        source.init(() => {

            console.log(
                "📷 Camera initialized"
            );


            const video =
                source.domElement;


            if (!video) {

                console.error(
                    "❌ Camera video element not found"
                );

                return;
            }


            // Mobile browser requirements

            video.setAttribute(
                "autoplay",
                "true"
            );

            video.setAttribute(
                "playsinline",
                "true"
            );

            video.setAttribute(
                "webkit-playsinline",
                "true"
            );

            video.setAttribute(
                "muted",
                "true"
            );


            video.autoplay =
                true;

            video.playsInline =
                true;

            video.muted =
                true;


            // Camera styling

            video.style.position =
                "absolute";

            video.style.top =
                "0px";

            video.style.left =
                "0px";

            video.style.width =
                "100%";

            video.style.height =
                "100%";

            video.style.objectFit =
                "cover";

            video.style.zIndex =
                "0";


            if (
                !containerRef.current.contains(
                    video
                )
            ) {

                containerRef.current.appendChild(
                    video
                );
            }


            // -----------------------------------------------------
            // Wait until camera has real dimensions
            // -----------------------------------------------------

            const startAR = () => {

                console.log(
                    "📹 Video dimensions:",
                    video.videoWidth,
                    "x",
                    video.videoHeight
                );


                if (
                    video.videoWidth === 0 ||
                    video.videoHeight === 0
                ) {

                    console.warn(
                        "⚠️ Video dimensions not ready yet"
                    );


                    setTimeout(
                        startAR,
                        100
                    );


                    return;
                }


                console.log(
                    "✅ Camera video is ready"
                );


                setCameraReady(
                    true
                );


                resizeAr();
            };


            if (
                video.readyState >= 2 &&
                video.videoWidth > 0
            ) {

                startAR();

            } else {

                video.addEventListener(
                    "loadedmetadata",
                    startAR,
                    {
                        once: true
                    }
                );
            }

        });


        // =========================================================
        // AR CONTEXT INITIALIZATION
        // =========================================================

        context.init(() => {

            console.log(
                "🧠 AR.js context initialized"
            );


            setArReady(
                true
            );


            camera.projectionMatrix.copy(
                context.getProjectionMatrix()
            );


            resizeAr();

        });


        // =========================================================
        // MARKER ROOT
        // =========================================================

        const markerRoot =
            new THREE.Group();


        scene.add(
            markerRoot
        );


        // =========================================================
        // LUX PATTERN MARKER
        // =========================================================

        console.log(
            "🔲 Loading LUX pattern:"
        );


        console.log(
            "/markers/lux-marker.patt"
        );


        const markerControls =
            new ArMarkerControls(

                context,

                markerRoot,

                {

                    type:
                        "pattern",

                    patternUrl:
                        "/markers/lux-marker.patt",

                    size:
                        0.10,

                    changeMatrixMode:
                        "modelViewMatrix"
                }
            );


        // =========================================================
        // MARKER EVENTS
        // =========================================================

        const handleMarkerFound =
            () => {

                console.log(
                    "✅✅✅ LUX MARKER FOUND!"
                );


                setDetected(
                    true
                );
            };


        const handleMarkerLost =
            () => {

                console.log(
                    "❌ LUX marker lost"
                );


                setDetected(
                    false
                );
            };


        markerControls.addEventListener(
            "markerFound",
            handleMarkerFound
        );


        markerControls.addEventListener(
            "markerLost",
            handleMarkerLost
        );


        // =========================================================
        // FOOD MODEL
        // =========================================================

        const loader =
            new GLTFLoader();


        loader.load(

            "/models/pizza_30cm.glb",


            (gltf) => {

                console.log(
                    "🍕 Pizza model loaded"
                );


                const food =
                    gltf.scene;


                // -------------------------------------------------
                // Calculate model bounds
                // -------------------------------------------------

                const box =
                    new THREE.Box3()
                        .setFromObject(
                            food
                        );


                const center =
                    box.getCenter(
                        new THREE.Vector3()
                    );


                const modelSize =
                    box.getSize(
                        new THREE.Vector3()
                    );


                console.log(
                    "🍕 Original pizza bounds:",
                    {
                        center,
                        size:
                            modelSize
                    }
                );


                // -------------------------------------------------
                // Center the geometry
                // -------------------------------------------------

                food.position.sub(
                    center
                );


                // -------------------------------------------------
                // Normalize model size
                // -------------------------------------------------

                const maxDimension =
                    Math.max(
                        modelSize.x,
                        modelSize.y,
                        modelSize.z
                    );

                // Real-world pizza diameter:
                // 30 cm = 0.30 meters
                const targetSize =
                    0.30;

                const scale =
                    targetSize /
                    maxDimension;

                food.scale.setScalar(
                    scale
                );

                console.log("🍕 REAL-WORLD SIZE:", {
                    diameterCm: 30,
                    diameterMeters: targetSize,
                    originalModelSize: maxDimension,
                    appliedScale: scale
                });


                console.log(
                    "🍕 Pizza scale:",
                    scale
                );


                // -------------------------------------------------
                // Lift pizza above marker
                // -------------------------------------------------

                food.position.y +=
                    0.03;


                // -------------------------------------------------
                // Initial rotation
                // -------------------------------------------------

                food.rotation.set(
                    -Math.PI / 2,
                    0,
                    0
                );


                // -------------------------------------------------
                // Rendering settings
                // -------------------------------------------------

                food.traverse(
                    (child) => {

                        if (
                            child.isMesh
                        ) {

                            child.frustumCulled =
                                false;

                            child.castShadow =
                                true;

                            child.receiveShadow =
                                true;
                        }
                    }
                );


                // -------------------------------------------------
                // Attach to marker
                // -------------------------------------------------

                markerRoot.add(
                    food
                );


                console.log(
                    "🍕 Pizza attached to LUX marker"
                );

            },


            // Loading progress

            undefined,


            // Loading error

            (error) => {

                console.error(
                    "❌ Failed to load pizza model:",
                    error
                );


                setModelError(
                    true
                );
            }
        );


        // =========================================================
        // ANIMATION
        // =========================================================

        let animationId;


        const animate = () => {

            animationId =
                requestAnimationFrame(
                    animate
                );


            if (
                source.ready &&
                source.domElement &&
                context.arController
            ) {

                context.update(
                    source.domElement
                );
            }


            renderer.render(
                scene,
                camera
            );
        };


        animate();


        // =========================================================
        // RESIZE / ORIENTATION CHANGE
        // =========================================================

        const handleResize =
            () => {

                console.log(
                    "📱 Screen resized/orientation changed"
                );


                resizeAr();


                renderer.setSize(
                    window.innerWidth,
                    window.innerHeight
                );


                renderer.setPixelRatio(
                    Math.min(
                        window.devicePixelRatio,
                        2
                    )
                );
            };


        window.addEventListener(
            "resize",
            handleResize
        );


        window.addEventListener(
            "orientationchange",
            handleResize
        );


        // =========================================================
        // DEBUG
        // =========================================================

        console.log(
            "🚀 LUX AR started"
        );


        console.log(
            "📌 Marker:",
            "/markers/lux-marker.patt"
        );


        console.log(
            "📌 Camera:",
            "640 × 480"
        );


        console.log(
            "📌 Detection:",
            "640 × 480"
        );


        // =========================================================
        // CLEANUP
        // =========================================================

        return () => {

            cancelAnimationFrame(
                animationId
            );


            window.removeEventListener(
                "resize",
                handleResize
            );


            window.removeEventListener(
                "orientationchange",
                handleResize
            );


            markerControls.removeEventListener(
                "markerFound",
                handleMarkerFound
            );


            markerControls.removeEventListener(
                "markerLost",
                handleMarkerLost
            );


            source.domElement
                ?.srcObject
                ?.getTracks()
                .forEach(
                    track =>
                        track.stop()
                );


            renderer.dispose();


            if (
                renderer.domElement.parentNode
            ) {

                renderer.domElement.parentNode.removeChild(
                    renderer.domElement
                );
            }


            if (
                source.domElement?.parentNode
            ) {

                source.domElement.parentNode.removeChild(
                    source.domElement
                );
            }

        };

    }, []);


    // =========================================================
    // UI
    // =========================================================

    return (

        <div
            ref={containerRef}
            className="
                w-full
                h-screen
                bg-black
                relative
            "
        >

            {/* =====================================================
                TOP STATUS CARD
            ===================================================== */}

            <div
                className="
                    absolute
                    top-5
                    left-1/2
                    -translate-x-1/2
                    z-20
                    bg-white/90
                    backdrop-blur-md
                    px-6
                    py-4
                    rounded-2xl
                    shadow-xl
                    text-center
                    min-w-[260px]
                "
            >

                <h1
                    className="
                        text-xl
                        font-bold
                        text-gray-900
                    "
                >
                    LUX
                </h1>


                <p
                    className="
                        text-sm
                        text-gray-500
                        mt-1
                    "
                >

                    {!cameraReady

                        ? "Starting camera..."

                        : detected

                            ? "Marker detected — displaying your dish"

                            : "Point your camera at the LUX marker"

                    }

                </p>


                {/* DEBUG STATUS */}

                <div
                    className="
                        mt-3
                        text-[11px]
                        text-left
                        text-gray-500
                        space-y-1
                    "
                >

                    <div>
                        Camera:{" "}
                        {cameraReady
                            ? "✓ Ready"
                            : "…"}
                    </div>


                    <div>
                        AR.js:{" "}
                        {arReady
                            ? "✓ Ready"
                            : "…"}
                    </div>


                    <div>
                        Marker:{" "}
                        {detected
                            ? "✓ FOUND"
                            : "Searching…"}
                    </div>

                </div>

            </div>


            {/* =====================================================
                MODEL ERROR
            ===================================================== */}

            {modelError && (

                <div
                    className="
                        absolute
                        inset-x-5
                        bottom-8
                        z-20
                        rounded-xl
                        bg-red-600
                        px-4
                        py-3
                        text-center
                        text-sm
                        font-medium
                        text-white
                        shadow-lg
                    "
                >
                    The 3D food model could not be loaded.
                </div>

            )}


            {/* =====================================================
                INSTRUCTION
            ===================================================== */}

            {cameraReady &&
                !detected &&
                !modelError && (

                    <div
                        className="
                            absolute
                            inset-x-5
                            bottom-8
                            z-20
                            rounded-xl
                            bg-black/70
                            px-4
                            py-3
                            text-center
                            text-sm
                            text-white
                            backdrop-blur-sm
                        "
                    >
                        Keep the entire square marker
                        visible, flat, and well lit.
                    </div>

                )}

        </div>
    );
}


export default MarkerAR;