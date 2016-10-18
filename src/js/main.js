var Jeopardy = (function() {
  function Game() {
    this.score = 0;
    this.numCorrect = 0;
    this.numWrong = 0;
    this.elem = undefined;
    // Start game
    this.startGame();
  }
  Game.prototype = {
    startGame: function() {
      var source = $("#game-template").html();
      var template = Handlebars.compile(source);
      var context = {};
      var html = template(context);
      $(html).prependTo($('.allGames'));
      this.elem = $('.game').first()[0];
      console.log(this.elem);
      this.init(this, this.elem);
      this.getClue(this);
    },
    init: function(game, gameElem) {
      $(gameElem).on('submit', 'form', function(event) {
        console.log("Clicked!", gameElem);
        event.preventDefault();
        var state = $(gameElem).find('.guessBtn').text();
        if (state === 'GUESS') {
          var guess = $(this).find('.guess').val().toLowerCase();
          var answer = $(this).siblings('.answer').text().toLowerCase();
          if (guess === answer) {
            game.numCorrect++;
            $(gameElem).find('.clueBox').addClass('correct');
            $(gameElem).find('.feedback').text('Correct! Press enter to continue.').fadeIn();
          } else {
            game.numWrong++;
            $(gameElem).find('.clueBox').addClass('wrong');
            $(gameElem).find('.feedback').text('Incorrect! The answer was "' + answer.toUpperCase() + '". Press enter to continue.').fadeIn();
          }
          game.score = game.numCorrect - game.numWrong;
          $(gameElem).find('.score').text(game.score);
          $(gameElem).find('.guessBtn').text('CONTINUE');
        } else if (state === 'CONTINUE') {
          $(gameElem).find('.clueBox').removeClass('correct wrong');
          $(gameElem).find('.feedback').hide();
          game.getScore();
          game.getClue(game);
        }
      });
    },
    getClue: function(game) {
      $.ajax({
        'url': 'http://jservice.io/api/random',
        'method': 'GET',
        'success': function(response) {
          var clue = new Clue(response[0], game);
          console.log(response);
          clue.showClue();
        },
        'error': function(error) {
          console.log(error);
        }
      });
    },
    getScore: function() {
      console.clear();
      console.log("Correct: " + this.numCorrect);
      console.log("Incorrect: " + this.numWrong);
      console.log("Total Answered: " + (this.numCorrect + this.numWrong));
      console.log("Total Score: " + this.score);
    }
  }

  function Clue(props, game) {
    this.game = game;
    this.allInfo = props;
    this.category = props.category.title;
    this.question = props.question;
    this.answer = props.answer;
    this.self = undefined;
  }
  Clue.prototype.showClue = function() {
    //First make sure the previous clue is gone
    $(this.game.elem).find('.clue').remove();
    var source = $("#clue-template").html();
    var template = Handlebars.compile(source);
    var context = {
      category: this.category,
      question: this.question,
      answer: this.answer
    };
    var html = template(context);
    $(html).prependTo($(this.game.elem).find('.clueBox'));
    $(this.game.elem).find('.guess').focus();
    this.self = $(this.game.elem).find('.clue')[0];
    console.log(this.self);
  }


  function newGame() {
    var newGame = new Game();
    allGames.push(newGame);
  }

  var allGames = [];
  var game = new Game();
  allGames.push(game);

  // Return object for user
  return {
    allGames: allGames,
    newGame: newGame
  }
})();
