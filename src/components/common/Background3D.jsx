import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import { useTheme } from '../../context/ThemeContext';
import { animationConfig } from '../../utils/config';

const Stars = ({ color, size, mouse }) => {
    const groupRef = useRef();
    const pointsRef = useRef();
    const [sphere] = useState(() => random.inSphere(new Float32Array(animationConfig.background.starCount * 3), { radius: animationConfig.background.radius }));

    useFrame((state, delta) => {
        // Automatic rotation (Points)
        if (pointsRef.current) {
            pointsRef.current.rotation.x -= delta / animationConfig.background.rotationSpeedX;
            pointsRef.current.rotation.y -= delta / animationConfig.background.rotationSpeedY;
        }

        // Mouse parallax (Group)
        if (groupRef.current) {
            const targetRotationX = mouse.current[1] * 0.15;
            const targetRotationY = mouse.current[0] * 0.15;

            groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.05;
            groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.05;
        }
    });

    return (
        <group ref={groupRef} rotation={[0, 0, Math.PI / 4]}>
            <Points ref={pointsRef} positions={sphere} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color={color}
                    size={size}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    );
};

const Background3D = () => {
    const { theme } = useTheme();
    const mouse = useRef([0, 0]);

    // Theme-based styling for stars
    const isDarkBlue = theme === 'dark-blue';
    const isBlack = theme === 'black';

    let color = '#475569';
    let starSize = animationConfig.background.starSize * 2.5;

    if (isDarkBlue) {
        color = '#ffffff';
        starSize = animationConfig.background.starSize;
    }

    if (isBlack) {
        color = '#e2e8f0';
        starSize = animationConfig.background.starSize * 1.15;
    }

    React.useEffect(() => {
        const handleMouseMove = (event) => {
            // Normalize mouse coordinates to -1 to 1
            mouse.current = [
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            ];
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <Stars color={color} size={starSize} mouse={mouse} />
            </Canvas>
        </div>
    );
};



export default Background3D;
