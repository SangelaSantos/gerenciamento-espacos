import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useEffect, useState } from 'react';
import * as THREE from 'three';

const salasInfo = [
  { nome: '20', descricao: 'Área administrativa da escola.' },
  { nome: '21', descricao: 'Espaço de leitura e estudo.' },
  { nome: '22', descricao: 'Laboratório de Ciências.' },
];

function Modelo({ onObjectClick }) {
  const { scene } = useGLTF('/modelo.glb');

  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isMesh) {
        const salaExiste = salasInfo.find((sala) => sala.nome === obj.name);
        if (salaExiste) {
          obj.userData = { nome: obj.name };
          obj.onClick = () => onObjectClick(obj.name);
        }
      }
    });
  }, [scene, onObjectClick]);

  return <primitive object={scene} />;
}

function RaycastSelector({ onObjectClick }) {
  const { gl, camera, scene } = useThree();
  const [clickableObjects, setClickableObjects] = useState([]);

  useEffect(() => {
    const objects = [];
    scene.traverse((obj) => {
      if (obj.isMesh && obj.userData.nome) {
        objects.push(obj);
      }
    });
    setClickableObjects(objects);
  }, [scene]);

  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onClick(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjects, true);

      if (intersects.length > 0) {
        const clickedObj = intersects[0].object;
        if (clickedObj.onClick) {
          clickedObj.onClick();
        }
      }
    }

    gl.domElement.addEventListener('click', onClick);
    return () => gl.domElement.removeEventListener('click', onClick);
  }, [gl, camera, clickableObjects]);

  return null;
}


function App() {
  const [infoSelecionada, setInfoSelecionada] = useState(null);

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
        flexDirection: 'column',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#fff',
        overflow: 'hidden',

      }}
    >
      {/* Cabeçalho fora da borda */}
      <nav>
        <h1 style={{ color: '#272727', margin: '5px 0 5px 0' }}>Sistema de gerenciamento de espaços</h1>
      </nav>

      {/* Caixa com borda e fundo envolvendo h3 e Canvas */}
      <div
        style={{
          border: '1px solid #064452',
          backgroundColor: '#f0f4f8',
          borderRadius: '12px',
          padding: '20px',
          width: '70%',
          height: '75%',
          maxWidth: '1000px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <h3 style={{ color: '#272727', marginTop: 0 }}>LOCAÇÃO DE SALAS - UNIDADE TAPAJÓS</h3>
        <div style={{ width: '100%', height: '90%', backgroundColor: '#fff' }}>
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
              maxDistance={15}
              target={[0, 0, 0]}
            />
            <RaycastSelector onObjectClick={handleObjectClick} />
          </Canvas>
        </div>
        <p style={{ color: '#272727', marginTop: '10px' }}>
          <strong>Info:</strong> {infoSelecionada || 'Clique em uma sala para ver detalhes.'}
        </p>
        {/* Exibe informações da sala clicada
        {infoSelecionada && (
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              padding: '10px 15px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '8px',
              color: '#000',
              maxWidth: '300px',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)'
            }}
          >
            {infoSelecionada}
          </div>
        )} */}
      </div>
    </div>
  );
}

export default App;
