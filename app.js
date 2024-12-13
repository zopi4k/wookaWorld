import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// Sélection des éléments HTML
const loadingContainer = document.getElementById('loading-container');
const progressBar = document.getElementById('progress-bar');
const loadingText = document.getElementById('loading-text');

// Fonction pour mettre à jour la progression
function updateProgress(loaded, total) {
    const progress = (loaded / total) * 100;
    progressBar.style.width = `${progress}%`;
    loadingText.textContent = `Loading... ${Math.round(progress)}%`;
    if (loaded === total) {
        setTimeout(() => {
            loadingContainer.style.display = 'none'; // Cacher la barre de chargement une fois terminé
        }, 500);
    }
}
// Gestionnaire de chargement global
const manager = new THREE.LoadingManager(
    () => {
        console.log('Chargement terminé');
    },
    (item, loaded, total) => {
        updateProgress(loaded, total);
    },
    (url) => {
        console.error(`Erreur lors du chargement : ${url}`);
    }
);



let fpsInfo = true
let infoDiv = false
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0
if(fpsInfo){
 infoDiv = document.createElement('div');
infoDiv.style.position = 'absolute';
infoDiv.style.top = '50px';
infoDiv.style.left = '10px';
infoDiv.style.color = 'white';
infoDiv.style.background = 'rgba(0, 0, 0, 0.5)';
infoDiv.style.padding = '5px';
infoDiv.style.fontFamily = 'Arial';
infoDiv.style.fontSize = '12px';
document.body.appendChild(infoDiv);


}
function updateRendererInfo() {
    if(fpsInfo && infoDiv){
    const info = renderer.info;
    infoDiv.innerHTML = `
        FPS: ${fps}       
    `;

    const now = performance.now();
    frameCount++;
    if (now - lastFrameTime >= 1000) { 
        fps = frameCount;
        frameCount = 0;
        lastFrameTime = now;
    }
}
}












// Modifier une donnée
let id_User = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

function change(parm){
    fetch('./db/update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(parm)
    })
    .then(response => response.json())
    .then(data => onChange(data));
}
let tabPlayerActifDB=[]
let tabActionDB= []
let tabAimation = []
let objetAction = {}
let infoObjetDB = {}
let tabPlayerActifWorld=[]
let timeStampServer = false


function onChange(data){
    if (Object.values(data).length >1) {
        tabPlayerActifDB=[]
        tabActionDB =[]
        infoObjetDB = {}
        tabAimation = []
        Object.values(data).forEach(value => {
            infoObjetDB[value.id] = {}
            if(value.type){infoObjetDB[value.id].type = value.type}
            if(value.etat){infoObjetDB[value.id].etat = value.etat}
            if(value.name_3D){infoObjetDB[value.id].name_3D = value.name_3D}
            if(value.timeLimit){infoObjetDB[value.id].timeLimit = value.timeLimit}
            if(value.timestamp){infoObjetDB[value.id].timestamp = value.timestamp}
            if(value.linkAction){infoObjetDB[value.id].linkAction = value.linkAction}
            if(value.linkCopie){infoObjetDB[value.id].linkCopie = value.linkCopie}
            if(value.animation){infoObjetDB[value.id].animation = value.animation; tabAimation.push(value.id)}
            if(world3D){
                world3D.visible = true
               
            // connaitre si c'est objet
            if(value.type == "action"){
                tabActionDB.push(value)
                if(value.etat == "1" && objetAction[value.id]!= "1" ){
                    

                    if(objetAction[value.id] == undefined){

                        //------------ premiere foix qu'il est appeler = replacer les animations sans le play
                        gotoAndStopAtEnd(value.id,"1");
                        if(value.linkAction){
                            gotoAndStopAtEnd(value.linkAction,"1");
                        }
                    }else{
                         playAnimationByName(value.id,"1");
                  
                        if(value.linkAction){
                            playAnimationByName(value.linkAction,"1");
                        }
                    }
                  

                     objetAction[value.id] = "1";
                }else if(value.etat == "0" && objetAction[value.id]!= "0"){
                  

                    if(objetAction[value.id] == undefined){

                        gotoAndStopAtEnd(value.id,"0");
                        if(value.linkAction){
                            gotoAndStopAtEnd(value.linkAction,"0");
                        }
                    }else{
                        playAnimationByName(value.id,"0");
                        
                        if(value.linkAction){
                            playAnimationByName(value.linkAction,"0");
                        }
                    }
                    
                    objetAction[value.id] = "0";
                 }
                 if(value.timeLimit){
                    let compteurSwitch =  (Number(value.timestamp) + Number(value.timeLimit))- Number(timeStampServer)
                    if(value.etat == "1" && compteurSwitch<0){
                        change({type:"action",id:value.id,etat:"0"});
                    }
                 }
            }
            //-- connaitre si c'est un joueur
            if(value.type == "player"){
                tabPlayerActifDB.push(value)
            }
            //-- ajouter notre personage si on le trouve
            if(value.type == "player" && value.id==id_User && tabPlayerActifWorld.length==0){
                //tabPlayerActifWorld.push(value)
                timeStampServer = value.timestamp
            }
        }
        });

        //-------- mettre a jour la liste des joueurs
        let clone_tabPlayerActifWorld = tabPlayerActifWorld
        for(let i = 0; i<tabPlayerActifWorld.length;i++){
            let findPlayerActif = false
            for(let a = 0; a<tabPlayerActifDB.length;a++){
                if(tabPlayerActifDB[a].id == tabPlayerActifWorld[i].id){
                    if(tabPlayerActifDB[a].id == id_User){
                        timeStampServer = tabPlayerActifDB[a].timestamp
                    }
                    findPlayerActif = true
                    //---- metre a jour le joueur
                    tabPlayerActifWorld[i].x = tabPlayerActifDB[a].x
                    tabPlayerActifWorld[i].y= tabPlayerActifDB[a].y
                    tabPlayerActifWorld[i].z= tabPlayerActifDB[a].z
                    tabPlayerActifWorld[i].rotX= tabPlayerActifDB[a].rotX
                    tabPlayerActifWorld[i].rotY= tabPlayerActifDB[a].rotY
                }
            }
            if(!findPlayerActif &&  tabPlayerActifWorld[i].id != id_User){
                //----------- player suprimé
                WookaUser.remove(tabPlayerActifWorld[i].obj3D)
                clone_tabPlayerActifWorld.splice(i,1)
            }
        }      
      

        for(let a = 0; a<tabPlayerActifDB.length;a++){
            let findPlayerNew = true
            for(let i = 0; i<tabPlayerActifWorld.length;i++){
                if(tabPlayerActifDB[a].id == tabPlayerActifWorld[i].id){
                    findPlayerNew = false
                }
            }
            if(findPlayerNew){
                    //----------- nouveau joueur arrivé
                    createPlayer(tabPlayerActifDB[a])
            }
        }

    }else{
       console.log("bigbug") 
    }

}

function animations(){
    if(tabAimation.length>0){
        for (let i = 0; i < tabAimation.length; i++) {
          let obj3D = findObjectByName(world3D, infoObjetDB[tabAimation[i]].name_3D);
          if(infoObjetDB[tabAimation[i]].animation){
            let anim_pose_Final = Number(infoObjetDB[tabAimation[i]].etat)
            //init si 0
            if(obj3D[infoObjetDB[tabAimation[i]].animation.split("_")[0]][infoObjetDB[tabAimation[i]].animation.split("_")[1]] == 0){
                obj3D[infoObjetDB[tabAimation[i]].animation.split("_")[0]][infoObjetDB[tabAimation[i]].animation.split("_")[1]] = anim_pose_Final
            }
            //animation de l'objet en etat "animation"
            obj3D[infoObjetDB[tabAimation[i]].animation.split("_")[0]][infoObjetDB[tabAimation[i]].animation.split("_")[1]] -=  (obj3D[infoObjetDB[tabAimation[i]].animation.split("_")[0]][infoObjetDB[tabAimation[i]].animation.split("_")[1]] - anim_pose_Final)/10
        }
        }
    }
}
function findObjectByName(scene, name) {
    if (scene.name === name) {
        return scene;
    }

    for (let child of scene.children) {
        const result = findObjectByName(child, name);
        if (result) {
            return result;
        }
    }

    return null;
}



// Initialiser Three.js
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);//75
const null1 = new THREE.Object3D();
const null2 = new THREE.Object3D();
null2.add(camera);
null1.add(null2);
// Position initiale de la camera
camera.position.set(0, 0, 0);
scene.add(null1);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap

document.body.appendChild(renderer.domElement);
let texture_SkyBox = ""
const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(10, 15, 20)
light.castShadow = true;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.bias = -0.0005; 
light.shadow.camera.left = -10*3;
light.shadow.camera.right = 10*3;
light.shadow.camera.top = 10*3;
light.shadow.camera.bottom = -10*3;
scene.add(light);











//scene.add(new THREE.CameraHelper(light.shadow.camera))

const loaderSB = new THREE.CubeTextureLoader(manager);
const environmentMap = loaderSB.load([
    './sb/left.jpeg', 'sb/right.jpeg', 'sb/top.jpeg', 'sb/buttom.jpeg','sb/back.jpeg','sb/front.jpeg'
],
(texture) => {
    texture_SkyBox = texture
    scene.environment = environmentMap;
},
(xhr) => {
 
},
(error) => {
    console.error('An error happened', error);
});





function createPlayer(elm){
     //---- cloner le wooka pour le joueur actif
    const wookaClone = objet3DWorld_Wooka.clone(true); 
    if(elm.id!=id_User){
        wookaClone.visible = true;
        wookaClone.scale.set(scaleWolrd, scaleWolrd, scaleWolrd);
    }
    const WookaUser1 = new THREE.Object3D();
    WookaUser1.add(wookaClone);
    WookaUser1.idUser = elm.id  
    WookaUser.add(WookaUser1);
    elm.obj3D = WookaUser1
    elm.obj3D_2 = wookaClone
    elm.oldPosX = elm.x
    elm.oldPosY = elm.y
    elm.oldPosZ = elm.z
    elm.oldRotX = elm.rotX
    elm.oldRotY = elm.rotY
    tabPlayerActifWorld.push(elm)
   
}
function movPlayer(){
    if(world3D && tabPlayerActifWorld.length>0){
        for(let i = 0; i<tabPlayerActifWorld.length;i++){


            let MoveYFind_
            // Créer un rayon pour le raycasting
            const raycaster = new THREE.Raycaster();
            // Mettre à jour le rayon
            const origin = new THREE.Vector3(tabPlayerActifWorld[i].oldPosX,tabPlayerActifWorld[i].oldPosY+2,tabPlayerActifWorld[i].oldPosZ );
            const direction = new THREE.Vector3(0, -1, 0).normalize();
            raycaster.set(origin, direction);
            const intersects = raycaster.intersectObjects([world3D]);
            if (intersects.length > 0) {
                let distPoint =0
                let tabUp = []
                for( let a = 0 ; a<intersects.length  ; a++){
                    distPoint = Math.floor(tabPlayerActifWorld[i].oldPosY - (intersects[a].point.y))
                    if(distPoint>=-2 && distPoint<=2){
                        if(intersects[i].object.name.split("_")[0] != "billboard"){
                        MoveYFind_ = intersects[a].point.y
                        tabUp.push(MoveYFind_)
                        }
                    }else{
                        MoveYFind_ = tabPlayerActifWorld[i].y
                        tabUp.push(MoveYFind_)
                    }
                }
                MoveYFind_ = tabUp[0]
            }
           

           
            tabPlayerActifWorld[i].oldPosX -= (tabPlayerActifWorld[i].oldPosX - Number(tabPlayerActifWorld[i].x))/20         
            tabPlayerActifWorld[i].oldPosY -= (tabPlayerActifWorld[i].oldPosY - MoveYFind_)/2
            tabPlayerActifWorld[i].oldPosZ -= (tabPlayerActifWorld[i].oldPosZ - Number(tabPlayerActifWorld[i].z))/20
            
            tabPlayerActifWorld[i].oldRotX -= (tabPlayerActifWorld[i].oldRotX - Number(tabPlayerActifWorld[i].rotX))/20
            tabPlayerActifWorld[i].oldRotY -= (tabPlayerActifWorld[i].oldRotY - Number(tabPlayerActifWorld[i].rotY))/20

      
            tabPlayerActifWorld[i].obj3D.position.set(tabPlayerActifWorld[i].oldPosX , tabPlayerActifWorld[i].oldPosY,tabPlayerActifWorld[i].oldPosZ )
    
             
            tabPlayerActifWorld[i].obj3D.rotation.set(0,tabPlayerActifWorld[i].oldRotX,0)
            tabPlayerActifWorld[i].obj3D_2.rotation.set(tabPlayerActifWorld[i].oldRotY,0,0)

        }
    }
}







function isLightVisible() {
if(world3D){
    let worldLightPosition, direction, angle, setVisible;
    let worldCameraPosition = new THREE.Vector3();
    camera.getWorldPosition(worldCameraPosition);
    let cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection); 
    for(let i = 0 ; i<Elm3DWorld.length ; i++){
        worldLightPosition = new THREE.Vector3();
        Elm3DWorld[i].getWorldPosition(worldLightPosition);
    
        // Calculer le vecteur directionnel entre l'objet et la caméra
        direction = new THREE.Vector3().subVectors(worldLightPosition, worldCameraPosition).normalize();
    
        // Calculer l'angle entre la direction de la caméra et la direction de l'objet
        angle = direction.angleTo(cameraDirection); // Retourne l'angle en radians
    
        // Définir la visibilité selon le champ de vision de la caméra
        setVisible = angle < (120/ 2) * (Math.PI / 180);
        Elm3DWorld[i].visible = setVisible;
      
    }

   
}

 

}











// Charger le modele 3D
const loader = new GLTFLoader(manager);
let world3D = false
let animWorld = false
let tabAnimWorld = false
let mixersAnims = false
let objet3DWorld_Wooka =false
let WookaUser = new THREE.Group();
let scaleWolrd = 1
let Elm3DWorld = []
let Elm3DBillBoard = []
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( './01700/libs/draco/' );
loader.setDRACOLoader( dracoLoader );
loader.load('world.glb', function (gltf) {
    world3D =gltf.scene
    world3D.visible = false;
    
    world3D.scale.set(scaleWolrd, scaleWolrd,scaleWolrd);
    objet3DWorld_Wooka = world3D.getObjectByName('wooka');
    objet3DWorld_Wooka.visible = false;
    objet3DWorld_Wooka.scale.set(0, 0, 0);
    scene.add(WookaUser);
    //---- shadows
    world3D.traverse((child) => {
        if(child.isMesh){
            if(child.name.split("_")[0]  == "billboard"){
                child.castShadow = false
                child.receiveShadow = false
            }else{
                child.castShadow = true
                child.receiveShadow = true
            }
            
            if(child.material.name == "void"){
                child.visible = false
            }
        }
        if (child.isLight) {
           Elm3DWorld.push(child)
            child.distance = 3;
            child.shadow.radius = 3;
            child.castShadow = true;
            child.shadow.bias = -0.0005;      
        }
    })
    scene.add(world3D);
    // Access the animation
    if (gltf.animations.length > 0) {
        animWorld = new THREE.AnimationMixer(world3D);
        tabAnimWorld = gltf.animations
        mixersAnims = []
        for(let i=0;i<tabAnimWorld.length;i++){

            if(tabAnimWorld[i].name.split("_")[0] == "loop" ){
                animWorld.clipAction(tabAnimWorld[i]).play();
            }else{
                animWorld.clipAction(tabAnimWorld[i])
            }
        }   
    }

    // Créer un rayon pour le raycasting
    const raycaster = new THREE.Raycaster();
    // Mettre à jour le rayon
    const origin = new THREE.Vector3(0,hauteur_decalCam,0 );
    const direction = new THREE.Vector3(0, -1, 0).normalize();
    raycaster.set(origin, direction);
    const intersects = raycaster.intersectObjects([world3D]);
    if (intersects.length > 0) {
        //----- placer la cam sur le terrain
        null1.position.set( 0,intersects[0].point.y+hauteur_decalCam,0 );
        hauteurCam = MoveY = getOldMoveY =intersects[0].point.y
    }

    link_obj()
    initBillBoard()
},
(xhr) => {
},
(error) => {
    console.error('An error happened', error);
} );

function link_obj(){
    let sol = world3D.getObjectByName('sol');
    for(let i = 0 ; i< sol.children.length ; i++){
        if(sol.children[i].name.split("_")[1]  == "arbre"){
           clone3D('loop_arbre',sol.children[i])
        }
        if(sol.children[i].name.split("_")[1]  == "herbe"){
            clone3D('loop_herbe',sol.children[i])
        }
    }
}
//-------------------- Cloner 3D
function clone3D(getObjet,getCible){
    let obj_1 = world3D.getObjectByName(getObjet);
    obj_1.scale.set(0, 0, 0);
    let elm3D = obj_1.clone(true);
    elm3D.scale.set(1, 1, 1);
    getCible.add(elm3D);
    // Créer un AnimationMixer pour le clone
    const mixerClone = new THREE.AnimationMixer(elm3D);
    const clips = tabAnimWorld.filter((clip) => clip.name.includes(getObjet));
    if (clips.length > 0) {
        const action = mixerClone.clipAction(clips[0]); // Utilisez la première animation liée à l'arbre
        action.play();
    }
    mixersAnims.push(mixerClone);
}

function initBillBoard(){
    scene.traverse((child) => {
        if(child.isMesh){
            if(child.name.split("_")[0]  == "billboard"){
                Elm3DBillBoard.push(child)


                // Supposons que 'object' est votre Mesh avec une texture déjà appliquée.
                const texture = child.material.map; // Récupérer la texture de l'ancien matériau

                // Créer un nouveau matériau MeshBasicMaterial
                const basicMaterial = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true, // Pour supporter les textures avec transparence
                    alphaTest: 0.5,    // Facultatif : pour éviter les artefacts sur les zones transparentes
                });

                // Appliquer le nouveau matériau à l'objet
                child.material = basicMaterial;

            }
        }
    })
}

function orientationBillBoard(){
    const cameraWorldPosition = new THREE.Vector3();
    camera.getWorldPosition(cameraWorldPosition);
    Elm3DBillBoard.forEach((billboard) => {
        const objectWorldPosition = new THREE.Vector3();
        billboard.getWorldPosition(objectWorldPosition);
        billboard.lookAt(cameraWorldPosition);
    });
}






let hauteurCam = 0
let hauteur_decalCam = scaleWolrd
let MoveY = 0
let MoveYFind = false
let setOut = false
function hauterCamera() {
    if( world3D ){
        // Créer un rayon pour le raycasting
        const raycaster = new THREE.Raycaster();
        // Mettre à jour le rayon
        const origin = new THREE.Vector3(null1.position.x,null1.position.y+hauteur_decalCam*2,null1.position.z );
        const direction = new THREE.Vector3(0, -1, 0).normalize();
        raycaster.set(origin, direction);
        const intersects = raycaster.intersectObjects([world3D]);
        if (intersects.length > 0) {
            let distPoint =0
            setOut = false
            MoveYFind = false
            let tabUp = []
            for( let i = 0 ; i<intersects.length  ; i++){
                distPoint = Math.floor(null1.position.y - (intersects[i].point.y+hauteur_decalCam))
               if(distPoint>=-2 && distPoint<=2){

                if(intersects[i].object.name.split("_")[0] != "billboard"){
                    MoveYFind = intersects[i].point.y
                    tabUp.push(intersects[i].point.y)
                }
                    if(intersects[i].object.material.name == "void"){
                        setOut= true
                    }
                }              
            }
            if(MoveYFind){
                MoveY = tabUp[0]
            }else{
                setOut= true
            }
            

        }else{
            setOut = true
     
          
             //null1.position.set(MoveX,MoveY+2,MoveZ)
        }
    }
}



// Variables pour gerer les mouvements de souris et touch
let isDragging = false;
let isOut = false;
let isRightBtn = false;
let isLeftBtn = false;
let isCentertBtn = false;
let lastMousePosition = { x: 0, y: 0 };
let touchStartPos = 0;
let isMoving = false

// -----------------------------------------------------------------------    Gestion des evenements de souris


//---------------------------- clic droit
renderer.domElement.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    isRightBtn = false
});
renderer.domElement.addEventListener('mousedown', (event) => {
    if (event.button === 2) { 
        event.preventDefault(); 
        isRightBtn = true
    }
});


const raycasterClick = new THREE.Raycaster();
const mouseClick = new THREE.Vector2();
function chekCklic (event){
    if(isMoving){

    }else{

        // Calcul des coordonnées de la souris (normalisées entre -1 et 1)
        mouseClick.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouseClick.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Obtenir la position de la caméra dans l'espace mondial
        const cameraWorldPosition = new THREE.Vector3();
        camera.getWorldPosition(cameraWorldPosition);

        // Créer un nouveau vecteur direction à partir des coordonnées normalisées de la souris
        const mouseVector = new THREE.Vector3(mouseClick.x, mouseClick.y, 0.5);
        mouseVector.unproject(camera);

        // Obtenir le vecteur direction
        const cameraWorldDirection = mouseVector.sub(cameraWorldPosition).normalize();

        // Mettre à jour le Raycaster avec la position et la direction de la caméra
        raycasterClick.set(cameraWorldPosition, cameraWorldDirection);

        // Intersections avec les objets de la scène
        const intersects = raycasterClick.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            const intersection = intersects[0];
            /*console.log('Intersection:', intersection);
            console.log('Intersection:', intersection.object.material.name);
            console.log("Distance: " + intersection.distance);*/
            if(intersection.distance <7){
                ClickObject(intersection)
            }

        } else {
            console.log('Aucun objet détecté.');
        }
    }
}


function ClickObject (elm){



    if( elm.object.name.split('_')[0] == "action" ){
         //---- recupérer le nom
        let getNameElm = elm.object.name.split("_")[1] 
        //--- verifier son type
        let getType = infoObjetDB[getNameElm].type
   
        if(getType == "action"){
            let getAnim = ""
            if(  infoObjetDB[getNameElm].linkAction ){
                    let get_anim = ""
                    //---- savoir si l'animation se joue
                    if(findClipByName(infoObjetDB[getNameElm].linkAction)){
                        get_anim = findClipByName(infoObjetDB[getNameElm].linkAction)
                    }
                    //---- connaitre quel anime serais en cours
                    if(findClipByName(infoObjetDB[getNameElm].linkAction+"_"+objetAction[getNameElm])){
                        get_anim = findClipByName(infoObjetDB[getNameElm].linkAction+"_"+objetAction[getNameElm])
                    }
                    getAnim = animWorld.clipAction(get_anim);
            }else{
                    //---- savoir si l'animation se joue
                    getAnim = animWorld.clipAction(findClipByName(getNameElm+"_"+objetAction[getNameElm]));
            }
            if(getAnim.time >= 0 && getAnim.time < getAnim.getClip().duration){
                    
            }else{
                for(var i =0; i < tabActionDB.length;i++){
                    if(tabActionDB[i].id == elm.object.name.split("_")[1] ){
                        if(tabActionDB[i].etat == "0"){
                            if(tabActionDB[i].linkCopie){
                                change({id:tabActionDB[i].linkCopie,etat:"1"});
                            }
                            change({id:elm.object.name.split("_")[1],etat:"1"});
                        }else{
                            if(tabActionDB[i].linkCopie){
                                change({id:tabActionDB[i].linkCopie,etat:"0"});
                            }
                            change({id:elm.object.name.split("_")[1],etat:"0"});
                        }
                    }   
                }
            }
        }

        if(getType == "bouton"){
           change({id:infoObjetDB[getNameElm].linkAction,etat:Number(infoObjetDB[infoObjetDB[getNameElm].linkAction].etat)+Number(infoObjetDB[getNameElm].etat)});
        }
        if(getType == "lien"){
            if(elm.object.material.name.split("_")[1]){
                window.open(elm.object.material.name.split("_")[1], "_blank");
            }
        }


    }

}

function findClipByName(name) {
    return tabAnimWorld.find(clip => clip.name === name);
}

function playAnimationByName(_name,_action) {
    // Recherchez l'action correspondant à l'animation par son nom
    const action = animWorld.clipAction(findClipByName(_name+"_"+_action));
    if (action) {
        // Arrêtez toutes les autres animations en cours pour éviter des conflits
       //animWorld.stopAllAction();
       animWorld.clipAction(findClipByName(_name+"_0")).stop()
       animWorld.clipAction(findClipByName(_name+"_1")).stop()
       // Configurez l'action pour ne pas se répéter
       action.setLoop(THREE.LoopOnce);
       // Définissez une fonction à appeler lorsque l'animation est terminée
       action.clampWhenFinished = action.stop();
        // Jouez l'action trouvée 
        action.play();
    } else {
        console.warn(`Animation non trouvée.`);
    }
}

function gotoAndStopAtEnd(_name,_action){
     // Recherchez l'action correspondant à l'animation par son nom
     const action = animWorld.clipAction(findClipByName(_name+"_"+_action));
     if (action) {
         // Arrêtez toutes les autres animations en cours pour éviter des conflits
        //animWorld.stopAllAction();
        animWorld.clipAction(findClipByName(_name+"_0")).stop()
        animWorld.clipAction(findClipByName(_name+"_1")).stop()
        //
        
        action.reset(); // Réinitialise l'action
        action.time = action.getClip().duration;
        action.paused = true; // Empêche la lecture
        action.play(); 
     } else {
        console.warn(`Animation non trouvée.`);
    }
}


//------------------------------ clic gauche
renderer.domElement.addEventListener('mousedown', function (event) {
    isDragging = true;
    isMoving = false
    if (event.button === 0) { 
        isLeftBtn = true;
    }
    if (event.button === 1) { 
        isCentertBtn = true;
    }
    lastMousePosition.x = event.clientX;
    lastMousePosition.y = event.clientY;
});

renderer.domElement.addEventListener('mouseup', (event) => {
    isDragging = false;
    if (event.button === 0)  { 
        isLeftBtn = false;
    }
    if (event.button === 1) { 
        isCentertBtn = false;
    }
    chekCklic(event)
});

renderer.domElement.addEventListener('mouseleave', (event) => {
    isOut = true;
});

renderer.domElement.addEventListener('mousemove', function (event) {

    if (isOut) {isMoving=false; isOut= false ; isDragging = false ; isRightBtn = false; return; }

   if (isDragging){
    isMoving = true
    const deltaX = event.clientX - lastMousePosition.x;
    const deltaY = event.clientY - lastMousePosition.y;
    lastMousePosition.x = event.clientX;
    lastMousePosition.y = event.clientY;

    if(isLeftBtn){
        moveCam( false ,0,1,  -deltaY/5 )
    }

    if(isRightBtn || isLeftBtn || isCentertBtn) {
        // Tourner la camera horizontalement
        null1.rotation.y -= deltaX * 0.005;
        
    }

    if(isRightBtn ||isCentertBtn ){
        // Basculer la camera verticalement
        null2.rotation.x -= deltaY * 0.01;
        if (null2.rotation.x < -Math.PI / 2) null2.rotation.x = -Math.PI / 2;
        if (null2.rotation.x > Math.PI / 4) null2.rotation.x = Math.PI / 4;
    }
   }
});

let velocity = new THREE.Vector3();
let getOldPosX = 0
let getOldPosY = 0
let getOldPosZ = 0
let getOldMoveX = 0
let getOldMoveY = 0
let getOldMoveZ = 0
let MoveX = 0
let MoveZ = 0

function moveCam(_deltaY,_setX,_setZ,_vitesse ){
    let moveDistance = 0
    if(_deltaY) {
        moveDistance = -Math.sign(_deltaY) * _vitesse;
    }else{
        moveDistance = _vitesse;
    }
    const forwardVector = new THREE.Vector3(_setX, 0, _setZ); 
    forwardVector.applyQuaternion(null1.quaternion); 
    getOldPosX = null1.position.x
    getOldPosY = null1.position.y
    getOldPosZ = null1.position.z
    null1.position.add(forwardVector.multiplyScalar(moveDistance));

    MoveX = null1.position.x
    MoveZ = null1.position.z
    null1.position.set( getOldPosX, getOldPosY, getOldPosZ) 
}

renderer.domElement.addEventListener('wheel', function (event) {
    moveCam( event.deltaY , 0,-1,  2.5)
});

function updateCameraPosition() {
    
        getOldMoveX = getOldPosX
        getOldMoveZ = getOldPosZ
        getOldMoveY = hauteurCam
        getOldPosX -= (getOldPosX - MoveX)/10
        getOldPosZ -= (getOldPosZ - MoveZ)/10 
        hauteurCam -= (hauteurCam- MoveY)/3

        null1.position.set( getOldPosX, hauteurCam+hauteur_decalCam, getOldPosZ) 
        hauterCamera()
        if(setOut){
            
            getOldPosX = MoveX = getOldMoveX
            getOldPosZ = MoveZ = getOldMoveZ
            hauteurCam = MoveY = getOldMoveY
            null1.position.set( getOldPosX, hauteurCam+hauteur_decalCam, getOldPosZ) 
        }
       
       



   if (moveLeft && !keyShift)  null1.rotation.y += 0.03;
   if (moveRight && !keyShift)  null1.rotation.y -= 0.03;
   if (moveForward && keyShift) {
        null2.rotation.x += 0.03;
        if (null2.rotation.x > Math.PI / 4) null2.rotation.x = Math.PI / 4;
   }
   if (moveBackward && keyShift) {
        null2.rotation.x -= 0.03;
        if (null2.rotation.x < -Math.PI / 2) null2.rotation.x = -Math.PI / 2;
  }

  if (moveForward && !keyShift) {
    moveCam( false, 0,-1, 1)
  }

  if (moveBackward && !keyShift) {
    moveCam( false, 0,-1, -1)
  }

  if (moveLeft && keyShift) {
    moveCam( false, -1,0, 1)
  }

  if (moveRight && keyShift) {
    moveCam( false, -1,0, -1)
  }
    
    // Ajoutez ici votre logique pour ajuster la position de la camera
    // Par exemple, utilisez un raycast pour detecter si la camera touche le sol
}

// Variables pour stocker les mouvements
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let keyShift = false;
let keySpace = false;
function onKeyDown(event) {
    switch (event.code) {
        case 'ArrowUp':
            moveForward = true;
            break;
        case 'ArrowDown':
            moveBackward = true;
            break;
        case 'ArrowLeft':
            moveLeft = true;
            break;
        case 'ArrowRight':
            moveRight = true;
            break;
        case 'ShiftLeft':
            keyShift = true;
            break;
        case 'ShiftRight':
            keyShift = true;
            break;
        case 'Space':
            keySpace = true;
            break;
    }
}
function onKeyUp(event) {
    switch (event.code) {
        case 'ArrowUp':
            moveForward = false;
            break;
        case 'ArrowDown':
            moveBackward = false;
            break;
        case 'ArrowLeft':
            moveLeft = false;
            break;
        case 'ArrowRight':
            moveRight = false;
            break;
        case 'ShiftLeft':
            keyShift = false;
            break;
        case 'ShiftRight':
            keyShift = false;
            break;
        case 'Space':
            keySpace = false;
            break;
    }
}
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);









// --------------------------------------------------------- Gestion des evenements de touch
renderer.domElement.addEventListener('touchstart', function (event) {
    isDragging = true;
    if (event.touches.length === 2) {
        touchStartPos = 2;
        return;
    }
    if (event.touches.length === 1) {
        touchStartPos = 1;
    }
    lastMousePosition.x = event.touches[0].clientX;
    lastMousePosition.y = event.touches[0].clientY;
});
renderer.domElement.addEventListener('touchend', function(event) {
        isDragging = false;
        chekCklic(event)
});
renderer.domElement.addEventListener('touchmove', function (event) {
    event.preventDefault();
    const deltaX = event.touches[0].clientX - lastMousePosition.x;
    const deltaY = event.touches[0].clientY - lastMousePosition.y;
    lastMousePosition.x = event.touches[0].clientX;
    lastMousePosition.y = event.touches[0].clientY;
    if (touchStartPos == 2 && event.touches.length === 2) {
        null1.rotation.y -= deltaX * 0.003;
        null2.rotation.x -= deltaY * 0.003;
        if (null2.rotation.x < -Math.PI / 2) null2.rotation.x = -Math.PI / 2;
        if (null2.rotation.x > Math.PI / 4) null2.rotation.x = Math.PI / 4;
    }else{
        if( touchStartPos == 1){
            moveCam( false ,0,1, -deltaY/10 )
             null1.rotation.y -= deltaX * 0.003;
             isDragging= true
        }
    }

}, { passive: false });


let timeDB = 0

function checkTimeDB(){
    timeDB++
    if(timeDB==25){
        timeDB = 0
        change({type:"player",id:id_User,x:null1.position.x,y:null1.position.y,z:null1.position.z,rotX:null1.rotation.y,rotY:null2.rotation.x});
    }
}
// Boucle de rendu 
const clock = new THREE.Clock();
function animate() {
   //if(window.innerHeight>1000 && window.innerHeight>window.innerWidth && fps<35){
       // renderer.setPixelRatio(0.3);
    //}else{
        
let fps_ = 1
if(fps<60){
    fps_ = (fps+30)/100
}
 renderer.setPixelRatio(fps_);


    //}
   checkTimeDB();
   
   if(animWorld){
    updateCameraPosition();
     animations()
    movPlayer()
    const delta = clock.getDelta();
    animWorld.update(delta); //0.016 Update the mixer with a fixed delta time (16ms)
    //-------------------- Cloner 3D
    for (let index = 0; index < mixersAnims.length; index++) {
        mixersAnims[index].update(delta)
    }
    orientationBillBoard()
   }

   isLightVisible() 
    // Rendu avec le composer

    renderer.render(scene, camera);

   //


   updateRendererInfo();
   requestAnimationFrame(animate);  
  
   


}
animate();



// Fonction de redimensionnement
function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    if(renderer){
        camera.aspect = (width) / (height);
        camera.updateProjectionMatrix();
        renderer.setSize(width,height);
    }
 }
window.addEventListener('resize', onWindowResize, false);
onWindowResize()