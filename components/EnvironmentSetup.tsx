import React from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Environment } from '@react-three/drei';

export const EnvironmentSetup: React.FC = () => {
  return (
    <>
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} color="#001a10" />
      
      {/* Warm Main Key Light */}
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffd700" castShadow />
      
      {/* Cool Fill Light */}
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#004d40" />
      
      {/* Dramatic Top/Back Light for rim */}
      <spotLight 
        position={[0, 20, -5]} 
        intensity={2.0} 
        angle={0.5} 
        penumbra={1} 
        color="#ffffff" 
      />

      {/* Reflections */}
      <Environment preset="city" />

      {/* Post Processing for the "Arix Signature" Look */}
      <EffectComposer disableNormalPass>
        {/* Strong Bloom for the gold/emerald glow */}
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.4}
        />
        {/* Vignette for filmic focus */}
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};
