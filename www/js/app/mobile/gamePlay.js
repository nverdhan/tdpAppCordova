var Game325Component = React.createClass({displayName: "Game325Component",
    componentWillMount : function(){
        this.type = this.props.type;
        this.playerId = this.props.playerId;
        this.game = this.props.game;
        if(this.type == 'LIVE'){
            this.arrangePlayers(this.props.game);    
        }
        // this.arrangePlayers(this.props.game);
        this.players = this.props.game.players;
        this.playerIds = [];
        for (var i =  0; i < this.players.length; i++){
            this.playerIds.push(this.players[i].id); 
        };
        this.playedCards = this.props.game.playedCards;
        this.props.scope.updateScores(this.players);
        this.next(this.props.game);
    },
    componentWillReceiveProps : function(nextProps){
        // // console.log('props received');
        this.game = nextProps.game;
        this.props.game = nextProps.game;
        this.playerId = this.props.playerId;
        this.game.lastPlayerId = nextProps.game.otherPlayerId;
        this.arrangePlayers(this.props.game);
        this.players = this.props.game.players;
        // this.playedCards = this.props.game.playedCards;
        if(nextProps.game.gameTurn == 1){
          this.playedCards = nextProps.game.playedCards;  
        }
        // this.props.game.returnCard = false;
        this.playerIds = [];
        this.props.scope.updateScores(this.players);
        // // console.log(this.props.game.turnSuit);
        if(!nextProps.game.msgRender){
            for (var i =  0; i < this.players.length; i++){
                this.playerIds.push(this.players[i].id); 
            }
            // if(this.game.gameEvent == 'WITHDRAW'){
            //     this.props.game.returnCard = true;
            // }
            this.next(nextProps.game);    
        }
    },
    shouldComponentUpdate : function (nextProps, nextState) {
        return true;
    },
    // shouldComponentUpdate : function (nextProps, nextState) {
    //     // for (var i = this.props.game.players.length - 1; i >= 0; i--) {
    //     //     if(this.props.game.players[i].cardWillBeMovedFrom != nextProps.game.players[i].cardWillBeMovedFrom){
    //     //         return true;
    //     //     }
    //     // };
    //     if(this.props != nextProps)
    //         return true;
    // },
    arrangePlayers : function(){
        var myPlayerObj;
        for (var i = this.game.players.length - 1; i >= 0; i--) {
            if(this.game.players[i].id == this.playerId){
                myPlayerObj = this.game.players[i];
            }
        };
        while(this.game.players.indexOf(myPlayerObj) !== 0){
            var s = this.game.players.pop();
            this.game.players.unshift(s);
        }
    },
    getPlayerIndexFromId : function(id){
        for (var i = this.props.game.players.length - 1; i >= 0; i--) {
            if(this.props.game.players[i].id == id){
                return i;
            }
        }
    },
    setTrump : function(trump){
        var index = this.getPlayerIndexFromId(this.props.game.activePlayerId);
        if((this.playerId == this.props.game.activePlayerId || this.props.game.players[index].type == 'bot') && this.props.game.gameState == 'SET_TRUMP'){
            var data = {
                gameState : 'SET_TRUMP',
                gameEvent : 'SET_TRUMP',
                trump : trump,
                activePlayerId : this.props.game.activePlayerId
            }
            this.clickHandler(data);
        }
    },
    playCard : function(){
        //play card and place card on board
    },
    clickHandler : function(data){
        this.props.scope.sendEvent(data);
    },
    getInitialState : function(){
        return ({
            leftPlayerDeck : null,
            rightPlayerDeck : null,
            bottomPlayerPlayerCard : null,
            leftPlayerPlayerCard : null,
            rightPlayerPlayerCard : null,
            trumpCard : null
        })
    },
    playCard : function(){
        var activePlayerId = this.props.game.activePlayerId;
        var lastPlayerId = this.props.game.lastPlayerId;
        var lastPlayerPosition = this.getPlayerIndexFromId(lastPlayerId);
        for (var i = this.props.game.players.length - 1; i >= 0; i--) {
            for (var j = this.props.game.players[i].cards.length - 1; j >= 0; j--) {
                if(this.props.game.players[i].cards[j].suit == this.props.game.cardPlayed.suit && this.props.game.players[i].cards[j].rank == this.props.game.cardPlayed.rank){
                    this.props.game.playedCards[lastPlayerPosition] = this.props.game.players[i].cards[j];
                    this.props.game.players[i].cards[j].state = 'played';
                }
            }
        }
    },
    arrangeCards : function(){
        for (var i = this.props.game.players.length - 1; i >= 0; i--) {
            if(this.props.game.players[i].id == this.playerId){
                this.props.game.players[i].cards = sortDeck(this.props.game.players[i].cards);
            }
        };
    },
    next : function (data){
        var gameEvent = data.gameEvent;
        switch(gameEvent){
            case 'PLAY_CARD':
                if(this.props.game.returnCard){
                    this.returnCard();
                    var self = this;
                    setTimeout(function() {
                        self.arrangeCards();
                    }, 5000);
                }else{
                    this.arrangeCards();
                }
                break;
            case 'CARD_PLAYED':
                this.arrangeCards();
                this.playCard();
                this.placeCardOnBoard();
                break;
            case 'DECLARE_WINNER':
                this.arrangeCards();
                this.playCard();
                this.placeCardOnBoard();
                this.updateCards();
                this.moveHand();
                break;
            case 'SET_TRUMP':
                break;
            case 'WITHDRAW':
                if(this.props.game.returnCard){
                    this.returnCard();
                    angular.element('.bottom-player-diabled').css('display','block');
                    // console.log('withdraw added');
                    setTimeout(function () {
                        angular.element('.bottom-player-diabled').css('display','none');
                        // console.log('withdraw removed');
                    },1350)
                }   
                break;
            case 'RETURN':
                this.withdrawCard();
                angular.element('.bottom-player-diabled').css('display','block');
                // console.log('return added');
                setTimeout(function () {
                    angular.element('.bottom-player-diabled').css('display','none');
                    // console.log('return removed');
                },1350)
                break;
            default:
                null;
                break;
        }
        var self = this;
        var fn  = function(){
            self.setState({
                gameState : gameEvent
            }); 
        }
        delayService.asyncTask(200, fn);
        if(this.type == 'BOTS' && gameEvent != 'DECLARE_WINNER'){
            this.checkBotPlay();
        }
    },
    updateCards : function(){
        var self = this;
        var fn = function(){
            self.players =  self.props.game.players;
        }
        delayService.asyncTask(600, fn);
    },
    withdrawCard : function (){
        var self = this;
        var fn = function (){
            Game.prototype.withdrawCard.call(self.props.game);
            self.setState({
                gameState : 'withdrawMoved'
            })
        }
        delayService.asyncTask(1200, fn);
    },
    returnCard : function() {
        var self = this;
        // // console.log('returned')
        var fn = function (){
            Game.prototype.returnCard.call(self.props.game);
            self.setState({
                gameState : 'returnMoved'
            })
        }
        delayService.asyncTask(1200, fn);
    },
    placeCardOnBoard : function(){
        var self = this;
        var fn = function () {
            var playerIndex = self.getPlayerIndexFromId(self.props.game.otherPlayerId);
            self.playedCards[playerIndex].display = 'block';
            self.playedCards[playerIndex].suit = self.props.game.cardPlayed.suit;
            self.playedCards[playerIndex].rank = self.props.game.cardPlayed.rank;
            if(this.type == 'BOTS'){
                self.props.game.playedCards[playerIndex] = self.props.game.cardPlayed;                
            }
            for (var i = self.props.game.players.length - 1; i >= 0; i--) {
                    for (var j = self.props.game.players[i].cards.length - 1; j >= 0; j--) {
                        if(self.props.game.players[i].cards[j].suit == self.props.game.cardPlayed.suit && self.props.game.players[i].cards[j].rank == self.props.game.cardPlayed.rank){
                            var index = j;
                            var id = i;
                            var card = self.props.game.players[id].cards.splice(index, 1);
                        }else if(self.props.game.players[i].cardPlayed.suit == self.props.game.cardPlayed.suit && self.props.game.players[i].cardPlayed.rank == self.props.game.cardPlayed.rank) {
                            var card = self.props.game.cardPlayed;
                        }
                    };
                };
                self.setState({
                    gameState : 'CARD_PLACED_ON_BOARD'
                });
                }
            delayService.asyncTask(1200, fn);
    },
    moveHand : function (){
        var self = this;
        if(this.props.type == "BOTS"){
            this.props.game.turnSuit = '';
        }
        var fn = function (){
            var winnerId = self.props.game.winnerId;
            var winnerPos = self.getPlayerIndexFromId(winnerId);
            for (var i = self.props.game.players.length - 1; i >= 0; i--){
                self.playedCards[i].moveTo = winnerPos;
            }
            self.setState({
                gameState : 'HAND_MOVED'
            });
        }
        delayService.asyncTask(2000, fn);
        delayService.asyncTask(2000, this.refreshPlayedCards);
        delayService.asyncTask(1600, this.updateScores);

    },
    refreshPlayedCards : function () {
        var self = this;
        if(this.props.type == 'BOTS'){
            for (var i = this.props.game.players.length - 1; i >= 0; i--){
                this.props.game.allPlayedCards.push(this.props.game.playedCards[i]);
            }
            this.refreshRemainingCards();
        }
        /***********If Bots*********************/
        /*
        for (var i = this.props.game.players.length - 1; i >= 0; i--){
                this.props.game.allPlayedCards.push(this.props.game.playedCards[i]);
        };
        this.refreshRemainingCards();
        */
        /***********If Bots*********************/
        var fn = function () {
            for (var i = self.props.game.players.length - 1; i >= 0; i--){
                self.playedCards[i].suit = '';
                self.playedCards[i].rank = '';
                self.playedCards[i].display = 'none';
                delete self.playedCards[i].moveTo;
                /***********If Bots*********************/
                if(self.props.type == 'BOTS'){
                    self.playedCards[i] = '';
                    self.props.game.playedCards[i] = '';
                }
                // self.playedCards[i] = '';
                // self.props.game.playedCards[i] = '';
                /***********If Bots*********************/
            }
            self.setState({
                gameState : 'REFRESH_PLAYED_CARDS'
            });
            // self.updateScores();
        }
        delayService.asyncTask(1200, fn);
    },
    refreshRemainingCards : function(){
        var playedindex = Array();
        var removedCards = Array([],[],[],[]); //S H C D
        var suitIndex = 0;
        var remaining = this.props.game.remainingCards;
        var allplayed = this.props.game.allPlayedCards;
        for (var i = 0 ; i <= remaining.length - 1; i++) {
            for (var j = 0; j <= allplayed.length - 1; j++) {
                if(remaining[i].suit == allplayed[j].suit && remaining[i].rank == allplayed[j].rank) {
                    playedindex.push(i);
                    if(remaining[i].suit == 'S') suitIndex = 0;
                    if(remaining[i].suit == 'H') suitIndex = 1;
                    if(remaining[i].suit == 'C') suitIndex = 2;
                    if(remaining[i].suit == 'D') suitIndex = 3;
                    removedCards[suitIndex].push(remaining[i].currentSuitOrder);
                }
            }
        }
        for (var i = playedindex.length - 1; i >= 0; i--) {
            this.props.game.remainingCards.splice(playedindex[i],1);
        };
        remaining = this.props.game.remainingCards;
        for (var i = 0 ; i <= remaining.length - 1; i++) {
            if(remaining[i].suit == 'S' && removedCards[0].length!=0){
                for (var j = removedCards[0].length - 1; j >= 0; j--) {
                    if(remaining[i].currentSuitOrder > removedCards[0][j]) remaining[i].currentSuitOrder--;
                };
            }
            if(remaining[i].suit == 'H' && removedCards[1].length!=0){
                for (var j = removedCards[1].length - 1; j >= 0; j--) {
                    if(remaining[i].currentSuitOrder > removedCards[1][j]) remaining[i].currentSuitOrder = remaining[i].currentSuitOrder - 1;
                };
            }
            if(remaining[i].suit == 'C' && removedCards[2].length!=0){
                for (var j = removedCards[2].length - 1; j >= 0; j--) {
                    if(remaining[i].currentSuitOrder > removedCards[2][j]) remaining[i].currentSuitOrder--;
                };
            }
            if(remaining[i].suit == 'D' && removedCards[3].length!=0){
                for (var j = removedCards[3].length - 1; j >= 0; j--) {
                    if(remaining[i].currentSuitOrder > removedCards[3][j]) remaining[i].currentSuitOrder--;
                };
            }
        }
        this.props.game.remainingCards = remaining;
        playedindex.splice(0,playedindex.length);
        // // console.log(remaining);
    },
    updateScores : function (){
        if(this.props.game.gameTurn%30 == 1 && (this.playerId == this.props.game.activePlayerId)){
            // this.props.game.allPlayedCards.splice(0,this.props.game.allPlayedCards.length);
                    var data = {
                        gameEvent : 'NEXT_ROUND'
                    }
                    this.clickHandler(data);
                    // console.log('NEXT');
        }else{
            if(this.type == 'BOTS'){
                if(this.props.game.gameTurn%30 == 1){
                    this.props.game.allPlayedCards.splice(0,this.props.game.allPlayedCards.length);
                    var data = {
                        gameEvent : 'NEXT_ROUND'
                    }
                    this.clickHandler(data);
                }else{
                    delayService.asyncTask(1000, this.checkBotPlay);      
                }
            }    
        }
        this.props.scope.updateScores(this.players);
        
    },
    checkBotPlay : function (){
        var self = this;
        if(this.type == 'BOTS' && this.props.game.players[this.props.game.activePlayerId].type == 'bot'){
            var fn = function(){
                self.playBot();
            }
            var fn = delayService.asyncTask(2000, fn);
        }
    },
    playBot : function(){
        // // console.log(this.props.game.gameState);
        switch(this.props.game.gameState){
            case 'PLAY_CARD':
                var e = this.props.game.activePlayerId;
                // // console.log(e);
                var trump = this.props.game.trump;
                var turnSuit = this.props.game.turnSuit;
                var deck = this.props.game.players[e].cards;
                // // console.log(deck);
                var playableCards = Array();
                var trumpCards = Array();
                var cardToPlay = '';
                var minSuit = '';
                var suitCount = [{
                                    suit: 'S',
                                    count: 0
                                },
                                {
                                    suit: 'H',
                                    count: 0
                                },
                                {
                                    suit: 'D',
                                    count: 0
                                },
                                {
                                    suit: 'C',
                                    count: 0
                                }];
                for (var i = 0; i < deck.length; i++){
                    for (var j = suitCount.length - 1; j >= 0; j--) {
                        if(deck[i].suit == suitCount[j].suit){
                            suitCount[j].count++;
                        }
                    };
                    deck[i].winningProbability = 0;
                }
                deck = this.getWinningProbability(deck, suitCount);
                for (var i = 0; i < deck.length; i++){
                    if(deck[i].suit == turnSuit){
                        var a = deck[i];
                        playableCards.push(a);
                    }
                    if(deck[i].suit == trump){
                        var a = deck[i];
                        trumpCards.push(a);
                    }
                }
                if(this.getCurrentPosition() == 0){
                    cardToPlay = '';
                    minSuit = '';
                    for (var i = trumpCards.length - 1; i >= 0; i--) {
                        if(trumpCards[i].winningProbability == 1){
                            cardToPlay = trumpCards[i];
                            // console.log('Trump waali chaal :)');
                            break;
                        }
                    };
                    if(cardToPlay != ''){
                        this.cardPlayed(cardToPlay);
                        break;    
                    }
                    for (var i = deck.length - 1; i >= 0; i--) {
                        if(deck[i].winningProbability == 1){
                            cardToPlay = deck[i];
                            // console.log('I played my largest card xD');
                            break;
                        }
                    };
                    if(cardToPlay != ''){
                        this.cardPlayed(cardToPlay);
                        break;    
                    }
                    var validMinSuit = Array();
                    for (var i = suitCount.length - 1; i >= 0; i--) {
                        if(suitCount[i].count!=0 && suitCount[i].suit!=trump) {
                            validMinSuit.push(suitCount[i]);
                        }
                    };
                    if(validMinSuit.length != 0){
                        minSuit = validMinSuit[validMinSuit.length - 1];
                        for (var i = validMinSuit.length - 1; i >= 0; i--) {
                            if(validMinSuit[i].count < minSuit.count){
                                minSuit = validMinSuit[i];
                            }
                        };
                        // // console.log(minSuit);
                        var minSuitCards = Array();
                        for (var i = deck.length - 1; i >= 0; i--) {
                            if(deck[i].suit == minSuit.suit){
                                minSuitCards.push(deck[i]);
                            }
                        };
                        var card = minSuitCards[0];
                        for (var i = 0; i <= minSuitCards.length - 1; i++) {
                            if (minSuitCards[i].currentSuitOrder > card.currentSuitOrder){
                                card = minSuitCards[i];
                            }
                        };
                        if(card.currentSuitOrder > 2){
                            cardToPlay = card;
                            // console.log('Just removing this suit from my deck 8)');
                        }else{
                            cardToPlay = this.getSmallestCard(deck);
                            // console.log('This was my smallest card, no options with me ;(');
                        }
                    }else{
                        cardToPlay = this.getSmallestCard(deck);
                        // console.log('This was my smallest card, no options with me ;(');
                    }
                    if(cardToPlay != ''){
                        this.cardPlayed(cardToPlay);
                        break;    
                    }else{
                        // console.log('What the Fuck! Nothing to play.')
                    }
                }else if(this.getCurrentPosition() == 1 || this.getCurrentPosition() == 2){
                    var playedCards = this.props.game.playedCards;
                    var oppCard = Array();
                    var greaterCards = Array();
                    var cardToPlay = '';
                    for (var i = playedCards.length - 1; i >= 0; i--) {
                            for (var key in this.props.game.playedCards[i]) {
                                if (this.props.game.playedCards[i].hasOwnProperty(key)) {
                                    oppCard.push(playedCards[i])
                                    break;
                                }
                            }
                    };
                    // // console.log(playableCards);
                    // // console.log(trumpCards);
                    if(playableCards.length > 0){
                        var trumpHit = false;
                        var smallestPlayable = playableCards[playableCards.length - 1];
                        for (var i = playableCards.length - 1; i >= 0; i--) {
                            if(this.getCurrentPosition() == 1){
                                if(playableCards[i].winningProbability == 1){
                                    cardToPlay = playableCards[i];
                                    // console.log('I played the largest card :D');
                                    break;
                                }
                                if(playableCards[i].rank > oppCard[0].rank){
                                    greaterCards.push(playableCards[i]);
                                }
                            }else{
                                if(playableCards[i].rank > oppCard[0].rank && playableCards[i].rank > oppCard[1].rank){
                                    greaterCards.push(playableCards[i]);
                                }    
                                if((oppCard[0].suit == trump && oppCard[1].suit != trump) || (oppCard[0].suit != trump && oppCard[1].suit == trump)){
                                    trumpHit = true;
                                }
                            }
                            if(playableCards[i].currentSuitOrder > smallestPlayable.currentSuitOrder){
                                smallestPlayable = playableCards[i];
                            }
                        };
                        if(trumpHit){
                            cardToPlay = smallestPlayable;
                            // console.log('Only smaller cards to be sacrificed to a trump');
                        }
                        if(cardToPlay != ''){
                            this.cardPlayed(cardToPlay);
                            break;
                        }
                        var cardToPlay = greaterCards[greaterCards.length - 1];
                        for (var i = greaterCards.length - 1; i >= 1; i--) {
                            if(greaterCards[i].currentSuitOrder > cardToPlay.currentSuitOrder){
                                cardToPlay = greaterCards[i];
                            }
                        };
                        if(greaterCards.length > 0){
                            this.cardPlayed(cardToPlay);
                            // console.log('I played a larger card :)');
                            break;    
                        }else{
                            this.cardPlayed(smallestPlayable);
                            // console.log('I played the smallest playable card :(');
                            break;
                        }
                    }else if(trumpCards.length > 0){
                        var trumpHit = false;
                        if(this.getCurrentPosition() == 2){
                            if(oppCard[0].suit == trump && oppCard[1].suit != trump){
                                    trumpHit = true;
                                    var oppTrump = oppCard[0];
                            }
                            if(oppCard[0].suit != trump && oppCard[1].suit == trump){
                                trumpHit = true;
                                var oppTrump = oppCard[1];
                            }
                        }
                        if(trumpHit){
                            var greaterTrumps = Array();
                            for (var i = trumpCards.length - 1; i >= 0; i--) {
                                if(trumpCards[i].rank > oppTrump.rank){
                                    greaterTrumps.push(trumpCards[i]);
                                }
                            };
                            // console.log(greaterTrumps);
                            var cardToPlay = greaterTrumps[greaterTrumps.length - 1]
                            for (var i = greaterTrumps.length - 1; i >= 0; i--) {
                                if(greaterTrumps[i].currentSuitOrder > cardToPlay.currentSuitOrder){
                                    cardToPlay = greaterTrumps[i];
                                }
                            };
                            if(greaterTrumps.length > 0 && cardToPlay !=''){
                                this.cardPlayed(cardToPlay);
                                // console.log('Guess what, I have a bigger trump, bitch! xD');
                                break;     
                            }
                        }
                        var cardToPlay = trumpCards[trumpCards.length - 1];
                        for (var i = trumpCards.length - 1; i >= 1; i--) {
                            if(trumpCards[i].currentSuitOrder > cardToPlay.currentSuitOrder){
                                cardToPlay = trumpCards[i];
                            }
                        };
                        this.cardPlayed(cardToPlay);
                        // console.log('Taste my little trump, bitch! xD');
                        break;    
                        
                    }else{
                        var validMinSuit = Array();
                        for (var i = suitCount.length - 1; i >= 0; i--) {
                            if(suitCount[i].count!=0 && suitCount[i].suit!=trump) {
                                validMinSuit.push(suitCount[i]);
                            }
                        };
                        minSuit = validMinSuit[validMinSuit.length - 1];
                        for (var i = validMinSuit.length - 1; i >= 0; i--) {
                            if(validMinSuit[i].count < minSuit.count){
                                minSuit = validMinSuit[i];
                            }
                        };
                        // // console.log(validMinSuit);
                        var minSuitCards = Array();
                        for (var i = deck.length - 1; i >= 0; i--) {
                            if(deck[i].suit == minSuit.suit){
                                minSuitCards.push(deck[i]);
                            }
                        };
                        var card = minSuitCards[0];
                        for (var i = 0; i <= minSuitCards.length - 1; i++) {
                            if (minSuitCards[i].currentSuitOrder > card.currentSuitOrder){
                                card = minSuitCards[i];
                            }
                        };
                        if(card.currentSuitOrder > 2){
                            this.cardPlayed(card);
                            // console.log('Just removing this suit from my deck 8)');
                            break;    
                        }else{
                            var card = this.getSmallestCard(deck);
                            this.cardPlayed(card);
                            // console.log('This was my smallest card, no options with me ;(');
                            break;
                        }
                    }
                }
                // console.log('No cards to Play! Fuck!');
                break;
            case 'SET_TRUMP':
                // // console.log('bot setting Trump now');
                var e = this.props.game.activePlayerId;
                var deck = this.props.game.players[e].cards;
                // var trumps = ['S', 'H', 'C', 'D'];
                var suitWeight = [{
                                    suit: 'S',
                                    weight: 0
                                },
                                {
                                    suit: 'H',
                                    weight: 0
                                },
                                {
                                    suit: 'C',
                                    weight: 0
                                },
                                {
                                    suit: 'D',
                                    weight: 0
                                }];
                // var trump = trumps[Math.floor(Math.random()*trumps.length)];
                for (var i = deck.length - 1; i >= 0; i--) {
                    for (var j = suitWeight.length - 1; j >= 0; j--) {
                        if(deck[i].suit == suitWeight[j].suit){
                            suitWeight[j].weight += deck[i].rank;
                        }
                    };
                };
                // // console.log(suitWeight);
                maxSuitWeight = suitWeight[suitWeight.length - 1];
                for (var i = suitWeight.length - 1; i >= 0; i--) {
                    if(suitWeight[i].weight > maxSuitWeight.weight){
                        maxSuitWeight = suitWeight[i];
                    }
                };
                var trump = maxSuitWeight.suit;
                var self = this;
                var fn = function () {
                    self.setTrump(trump);
                }
                delayService.asyncTask(1000, fn);
                break;
            case 'WITHDRAW_CARD':
                var cardIndex = Math.floor(Math.random()*10);
                var self = this;
                var data = {
                        gameState : 'WITHDRAW_CARD',
                        gameEvent : 'WITHDRAW_CARD',
                        card : cardIndex,
                    }
                var fn = function () {
                    self.clickHandler(data);
                }
                delayService.asyncTask(2000, fn);
                    // socket.emit('GAME', {data : data});
                break;
            case 'RETURN_CARD':
                var e = this.props.game.activePlayerId;
                var deck = this.props.game.players[e].cards;
                var trump = this.props.game.trump;
                var minSuit = '';
                var suitCount = [{
                                    suit: 'S',
                                    count: 0
                                },
                                {
                                    suit: 'H',
                                    count: 0
                                },
                                {
                                    suit: 'D',
                                    count: 0
                                },
                                {
                                    suit: 'C',
                                    count: 0
                                }];
                for (var i = 0; i < deck.length; i++){
                    for (var j = suitCount.length - 1; j >= 0; j--) {
                        if(deck[i].suit == suitCount[j].suit){
                            suitCount[j].count++;
                        }
                    };
                }
                var validMinSuit = Array();
                for (var i = suitCount.length - 1; i >= 0; i--) {
                    if(suitCount[i].count!=0 && suitCount[i].suit!=trump) {
                        validMinSuit.push(suitCount[i]);
                    }
                };
                minSuit = validMinSuit[validMinSuit.length - 1];
                for (var i = validMinSuit.length - 1; i >= 0; i--) {
                    if(validMinSuit[i].count < minSuit.count){
                        minSuit = validMinSuit[i];
                    }
                };
                var minSuitCardIndex = Array();
                for (var i = deck.length - 1; i >= 0; i--) {
                    if(deck[i].suit == minSuit.suit){
                        minSuitCardIndex.push(i);
                    }
                };
                var cardIndex = minSuitCardIndex[0];
                for (var i = 0; i <= minSuitCardIndex.length - 1; i++) {
                    if (deck[minSuitCardIndex[i]].rank < deck[cardIndex].rank){
                                cardIndex = minSuitCardIndex[i];
                    }
                };
                if(deck[cardIndex].rank < 11){
                    var selectedCardIndex = cardIndex
                }else{
                    var smallestIndex = deck.length - 1;
                    for (var i = deck.length - 1; i >= 1; i--) {
                        if(deck[smallestIndex].suit == trump && deck[i].suit!=trump){
                            smallestIndex = i;
                        }
                        if(deck[i].rank < deck[smallestIndex].rank && deck[i].suit != trump){
                            smallestIndex = i;
                        }
                    };
                    var selectedCardIndex = smallestIndex;
                }
                var self = this;
                var data = {
                        gameState : 'RETURN_CARD',
                        gameEvent : 'RETURN_CARD',
                        card : selectedCardIndex,
                    }
                var fn = function () {
                    self.clickHandler(data);
                }
                delayService.asyncTask(2000, fn);
                break;
            default: 
                break;
        }   
    },
    getSmallestCard : function (deck){
        var smallest = deck[deck.length - 1];
        for (var i = deck.length - 1; i >= 1; i--) {
            if(deck[i].currentSuitOrder > smallest.currentSuitOrder && deck[i].suit != this.props.game.trump){
                smallest = deck[i];
            }
        };
        return smallest;
    },
    getWinningProbability: function(deck, suitCount){
        var remaining = this.props.game.remainingCards;
        var abc=0;
        for (var j = remaining.length - 1; j >= 0; j--) {
            remaining[j].mycard = false;
            for (var i = deck.length - 1; i >= 0; i--) {
                if(deck[i].suit == remaining[j].suit && deck[i].rank == remaining[j].rank){
                    deck[i].currentSuitOrder = remaining[j].currentSuitOrder;
                    remaining[j].mycard = true;
                }
            } 
        }
        for (var i = deck.length - 1; i >= 0; i--) {
            var smaller = 0;
            var total = 0;
            var thissuitCount = 0;
            for (var k = suitCount.length - 1; k >= 0; k--) {
                if(suitCount[k].suit == deck[i].suit){
                    thissuitCount = suitCount[k].count;
                    break;
                }
            };
            for (var j = remaining.length - 1; j >= 0; j--) {
                if(deck[i].suit == remaining[j].suit){
                    total ++;
                    if(deck[i].currentSuitOrder < remaining[j].currentSuitOrder && !remaining[j].mycard){
                        smaller++;
                    }
                } 
            }
            if(smaller<2 || (total - thissuitCount) <2) continue;
            deck[i].winningProbability = this.C(smaller,2)/this.C((total - thissuitCount),2);
        };
        return deck;
    },
    factorial: function(x){
        if(x==0) {
            return 1;
        }
        return x * this.factorial(x-1);
    },
    C: function(n,r){
        return this.factorial(n)/(this.factorial(r)*this.factorial(n-r));
    },
    getCurrentPosition : function(){
        var pos = 0;
        for (var i = this.props.game.players.length - 1; i >= 0; i--) {
            var temp = 0;
            for (var key in this.props.game.playedCards[i]) {
               if (this.props.game.playedCards[i].hasOwnProperty(key)) {
                    pos = pos + 1;
                    break;
               }
            }
        }
        return pos;
    },
    cardPlayed : function (card, player){
        var sendEvent = false;
        this.props.game.lastPlayerId = this.props.game.activePlayerId;
        var activePlayer = this.props.game.activePlayerId;
        var activePlayerIndex = this.getPlayerIndexFromId(activePlayer);
        var playerPosition = this.getPlayerIndexFromId(player);
        if((this.props.game.players[activePlayerIndex].type == 'bot' || (this.playerId == this.props.game.activePlayerId && player == this.props.game.activePlayerId)) && this.props.game.gameState == 'PLAY_CARD'){
            var data = {
                gameState : 'PLAY_CARD',
                gameEvent : 'PLAY_CARD',
                cardPlayed : card,
                activePlayerId : this.props.game.activePlayerId
            }
            sendEvent = true;
        }
        if(this.playerId == this.props.game.activePlayerId && this.props.game.gameState == 'WITHDRAW_CARD' && player == this.props.game.otherPlayerId){
            for (var i = this.players[playerPosition].cards.length - 1; i >= 0; i--){
                if(this.players[playerPosition].cards[i].suit == card.suit && this.players[playerPosition].cards[i].rank == card.rank){
                    cardIndex = i;
                }
            }
            var data = {
                        gameState : 'WITHDRAW_CARD',
                        gameEvent : 'WITHDRAW_CARD',
                        card : cardIndex,
                    }
            sendEvent = true;
        }
        if(this.playerId == this.props.game.activePlayerId && this.props.game.gameState == 'RETURN_CARD' && player == this.props.game.activePlayerId){
            for (var i = this.players[activePlayerIndex].cards.length - 1; i >= 0; i--){
                if(this.players[activePlayerIndex].cards[i].suit == card.suit && this.players[activePlayerIndex].cards[i].rank == card.rank){
                    cardIndex = i;
                }
            };
            var data = {
                        gameState : 'RETURN_CARD',
                        gameEvent : 'RETURN_CARD',
                        card : cardIndex,
                    }
            sendEvent = true;

        }
        if(sendEvent){
            this.clickHandler(data);            
        }
    },
    
    render : function(){
        var gameBodyStyle = scaleGameBody();
        gameBodyStyle.width = gameCSSConstants.gameWindow.x;
        gameBodyStyle.height = gameCSSConstants.gameWindow.y;
        gameBodyStyle.position = 'absolute';
        return (
            React.createElement("div", {id: "war_game_component", style: gameBodyStyle, className: "game-body"}, 
            React.createElement(BlockComponent),
            React.createElement(TrumpComponent, {trump: this.props.game.trump, setTrump: this.setTrump, gameState: this.props.game.gameState, playerId : this.props.playerId, activePlayerId: this.props.game.activePlayerId}), 
            React.createElement(PlayedCardsComponent, {playedCards: this.playedCards}), 
            React.createElement(GameStateInfo, {gameState: this.props.game.gameState, players: this.props.game.players, activePlayerId: this.props.game.activePlayerId, otherPlayerId: this.props.game.otherPlayerId, lastPlayerId: this.props.game.lastPlayerId}), 
            React.createElement(PlayerComponent, {player: this.props.game.players[0], playerIds: this.playerIds, scope: this.props.scope, cardPlayed: this.cardPlayed, position: 0, activePlayerId: this.props.game.activePlayerId, suit : this.props.game.turnSuit, trump : this.props.game.trump}), 
            React.createElement(PlayerComponent, {player: this.props.game.players[1], playerIds: this.playerIds, scope: this.props.scope, cardPlayed: this.cardPlayed, position: 1, activePlayerId: this.props.game.activePlayerId, suit : this.props.game.turnSuit, trump : this.props.game.trump}), 
            React.createElement(PlayerComponent, {player: this.props.game.players[2], playerIds: this.playerIds, scope: this.props.scope, cardPlayed: this.cardPlayed, position: 2, activePlayerId: this.props.game.activePlayerId, suit : this.props.game.turnSuit, trump : this.props.game.trump})
            )
        );
    }
});
var BlockComponent = React.createClass({displayName: "BlockComponent",
    handleEventProp : function(e){
        // // console.log(e.type);
        e.stopPropagation();
        e.preventDefault();
        e.bubbles = false;
    },
    render : function(){
        var disableBlockStyle = disableBlockCSS();
        return (
            React.createElement("div", {'data-display': "none", id: "bottomPlayerDiabled", style: disableBlockStyle, className: "bottom-player-diabled", onTouchEnd: this.handleEventProp, onClick: this.handleEventProp, onTouchStart: this.handleEventProp})
            );
        }
});
var GameStateInfo = React.createClass({displayName: "GameStateInfo",
    render : function (){
        var gameState = this.props.gameState;
        var players = this.props.players;
        var activePlayerId = this.props.activePlayerId;
        var otherPlayerId = this.props.otherPlayerId;
        for (var i = players.length - 1; i >= 0; i--) {
            if(players[i].id == this.props.activePlayerId){
                activePlayerId = i;
            }
            if(players[i].id == this.props.otherPlayerId){
                otherPlayerId = i;
            }
        };
        switch(gameState){
            case 'PLAY_CARD':
                if(activePlayerId == 0){
                    var statusString = 'Your';
                }else{
                    var statusString = players[activePlayerId].name+"'s";   
                }
                statusString+= ' turn. Play Card.';
                break;
            case 'SET_TRUMP':
                if(activePlayerId == 0){
                    var statusString = 'Your';
                }else{
                    var statusString = players[activePlayerId].name+"'s";   
                }
                statusString+= ' turn. Set Trump.';
                break;
            case 'WITHDRAW_CARD':
                if(activePlayerId == 0){
                    var statusString = 'Your';
                }else{
                    var statusString = players[activePlayerId].name+"'s";   
                }
                if(activePlayerId == 0){
                    statusString+= " turn. Select a card from "+players[otherPlayerId].name+"'s cards to withdraw card";
                }else{
                    statusString+= " turn. "+players[activePlayerId].name+" withdrawing card from "+players[otherPlayerId].name;
                }
                
                break;
            case 'RETURN_CARD':
                if(activePlayerId == 0){
                    var statusString = 'Your';
                }else{
                    var statusString = players[activePlayerId].name+"'s";   
                }
                // statusString+= ' turn. Return card to '+players[otherPlayerId].name;
                if(activePlayerId == 0){
                    statusString+= " turn. Select a card from your deck to return card to "+players[otherPlayerId].name;
                }else{
                    statusString+= " turn. "+players[activePlayerId].name+" returning card to "+players[otherPlayerId].name;
                }
                break;
        }
        var textStyle = {
            bottom : '12px',
            position : 'relative'
        }
        var divStyle = {
            top : 260
        }
        return (
                React.createElement("div", {className: "game-status", style : divStyle}, 
                React.createElement("h2", {style : textStyle}, statusString)
                )
        );
    }
});
var TrumpComponent = React.createClass({displayName: "TrumpComponent",
    getInitialState : function (){
        return {
            trumps : ['S', 'H', 'C', 'D'],
        }
    },
    handleClick : function (trump){
        if(this.props.playerId == this.props.activePlayerId && this.props.gameState == 'SET_TRUMP'){
            angular.element('.bottom-player-diabled').css('display', 'block');
            this.props.setTrump(trump);    
        }
    },
    render : function(){
            var self = this;
            var gameState = self.props.gameState;
            var trumpNodes = this.state.trumps.map(function (trump, index){
                var style = getTrumpStyle(trump, self.props.trump, index, gameState);
                style.border = 'none';
                style.boxShadow = 'none';
                style.background = 'trasparent';
                if(style.zIndex == 0){
                    style.display = 'none';
                }else{
                    style.display = 'block';
                }
                return (React.createElement(TrumpCardComponent, {key: trump, style: style, trump: trump, click: self.handleClick}))
            });
            var style = {
                position : 'relative',
                bottom : '25%'
            }
            return (
                React.createElement("div", {className: "trumps", style : style}, 
                    trumpNodes
                )
            )
        }
});
var TrumpCardComponent = React.createClass({displayName: "TrumpCardComponent",
    handleClick : function(e){
        this.props.click(e.props.trump);
    },
    render : function (){
        var style = this.props.style;
        style.width = gameCSSConstants.cardSize.x;
        style.height = gameCSSConstants.cardSize.y*0.8;
        style.border = 'none';
        var trumpClass = 'card '+this.props.trump;
        var cardStyle = {
            border : 'none',
            border : 'none',
            boxShadow : 'none',
            background : 'none'
                
        }
        return (
                    // React.createElement("div", {className: "playingCards simpleCards card trump-cards", style: this.props.style, onClick: this.handleClick.bind(null, this)}, 
                        React.createElement("div", {className: "playingCards simpleCards card trump-cards", style: this.props.style, onClick: this.handleClick.bind(null, this)}, 
                        React.createElement("a", {className: trumpClass, style : cardStyle},
                            React.createElement("span", {className: 'suit'},'')
                        )
                    )
                )
    }
});
var PlayerComponent = React.createClass({displayName: "PlayerComponent",
    getInitialState : function (){
        return {
            player : null,
            mounted : false,
            style : {    
                    width : 100,
                    height : 50,
                    left : 0,
                    top : 0,
                    'transform' : 'translateX(0px) translateY(0px)'
                }
        }
    },
    componentDidMount : function (){
        if(this.props.player.id == 0){
        }
    },
    handleCardClick : function (card, player) {
            this.props.cardPlayed(card, player);
    },
    shouldComponentUpdate : function (nextProps, nextState) {
        return true;
    },
    getActiveStatus : function (){
        var trump = this.props.trump;
        var suit = this.props.suit;
        var n = 0;
        for (var i = this.props.player.cards.length - 1; i >= 0; i--) {
            if(this.props.player.cards[i]){
                this.props.player.cards[i].isPlayable = true;
                if(this.props.suit && this.props.player.cards[i].suit == this.props.suit){
                    n++;
                }
            }
        }
        if(n > 0){
            for (var i = this.props.player.cards.length - 1; i >= 0; i--) {
                if(this.props.suit && this.props.player.cards[i].suit != this.props.suit){
                    this.props.player.cards[i].isPlayable = false;;
                }
            }
        }
    },
    render : function () {
        var player = this.props.player;
        var self = this;
        var noOfCards = this.props.player.cards.length;
        var activePlayerId = this.props.activePlayerId;
        var position = this.props.position;
        var updateCards = true;
        if(player.msg){
            updateCards = false;
        }
        // if(position == 1){
            // if(this.props.player.cardWillBeMovedFrom){
            //     // console.log(position);
            //     // console.log('Yes');
            // }
        // }
        this.getActiveStatus();
        var cards = this.props.player.cards.map(function (card, index){
            if(card){
                var cardStyle = getCardPic(card);
                var cardKey = card.rank+'.'+card.suit;
                return React.createElement(CardComponent, {playerIds: self.props.playerIds, updateCards : updateCards, scope: self.props.scope, key: cardKey, card: card, index: index, position: self.props.position, playerId: self.props.player.id, noOfCards: noOfCards, cardClicked: self.handleCardClick, cardStyle: cardStyle, suit : self.props.suit, trump : self.props.trump, cardWillBeMovedFrom : self.props.player.cardWillBeMovedFrom})    
            }
            
        });
        return (
            React.createElement("div", null, 
            React.createElement(PlayerInfoComponent, {player: player, activePlayerId: activePlayerId, position: position}), 
            cards
            )
        )
    }
});
var PlayerInfoComponent = React.createClass({displayName: "PlayerInfoComponent",
    componentDidMount : function (){
    },
    getInitialState : function(){
        return {
            msg : '',   
        }
    },
    componentWillUpdate : function(nextProps, nextState){
        if(nextProps.player.msg == this.msg){
            this.msg = '';
        }else{
            this.msg = nextProps.player.msg;
        }
    },
    timeout : function (ms, fn) {
        var timeout, promise;
          promise = new Promise(function(resolve, reject) {
            timeout = setTimeout(function() {
              fn();
            }, ms);
          });
          return {
                   promise:promise, 
                   cancel:function(){clearTimeout(timeout);} //return a canceller as well
                 };
    },
    render : function () {
        var id = this.props.player.id;
        var name = this.props.player.name;
        var type = this.props.player.type;
        var image = this.props.player.image;
        var position = this.props.position;
        var scores = this.props.player.scores[this.props.player.scores.length - 1];
        var handsMade = scores.handsMade;
        var handsToMake = scores.handsToMake;
        var activePlayerId = this.props.activePlayerId;
        var msg = this.props.player.msg;
        var msg = this.msg;
        var cx = React.addons.classSet;
        var profileClasses;
        if (position!=0) {
            if(this.msg && this.msg.length > 0){
                if(this.timeoutObj){
                    this.timeoutObj.cancel();    
                }
                profileClasses = cx({
                    'players-profile' : true,
                    'anim-start' : true,
                    'anim-end' : false
                });
                var self = this;
                var fn = function(){
                    self.msg = '';
                    self.setState({msg : self.props.player.msg});
                }
                this.timeoutObj = this.timeout(3000, fn);
            }else{
                    profileClasses = cx({
                        'players-profile' : true,
                        'anim-start' : false,
                        'anim-end' : true
                    });
            }
        }
        switch(position){
            case 0:
                name = 'You';
                var className = 'players-profile bottom-player';
                var divStyle = {
                    bottom : -3,
                }
                break;
            case 1:
                var className = 'left-player';
                var divStyle = {
                    top : 190,
                    left : -10,
                }
                break;
            case 2:
                var className = 'right-player';
                var divStyle = {
                    top : 190,
                    right : -10,
                }
                break;
        }
        var playerClass  = ''
        if(id == activePlayerId){
        //    playerClass  = 'ball player-active';
        }
        var isInt = function(value) {
            return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
        }
        if(type == 'local' || type == 'bot' || type == 'you'){
            var picurl = 'assets/img/avatars.png';
            var index = image;
            var backgroundPosition = index*45+'px 0px';
            if(type == 'you' && !isInt(image) && image.indexOf("facebook") > -1){
                var picurl = image;
                var backgroundundPosition = '50% 50%';    
            }
        }else{
            var picurl = image;
            var backgroundundPosition = '50% 50%';
        }
        var playerStyle = {
                /*background: '#fff url('+picurl+')',
                backgroundPosition : backgroundPosition*/
            }
            if(this.props.player.status == 'disconnected'){
                var stats = 'disconnected...';
            }else{
                var stats = handsMade+"/"+handsToMake;
            }
            var statStyle = {
                position : 'relative',
                width : 'inherit',
                top : 0,
                left : 0
            }
        return (
            React.createElement("div", {className: className, style: divStyle}, 
                React.createElement("div", {className: profileClasses}, 
                    React.createElement("div", {className: playerClass, style: playerStyle}, 
                        React.createElement("div", {className: "name"}, name), 
                        React.createElement(StatisticsComponent, {player: this.props.player})
                    ),
                    React.createElement("div", {className : "notif"},
                        React.createElement("div", {className : "bar"},
                            React.createElement("p", {className : "text"}, msg
                            )
                        )
                    )
                )
            )
        )
    }
});
var StatisticsComponent = React.createClass({displayName: "StatisticsComponent",
    render : function (){
        var scores = this.props.player.scores[this.props.player.scores.length - 1];
        var handsMade = scores.handsMade;
        var handsToMake = scores.handsToMake;
        var cx = React.addons.classSet;
        statClasses = cx({
                        'stat-img' : true,
                        'fillgreen': true,
                    });
        var statClasses =[];
        if(this.props.player.status == 'disconnected'){
                var stats = 'disconnected...';
            }else{
                var stats = [];
                if(handsMade < handsToMake){
                    for (var i = 0; i < handsMade ; i++) {
                        statClasses.push(cx({
                                            'stat-img' : true,
                                            'fillgreen': false, 
                                            'fillgrey': false, 
                                            'fillblue': false, 
                                            'fillred': true, 
                                        }));
                    }
                    for (var i = 0; i < handsToMake-handsMade ; i++) {
                        statClasses.push(cx({
                                            'stat-img' : true,
                                            'fillgreen': false, 
                                            'fillgrey': true, 
                                            'fillblue': false, 
                                            'fillred': false, 
                                        }));
                    }
                    for (var i = 0; i < handsToMake ; i++) {
                        stats.push(React.createElement("div", {className: statClasses[i]}));
                    }    
                }else if(handsMade == handsToMake){
                    for (var i = 0; i < handsMade ; i++) {
                        statClasses.push(cx({
                                            'stat-img' : true,
                                            'fillgreen': false, 
                                            'fillgrey': false, 
                                            'fillblue': true, 
                                            'fillred': false, 
                                        }));
                    }
                    for (var i = 0; i < handsToMake ; i++) {
                        stats.push(React.createElement("div", {className: statClasses[i]}));
                    }   
                }else if(handsMade > handsToMake){
                    for (var i = 0; i < handsToMake ; i++) {
                        statClasses.push(cx({
                                            'stat-img' : true,
                                            'fillgreen': false, 
                                            'fillgrey': false, 
                                            'fillblue': true, 
                                            'fillred': false, 
                                        }));
                    }
                    for (var i = 0; i < handsMade-handsToMake ; i++) {
                        statClasses.push(cx({
                                            'stat-img' : true,
                                            'fillgreen': true, 
                                            'fillgrey': false, 
                                            'fillblue': false, 
                                            'fillred': false, 
                                        }));
                    }
                    for (var i = 0; i < handsMade ; i++) {
                        stats.push(React.createElement("div", {className: statClasses[i]}));
                    }   
                }
                
            }
        return (
                    React.createElement("div", {className: "statistics"}, {stats: stats})
                )
    }
});
var PlayedCardsComponent = React.createClass({displayName: "PlayedCardsComponent",
    getInitialState : function () {
        return {

        }
    },
    render : function(){
        var cards = this.props.playedCards.map(function (card, index){
            if(typeof card.moveTo == 'undefined'){
                switch(index){
                    case 0:
                        var posY = -(gameCSSConstants.cardSize.y + 40);
                        var posX = gameCSSConstants.gameWindow.x/2 - gameCSSConstants.cardSize.x/2;
                        break;
                    case 1:
                        var posY = -(2*gameCSSConstants.cardSize.y + 40);
                        var posX = gameCSSConstants.gameWindow.x/3 - gameCSSConstants.cardSize.x/2;
                        // var posX = 0;
                        break;
                    case 2:
                        var posY = -(2*gameCSSConstants.cardSize.y + 40);
                        var posX = 2*gameCSSConstants.gameWindow.x/3 - gameCSSConstants.cardSize.x/2;
                        // var posX = gameCSSConstants.gameWindow.x - gameCSSConstants.cardSize.x;
                }
            }else{
                var fullDeckWidth = 9*(gameCSSConstants.cardLeftMargin) + gameCSSConstants.cardSize.x;
                switch(card.moveTo){
                    case 0:
                        var posY = 0;
                        var posX = 0.5*(gameCSSConstants.gameWindow.x - gameCSSConstants.cardSize.x);
                        break;
                    case 1:
                        var posY = -(gameCSSConstants.gameWindow.y - gameCSSConstants.cardSize.y - 60 - 2*gameCSSConstants.gameWindow.padding);
                        // var posX = 0.5*(fullDeckWidth - gameCSSConstants.cardSize.x);
                        var posX = 0;
                        break;
                    case 2:
                        var posY = -(gameCSSConstants.gameWindow.y - gameCSSConstants.cardSize.y - 60 - 2*gameCSSConstants.gameWindow.padding);
                        // var posX = gameCSSConstants.gameWindow.x - 0.5*(fullDeckWidth - gameCSSConstants.cardSize.x);
                        var posX = gameCSSConstants.gameWindow.x - gameCSSConstants.cardSize.x;
                        break;
                }
            }
            var style = {
                height : gameCSSConstants.cardSize.y,
                width : gameCSSConstants.cardSize.x,
                left : 0,
                top : (gameCSSConstants.gameBody.y - (gameCSSConstants.cardSize.y)),
                transform : 'translateX('+posX+'px) translateY('+posY+'px)',
                display : 'none'
            }
            if(card.display){
                style.display = 'block';
            }
            var frontClassName = 'card frontRotated';
            var backClassName = 'card backRotated';
            
            var cardRank = card.rank;
            var cardSuit = card.suit;
            var getCardSuit = function () {
                var x = '';
                if(cardSuit == 'H')
                    return '&hearts;';
                if(cardSuit == 'S')
                    return '&spades;';
                if(cardSuit == 'D')
                    return '&diams;';
                if(cardSuit == 'C')
                    return '&clubs;';
            }
            var cardSuitHTML = getCardSuit();
            var x = function () {
              return {__html: cardSuitHTML}
            }
            var getRankForHTML = function(card){
                if(card.rank == 13){
                    return 'A';
                }else if(card.rank == 12){
                    return 'K';
                }else if(card.rank == 11){
                    return 'Q';
                }else if(card.rank == 10){
                    return 'J';
                }else{
                    return card.rank+1;
                }
            }
            var cardRank = getRankForHTML(card);
            var rankClassName = 'rank-'+card.rank+' '+cardSuit;
            frontClassName = frontClassName+' '+rankClassName;
            var classSet = 'card playingCards simpleCards';
            if(card.suit){
                var cardKey = card.suit+'_'+card.rank;
                // return (
                //     React.createElement("div", {className: classSet, style: style},
                //         React.createElement("a", {className: frontClassName},
                //             React.createElement("span", {className: 'rank'}, cardRank),
                //             React.createElement("span", {className: 'suit', dangerouslySetInnerHTML : x()})
                //         ),
                //         React.createElement("a", {className: backClassName})
                //     )
                // )
                return (
                        React.createElement("div", {className: classSet, style: style},
                            React.createElement("a", {className: frontClassName},
                                React.createElement("span", {className: 'rank'}, cardRank),
                                React.createElement("span", {className: 'suit', dangerouslySetInnerHTML : x()})
                            ),
                            React.createElement("a", {className: backClassName})
                        )
                )
                // if(globalVars.activeCardFront == 'cardFront1'){
                //     return (
                //         React.createElement("div", {className: classSet, style: style},
                //             React.createElement("a", {className: frontClassName},
                //                 React.createElement("span", {className: 'rank'}, cardRank),
                //                 React.createElement("span", {className: 'suit', dangerouslySetInnerHTML : x()})
                //             ),
                //             React.createElement("a", {className: backClassName})
                //         )
                //     )
                // }else if(globalVars.activeCardFront == 'cardFront2'){
                //     var cardStyle = getCardPic(card);
                //     return (
                //         React.createElement("div", {key: cardKey, className: "card", style: style}, 
                //             React.createElement("a", {className: frontClassName, style: cardStyle}), 
                //             React.createElement("a", {className: backClassName})
                //         )
                //     )
                // }
            }
        });
        return (
                React.createElement("div", null, 
                    cards
                )
            )
    }
})
var CardComponent = React.createClass({displayName: "CardComponent",
    getInitialState : function (){
        return {
            shuffle : true,
            style : {
                left : gameCSSConstants.deckCSS.x,
                top : gameCSSConstants.deckCSS.y,
                height : gameCSSConstants.cardSize.y,
                width : gameCSSConstants.cardSize.x
            }
        }
    },
    getInitialCardCSS : function(){
        return {
            
        }
    },
    componentDidMount : function(){
        var self = this;
        var t = (this.props.index+this.props.position+2)*100;
        var fn = function (){
            self.setState({mounted : true})
        }
        if(this.props.cardWillBeMovedFrom){
            fn();
        }else{
            if(this.props.card.animation != false){
                delayService.asyncTask(t, fn);
            }else{
                fn();
            } 
        }
        
        
    },
    componentWillLeave : function(){
        this.state.style.transform = 'translateX(0px) translateY(0px)';
    },
    handleClick : function(card, player, e){
        if(!card.isPlayable){
            // console.log('You cannot play this card!');
            e.stopPropogation;
        }else{
            this.props.cardClicked(card, player);
        }
    },
    handleTouch : function(){
        // // console.log('touched');
    },
    componentWillReceiveProps : function (nextProps, nextState) {
        this.props = nextProps;
    },
    render : function (){
        var style = this.state.style;
        var cardStyle = this.props.cardStyle;
        var index = this.props.index;
        var playerId = this.props.playerId;
        var position = this.props.position;
        var card = this.props.card;
        var noOfCards = this.props.noOfCards;
        
        var cardWillBeMovedFrom = this.props.cardWillBeMovedFrom;
        var movingCardPosition = this.props.playerIds.indexOf(cardWillBeMovedFrom);
        if(movingCardPosition > -1){
            if(position != 2){
                if(card.moveFrom!=2){
                    noOfCards = noOfCards+1;
                }
            }
            card.animation = false;
        }
        // gameCSSConstants.cardSize.x = gameCSSConstants.cardSize.x*1.2;
        // gameCSSConstants.cardSize.x = gameCSSConstants.cardSize.y*1.2;
        var leftMargin = gameCSSConstants.cardLeftMargin;
        if(position == 0){
            leftMargin = 0.7*gameCSSConstants.cardSize.x
        }
        
        var fullDeckWidth = 9*(leftMargin) + gameCSSConstants.cardSize.x;
        var deckWidth = noOfCards*(leftMargin) + gameCSSConstants.cardSize.x;
        if(this.state.mounted){
            if(!card.state || card.state == 'deck'){
                switch(position){
                case 0:
                    var leftMargin = 0.7*gameCSSConstants.cardSize.x
                    var posY = 0;
                    var posX = 0.5*(gameCSSConstants.gameWindow.x - (noOfCards - 1)*(leftMargin) - gameCSSConstants.cardSize.x);
                        posX+= (index)*(leftMargin);
                    break;
                case 1:
                    var leftMargin = gameCSSConstants.cardLeftMargin*0.4;
                    var posY = -(gameCSSConstants.gameWindow.y - gameCSSConstants.cardSize.y - 2*gameCSSConstants.gameWindow.padding);
                    if(movingCardPosition == 0){
                        index = index+1;
                    }
                    var posX = 0;
                        //posX+= (index)*(leftMargin);
                        posY+= (index)*(leftMargin);
                    break;
                case 2:
                    var leftMargin = gameCSSConstants.cardLeftMargin*0.4;
                    var posY = -(gameCSSConstants.gameWindow.y - gameCSSConstants.cardSize.y - 2*gameCSSConstants.gameWindow.padding);
                    // var posX = gameCSSConstants.gameWindow.x - deckWidth;
                    var posX = gameCSSConstants.gameWindow.x - gameCSSConstants.cardSize.x;
                        // posX+= (index+1)*(leftMargin);
                        posY+= (index)*(leftMargin);
                }   
            }else if(card.state == 'played'){
                switch(position){
                case 0:
                    var posY = -(gameCSSConstants.cardSize.y + 40);
                    var posX = gameCSSConstants.gameWindow.x/2 - gameCSSConstants.cardSize.x/2;
                    break;
                case 1:
                    var posY = -(2*gameCSSConstants.cardSize.y + 40);
                    var posX = gameCSSConstants.gameWindow.x/3 - gameCSSConstants.cardSize.x/2;
                    break;
                case 2:
                    var posY = -(2*gameCSSConstants.cardSize.y + 40);
                    var posX = 2*gameCSSConstants.gameWindow.x/3 - gameCSSConstants.cardSize.x/2;
                }
            }else if(card.state == 'withdrawn'){
                var moveToPosition = this.props.playerIds.indexOf(card.moveTo);
                var moveFromPosition = this.props.playerIds.indexOf(card.moveFrom);
                var index = 10;
                switch(moveToPosition){
                    case 0:
                        // var leftMargin = gameCSSConstants.cardLeftMargin;
                        // if(position == 0){
                            var leftMargin = 0.7*gameCSSConstants.cardSize.x
                        // }
                        var posY = 0;
                        var posX = 0.5*(gameCSSConstants.gameWindow.x - (noOfCards - 1)*(leftMargin) - gameCSSConstants.cardSize.x);
                            posX+= (index-0.5)*(leftMargin);
                        break;
                    case 1:
                        if(moveFromPosition == 0){
                            index = 0;
                        }
                        var leftMargin = gameCSSConstants.cardLeftMargin*0.4;
                        var posY = -(gameCSSConstants.gameWindow.y - gameCSSConstants.cardSize.y - 2*gameCSSConstants.gameWindow.padding);
                        // var posX = 0.5*(fullDeckWidth -  (noOfCards - 1)*(leftMargin) - gameCSSConstants.cardSize.x);
                        var posX = 0;
                            // posX+= (index)*(leftMargin);
                            posY+= (index)*(leftMargin);
                        break;
                    case 2:
                        index = 0;
                        var leftMargin = gameCSSConstants.cardLeftMargin*0.4;
                        var posY = -(gameCSSConstants.gameWindow.y - gameCSSConstants.cardSize.y - 2*gameCSSConstants.gameWindow.padding);
                        // var posX = gameCSSConstants.gameWindow.x -0.5*(fullDeckWidth +  (noOfCards - 1)*(leftMargin) + gameCSSConstants.cardSize.x);
                        var posX = gameCSSConstants.gameWindow.x - gameCSSConstants.cardSize.x;
                            // posX+= (index-1)*(leftMargin);
                            posY+= (index-1)*(leftMargin);
                        break;
                }
            }else if(card.state == 'returned'){
                var moveToPosition = this.props.playerIds.indexOf(card.moveTo);
                var moveFromPosition = this.props.playerIds.indexOf(card.moveFrom);
                var index = 10;
                switch(moveToPosition){
                    case 0:
                        var leftMargin = 0.7*gameCSSConstants.cardSize.x
                        var posY = 0;
                        var posX = 0.5*(gameCSSConstants.gameWindow.x - (noOfCards - 1)*(leftMargin) - gameCSSConstants.cardSize.x);
                            posX+= (index-0.5)*(leftMargin);
                        break;
                    case 1:
                        if(moveFromPosition == 0){
                            index = 0;
                        }else{
                            index = 9;
                        }
                        var leftMargin = gameCSSConstants.cardLeftMargin*0.4;
                        var posY = -(gameCSSConstants.gameWindow.y - gameCSSConstants.cardSize.y - 2*gameCSSConstants.gameWindow.padding);
                        // var posX = 0.5*(fullDeckWidth -  (noOfCards - 1)*(leftMargin) - gameCSSConstants.cardSize.x);
                        var posX = 0;
                            // posX+= (index+0.5)*(leftMargin);
                            posY+= (index+0.5)*(leftMargin);
                        break;
                    case 2:
                        var leftMargin = gameCSSConstants.cardLeftMargin*0.4;
                        index = 0;
                        var posY = -(gameCSSConstants.gameWindow.y - gameCSSConstants.cardSize.y - 2*gameCSSConstants.gameWindow.padding);
                        // var posX = gameCSSConstants.gameWindow.x -0.5*(fullDeckWidth +  (noOfCards - 1)*(leftMargin) + gameCSSConstants.cardSize.x);
                        var posX = gameCSSConstants.gameWindow.x - gameCSSConstants.cardSize.x;
                            // posX+= (index+0.5)*(leftMargin);
                            posY+= (index+0.5)*(leftMargin);
                        break;
                }
            }
            style.transform = 'translateX('+posX+'px) translateY('+posY+'px)';
        }
        
        var frontClassName = 'card front';
        var backClassName = 'card back';
        if((position == 0 && this.state.mounted) || card.state == 'played' || (card.moveTo == 0 && card.state == 'withdrawn') || (card.moveTo == 0 && card.state == 'returned')){
            frontClassName = 'card frontRotated';
            backClassName = 'card backRotated';
        }
        if(card.moveTo != 0 && (card.state == 'withdrawn' || card.state == 'returned')){
            var frontClassName = 'card front';
            var backClassName = 'card back';
        }
        isActiveClassName = 'card playingCards simpleCards';
        if(position == 0 && !this.props.card.isPlayable){
            var isActiveClassName = 'card disabled playingCards simpleCards';
        }
        var cardRank = this.props.card.rank;
        var cardSuit = this.props.card.suit;
        var getCardSuit = function () {
            var x = '';
            if(cardSuit == 'H')
                return '&hearts;';
            if(cardSuit == 'S')
                return '&spades;';
            if(cardSuit == 'D')
                return '&diams;';
            if(cardSuit == 'C')
                return '&clubs;';
        }
        var cardSuitHTML = getCardSuit();
        var x = function () {
          return {__html: cardSuitHTML}
        }
        var getRankForHTML = function(card){
            if(card.rank == 13){
                return 'A';
            }else if(card.rank == 12){
                return 'K';
            }else if(card.rank == 11){
                return 'Q';
            }else if(card.rank == 10){
                return 'J';
            }else{
                return card.rank+1;
            }
        }
        var cardRank = getRankForHTML(this.props.card);
        var rankClassName = 'rank-'+this.props.card.rank+' '+cardSuit;
        frontClassName = frontClassName+' '+rankClassName;
        backClassName+= ' '+globalVars.activeCardBack;
        return (
                //React.createElement("div", {className: isActiveClassName, style: style, onClick: this.handleClick.bind(this, this.props.card, this.props.playerId)}, 
                    React.createElement(Swiper, {className: isActiveClassName, style: style, onSwipeUp: this.handleClick.bind(this, this.props.card, this.props.playerId), onClick: this.handleClick.bind(this, this.props.card, this.props.playerId)},
                    React.createElement("a", {className: frontClassName},
                        React.createElement("span", {className: 'rank'}, cardRank),
                        React.createElement("span", {className: 'suit', dangerouslySetInnerHTML : x()})
                    ),
                    React.createElement("a", {className: backClassName})
                )
            )
        // if(globalVars.activeCardFront == 'cardFront1'){
        //     return (
        //         React.createElement("div", {className: isActiveClassName, style: style, onClick: this.handleClick.bind(this, this.props.card, this.props.playerId)}, 
        //             React.createElement("a", {className: frontClassName},
        //                 React.createElement("span", {className: 'rank'}, cardRank),
        //                 React.createElement("span", {className: 'suit', dangerouslySetInnerHTML : x()})
        //             ),
        //             React.createElement("a", {className: backClassName})
        //         )
        //     ) 
        // }else if(globalVars.activeCardFront == 'cardFront2'){
        //     return (
        //         React.createElement("div", {className: isActiveClassName, style: style, onClick: this.handleClick.bind(this, this.props.card, this.props.playerId)}, 
        //             React.createElement("a", {className: frontClassName, style: cardStyle}), 
        //             React.createElement("a", {className: backClassName})
        //         )
        //     )
        // }
        
    }
});
