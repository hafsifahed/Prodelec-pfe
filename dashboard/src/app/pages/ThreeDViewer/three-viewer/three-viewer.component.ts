import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

@Component({
  selector: 'app-three-viewer',
  templateUrl: './three-viewer.component.html',
  styleUrls: ['./three-viewer.component.scss']
})
export class ThreeViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true }) containerRef!: ElementRef;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private mixer?: THREE.AnimationMixer;
  private clock = new THREE.Clock();
  private stats!: Stats;
  private model: THREE.Group | undefined;

  ngAfterViewInit(): void {
    this.initThreeJS();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    // this.camera.position.z = 5;
    // this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private initThreeJS(): void {
    const container = this.containerRef.nativeElement;

    this.stats = new Stats(); // Instantiate Stats using 'new'

    
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true  });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);

    this.scene = new THREE.Scene();
    this.scene.background = null;
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(this.renderer), 0.04).texture;

    this.camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 1, 100);
    this.camera.position.set(5, 5, 5);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0.5, 0);
    this.controls.update();
    this.controls.enableDamping = true;
    
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 500;
    this.controls.maxPolarAngle = Math.PI / 2;

    this.renderer.setAnimationLoop(() => this.animate());
  }

  private animate(): void {
    const delta = this.clock.getDelta();

    if (this.mixer) {
      this.mixer.update(delta);
    }

    this.controls.update();
    this.stats.update();
    this.renderer.render(this.scene, this.camera);
  }

  private cleanup(): void {
    this.renderer.dispose();
    this.controls.dispose();

  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.loadModel(file);
    }
  }

  private loadModel(file: File): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.gltf') || fileName.endsWith('.glb')) {
        this.loadGLTFModel(file);
      } else if (fileName.endsWith('.obj')) {
        this.loadOBJModel(file);
      } else {
        console.error('Unsupported file format');
      }
    };
  }

  private loadGLTFModel(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const loader = new GLTFLoader();
      loader.load(
        dataUrl,
        (gltf) => {
          if (this.model) {
            this.scene.remove(this.model);
          }
          this.model = gltf.scene;
          this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              if (child.material) {
                child.material.roughness = 0.5;
                child.material.metalness = 0.5;
                child.castShadow = true;
                child.material.envMapIntensity = 1;
              }
            }
          });
          this.scene.add(this.model);
          this.mixer = new THREE.AnimationMixer(this.model);
          if (gltf.animations.length > 0) {
            this.mixer.clipAction(gltf.animations[0]).play();
          }
        },
        undefined,
        (error) => {
          console.error('Error loading 3D model', error);
        }
      );
    };
    reader.readAsDataURL(file);
  }

  private loadOBJModel(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const loader = new OBJLoader();
      const object = loader.parse(dataUrl);
      if (this.model) {
        this.scene.remove(this.model);
      }
      this.model = object;
      this.scene.add(this.model);
    };
    reader.readAsText(file);
  }
}

