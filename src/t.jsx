import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useEffect, useState } from 'react';
import * as THREE from 'three';

const salasInfo = [
  //ZN-01
  { nome: '01', descricao: 'Guarita' },
  { nome: '02', descricao: 'Reitoria, CITIC, Cerimonial' },
  { nome: '03', descricao: 'IEG' },
  { nome: '04', descricao: 'IBEF, Laboratório de Química ICTA' },
  { nome: '08', descricao: 'Laboratório Tecnologia da Madeira' },
  { nome: '09', descricao: 'Laboratório ICTA e IEG' },
  { nome: '10', descricao: 'Laboratório de Sementes Florestais' },
  { nome: '11', descricao: 'Laboratório ICED e ISCO' },
  { nome: '13', descricao: 'Laboratórios' },
  { nome: '15', descricao: 'Laboratório de Arqueologia 2 - ICS' },
  { nome: '16', descricao: 'Serraria' },
  { nome: '17', descricao: 'Projeto Navegar' },
  { nome: '18', descricao: 'Laboratório IEG' },
  { nome: '19001', descricao: 'Bloco de Salas Especiais - BSE' },
  { nome: '19002', descricao: 'Bloco de Salas Especiais - BSE' },
  { nome: '19', descricao: 'Sala de Monitoramento' },
  { nome: '20', descricao: 'Escritório Contrato Limpeza' },
  { nome: '21', descricao: 'Laboratório de Ciências Atmosféricas - IEG' },
  { nome: '22', descricao: 'Laboratório de Inteligência Computacional - IEG' },
  { nome: '23', descricao: 'Laboratório de Arqueologia 1 - ICS' },
  { nome: '24', descricao: 'Reservatório Ativo' },
  { nome: '25', descricao: 'Laboratório de Morfofisiologia' },
  { nome: '29', descricao: 'SE - 02 Subestação' },
  { nome: '29001', descricao: 'Professores IBEF' },
  { nome: '30', descricao: 'SE - 03 Subestação' },
  { nome: '31', descricao: 'SE-04 - Subestação' },
  { nome: '32', descricao: 'SE - 05 Subestação' },
  { nome: '34', descricao: 'Bloco Modular Tapajós' },
  { nome: '34001', descricao: 'BMT - 3' },
  { nome: 'NSAB', descricao: 'NSAB' },
  { nome: 'NSAC', descricao: 'NSAC' },
  { nome: 'NSAB01', descricao: 'NSAB' },
  { nome: 'NSAC01', descricao: 'NSAC' },
  //ZN-03
  { nome: '01006', descricao: 'Restaurante Universitário (RU)' },
  { nome: '02006', descricao: 'Subestação (SE) e Grupo Gerador (GG)' },
  //ZN-04
  { nome: '01002', descricao: 'Núcleo Tecnológico de Bioativos (NTB)' },
  { nome: '02002', descricao: 'Laboratórios - IBEF' },
  { nome: '03002', descricao: 'Casa de gases' },
  { nome: '04002', descricao: 'Laboratórios - IBEF' },
  { nome: '05002', descricao: 'Núcleo Tecnológico de Laboratórios (NTL)' },
  { nome: '052001', descricao: 'Núcleo Tecnológico de Laboratórios (NTL)' },
  { nome: '06002', descricao: 'Sistema de Abastecimento de Água' },
  { nome: '07002', descricao: 'Sistema de Abastecimento de Água' },
  //ZN-05
  { nome: '01001', descricao: 'Laboratórios - ICTA' },
  { nome: '02001', descricao: 'Laboratórios - ICTA' },
  { nome: '03001', descricao: 'Sistema de Abastecimento de Água' },
  { nome: '04001', descricao: 'Projeto Fábrica de Ração' },
  { nome: '05001', descricao: 'Base Administrativa do Viveiro' },
  { nome: '06001', descricao: 'Rede Nacional de Pesquisa e Extensão (RNP)' },
];

function Modelo({ onObjectClick, objetoSelecionado }) {
  const { scene } = useGLTF('/adjustments.glb');

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
