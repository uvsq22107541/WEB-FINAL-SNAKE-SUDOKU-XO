/*                  Fichier contenant l'implémentation des règles du jeu SNAKE                        */
/* ------------------------------------ Classe Principale --------------------------------------------*/

var highscore =0;
//var meilleurtemps = 1000;

export default class Snake {
  /** ------------------------------------ 1 ----------------------------------------------------------- 
   * Le constructeur prend la scene du jeu et l'initialise avec les différents éléments du jeu (serpent, 
   * pommes, obstacles) 
  -----------------------------------------------------------------------------------------------------*/
  constructor(scene) {
    // initialisation de la scène
    this.scene = scene;
    /* initialisation de la variable stockant le dernier mouvement du serpent à 0, pour faire la mise à 
    jour des mouvements du serpent à chaque instant*/
    this.lastMoveTime = 0;
    // Initialisation du pas de mouvement à 100 pixels / vitesse  
    this.moveInterval = 100;
    // initialisation du serpent avec un carré de 16*16 pixels
    this.tileSize = 16;
    // initialisation de direction de démarrage du serpent à gauche
    this.direction = Phaser.Math.Vector2.LEFT;
    // le corps du serpent est un tableau, qui s'incrémente petit à petit dans la boucle
    this.body = [];
    this.body.push(
      this.scene.add
        // initialisation de la position initiale du serpent au milieu de la scene
        .rectangle(
          this.scene.game.config.width / 2,
          this.scene.game.config.height / 2,
          16,
          16,
          // initialisation de la couleur du serpent (tete) avec la couleur rouge
          0xffffff
          //this.obstacle1 = this.scene.add.circle(64, 160, 16, 0x606060).setOrigin(0);
        )
        .setOrigin(0)
    );

    this.apple = this.scene.add.rectangle(64, 160, 16, 16, 0x00ff00).setOrigin(0);

    // // initialisation de la pomme avec un carré bleu de 16*16 pixels
    this.appleblue = this.scene.add.rectangle(64, 160, 16, 16, 0x0080ff).setOrigin(0);

    // // initialisation de l'obstacle avec un carré gris de 16*16 pixels
    this.obstacle = this.scene.add.rectangle(64, 160, 16, 16, 0x000000).setOrigin(0);
    //this.obstacle = this.scene.add.rectangle(80, 176, 16, 16, 0x606060).setOrigin(0);

    // // initialisation de la pomme empoisonnée avec un carré rouge de 16*16 pixels
    this.applerouge = this.scene.add.rectangle(64, 160, 16, 16, 0xf00020).setOrigin(0);


    // // initialisation de l'obstacle avec un cercle gris de 16*16 pixels
    //this.obstacle1 = this.scene.add.circle(64, 160, 16, 0x606060).setOrigin(0);

    //-----------------------------------------------SCORE---------------------------------------------
    this.score = 0
    this.scoreText = this.scene.add.text(20, 16, 'score: 0', { fontSize: '32px Arial', fill: 'white' });
    
    this.highScoreText = this.scene.add.text(210, 16, 'HS: ' + localStorage.getItem("highscore"), {
      font: '25px Arial',
      fill: 'white'
    });

    //this.temps = new Date().getSeconds;
    this.temps = 0
    this.tempsText = this.scene.add.text(480, 16, 'temps: 0', { fontSize: '32px Arial', fill: 'white' });

    /*
    this.meilleurTempsText = this.scene.add.text(210, 40, 'MT: ' + localStorage.getItem("meilleurtemps"), {
      font: '25px Arial',
      fill: 'white'
    });
    */
    this.nbvert = 0
    this.nbvertText = this.scene.add.text(20, 40, ' Vertes: 0', { fontSize: '32px Arial', fill: 'greenyellow' });

    this.nbbleu = 0
    this.nbbleuText = this.scene.add.text(180, 40, ' Bleues: 0', { fontSize: '32px Arial', fill: '#335DFF' });

    this.nbrouge = 0
    this.nbrougeText = this.scene.add.text(350, 40, ' Rouges: 0', { fontSize: '32px Arial', fill: 'red' });

    this.nbtotal = 0
    this.nbtotalText = this.scene.add.text(510, 40, ' Total: 0', { fontSize: '32px Arial', fill: 'white' });

     //-------------------------------------------------------------------------------------------------
    // initialisation de la position initiale de la pomme verte, bleue, rouge et l'obstacle alétoirement
    this.positionApple();
    this.positionAppleBlue();
    this.positionAppleRouge();
    //setTimeout(this.detruirepommerouge(), 7000);
    //this.scene.time.events.add(Phaser.Timer.SECOND * 4, detruirepommerouge, this);
    //setTimeout(positionAppleRouge(), 10); 
    this.positionobstacle();

    // serveur en écout du clavier
    //this.keydown(e);
    scene.input.keyboard.on('keydown', e => {
      this.keydown(e);
    });
  }

   // ------------------------------------ 2 -----------------------------------------------------------
  /**2 Méthode pour le clavier et Direction de serpents, chaque fleche du clavier change la direction du 
   * serpent dans le ses correspondant en utilisant le module math de phaser
      Les bouttons du clavier sont spécifiés par leur code asccii  
  ----------------------------------------------------------------------------------------------------**/
  keydown(event) {
    console.log(event.keyCode);
    switch (event.keyCode) {
      case 37: //left
        if (this.direction !== Phaser.Math.Vector2.RIGHT) this.direction = Phaser.Math.Vector2.LEFT;
        break;
      case 38: //up
        if (this.direction !== Phaser.Math.Vector2.DOWN) this.direction = Phaser.Math.Vector2.UP;
        break;
      case 39: //right
        if (this.direction !== Phaser.Math.Vector2.LEFT) this.direction = Phaser.Math.Vector2.RIGHT;
        break;
      case 40: //down
        if (this.direction !== Phaser.Math.Vector2.UP) this.direction = Phaser.Math.Vector2.DOWN;
        break;
      case 65: //a pour ajouter vitesse
        this.add = true;
        break;
      case 32: //space pour arreter le jeu
        this.stop = true;
        break;
    }
  }



  // ------------------------------------ 3 -----------------------------------------------------------
  /** 3  Méthode pour la mise à jour de la position du serpent à chaque instant grace à la variable 
        lasttimemove
  ----------------------------------------------------------------------------------------------------**/
  update(time) {
    if (this.stop === true) return;
    if (time >= this.lastMoveTime + this.moveInterval) {
      this.lastMoveTime = time;
      this.move();
      this.temps += 1;

      this.tempsText.setText('Temps: ' + this.temps);
      //setTimeout(this.detruirepommerouge(), 7000);

    }

    //---------------------------------------SCORE-----------------------------------------------------
    this.scoreText.setText('Score: ' + this.score);

    this.highScoreText.text = 'Meilleur Score: ' + localStorage.getItem("highscore");
    {
      if (this.score >= localStorage.getItem("highscore")) {
        localStorage.setItem("highscore", this.score);
      }
    }

    this.nbvertText.setText('Vertes : ' + this.nbvert);
    this.nbbleuText.setText('Bleues : ' + this.nbbleu);
    this.nbrougeText.setText('Rouges : ' + this.nbrouge);
    this.nbtotalText.setText('Total : ' + this.nbtotal);  }

    // ------------------------------------ 4 -----------------------------------------------------------
  /** 4.1 Méthode pour Générer une position aléatoire (x,y) pour la pommme verte **/
  positionApple() {
    this.apple.x =
      Math.floor((Math.random() * this.scene.game.config.width) / this.tileSize) * this.tileSize;
    this.apple.y =
      Math.floor((Math.random() * this.scene.game.config.height) / this.tileSize) * this.tileSize;
  }

   /** 4.2 Méthode pour Générer une position al&atoire (x,y) pour la pommme bleue **/
   positionAppleBlue() {
    this.appleblue.x =
      Math.floor((Math.random() * this.scene.game.config.width) / this.tileSize) * this.tileSize;
    this.appleblue.y =
      Math.floor((Math.random() * this.scene.game.config.height) / this.tileSize) * this.tileSize;
  }

   /** 4.3 Méthode pour Générer une position al&atoire (x,y) pour la pommme rouge **/
   positionAppleRouge() {
    this.applerouge.x =
      Math.floor((Math.random() * this.scene.game.config.width) / this.tileSize) * this.tileSize;
    this.applerouge.y =
      Math.floor((Math.random() * this.scene.game.config.height) / this.tileSize) * this.tileSize;
      //setTimeout(positionAppleRouge,2000);
      //this.scene.time.addEvent(Phaser.Timer.SECOND * 4, detruirepommerouge, this);
      
      //this.scene.time.addEvent({delay: 4000, loop: false, 
        //callback: (event) => {this.scene.events.emit('detruirepommerouge')}});
    }

    detruirepommerouge () {
      this.applerouge.destroy();
  
  }
  /** 4.4 Méthode pour Générer une position aléatoire (x,y) pour l'obstacle avec le module Math **/
  positionobstacle() {
    this.obstacle.x =
      Math.floor((Math.random() * this.scene.game.config.width) / this.tileSize) * this.tileSize;
    this.obstacle.y =
      Math.floor((Math.random() * this.scene.game.config.height) / this.tileSize) * this.tileSize;
  }


// -----------------------------------------------------------------------------------------------------
 

    // ------------------------------------  ----------------------------------------------------------- 
    /** 5 Méthode qui gére tous les mouvements du serpents (règles du jeu) 
     * ------------------------------------------------------------------------------------------------**/


  /* Ici si le serpent passe sur les pommes on doit ettendre sa longuer, et si il affronte un mure,
  un obstacle, ou lui meme le jeux s'arrete
   s'arrette */
  move() {

    // initialiser x et y avec les cordonnées de la tete du serpent
    let x = this.body[0].x + this.direction.x * 16;
    let y = this.body[0].y + this.direction.y * 16;

    /* si les cordonnées de la tete du serpent sont égales aux cordonnées de la pomme verte
    étendre la longueur du serpent avec la méthode push (rajout d'un carré vert) */
    if (this.apple.x === x && this.apple.y === y) {
      this.body.push(this.scene.add.rectangle(0, 0, 16, 16, 0x00ff00).setOrigin(0));
      this.add = false;
      //-----------------------------------SCORE POMME VERTE +1 --------------------------------------
      this.score += 1;
      this.nbvert += 1;
      this.nbtotal += 1;
      //----------------------------------------------------------------------------------------------
      //-----------------------------------SON POMME VERTE -------------------------------------------
      let audio = new Audio("son/1pt.wav");
      audio.play();
      //----------------------------------------------------------------------------------------------
      // générer une nouvelle pomme
      this.positionApple();
      //---------------setTimeout(function(){console.log("j'attends 9 seconds");},9000);
      ///--------------this.applerouge.destroy();
    }

     /* si les cordonnées de la tete du serpent sont égales aux cordonnéEs de la pomme bleue
    étendre la longueur du serpent avec la méthode push (rajout d'un carré bleu) */
    if (this.appleblue.x === x && this.appleblue.y === y) {
      this.body.push(this.scene.add.rectangle(0, 0, 16, 16, 0x0080ff).setOrigin(0));
      this.add = false;
      //-----------------------------------SCORE POMME BLEUE +5 --------------------------------------
      this.score += 5;
      this.nbbleu += 1; 
      this.nbtotal += 1;
      //----------------------------------------------------------------------------------------------
      //-----------------------------------SON POMME BLEUE -------------------------------------------
      let audio = new Audio("son/5pts.mp3");
      audio.play();
      //----------------------------------------------------------------------------------------------
      // générer une nouvelle pomme
      this.positionAppleBlue();
    }

     /* si les cordonnées de la tete du serpent sont égales aux cordonnéEs de la pomme rouge
    étendre la longueur du serpent avec la méthode push (rajout d'un carré rouge) */
    if (this.applerouge.x === x && this.applerouge.y === y) {
      this.body.push(this.scene.add.rectangle(0, 0, 16, 16, 0xf00020).setOrigin(0));
      this.add = false;
      //-----------------------------------SCORE POMME ROUGE -1 --------------------------------------
      this.score -= 1;
      this.nbrouge += 1;
      this.nbtotal += 1;
      //----------------------------------------------------------------------------------------------
      //-----------------------------------SON POMME ROUGE -------------------------------------------
      let audio = new Audio("son/death.wav");
      audio.play();
      //----------------------------------------------------------------------------------------------
      // générer une nouvelle pomme
      this.positionAppleRouge();
    }

    //Si le serpent mange une pomme etendre son corps (sans la tete) - décallage des cellules existantes pour insérer la nouvelle
    for (let index = this.body.length - 1; index > 0; index--) {
      this.body[index].x = this.body[index - 1].x;
      this.body[index].y = this.body[index - 1].y;
    }
    this.body[0].x = x;
    this.body[0].y = y;


    //Serpent mort :

    /*S'il affronte la longeur et la largeur de la scène du jeu, i.e si les cordonnées de la tete du
      serpent correspondent aux cordonnées des bordures de la scène du jeu */
    if (
      this.body[0].x < 0 ||
      this.body[0].x >= this.scene.game.config.width ||
      this.body[0].y < 0 ||
      this.body[0].y >= this.scene.game.config.height
    ) {
      //-----------------------------------SON AFFRONTER MUR -------------------------------------------
      let audio = new Audio("son/echec.mp3");
      audio.play();
      //----------------------------------------------------------------------------------------------
      // relancer le jeu
      this.scene.scene.restart();
      
    }

    //Vérifier la taille du serpent (begin,end-1)
    /*S'il affronte son corps meurt. 
    la variable bodyminushead est un vecteur stockant les cordonnnées des carrés composant le corps 
    du serpent sans sa tete */
    let bodyminushead = this.body.slice(1); //Enlever la tete (juste le body)
    
    //tester si cordonnées de la tete correspondent aux cordonnées de body
    if (bodyminushead.filter(b => b.x === this.body[0].x && b.y === this.body[0].y).length > 0) {

      //-----------------------------------SON AFFRONTER LUI MEME ------------------------------------
      let audio = new Audio("son/echec.mp3");
      audio.play();
      //----------------------------------------------------------------------------------------------
      //relancer
      this.scene.scene.restart();
    }

    /* si les cordonnées de la tete du serpent sont égales aux cordonnéEs de l'obstacle 
      */
    if (this.obstacle.x === x && this.obstacle.y === y) {
      //-----------------------------------SON AFFRONTER L'OBSTACLE ------------------------------------
      let audio = new Audio("son/echec.mp3");
      audio.play();
      //----------------------------------------------------------------------------------------------
      this.scene.scene.restart();
    }
  }
  //end = new Date().getTime();
  //time = end - start;
}
//performance.mark("end-script")