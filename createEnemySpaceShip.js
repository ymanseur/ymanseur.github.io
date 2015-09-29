function createEnemySpaceShip(){
	//all the blocks that make up the enemy spaceship
	var boxGeometry = [
		new THREE.BoxGeometry(sizeParameter,sizeParameter,sizeParameter),
		new THREE.BoxGeometry(sizeParameter,sizeParameter,sizeParameter),
		new THREE.BoxGeometry(6*sizeParameter,sizeParameter,sizeParameter),
		new THREE.BoxGeometry(2*sizeParameter,sizeParameter,sizeParameter),
		new THREE.BoxGeometry(2*sizeParameter,sizeParameter,sizeParameter),
		new THREE.BoxGeometry(2*sizeParameter,sizeParameter,sizeParameter),
		new THREE.BoxGeometry(10*sizeParameter,sizeParameter,2*sizeParameter),
		new THREE.BoxGeometry(sizeParameter,sizeParameter,sizeParameter),
		new THREE.BoxGeometry(sizeParameter,sizeParameter,sizeParameter),
		new THREE.BoxGeometry(sizeParameter,sizeParameter,sizeParameter),
		new THREE.BoxGeometry(sizeParameter,sizeParameter,sizeParameter),
		new THREE.BoxGeometry(2*sizeParameter,sizeParameter,sizeParameter),
		new THREE.BoxGeometry(2*sizeParameter,sizeParameter,sizeParameter)
	];
	var shipMaterial = new THREE.MeshPhongMaterial({color:0x39FF14});

	//create all the parts of the spaceship
	for(var i=0; i<boxGeometry.length; i++){
		var boxMesh = new THREE.Mesh(boxGeometry[i], shipMaterial);
		enemySpaceParts.push(boxMesh);
	}

	//position all of the parts of the spaceship
	positionEnemyParts()
}

function positionEnemyParts(){
	enemySpaceParts[0].position.set(-1.5*sizeParameter,0,-3.5*sizeParameter);
	enemySpaceParts[1].position.set(1.5*sizeParameter,0,-3.5*sizeParameter);
	enemySpaceParts[2].position.set(0,0,-2.5*sizeParameter);
	enemySpaceParts[3].position.set(-3*sizeParameter,0,-1.5*sizeParameter);
	enemySpaceParts[4].position.set(0,0,1.5*-sizeParameter);
	enemySpaceParts[5].position.set(3*sizeParameter,0,1.5*-sizeParameter);
	enemySpaceParts[6].position.set(0,0,0);
	enemySpaceParts[7].position.set(-4.5*sizeParameter,0,1.5*sizeParameter);
	enemySpaceParts[8].position.set(-2.5*sizeParameter,0,1.5*sizeParameter);
	enemySpaceParts[9].position.set(2.5*sizeParameter,0,1.5*sizeParameter);
	enemySpaceParts[10].position.set(4.5*sizeParameter,0,1.5*sizeParameter);
	enemySpaceParts[11].position.set(-2*sizeParameter,0,2.5*sizeParameter);
	enemySpaceParts[12].position.set(2*sizeParameter,0,2.5*sizeParameter);
}

function positionEnemies(){
	var i=0;
	for(row = -2; row<3; row++){
		for(col = -5; col<6; col++){
			enemies[i].position.set(18*col-7.5,0,15*row - 60);
			i++;
		}
	}
}