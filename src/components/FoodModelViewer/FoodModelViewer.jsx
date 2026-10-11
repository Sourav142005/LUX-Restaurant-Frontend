import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

function FoodModel() {
    const { scene } = useGLTF("/models/coffee_cup.glb");
    return (
        <primitive
            object={scene}
            position={[0, 0.043, 0]}
        />
    );
}

function RotatableFood() {
    const modelRef = useRef();
    const lastX = useRef(0);
    const dragging = useRef(false);

    const handlePointerDown = (event) => {
        dragging.current = true;
        lastX.current = event.clientX;

        event.stopPropagation();
    };

    const handlePointerMove = (event) => {
        if (!dragging.current) return;

        const deltaX = event.clientX - lastX.current;

        modelRef.current.rotation.y += deltaX * 0.01;

        lastX.current = event.clientX;

        event.stopPropagation();
    };

    const handlePointerUp = (event) => {
        dragging.current = false;

        event.stopPropagation();
    };

    return (
        <group
            ref={modelRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            castShadow
        >
            <FoodModel />
        </group>
    );
}

function FoodModelViewer() {
    return (
        <div
            className="w-full h-full bg-stone-100"
            style={{
                touchAction: "none"
            }}
        >
            <Canvas
                camera={{
                    position: [0, 0.25, 0.8],
                    fov: 45
                }}
                shadows
            >

                <RotatableFood />

                {/* Table */}
                <mesh
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, 0, 0]}
                    receiveShadow
                >
                    <planeGeometry args={[1, 1]} />

                    <meshStandardMaterial
                        color="#8b7355"
                    />
                </mesh>

                {/* Lighting */}
                <ambientLight intensity={1} />

                <directionalLight
                    position={[3, 5, 3]}
                    intensity={2}
                    castShadow
                />

            </Canvas>
        </div>
    );
}

export default FoodModelViewer;