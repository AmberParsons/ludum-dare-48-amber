<script>
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { settings } from '$lib/state.js';
	let container;
	let height;
	let width;
	let renderer, camera, scene;
	let keys = {};
	let snow;

	const bullets = [];

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	onMount(async () => {
		scene = new THREE.Scene();
		camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
		camera.zoom = 20;
		camera.updateProjectionMatrix();
		renderer = new THREE.WebGLRenderer({ antialias: false });
		renderer.setSize(width, height);
		container.appendChild(renderer.domElement);

		snow = new THREE.TextureLoader().load('resources/snow.png');
		snow.magFilter = THREE.NearestFilter;
		snow.wrapT = THREE.RepeatWrapping;
		snow.wrapS = THREE.RepeatWrapping;
		snow.center = new THREE.Vector2(0, 1);
		snow.repeat.set(0.5, 0.5);

		camera.position.z = 15;

		function animate() {
			if (keys['w'] || keys['W']) camera.translateY(0.5);
			if (keys['s'] || keys['A']) camera.translateY(-0.5);
			if (keys['a'] || keys['S']) camera.translateX(-0.5);
			if (keys['d'] || keys['D']) camera.translateX(0.5);
			bullets.forEach((bullet, index) => {
				if (!bullet) return;
				bullet.translateZ(-1.5);
				bullet.translateY(-0.2);
				bullet.rotateY(0.0014);
				if (bullet.position.z < bullet.startPosition - 420) {
					scene.remove(bullet);
					bullets[index] = null;
				}
			});
			renderer.render(scene, camera);
			requestAnimationFrame(animate);
		}
		setInterval(() => {
			const snowMap = snow.clone();
			const chooseRandomOffset = () => Math.ceil(Math.random() * 2) / 2;
			snowMap.offset = new THREE.Vector2(chooseRandomOffset(), chooseRandomOffset());
			const material = new THREE.SpriteMaterial({ map: snowMap, color: 0xffffff * Math.random() });
			material.map.needsUpdate = true;

			const snowflake = new THREE.Sprite(material);
			snowflake.position.x = Math.random() * 40 - 20;
			const scale = 2.5 + Math.random() * 1;
			snowflake.scale.set(scale, scale);
			snowflake.startPosition = snowflake.position.z;
			bullets.push(snowflake);
			scene.add(snowflake);
		}, 25);
		animate();
	});

	function handleClick() {
		$settings.theme = Math.random();
	}

	function handleKeyDown(e) {
		keys[e.key] = true;
	}
	function handleKeyUp(e) {
		keys[e.key] = false;
	}
</script>

<svelte:head>
	<title>Gamebox</title>
</svelte:head>

<svelte:window on:resize={onWindowResize} on:keydown={handleKeyDown} on:keyup={handleKeyUp} />

<div
	id="game"
	on:click={handleClick}
	bind:this={container}
	bind:clientHeight={height}
	bind:clientWidth={width}
/>
