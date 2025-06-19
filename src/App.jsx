import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useEffect, useState } from 'react';
import * as THREE from 'three';

// Exemplo de dados (pode vir de API futuramente)
const salasInfo = [
  { nome: '29', descricao: 'Área administrativa da escola.' },
  { nome: '29001', descricao: 'Espaço de leitura e estudo.' },
  { nome: 'Laboratório1', descricao: 'Laboratório de Ciências.' },
  // Adicione mais conforme o nome dos seus objetos no Blender
];

function Modelo({ onObjectClick }) {
  const { scene } = useGLTF('/modelo.glb');

  // Adiciona os eventos de clique nos objetos
  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.userData = { nome: obj.name };

        // Adiciona função ao objeto
        obj.onClick = () => onObjectClick(obj.name);
      }
    });
  }, [scene, onObjectClick]);

  return <primitive object={scene} />;
}

// Componente de Raycaster para detectar clique em Mesh
function RaycastSelector({ onObjectClick }) {
  const { gl, camera, scene } = useThree();

  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onClick(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const clickedObj = intersects[0].object;
        if (clickedObj.onClick) {
          clickedObj.onClick();
        }
      }
    }

    gl.domElement.addEventListener('click', onClick);
    return () => gl.domElement.removeEventListener('click', onClick);
  }, [gl, camera, scene, onObjectClick]);

  return null;
}

function App() {
  const [infoSelecionada, setInfoSelecionada] = useState(null);

  // Função quando clicar em um objeto
  const handleObjectClick = (objName) => {
    const infoSala = salasInfo.find((sala) => sala.nome === objName);
    if (infoSala) {
      setInfoSelecionada(infoSala.descricao);
    } else {
      setInfoSelecionada(`Sem informações para: ${objName}`);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        margin: 'auto',
        backgroundColor: '#333'
      }}
    >
      <Canvas camera={{ position: [0, 10, 20], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 15]} />
        <Modelo onObjectClick={handleObjectClick} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2.5}
          minPolarAngle={0}
          minDistance={5}
          maxDistance={12}
          target={[0, 0, 0]}
        />

        <RaycastSelector onObjectClick={handleObjectClick} />
      </Canvas>
      {/* Exibe as informações da sala clicada */}
      {infoSelecionada && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            padding: '10px 15px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            color: '#000',
            maxWidth: '300px'
          }}
        >
          {infoSelecionada}
        </div>
      )}
    </div>
  );
}

export default App;
