function addEventListeners(){
	window.document.addEventListener("keydown", keyIsPressed);
	window.document.addEventListener("keyup", keyIsReleased);
	window.addEventListener("resize", onWindowResize);
}

function onWindowResize(event){
	var canvasWidth = window.innerWidth-24;
	var canvasHeight = window.innerHeight-130-12;
	var aspectRatio = canvasWidth/canvasHeight;
	renderer.setSize(canvasWidth,canvasHeight);
	camera.aspect = aspectRatio;
	camera.updateProjectionMatrix();
}

function keyIsPressed(event){
	switch(event.keyCode){
		case 37: //Left
			moveLeft=true;break;
		case 38: //Up
			moveUp=true;break;
		case 39: //Right
			moveRight=true;break;
		case 40: //Down
			moveDown=true;break;
		case 32: //Space
			if(shooting)
				break;
			resetLaser();
			shooting=true;
			break;
		case 13: //Enter starts the game
			startRendering=true;toggleInstructions();break;
		case 72: //H for Help
			toggleInstructions();break;
		case 80: //P for pause
			if(startRendering){startRendering=false;}
			else{startRendering=true;}break;
	}
	if(event.shiftKey){//capital N
		if(event.keyCode==78)
			newGame();
	}
}

function keyIsReleased(event){
	switch(event.keyCode){
		case 37: //Left
			moveLeft=false;break;
		case 38: //Up
			moveUp=false;break;
		case 39: //Right
			moveRight=false;break;
		case 40: //Down
			moveDown=false;break;
	}
}

