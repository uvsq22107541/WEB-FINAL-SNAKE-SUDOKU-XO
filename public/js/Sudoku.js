  //create variables
  var timer;
  var timeRemaining;
  var lives;
  var selectedNum;
  var selectedTile;
  var disableSelect; //when the game end we don't wan them to be able to select any new numbers

  window.onload = function(){
      //run startgame function when button is clicked
      //this access the html element that has the id = start-btn
      id("start-btn").addEventListener("click", startGame); //we add a listner to this butn that when it is clicked we should run the start game functon
      //add event listener to each number in number contanier ////////////////////////////////// krml select deselect l nb container al taraf
      for (let i = 0; i < id ("number-container").children.length; i++) { //number-container.length ===== 9
          id("number-container").children[i].addEventListener("click", function() { //create new function that gonna run every time that the tile is clicked
            //if selecting is not disaled
            if (!disableSelect){
                //if number is already selected
                if(this.classList.contains("selected")){ //"this" refer to the nb al taraf is for the specific of the number container 
                    //then remove selection
                    this.classList.remove("selected");
                    selectedNum = null;
                } else { //if it was not already selected  
                    //deselcted all other numbers
                    for (let i = 0; i < 9; i++){
                        id("number-container").children[i].classList.remove("selected");                  
                     }
                     //selected it and update selectedNum Variable 
                     this.classList.add("selected");
                     selectedNum = this;
                     updateMove(); //function that check if there's a piece of nb-container and a tile selected then it will try and place that nb in that tile and if it's correct it'll stay if it's incorrect it will flach red 
                     
                     ////////////////////////////////////////////////////

                }
            }  
          });
      }
    }

    
    {var y;}

  function startGame(){
    { var x = Math.floor(Math.random() * 10);}
    if (x % 2 != 0){
          y = x - 1;
    };

      //choose board difficulty  (setup our difficult selection)
       let board;
       if (id("diff-1").checked) board = easy[y];
       else if (id("diff-2").checked) board = medium[y];
       else board = hard[y];
       
       //set lives to 3 and enable selcting numbers and tiles
      lives = 3;
      disableSelect = false; //whenever this boolean variable is false it means that we are able to select tiles and numbers  will set it to true once the game ends
      id("lives").textContent = "Lives Remaining: 3"; //means that the html elemnt with the id = lives isgoing to show lives remaing = 3 bcz at the begining we start with three lives 
      //create board based on difficulty 
      generateBoard(board);
      //starts the timer
      startTimer();
      //sets theme based on input
      if (id("theme-1").checked) { 
          qs("body").classList.remove("dark"); //in css 3ena body.dark
      } else {
          qs("body").classList.add("dark");
      }
      //show number container
      id("number-container").classList.remove("hidden");
    }

    function startTimer(){
        //sets time remaining based on input
        if(id("time-1").checked) timeRemaining = 180;
        else if (id("time-2").checked) timeRemaining = 300;
        else timeRemaining = 600;
        //sets timer for first second
        id("timer").textContent = timeConversion(timeRemaining);
        //sets timer to update every second
        timer = setInterval(function(){
            timeRemaining --; //this function will subtract time remaining by 1
            //if no time remaining end he game
            if (timeRemaining === 0) endGame(); //check if it's over to call endGame function 
            id("timer").textContent = timeConversion(timeRemaining); //covert into min ma bdna yhn bl second
        }, 1000) //interval lenght will be 1000 ms, every 1000 ms will run this function (setInterval)  

    }

    //converts seconds into string of MM:SS format
    function timeConversion(time){
        let minutes = Math.floor(time /60);
        if (minutes < 10)minutes = "0" + minutes;
        let seconds = time % 60;
        if (seconds < 10) seconds = "0" + seconds;
        return minutes + ":" + seconds;

    }

    function generateBoard(board){
        //clear previous board (bcz if we finish the game and we want to satrt a new game we don't want board stacking on top of each other)
        clearPrevious();
        //let used to increment tile ids
        let idCount = 0;
        //create 81 tiles
        for(let i = 0; i < 81; i++){ //for each tile
          //create a new paragraph element 
          let tile = document.createElement("p");
          //if the tile is not supposwd to be blank
          if(board.charAt(i) != "-") {
              //setile text to correct number 
              tile.textContent = board.charAt(i); //y3ne hon ha tkhd for ex 6 cz awal r2m bl array mch - w fi 6
           } else { //////////// if = " - " //////////////////////////// hyde kela krml n3ml select deselct b2lb tblx
               //add click event listener to tile  
               tile.addEventListener("click" , function(){
                //if selecing is not disabled
                if(!disableSelect){ //we can selected
                    //if the tile is already selected
                    if(tile.classList.contains("selected")){
                        //then remove selection
                        tile.classList.remove("selected");
                        selectedTile = null;
                    } else {
                        //deselect all other tiles
                        for(let i = 0; i < 81; i++){
                            qsa(".tile")[i].classList.remove("selected"); //qsa(.tile) we are selecting any elts that has the tile classwhich all of our 81 tiles whithin the board div have and it will return those in an array and then we're gonna remove the selected one from each one
                        }
                        //add selection and update variable
                        tile.classList.add("selected"); //adding the selected class to it which wll highlight it blue
                        selectedTile = tile; //set the current selected tile to be equal to tile
                        updateMove();
                    }///////////////////////////////////////
                }
               });     
          }
          //assign tile id 
          tile.id = idCount;
          //increment for next tile
          idCount ++;
          //add tile class to all tiles
          tile.classList.add("tile");
          if ((tile.id > 17 && tile.id < 27) || (tile.id > 44 & tile.id < 54)) {
              tile.classList.add("bottomBorder"); //3m ncht8l 3l tile li lzm ykun 3ndon bottomborder y3ne li hene had lkhat l horizantal 
          }
          if ((tile.id + 1) % 9 == 3 || (tile.id + 1 ) % 9 == 6) {
              tile.classList.add("rightBorder"); //same for the vertical border
          }
          //add tile to board
          id("board").appendChild(tile);
        }
    }

    function updateMove(){
        //if a tile and a nb is selected
        if (selectedTile && selectedNum){
            //set the tile to the correct nb
            selectedTile.textContent = selectedNum.textContent;
            //if the nb maches the corresponding nb in the solution key
            if (checkCorrect(selectedTile)){
                //deselects the tiles // la ma a3ml select la kaza tile or num bi zet lwa2t
                selectedTile.classList.remove("selected");
                selectedNum.classList.remove("selected");
                //clear the selected variables
                selectedNum = null;
                selectedTile = null;
                //check if boarf is completed
                if(checkDone()){
                    endGame();//so hon 3ayat lal end game abl ma ykun lives=o then ha y3tine ene i won
                }
                
                //if the nb does not match the solution key
            } else {
                //disable selecting new number for one second 
                disableSelect = true;
                //Make the tile turn red
                selectedTile.classList.add("incorrect");
                //run in one second 
                setTimeout(function(){
                    //subtract lives by one
                    lives --;
                    //if no lives left end the game 
                    if (lives === 0){
                        endGame();
                    } else{
                        //if lives is not equal to zero
                        //update lives text
                        id("lives").textContent = "Lives Remaining: " + lives;
                        //renable selecting numbers and tiles
                        disableSelect = false;
                    }
                    //restore tile color and remove selected from both
                    selectedTile.classList.remove("incorrect"); //chlt l red color
                    selectedTile.classList.remove("selected");
                    selectedNum.classList.remove("selected");
                    //clear the tiles text and clear selected variables
                    selectedTile.textContent = "";
                    selectedTile = null;
                    selectedNum = null;

                }, 1000);  //1000 bcz it's gonna wait a thousand ms and then it will run this function
            }
        }
    }

    function checkDone(){
        let tiles = qsa(".tile");
        for (let i = 0; i < tiles.length; i++){ //eza ata3 ala kl tiles w tl3 chi fade false eza klo t3aba true w i won
            if (tiles[i].textContent === "") return false;
        }
        return true;
    }

    function endGame(){
        //disable moves and stop the timer
        disableSelect = true;
        clearTimeout(timer); //hyde li 3mlila store bi alb startTimer
        //Display win or loss message
        if(lives === 0 || timeRemaining === 0) {
            id("lives").textContent = "You Lost!"
        } else {
            id("lives").textContent = "You Won!"
        }
    }

    function checkCorrect(tile){
        //set solution based on difficulty selection 
        let solution;
        if (id("diff-1").checked) solution = easy[y+1];
        else if (id("diff-2").checked) solution = medium[y+1];
        else solution = hard[y+1];
        //if tile's number is equal to solution's nb
        if(solution.charAt(tile.id) === tile.textContent) return true;
        return false;
         
    }

    function clearPrevious(){
        //access all of the tiles
        let tiles = qsa(".tile"); //everything in the class tile will be passed back in this array "tiles"
        //remove each tile
        for (let i = 0; i < tiles.length; i++) {
            tiles[i].remove(); //this will remove the tile from that array
        }
        //if there is a timer clear it 
        if (timer) clearTimeout(timer);
        //deselect any numbers (bcz maybe we have number selected from the previous game we want to start with a clean board)
        for (let i = 0; i < id("number-container").children.length; i++){// this will pass throught an array of all the children of the number container
            id("number-container").children[i].classList.remove("selected");
        }
        //clear selected variable
        selectedTile = null;
        selectedNum = null;
    }

  //Helper functions
  function id(id){ //now we can instead of typing document.getElementById we can type id ex bl function fo2 id("start-btn")
      return document.getElementById(id);
  }
  //Helper functions
  function qs(selector){
      return document.querySelector(selector);
  }
   //Helper functions
  function qsa(selector){ //return an array of all the items that are picked by that selector
    return document.querySelectorAll(selector);
}

//load board from file or manually(strings)
// this it for setting up three different keys for a baord, 
// each key is an array with two strings, the first string  is the initial board the second is the solution 
//each string represent one tile and the dash represent the empty on
const easy = [
    "6------7------5-2------1---362----81--96-----71--9-4-5-2---651---78----345-------",
    "685329174971485326234761859362574981549618732718293465823946517197852643456137298",
    "--7--18-----276--42-139876---2----1-63-142-5---5--348-1---------8-6-5----9-82--7-",
    "367451829859276134241398765472589316638142957915763482126937548784615293593824671",
    "3-84---7-71---5--2--4-918-66----9-8715-8-29---4--67-1-9-3-1-6----1----2--6-------",
    "398426175716385492524791836632149587157832964849567213973214658481653729265978341",
    "7------------4-2--4-6-3-951--7---1--2-9-81736---62-5-85-23--479----543--3--8-----",
    "715269843938145267426738951867593124259481736143627598582316479671954382394872615",
    "-82-43--59---2---16-7---4-2-296----831---7-5--541-92-7---9---13-----87-----36--49",
    "182743695945826371637591482729654138316287954854139267468972513593418726271365849"
  ] ;
  const medium = [
    "-8-43--2--31--75-8-6-91---7------14-1-652-----72-8-3---2--9--6-5-----2-----3---8-",
    "789435621431267598265918437853679142146523879972184356324891765598746213617352984",
    "-283159----1--------5-4--1625------94-62---3---7-6---518-52--6----73--427--4-----",
    "628315974341697258975842316253174689496258137817963425184529763469731842732486591",
    "----7-2-6--56-378-8---12---1-2---4----73------3-5276-1----6-9----91-48---84--9--7",
    "943875216215693784876412359152986473697341528438527691321768945769154832584239167",
    "--5-3----73-9-4----985-14---4-------65----918--2-6--4----48-6-7-----6-23--32---8-",
    "415638279736924851298571436349815762657342918182769345521483697874196523963257184",
    "-79--2-8684-3---1---------49---47--8--12--4-9-----6-5175-----9-2--8---4--3----5-2",
    "579712386842369715613578924925147638361285479487936251754621893296853147138794562"


  ];
  const hard = [
    "-1-5-------97-42----5----7-5---3---7-6--2-41---8--5---1-4------2-3-----9-7----8--",
    "712583694639714258845269173521436987367928415498175326184697532253841769976352841",
    "4---------95-32---8--57---65-----74-3---64--597-8-----15----2---4--18-6---6925-8-",
    "427186359695432871813579426561293748382764915974851632158647293249318567736925184",
    "19-34--7-8-------45-----2----76---4---38-15-96---593---2---6--5---92--8-----1----",
    "192345678836297154574168293957632841243871569681459327329786415415923786768514932",
    "-----5---3-9----4---6---23--91--73--8---2-6--46--1--8--186---27--29---1--7-------",
    "184235976329786145756491238291867354837524691465319782918653427642978513573142869",
    "-5---------4---1------2-4-7-9------6--3--4--116--7589-5--2-7---7--4-6--9-----3-58",
    "357641982924738165681529437495812376873964521162375894519287643738456219246193758"
  ]; 
