/* Configuration du système pour développer des jeux avec Phaser et 
mise en place d'un environnement de jeu de base. */

/*Importer le fichier MainScene.js contenant le code javascript des trois étapes principales : 
du démarrage du jeu*/
import MainScene from './MainScene.js';

/** Mettre en place un jeu de phaser avec un fond de 640px par 640px  */
const config = {
  width: 640,
  height: 640,
  backgroundColor: '#633974', /*Violet clair '#8a307f' #380036*/
  type: Phaser.AUTO,
  parent: 'phaser-game',
  
  /* scène indique au programme d'exécuter la fonction précharger avant le début du jeu et 
  la fonction créer pour démarrer le jeu. 
  Toutes ces informations sont transmises à l'objet de jeu appelé Snake 
   */
  scene: [MainScene]
};

new Phaser.Game(config);


