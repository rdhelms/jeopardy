var Jeopardy = (function() {
  var storage = {
    set: function() {
      localStorage.allGames = JSON.stringify(allGames);
    },
    get: function() {
      var oldGames = JSON.parse(localStorage.allGames);
      for (var index = 0; index < oldGames.length; index++) {
        var oldGame = oldGames[index];
        var newGame = new Game(oldGame.numCorrect, oldGame.numWrong, oldGame.score);
        allGames.push(newGame);
      }
    }
  }


  function Game(numCorrect, numWrong, score) {
    this.score = score || 0;
    this.numCorrect = numCorrect || 0;
    this.numWrong = numWrong || 0;
    this.elem = undefined;
    // Start game
    this.startGame();
  }
  Game.prototype = {
    startGame: function() {
      var source = $("#game-template").html();
      var template = Handlebars.compile(source);
      var context = {
        score: this.score,
        correct: this.numCorrect,
        incorrect: this.numWrong,
        total: (this.numCorrect + this.numWrong)
      };
      var html = template(context);
      $(html).prependTo($('.allGames'));
      this.elem = $('.game').first()[0];
      this.init(this, this.elem);
      this.getClue(this);
    },
    init: function(game, gameElem) {
      // Setup the event handler for the form submission
      $(gameElem).on('submit', 'form', function(event) {
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
          $(gameElem).find('.numCorrect').text(game.numCorrect);
          $(gameElem).find('.numIncorrect').text(game.numWrong);
          $(gameElem).find('.numTotal').text(game.numCorrect + game.numWrong);
          $(gameElem).find('.guessBtn').text('CONTINUE');
        } else if (state === 'CONTINUE') {
          $(gameElem).find('.clueBox').removeClass('correct wrong');
          $(gameElem).find('.feedback').hide();
          game.getClue(game);
        }
        storage.set();
      });
    },
    getClue: function(game) {
      $.ajax({
        'url': 'http://jservice.io/api/random',
        'method': 'GET',
        'success': function(response) {
          var clue = new Clue(response[0], game);
          clue.showClue();
        },
        'error': function(error) {
          console.log(error);
        }
      });
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
  }

  function makeGame() {
    var newGame = new Game();
    allGames.push(newGame);
  }

  function getGames() {
    return allGames;
  }

  // Setup the new game button
  $('header button').on('click', function() {
    makeGame();
  });

  var allGames = [];
  if (localStorage.allGames) {
    console.log("Old games");
    storage.get();
  } else {
    console.log("New game");
    var newGame = new Game();
    allGames.push(newGame);
  }

  // Return object for user
  return {
    getGames: getGames,
    makeGame: makeGame
  };
})();
