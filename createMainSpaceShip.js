function createMainSpaceShip(){
	//create the four cubes
	// [0] is the back piece of the ship
	// [3] is the front piece of the ship
	var boxGeometry = [
		new THREE.BoxGeometry(13*sizeParameter, 1*sizeParameter, 4*sizeParameter),
		new THREE.BoxGeometry(11*sizeParameter, 1*sizeParameter, 1*sizeParameter),
		new THREE.BoxGeometry( 3*sizeParameter, 1*sizeParameter, 2*sizeParameter),
		new THREE.BoxGeometry( 1*sizeParameter, 1*sizeParameter, 1*sizeParameter)
	];

	var shipMaterial = new THREE.MeshPhongMaterial({color:0x39FF14});

	//create the four parts of the spaceship
	for(var i=0; i<boxGeometry.length; i++){
		var boxMesh = new THREE.Mesh(boxGeometry[i], shipMaterial);
		mainSpaceParts.push(boxMesh);
	}

	//position the four pieces of the space ship with createdSpaceShip[3] being at the origin
	positionSpaceshipParts();
}

function positionSpaceshipParts(){
	mainSpaceParts[0].position.set(0,0,5.5*sizeParameter-offset);
	mainSpaceParts[1].position.set(0,0,3.0*sizeParameter-offset);
	mainSpaceParts[2].position.set(0,0,1.5*sizeParameter-offset);
	mainSpaceParts[3].position.set(0,0,0-offset);
}

function addLightToMainSpaceship(){
	//create a light
	var light_top = new THREE.PointLight(laserColor,0.4);
	var light_bot = new THREE.PointLight(laserColor,0.4);
	var light_lef = new THREE.PointLight(laserColor,0.4);
	var light_rig = new THREE.PointLight(laserColor,0.4);
	light_top.position.set(0,offset,-offset);
	light_bot.position.set(0,-offset,-offset);
	light_lef.position.set(-7*sizeParameter,0,offset);
	light_rig.position.set(7*sizeParameter,0,offset);
	player.add(light_top);
	player.add(light_bot);
	player.add(light_lef);
	player.add(light_rig);
}