/** -Phaser est un framework de création de jeux vidéo 2D. 
 *  -Phaser utilise :
 *     1) HTML5 Canvas : pour afficher le jeu et 
 *     2) JavaScript : pour exécuter le jeu. 
 *  -L'avantage d'utiliser Phaser est qu'il :
 *     1) possède une bibliothèque complète qui complète une grande partie de la physique des jeux vidéo,
 *        permettant ainsi, de se concentrer sur la conception du jeu lui-même 
 *     2) réduit le temps de développement et facilite le flux de travail
 * */

/*Importer le fichier Snake.js contenant le code javascript de la conception et des règles du jeu SNAKE*/
import Snake from './Snake.js';

/** Phaser comporte trois étapes principales : précharger, créer et mettre à jour. 
 * Les étapes de préchargement et de création  sont exécutées une fois au démarrage du jeu.
*/
export default class MainScene extends Phaser.Scene {

  /** Etape de préchargement : les ressources du jeu sont téléchargées et mises à disposition du jeu. */
  constructor() {
    super('MainScene');
  }

  /** Etape de création : initialise le jeu et tous les éléments du jeu de départ. **/
  create() {
    this.snake = new Snake(this);
  }


  /** Etape de mise à jour : fonctionne en boucle tout au long du jeu. 
   * C'est le cheval de bataille qui met à jour les éléments du jeu pour le rendre interactif. */
  update(time, delta) {
    this.snake.update(time);
  }
}
