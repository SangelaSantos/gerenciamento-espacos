import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useEffect, useState } from 'react';
import * as THREE from 'three';

const salasInfo = [
  { nome: '01', descricao: '01' },
  { nome: '02', descricao: '02' },
  { nome: '03', descricao: '03' },
  { nome: '04', descricao: '04' },
  { nome: '05', descricao: '05' },
  { nome: '06', descricao: '06' },
  { nome: '07', descricao: '07' },
  { nome: '08', descricao: 'Laboratório Tecnologia da Madeira' },
  { nome: '09', descricao: '09' },
  { nome: '10', descricao: '10' },
  { nome: '11', descricao: '11' },
  { nome: '12', descricao: '12' },
  { nome: '13', descricao: '13' },
  { nome: '14', descricao: '14' },
  { nome: '15', descricao: '15' },
  { nome: '16', descricao: '16' },
  { nome: '17', descricao: '17' },
  { nome: '18', descricao: '18' },
  { nome: '19', descricao: '19' },
  { nome: '20', descricao: 'Escritório Contrato Limpeza' },
  { nome: '21', descricao: 'Laboratório de Ciências Atmosféricas - IEG' },
  { nome: '22', descricao: 'Laboratório de Inteligência Computacional - IEG' },
  { nome: '23', descricao: '23' },
  { nome: '24', descricao: '24' },
  { nome: '25', descricao: '25' },
  { nome: '26', descricao: '26' },
  { nome: '27', descricao: '27' },
  { nome: '28', descricao: '28' },
  { nome: '29', descricao: '29' },
  { nome: '30', descricao: '30' },
  { nome: '31', descricao: 'SE-04 - Subestação' },
  { nome: '32', descricao: '32' },
  { nome: '33', descricao: '33' },
  { nome: '34', descricao: '34' },
  { nome: '35', descricao: '35' },
  { nome: '36', descricao: '36' },
  { nome: 'NSAB', descricao: 'NSAB' },
  { nome: 'NSAC', descricao: 'NSAC' },
];

function Modelo({ onObjectClick, objetoSelecionado }) {
  const { scene } = useGLTF('/certo4.glb');

  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.material.side = THREE.DoubleSide;

        const salaExiste = salasInfo.find((sala) => sala.nome === obj.name);
        if (salaExiste) {
          obj.userData = { nome: obj.name };
          obj.onClick = () => onObjectClick(obj);
          obj.material.emissive = new THREE.Color(0x000000);
        }
      }
    });
  }, [scene, onObjectClick]);

  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isMesh && obj.userData?.nome) {
        if (obj === objetoSelecionado) {
          obj.material.emissive.set(0x2e8b57); // Verde para selecionado
        } else {
          obj.material.emissive.set(0x000000); // Reset
        }
      }
    });
  }, [scene, objetoSelecionado]);

  return <primitive object={scene} />;
}

function RaycastSelector({ onObjectClick, objetoSelecionado }) {
  const { gl, camera, scene } = useThree();
  const [clickableObjects, setClickableObjects] = useState([]);
  const [hoveredObject, setHoveredObject] = useState(null);

  useEffect(() => {
    const objs = [];
    scene.traverse((obj) => {
      if (obj.isMesh && obj.userData?.nome) {
        objs.push(obj);
      }
    });
    setClickableObjects(objs);
  }, [scene]);

  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function handlePointerMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjects, true);

      if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj !== hoveredObject) {
          // Reset o antigo hover
          if (hoveredObject && hoveredObject !== objetoSelecionado) {
            hoveredObject.material.emissive.set(0x000000);
          }
          // Se o novo objeto não for o selecionado, aplicar hover azul
          if (obj !== objetoSelecionado) {
            obj.material.emissive.set(0x4682b4); // Azul (hover)
          }
          setHoveredObject(obj);
        }
      } else {
        // Quando não estiver sobre nada
        if (hoveredObject && hoveredObject !== objetoSelecionado) {
          hoveredObject.material.emissive.set(0x000000);
        }
        setHoveredObject(null);
      }
    }

    function handleClick(event) {
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

    gl.domElement.addEventListener('mousemove', handlePointerMove);
    gl.domElement.addEventListener('click', handleClick);
    return () => {
      gl.domElement.removeEventListener('mousemove', handlePointerMove);
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [gl, camera, clickableObjects, hoveredObject, objetoSelecionado]);

  return null;
}

function App() {
  const [infoSelecionada, setInfoSelecionada] = useState(null);
  const [objetoSelecionado, setObjetoSelecionado] = useState(null);

  const handleObjectClick = (obj) => {
    setObjetoSelecionado(obj);

    const infoSala = salasInfo.find((sala) => sala.nome === obj.name);
    if (infoSala) {
      setInfoSelecionada(infoSala.descricao);
    } else {
      setInfoSelecionada(`Sem informações para: ${obj.name}`);
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
      <nav>
        <h1 style={{ color: '#272727', margin: '5px 0 5px 0' }}>Sistema de gerenciamento de espaços</h1>
      </nav>

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
          alignItems: 'center',
        }}
      >
        <h3 style={{ color: '#272727', marginTop: 0 }}>LOCAÇÃO DE SALAS - UNIDADE TAPAJÓS</h3>
        <div style={{ width: '100%', height: '90%', backgroundColor: '#fff' }}>
          <Canvas camera={{ position: [-4, 0, 2], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 20, 15]} />
            <Modelo onObjectClick={handleObjectClick} objetoSelecionado={objetoSelecionado} />
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              maxPolarAngle={Math.PI / 2.3}
              minPolarAngle={0}
              minDistance={2}
              maxDistance={20}
              target={[0, 0, 0]}
            />
            <RaycastSelector onObjectClick={handleObjectClick} objetoSelecionado={objetoSelecionado} />
          </Canvas>
        </div>

        <p style={{ color: '#272727', marginTop: '10px', textAlign: 'left',
    alignSelf: 'flex-start', fontSize: '20px' }}>
          <strong>INFORMAÇÕES:</strong> {infoSelecionada || 'Clique em uma sala para ver detalhes.'}
        </p>
      </div>
    </div>
  );
}

export default App;
