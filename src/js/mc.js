var mc = (function() {

    //settings
    var numPool = [2, 3, 4, 5, 6, 7, 8, 9,
            3, 4, 5, 6, 7, 8, 9,
            4, 5, 6, 7, 8, 9,
            5, 6, 7, 8, 9,
            6, 7, 8, 9,
            7, 8, 9
        ],
        bgPool = ["pkm-bg.jpg", "water.jpg", "fire.jpg"],
        pokeBalls = ["pokeball1.png", "pokeball2.png", "pokeball3.png", "pokeball4.png",
            "pokeball5.png", "pokeball6.png", "pokeball7.png", "pokeball8.png",
            "pokeball9.png", "pokeball10.png", "pokeball11.png", "pokeball12.png"
        ],
        mcData = { tot: 0, cor: 0, wr: 0, balls: 0, yStars: 0, bStars: 0 },
        storageName = 'mcdata',
        newQ = false,
        userAns = null,
        multiply = true;

    //JQuery variables
    var mc = $('.mc'),
        sectBotLeft = $('.sect-bot-left'),
        answerBtn = sectBotLeft.find('li[data-product]'),
        doneBtn = sectBotLeft.find('.done'),
        nums = $('.sect-mid > .nums'),
        firstNum = $('.sect-mid > .first-num'),
        secondNum = $('.sect-mid > .second-num'),
        productNum = $('.sect-mid > .product-num'),
        rightWrong = $('.sect-mid > .right-wrong'),
        nextQ = $('#nextq'),
        calcSign = $('.calc-sign'),
        bStarHolder = $('.sect-top-1 .black-stars'),
        yStarHolder = $('.sect-top-1 .yellow-stars'),
        ballHolder = $('.sect-top-2'),
        clearHistory = $('#clear-history'),
        silkCover = $('.silk-cover'),
        clearConfirm = $('.clear-confirm'),
        clearConfirmOK = $('#clear-confirm-ok'),
        clearConfirmCancel = $('#clear-confirm-cancel'),
        backBtn = $('#backspace');

    //initializaion function
    function publicStart() {
        showInitData();
        clickEvent();
    }

    //sound
    var sid1 = "click";
    var sid2 = "yeah";
    var sid3 = "no";


    function loadSound() {
        createjs.Sound.registerSound("/mc/sound/tap.mp3", sid1);
        createjs.Sound.registerSound("/mc/sound/yeah.mp3", sid2);
        createjs.Sound.registerSound("/mc/sound/no.mp3", sid3);
    }

    function playSound(id) {
        createjs.Sound.play(id);
    }

    //actions if correct
    function actionsIfCorrect() {

        //correct 
        rightWrong.html('&check;');

        if (newQ) {
            playSound(sid2);
            //numbers
            mcData.cor++;
            renderNumbers();

            //balls
            mcData.balls++;
            var pos = ballHolder.find('li:last-child').position() || { left: 0, top: 5 };
            var w = ballHolder.find('li').outerWidth();
            var newBall = $('<li class="new-ball"></li>')
                .css('background-image', 'url("/mc/images/' + pokeBalls[getRandomInt(0, pokeBalls.length - 1)] + '")');
            ballHolder.append(newBall);
            setTimeout(function() {
                ballHolder.find('.new-ball').animate({ left: (pos.left + w) + 'px' },
                    1000,
                    "easeOutBounce",
                    function() {
                        ballHolder.find('.new-ball').removeAttr("class");
                    }
                );
            }, 600);

            //yellow stars
            if (mcData.balls == 10) {
                mcData.yStars++;
                mcData.balls = 0;

                setTimeout(function() {
                    upgradeBallOrStar(ballHolder, yStarHolder);
                }, 1500);
            }

            //black stars
            if (mcData.yStars == 10) {
                mcData.bStars++;
                mcData.yStars = 0;

                setTimeout(function() {
                    upgradeBallOrStar(yStarHolder, bStarHolder);
                }, 6500);
            }

            //if black stars more than 10
            if (mcData.bStars == 10) {

                setTimeout(function() {
                    upgradeBallOrStar(bStarHolder, null);
                }, 11500);
            }
            saveToLocalStorage(storageName, mcData);
            newQ = false;

        }
    }

    //actions if wrong
    function actionsIfwrong() {

        rightWrong.html('&cross;');
        if (newQ) {
            playSound(sid3);

            //numbers
            mcData.wr++;
            renderNumbers();

            //balls
            mcData.balls = --mcData.balls < 0 ? 0 : mcData.balls;

            //var pos = ballHolder.find('li:last-child').position();
            var w = ballHolder.outerWidth();
            ballHolder.find(':last-Child').addClass('leave-ball').animate({
                    left: [w - 40 + 'px', 'easeOutExpo'],
                    opacity: [0, 'easeInExpo']
                },
                1000,
                function() {
                    ballHolder.find('.leave-ball').remove();
                }
            );

            saveToLocalStorage(storageName, mcData);
            newQ = false;
        }
    }

    function upgradeBallOrStar(lowHolder, highHolder) {
        var len = lowHolder.children().length;
        var duration = 200;

        for (var i = len; i > 0; i--) {
            lowHolder.find(':nth-child(' + i + ')').animate({ opacity: 0 },
                duration * (len - i + 1),
                "swing",
                function() {
                    $(this).remove();
                }
            );
        }

        if (highHolder != null) {
            var pos = highHolder.find('li:last-child').position() || { left: 0, top: 5 };
            var w = highHolder.find('li').outerWidth() || 0;

            //only for black stars
            if (highHolder == bStarHolder) {
                pos.left = pos.left > 30 * 8 ? 0 : pos.left;
                w = highHolder.find('li:nth-child(2)').outerWidth() || 0;
            }

            var leftPos = pos.left + w + 'px';
            setTimeout(function() {
                highHolder.append('<li class="new-star"></li>');
                highHolder.find('.new-star').css('left', leftPos);
                setTimeout(function() {
                    highHolder.find('.new-star').animate({ width: '30px', height: '30px' },
                        2000,
                        "easeOutExpo",
                        function() {
                            highHolder.find('.new-star').removeAttr("style").removeAttr("class");
                        }
                    );
                }, 500);
            }, duration * len);
        } else { //do sth for black stars more than 10
            var bs = Math.floor(mcData.bStars / 10) * 10;
            lowHolder.append('<li class="black-stars-count">+' + bs + '</li>');
        }
    }

    //jquery events
    function clickEvent() {
        answerBtn.on('click', function() {
            var num = productNum.text() || '';
            if (num.length < 3) {
                var tapedNum = $(this).attr("data-product");
                num += tapedNum;
                productNum.text(num);
            }
            playSound(sid1);
        });

        backBtn.on('click', function(event) {
            var num = productNum.text() || '';
            if (num.length > 0) {
                num = num.substring(0, num.length - 1);
                productNum.text(num);
                playSound(sid1);
            }
        });

        doneBtn.on('click', function() {
            var num1 = firstNum.text();
            var num2 = secondNum.text();
            var num3 = productNum.text();
            playSound(sid1);

            if (isCorrect(num1, num2, num3)) {
                actionsIfCorrect();
            } else {
                actionsIfwrong();
            }
            renderNumbers();
        });

        nextQ.on('click', function(event) {

            if (!newQ) {
                var len = numPool.length;
                var n1 = numPool[getRandomInt(0, len - 1)];
                var n2 = numPool[getRandomInt(0, len - 1)];

                if (Math.random() > 0.65) {
                    multiply = true;
                    firstNum.text(n1);
                    calcSign.html("&times;");
                } else {
                    multiply = false;
                    firstNum.text(n1 * n2);
                    calcSign.html("&div;");
                }
                secondNum.text(n2);
                productNum.text('');
                rightWrong.html("&larr;");
                playSound(sid1);

                mcData.tot++;
                renderNumbers();
                newQ = true;
            }
        });

        //click to clear play history
        clearHistory.on('click', function() {

            silkCover.css("display", "block");
            clearConfirm.slideDown(400); //css("display", "block");

            clearConfirmOK.on('click', function() {
                //update history/records
                resetValues();
                saveToLocalStorage(storageName, mcData);
                renderNumbers();
                clearConfirm.slideUp(400); //css("display", "none");
                silkCover.fadeOut(400);
            });

            clearConfirmCancel.on('click', function() {
                clearConfirm.slideUp(400); //css("display", "none");
                silkCover.fadeOut(400);
            });
        });

    }

    function isCorrect(n1, n2, res) {
        if (multiply)
            return (n1 * n2 == res * 1);
        else
            return (n1 / n2 == res * 1);
    }

    //get random integer, inclusive min and max
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function renderNumbers() {
        $('#total').text(mcData.tot)
        $('#correct').text(mcData.cor)
        $('.balls-stars-count').html(mcData.bStars + '.' + mcData.yStars + '.' + mcData.balls);
    }

    //show data on first loading
    function showInitData() {
        if (typeof(Storage) !== 'undefined') {
            mcData = getStatData(storageName);
        }
        //alert(mcData.bStars);
        //render numbers
        renderNumbers();

        //set black star less than 8 due to space not enough
        //mcData.bStars = mcData.bStars==0?2:mcData.bStars;  //will be removed
        //mcData.bStars = mcData.bStars==8?0:mcData.bStars;

        //render black stars
        var str = '';
        for (var i = 0; i < mcData.bStars; i++) {
            str += '<li></li>';
        }
        bStarHolder.append(str);

        //render yellow stars
        str = '';
        for (var i = 0; i < mcData.yStars; i++) {
            str += '<li></li>';
        }
        yStarHolder.append(str);

        //render balls
        str = '';
        for (var i = 0; i < mcData.balls; i++) {
            str += '<li></li>';
        }
        ballHolder.append(str);
    }

    //get the records form localStorage if any
    //return value is a JSON object
    function getStatData(name) {
        if (JSON.parse(localStorage.getItem(name)) != null) {
            return JSON.parse(localStorage.getItem(name));
        } else {
            return mcData;
        }
    }

    //update the records to localStorage
    function saveToLocalStorage(name, newData) {
        localStorage.setItem(name, JSON.stringify(newData));
    }

    //reset initial values
    function resetValues() {
        mcData = { tot: 0, cor: 0, wr: 0, balls: 0, yStars: 0, bStars: 0 };
    }

    return {
        start: publicStart,
        loadSound: loadSound
    };
})();

mc.start();