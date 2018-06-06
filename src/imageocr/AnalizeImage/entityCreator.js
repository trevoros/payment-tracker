function createEntity(searchResult, totalPrice) {
    
    var getLast4 = function () {
        if (searchResult.cardLast4) {
            return searchResult.cardLast4.replace(/i/g, 1).replace(/b/, 5);
        }

        return 'XXXX';
    }

    var getStoreName = function() {
        var wordsInTitle = searchResult.wordsInTitle.words;
        if (wordsInTitle && wordsInTitle.length) {
            for (var j in wordsInTitle) {
                if (tryPublix(wordsInTitle[j])) {
                    return 'publix';
                }

                if (tryWalmart(wordsInTitle[j])) {
                    return 'walmart';
                }

                if (tryCarter(wordsInTitle[j])) {
                    return 'carters';
                }

                if (tryMcDonald(wordsInTitle[j])) {
                    return 'mcdonalds';
                }

                if (wordsInTitle[j].toLowerCase() == 'papa') {
                    for(var i = parseInt(j) + 1; i < wordsInTitle.length; i++) {
                        if (wordsInTitle[i].toLowerCase().indexOf('john') >= 0) {
                            return 'papajohns';
                        }
                    }
                }

                if (wordsInTitle[j].toLowerCase() == 'pizza') {
                    for(var i = parseInt(j) + 1; i < wordsInTitle.length; i++) {
                        if (wordsInTitle[i].toLowerCase().indexOf('hut') >= 0) {
                            return 'pizzahut';
                        }
                    }
                }

                if (wordsInTitle[j].toLowerCase() == 'taco') {
                    for(var i = parseInt(j) + 1; i < wordsInTitle.length; i++) {
                        if (wordsInTitle[i].toLowerCase().indexOf('bell') >= 0) {
                            return 'tacobell';
                        }
                    }
                }
                   
            }

            return searchResult.wordsInTitle.firstLine && searchResult.wordsInTitle.firstLine.join(' ') || 'NoName';
        }
    }

    var tryPublix = function (word) {
        return word.toLowerCase().indexOf('publix') >= 0 || word.toLowerCase() .indexOf('pyblix') >= 0;
    }

    var tryWalmart = function (word) {
        return word.toLowerCase().indexOf('walmart') >= 0;
    }

    var tryCarter = function (word) {
        return word.toLowerCase().indexOf('carter') >= 0;
    }

    var tryMcDonald = function (word) {
        return word.toLowerCase().indexOf('mcdonal') >= 0;
    }

    var trySushiRunner = function (wordsInTitle) {
        return wordsInTitle.find(w => w.toLowerCase() == 'publix' || w.toLowerCase() == 'pyblix');
    }

    return {
        cardLast4: getLast4(),
        cardType: searchResult.creditCardType,
        date: searchResult.date || 'XX/XX/XXXX',
        total: totalPrice,
        storeName: getStoreName()
    };
}

module.exports = createEntity;