var Jeopardy = (function() {
  function Game() {
    var self = this;
    this.score = 0;
    this.numCorrect = 0;
    this.numWrong = 0;
    this.elem = undefined;

    this.Clue = function(props) {
      this.allInfo = props;
      this.category = props.category.title;
      this.question = props.question;
      this.answer = props.answer;
      this.self = undefined;
    }

    this.Clue.prototype.showClue = function() {
      //First make sure the previous clue is gone
      $(self.elem).find('.clue').remove();
      var source = $("#clue-template").html();
      var template = Handlebars.compile(source);
      var context = {
        category: this.category,
        question: this.question,
        answer: this.answer
      };
      var html = template(context);
      $(html).prependTo($(self.elem).find('.clueBox'));
      $(self.elem).find('.guess').focus();
      this.self = $(self.elem).find('.clue')[0];
      console.log(this.self);
    };

    this.getClue = function() {
      $.ajax({
        'url': 'http://jservice.io/api/random',
        'method': 'GET',
        'success': function(response) {
          var clue = new self.Clue(response[0]);
          console.log(response);
          clue.showClue();
        },
        'error': function(error) {
          console.log(error);
        }
      });
    }

    this.startGame = function() {
      var source = $("#game-template").html();
      var template = Handlebars.compile(source);
      var context = {};
      var html = template(context);
      $(html).prependTo($('.allGames'));
      self.elem = $('.game').first()[0];
      console.log(self.elem);
      self.init(self.elem);
      self.getClue();
    }

    this.init = function(gameElem) {
      $(gameElem).on('submit', 'form', function(event) {
        console.log("Clicked!", gameElem);
        event.preventDefault();
        var state = $(gameElem).find('.guessBtn').text();
        if (state === 'GUESS') {
          var guess = $(this).find('.guess').val().toLowerCase();
          var answer = $(this).siblings('.answer').text().toLowerCase();
          if (guess === answer) {
            self.numCorrect++;
            $(gameElem).find('.clueBox').addClass('correct');
            $(gameElem).find('.feedback').text('Correct! Press enter to continue.').fadeIn();
          } else {
            self.numWrong++;
            $(gameElem).find('.clueBox').addClass('wrong');
            $(gameElem).find('.feedback').text('Incorrect! The answer was "' + answer.toUpperCase() + '". Press enter to continue.').fadeIn();
          }
          self.score = self.numCorrect - self.numWrong;
          $(gameElem).find('.score').text(self.score);
          $(gameElem).find('.guessBtn').text('CONTINUE');
        } else if (state === 'CONTINUE') {
          $(gameElem).find('.clueBox').removeClass('correct wrong');
          $(gameElem).find('.feedback').hide();
          self.getScore();
          self.getClue();
        }
      });
    }

    this.getScore = function() {
      console.clear();
      console.log("Correct: " + self.numCorrect);
      console.log("Incorrect: " + self.numWrong);
      console.log("Total Answered: " + (self.numCorrect + self.numWrong));
      console.log("Total Score: " + self.score);
    }

    // Start game
    self.startGame();
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
