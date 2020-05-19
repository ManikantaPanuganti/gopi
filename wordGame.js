var ApiFunctions = require("./update.js");
var score = 0;
const readline = require('readline');

function playgame() {
    var game_word;
    var game_word_synonyms;
    var game_word_definitions = new Array();
    var hint = [];
    ApiFunctions.randomWord((data) => {
        // console.log('Random Word is: ' + data.word);
        game_word = data.word.replace(" ", "%20");
        //console.log('Game Word: ' + game_word);
        ApiFunctions.definitions(game_word, (data) => {
            console.log("After def");
            if (data.length >= 1) {
                for (var index in data) {
                    game_word_definitions[index] = data[index].text;
                    hint.push({
                        type: 'definition',
                        value: data[index].text
                    })
                }
                //console.log('Length of definition array : ' + game_word_definitions.length);
            } else {
                console.log('\x1b[31m Error occured in the process.\nProcess will exit now. \x1b[0m');
                process.exit();
            }
            //user can guess synonyms also
            ApiFunctions.synonyms(game_word, (data) => {

                var hasSynonyms = false;
                if (data.length >= 1) {
                    hasSynonyms = true;
                    game_word_synonyms = data[0].words;
                    //console.log(data[0]);

                    for (var index in data[0].words) {
                        var temp = data[0].relationshipType;
                        hint.push({
                            type: [temp],
                            value: data[0].words[index]
                        });
                    }
                    if (data.length == 2) {
                        for (var index in data[1].words) {
                            var temp = data[1].relationshipType;
                            hint.push({
                                type: [temp],
                                value: data[1].words[index]
                            });
                        }

                    }
                    //console.log(hint);
                    //console.log('The Length of synonyms: ' + game_word_synonyms.length);
                    //console.log('synonyms : '+game_word_synonyms);

                }
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                console.log('Press "Ctrl + C" to exit the program.');
                console.log('Find the word with the following definition');
                console.log('Definition :\n\t' + game_word_definitions[0]);
                console.log('\x1b[93m Your score is "' + score + '": \x1b[0m');
                console.log('Type the word and press the ENTER key.');
                rl.on('line', (input) => {
                    var correctAnswer = false;
                    if (hasSynonyms) {
                        for (var index in game_word_synonyms) {
                            if (`${input}` == game_word_synonyms[index]) {
                                console.log('Congratulations! You have entered correct synonym for the word "' + game_word + '"');
                                rl.close();
                                correctAnswer = true;
                                score = score + 10;
                                console.log('\x1b[93m Your score is "' + score + '": \x1b[0m');
                            }
                        }
                    }
                    if (`${input}` === game_word) {
                        console.log('Congratulations! You have entered correct word.');
                        score = score + 10;
                        console.log('\x1b[93m Your score is "' + score + '": \x1b[0m');
                        rl.close();
                    } else {
                        if (`${input}` == '3') {
                            rl.close();
                        }
                        if (!(`${input}` == '1' || `${input}` == '2' || `${input}` == '3') && !correctAnswer) {
                            printGameRetryText();
                        }
                        switch (parseInt(`${input}`)) {
                            case 1:
                                console.log('Please try to guess the word again:');
                                if (score - 2 >= 0) {
                                    score = score - 2;
                                } else {
                                    score = 0;
                                }
                                console.log('\x1b[93m Your score is "' + score + '": \x1b[0m');
                                break;
                            case 2:
                                var randomNumber = Math.floor((Math.random() * parseInt(game_word_definitions.length)) + 1);
                                //console.log('Random Number : ' + randomNumber);
                                if (randomNumber == game_word_definitions.length) {
                                    randomNumber = game_word_definitions.length - 1;
                                }
                                if (score - 3 >= 0) {
                                    score = score - 3;
                                } else {
                                    score = 0;
                                }
                                console.log('Hint:');
                                var randomNumber = Math.floor((Math.random() * hint.length));
                                console.log(hint[randomNumber].type + "   :  " + hint[randomNumber].value);
                                if (hint[randomNumber].type == 'synonym') {
                                    for (var index in game_word_synonyms) {
                                        if (hint[randomNumber].value == game_word_synonyms[index]) {
                                            game_word_synonyms.splice(index, 1);
                                        }
                                    }
                                }
                                hint.splice(randomNumber, 1);
                                //console.log("hintlength",hint.length);
                                if (hint.length == 0) {
                                    var ana = ApiFunctions.permutations(game_word);
                                    for (var index in ana) {
                                        hint.push({
                                            type: "jumbled",
                                            value: ana[index]
                                        });
                                    }
                                }
                                console.log('\nTry to guess the word again using the hint provided.');
                                console.log('\x1b[93m Your score is "' + score + '": \x1b[0m');
                                console.log('Enter the word:');
                                break;
                            case 3:
                                console.log('The correct word is : ' + game_word);
                                console.log('Thank you for trying out this game. \nGame Ended.');
                                if (score - 4 >= 0) {
                                    score = score - 4;
                                } else {
                                    score = 0;
                                }
                                console.log('\x1b[93m Your score is "' + score + '": \x1b[0m');
                                rl.close();
                                break;
                            default:
                        }
                    }
                });
            });
        });
    });
}

var printGameRetryText = () => {
    console.log('\x1b[93m Your score is "' + score + '": \x1b[0m');
    console.log('\x1b[31m You have entered incorrect word.  \x1b[0m');
    console.log('Choose the options from below menu:');
    console.log('\t1. Try Again');
    console.log('\t2. Hint');
    console.log('\t3. Skip');
};
module.exports = {
    playgame
};
