var scene;
var camera;

//color of the laser (yellow)
var laserColor = 0xFFFF00;

//texture that creates the space-like environment
var skyBox;

//orbit controls
var controller;

//array of boxes that make up the player's spaceship
var mainSpaceParts = [];

//object that is the player's spaceship
var player;

//array of boxes that make up an enemy spaceship
var enemySpaceParts = [];

//parameter to vary the size of all objects
var sizeParameter = 1;

//offset is used for positioning the light and cubes in the player's spaceship
var offset = 4*sizeParameter;

//boolean values used for when the left and right arrow keys are pressed
var moveLeft = false, moveRight = false;

//boolean values for added functionality of moving forward/backwards
var moveUp = false, moveDown = false;

//object that is the laser that the player shoots
var laser;

//object that is the laser that the enemy shoots
var enemyLaser;

//the speed that the enemy's laser travels
var enemyLaserSpeed=2;

//boolean used that when it is false, the laser moves with the spaceship
var shooting = false, enemyShooting = false;

//boolean used when an enemy is hit
var hit;

//global boolean array that tells which enemy has been removed by index
//this will be used for when the closest enemy to the player will be shooting a laser for that row
var enemyStillAvailable = [];

//index of where the enemy laser currently is
var enemyLaserIndex;

//Array of enemy objects (5 rows x 11 columns)
var enemies = [];

//used for moving all the enemies by defining four cases of movement
//0-59 move left, 60-119 move up, 120-179 move right, 180-239 move down
var caseEnemy = 0;

var startRendering = false;

var flag = 0;


window.onload = function(){
	initializeScene();
	setScene();
	animateScene();
}

function initializeScene(){
	var canvasWidth = window.innerWidth-24;
	var canvasHeight = window.innerHeight-130-12;
	var aspectRatio = canvasWidth/canvasHeight;

	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setClearColor(0xD3D3D3);
	renderer.setSize(canvasWidth,canvasHeight);

	document.getElementById("HELP").style.display = "inline";
	document.getElementById("WebGLCanvas").appendChild(renderer.domElement);
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(45, aspectRatio, 1, 10000);

	addEventListeners();
} 

function setScene(){
	camera.position.set(0,150,150);

	controller = new THREE.OrbitControls(camera, renderer.domElement);

	camera.lookAt(scene.position);
	scene.add(camera);

	//create the player's spaceship
	player = new THREE.Object3D();
	createMainSpaceShip();

	for(var i = 0; i < mainSpaceParts.length; i++)
		player.add(mainSpaceParts[i]);
	player.position.set(0,0,45);
	scene.add(player);

	for(var i=0; i<55; i++){
		enemies.push(new THREE.Object3D());
		enemySpaceParts=[];
		createEnemySpaceShip();
		for(var j=0; j<enemySpaceParts.length; j++){
			enemies[i].add(enemySpaceParts[j]);
		}
	}

	positionEnemies();
	for(var i=0; i<enemies.length; i++){
		scene.add(enemies[i]);
		enemyStillAvailable.push(true);
	}

	addLightToMainSpaceship();

	//the world's light source
	var lightSource = new THREE.PointLight(laserColor,0.5,1000);
	lightSource.position.set(0,150,60);
	scene.add(lightSource);

	//create the world
	var imageNames = [	"backDrop_Right.bmp", 
						"backDrop_Left.bmp",
						"backDrop_Top.bmp",
						"backDrop_Bottom.bmp",
						"backDrop_Front.bmp",
						"backDrop_Back.bmp"];
	var skyGeometry = new THREE.BoxGeometry(1000,1000,1000);
	var materialArray = [];
	for(var i=0; i<6; i++)
		materialArray.push( new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture(imageNames[i]), side: THREE.BackSide}));
	var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
	skyBox = new THREE.Mesh(skyGeometry,skyMaterial);
	skyBox.rotation.x = -Math.PI/10;
	scene.add(skyBox);

	laser = new THREE.Object3D();
	enemyLaser = new THREE.Object3D();
	var boxLaser = new THREE.BoxGeometry(0.9*sizeParameter,0.9*sizeParameter,3*sizeParameter);
	var boxEnemyLaser = new THREE.BoxGeometry(0.9*sizeParameter,0.9*sizeParameter,3*sizeParameter);
	var materialLaser = new THREE.MeshBasicMaterial({color:laserColor});
	var materialEnemyLaser = new THREE.MeshBasicMaterial({color:laserColor});
	var laserShape = new THREE.Mesh(boxLaser,materialLaser);
	var laserEnemyShape = new THREE.Mesh(boxEnemyLaser,materialEnemyLaser);
	laser.add(laserShape);
	enemyLaser.add(laserEnemyShape);

	var numSources = 10;
	for(var i=-0.5*numSources; i<0.5*numSources; i++){
		var temp1 = new THREE.PointLight(laserColor,1,15*Math.sqrt(2)*sizeParameter);
		var temp2 = new THREE.PointLight(laserColor,1,15*Math.sqrt(2)*sizeParameter);
		temp1.position.set(0,15*sizeParameter,5*sizeParameter*i/numSources);
		temp2.position.set(0,15*sizeParameter,5*sizeParameter*i/numSources);
		laser.add(temp1);
		enemyLaser.add(temp2);
	}
	
	resetLaser();
	resetEnemyLaser();
	scene.add(laser);
	scene.add(enemyLaser);
}

function animateScene(){
	requestAnimationFrame(animateScene);
	if(startRendering)		
		renderScene();
	renderer.render(scene,camera);
}

function renderScene(){
	controller.update();

	moveEnemies();

	if(moveLeft && player.position.x>-100)
		player.translateX(-3);
	if(moveDown && player.position.z<75)
		player.translateZ(2);
	if(moveRight && player.position.x<100)
		player.translateX(3);
	if(moveUp && player.position.z>0)
		player.translateZ(-2);

	if(shooting)
		laser.translateZ(-4);
	else
		resetLaser();
	if(enemyShooting)
		enemyLaser.translateZ(enemyLaserSpeed);
	else
		resetEnemyLaser();

	//Reset laser if it missed all enemies
	if(laser.position.z<-100){
		shooting=false;
		resetLaser();
	}

	//Reset laser if it missed the player
	if(enemyLaser.position.z>player.position.z+5){
		enemyShooting=false;
	}

	var enemyShipDown = isLaserTouchingHitbox();
	if(enemyShipDown!=-1){
		var xExplosion = enemies[enemyShipDown].position.x;
		var zExplosion = enemies[enemyShipDown].position.z;
		scene.remove(enemies[enemyShipDown]);
		enemies[enemyShipDown].position.set(xExplosion,999,999);
		setTimeout(function(){enemyShipExplosion(enemyShipDown,xExplosion,zExplosion);},0);
		setTimeout(function(){enemyShipExplosion(enemyShipDown,xExplosion,zExplosion);},125);
		setTimeout(function(){enemyShipExplosion(enemyShipDown,xExplosion,zExplosion);},250);
		enemyStillAvailable[enemyShipDown] = false;
		//increment player's score
		var playerScore = document.getElementById("PlayerScore");
		var number = playerScore.innerHTML;
		number++;
		playerScore.innerHTML = number;
		var localHighScore = document.getElementById("highScore");
		var num2 = localHighScore.innerHTML;
		if(num2<number){localHighScore.innerHTML=number;}
		if(number%55==0){nextLevel();}
	}

	if(isPlayerHit()){
		setTimeout(function(){enemyShipExplosion(0,player.position.x,player.position.z);},0);
		setTimeout(function(){enemyShipExplosion(0,player.position.x,player.position.z);},125);
		setTimeout(function(){enemyShipExplosion(0,player.position.x,player.position.z);},250);
		//subtract from health
		var health = document.getElementById("Health");
		var number = health.innerHTML;
		number--;
		health.innerHTML = number;
		if(number==0){
			var score = document.getElementById("PlayerScore");
			var number = score.innerHTML;
			alert("You ran out of health!\nYour score was only " + number + " points :/ \nPress OK if you think you can beat it!");
			newGame();
		}
		if(enemyLaser.position.z>player.position.z+6){
			var score = document.getElementById("PlayerScore");
			var number = score.innerHTML;
			alert("You took to long!!\nYour score was only " + number + " points :/ \nPress OK if you think you can beat it!");
			newGame();
		}
	}
}

function enemyShipExplosion(index, x, z){
	var explosion = new THREE.Object3D();
	for(var i=0; i<50; i++){
		var temp = new THREE.Mesh(new THREE.BoxGeometry(0.5*sizeParameter,0.5*sizeParameter,0.5*sizeParameter), new THREE.MeshPhongMaterial({color:0x39FF14}));
		temp.position.set(10*Math.random()-5,7*Math.random()-3.5,7*Math.random()-3.5);
		explosion.add(temp);
	}
	explosion.position.set(x,0,z);
	setTimeout(function(){scene.add(explosion);},0);
	setTimeout(function(){scene.remove(explosion);},125);
}

function moveEnemies(){
	caseEnemy = caseEnemy % 240;
	var delta = 1;
	switch(true){
		case (caseEnemy < 60):
			for(var i=0; i<enemies.length;i++)
				enemies[i].translateX(delta);
			break;
		case(caseEnemy>=60 && caseEnemy<120):
			for(var i=0; i<enemies.length;i++)
				enemies[i].translateZ(delta/4);
			break;
		case(caseEnemy>=120 && caseEnemy<180):
			for(var i=0; i<enemies.length;i++)
				enemies[i].translateX(-delta);
			break;
		case(caseEnemy>=180):
			for(var i=0; i<enemies.length;i++)
				enemies[i].translateZ(-delta/4);
			break;
	}
	caseEnemy = caseEnemy + 4;
}

function resetLaser(){
	laser.position.set(player.position.x,player.position.y,player.position.z-3);
}

function resetEnemyLaser(){
	//choose which column to shoot the laser from
	enemyLaserIndex=-1;
	while(enemyLaserIndex<0){
		var choice =  Math.floor(Math.random()*11);

		//Just in case
		if(choice == 11){choice=10;}

		enemyLaserIndex = choice + 44 + 1;
		while(!enemyStillAvailable[enemyLaserIndex]){
			enemyLaserIndex = enemyLaserIndex - 11;
			if(enemyLaserIndex<11){break;}
		}
	}
	var xLaser = enemies[enemyLaserIndex].position.x;
	var zLaser = enemies[enemyLaserIndex].position.z;

	enemyLaser.position.set(xLaser,0,zLaser);
	enemyShooting=true;
}

//Returns -1 if nothing is hit or the index of the enemy spaceship that was hit
function isLaserTouchingHitbox(){
	hit = false;
	var xLaser = laser.position.x;
	var zLaser = laser.position.z;
	var xRight = xLaser + 0.45*sizeParameter;
	var xLeft = xLaser - 0.45*sizeParameter;
	var zUp = zLaser - 1.5*sizeParameter;
	var zDown = zLaser + 1.5*sizeParameter;
	for(var i=0; i<enemies.length; i++){
		var x = enemies[i].position.x;
		var z = enemies[i].position.z;

		var xEnemyRight = x + 5*sizeParameter;
		var xEnemyLeft = x - 5*sizeParameter;
		var zEnemyUp = z - 3.5*sizeParameter;
		var zEnemyDown = z + 3.5*sizeParameter;

		//There are 9 possible cases for a laser to tough an alien when thinking of an alien as a hit box
		// These 9 cases are bottom-left, bottom, bottom-right, middle-right, top-right, top, top-left, middle-left, and inside(should never be inside hopefully!)
		
		//bottom-left
		if(xLeft<=xEnemyLeft && xRight>=xEnemyLeft && zUp<=zEnemyDown && zDown>=zEnemyDown){
			hit=true;
			shooting=false;
			resetLaser();
			return i;
		//bottom
		}else if(xLeft>=xEnemyLeft && xRight<=xEnemyRight && zUp<=zEnemyDown && zDown>=zEnemyDown){
			hit=true;
			shooting=false;
			resetLaser();
			return i;
		//bottom-right
		}else if(xLeft<=xEnemyRight && xRight>=xEnemyRight && zUp<=zEnemyDown && zDown>=zEnemyDown){
			hit=true;
			shooting=false;
			resetLaser();
			return i;
		//middle-right
		}else if(xLeft<=xEnemyRight && xRight>=xEnemyRight && zUp>=zEnemyUp && zDown<=zEnemyDown){
			hit=true;
			shooting=false;
			resetLaser();
			return i;
		//top-right
		}else if(xLeft<=xEnemyRight && xRight>=xEnemyRight && zUp<=zEnemyUp && zDown>=zEnemyUp){
			hit=true;
			shooting=false;
			resetLaser();
			return i;
		//top
		}else if(xLeft>=xEnemyLeft && xRight<=xEnemyRight && zUp<=zEnemyUp && zDown>=zEnemyUp){
			hit=true;
			shooting=false;
			resetLaser();
			return i;
		//top-left
		}else if(xLeft<=xEnemyLeft && xRight>=xEnemyLeft && zUp<=zEnemyUp && zDown>=zEnemyUp){
			hit=true;
			shooting=false;
			resetLaser();
			return i;
		//middle-left
		}else if(xLeft<=xEnemyRight && xRight>=xEnemyLeft && zUp<=zEnemyUp && zDown>=zEnemyUp){
			hit=true;
			shooting=false;
			resetLaser();
			return i;
		//center
		}else if(xLeft>=xEnemyLeft && xRight<=xEnemyRight && zUp>=zEnemyUp && zDown<=zEnemyDown){
			hit=true;
			shooting=false;
			resetLaser();
			return i;
		}else
			continue;
		if(hit)
			break;
	}
	return -1;
}

function isPlayerHit(){
	var playerHit = false;
	var xLaser = enemyLaser.position.x;
	var zLaser = enemyLaser.position.z;
	var xRight = xLaser + 0.45*sizeParameter;
	var xLeft = xLaser - 0.45*sizeParameter;
	var zUp = zLaser - 1.5*sizeParameter;
	var zDown = zLaser + 1.5*sizeParameter;
	var x = player.position.x;
	var z = player.position.z;
	var xPlayerRight = x + 7.5*sizeParameter;
	var xPlayerLeft = x - 7.5*sizeParameter;
	var zPlayerUp = z - 3*sizeParameter;
	var zPlayerDown = z + 3*sizeParameter;

	//goes the same way as the isLaserTouchingHitbox() function
	//bottom-left
	if(xLeft<=xPlayerLeft && xRight>=xPlayerLeft && zUp<=zPlayerDown && zDown>=zPlayerDown){
		playerHit=true;
		enemyShooting=false;
		resetEnemyLaser();
		return playerHit;
	//bottom
	}else if(xLeft>=xPlayerLeft && xRight<=xPlayerRight && zUp<=zPlayerDown && zDown>=zPlayerDown){
		playerHit=true;
		enemyShooting=false;
		resetEnemyLaser();
		return playerHit;
	//bottom-right
	}else if(xLeft<=xPlayerRight && xRight>=xPlayerRight && zUp<=zPlayerDown && zDown>=zPlayerDown){
		playerHit=true;
		enemyShooting=false;
		resetEnemyLaser();
		return playerHit;
	//middle-right
	}else if(xLeft<=xPlayerRight && xRight>=xPlayerRight && zUp>=zPlayerUp && zDown<=zPlayerDown){
		playerHit=true;
		enemyShooting=false;
		resetEnemyLaser();
		return playerHit;
	//top-right
	}else if(xLeft<=xPlayerRight && xRight>=xPlayerRight && zUp<=zPlayerUp && zDown>=zPlayerUp){
		playerHit=true;
		enemyShooting=false;
		resetEnemyLaser();
		return playerHit;
	//top
	}else if(xLeft>=xPlayerLeft && xRight<=xPlayerRight && zUp<=zPlayerUp && zDown>=zPlayerUp){
		playerHit=true;
		enemyShooting=false;
		resetEnemyLaser();
		return playerHit;
	//top-left
	}else if(xLeft<=xPlayerLeft && xRight>=xPlayerLeft && zUp<=zPlayerUp && zDown>=zPlayerUp){
		playerHit=true;
		enemyShooting=false;
		resetEnemyLaser();
		return playerHit;
	//middle-left
	}else if(xLeft<=xPlayerRight && xRight>=xPlayerLeft && zUp<=zPlayerUp && zDown>=zPlayerUp){
		playerHit=true;
		enemyShooting=false;
		resetEnemyLaser();
		return playerHit;
	//center
	}else if(xLeft>=xPlayerLeft && xRight<=xPlayerRight && zUp>=zPlayerUp && zDown<=zPlayerDown){
		playerHit=true;
		enemyShooting=false;
		resetEnemyLaser();
		return playerHit;
	}else{
		return playerHit;
	}
}


function nextLevel(){
	//increase the level and difficulty
	var lvl = document.getElementById("currentLevel");
	var number = lvl.innerHTML;
	number++;
	lvl.innerHTML = number;
	enemyLaserSpeed += 1;

	//reinitialize global variables
	enemySpaceParts = [];
	enemyStillAvailable = [];
	enemies = [];
	shooting=false;
	enemyShooting=false;
	hit=false;
	
	//make new enemies
	for(var i=0; i<55; i++){
		enemies.push(new THREE.Object3D());
		enemySpaceParts=[];
		createEnemySpaceShip();
		for(var j=0; j<enemySpaceParts.length; j++){
			enemies[i].add(enemySpaceParts[j]);
		}
	}

	positionEnemies();
	for(var i=0; i<enemies.length; i++){
		scene.add(enemies[i]);
		enemyStillAvailable.push(true);
	}
	resetLaser();
	resetEnemyLaser();
	caseEnemy=0;
	startRendering=false;
}

function newGame(){
	//Back to lvl 1
	var lvl = document.getElementById("currentLevel");
	lvl.innerHTML = 1;
	//Reset Health
	var health = document.getElementById("Health");
	health.innerHTML = 10;
	//Reset Score
	var score = document.getElementById("PlayerScore");
	score.innerHTML = 0;

	//remove all enemies and their lasers
	for(var i=0; i<enemies.length;i++)
		scene.remove(enemies[i]);

	//reinitialize global variables
	enemySpaceParts = [];
	enemyStillAvailable = [];
	enemies = [];
	shooting=false;
	enemyShooting=false;
	hit=false;

	//make new enemies
	for(var i=0; i<55; i++){
		enemies.push(new THREE.Object3D());
		enemySpaceParts=[];
		createEnemySpaceShip();
		for(var j=0; j<enemySpaceParts.length; j++){
			enemies[i].add(enemySpaceParts[j]);
		}
	}

	positionEnemies();
	for(var i=0; i<enemies.length; i++){
		scene.add(enemies[i]);
		enemyStillAvailable.push(true);
	}
	resetLaser();
	resetEnemyLaser();
	caseEnemy=0;
	//startRendering = false;
}

function toggleInstructions(){
	var e = document.getElementById("HELP");
	if(e.style.display != 'none')
		e.style.display = 'none';		
	else
		e.style.display = 'inline';
		
}
