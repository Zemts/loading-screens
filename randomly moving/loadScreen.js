var loadScreen = function(){
    "use strict";

    var background;
    var container;
    var text;
    var bottomLeft;
    var bottomRight;
    var topLeft;
    var topRight;
    var cubesSet;
    var durationTime;
    var intervalID;
    var translate;
    var STYLES = {
        'BG' : {
            'background-color' : 'rgb(0, 191, 255)',
            'display' : 'block',
            'font-size' : '0',
            'height' : '100%',
            'left' : '0',
            'position' : 'fixed',
            'text-align' : 'center',
            'top' : '0',
            'width' : '100%',
            'z-index' : '1000'
        },
        'CONTAINER' : {
            'background-color' : 'transparent',
            'display' : 'inline-block',
            'height' : '9vmin',
            'position' : 'relative',
            'top' : '40vh',
            'transform' : 'translate(0,0)',
            'transition-duration' : '0.3s',
            'transition-property' : 'transform',
            'transition-timing-function' : 'ease-in-out',
            'width' : '9vmin'
        },
        'CUBES' : {
            'background-color' : 'white',
            'height' : '4vmin',
            'position' : 'absolute',
            'transform' : 'translate(0,0)',
            'transition-duration' : '0.3s',
            'transition-property' : 'transform',
            'transition-timing-function' : 'ease-in-out',
            'width' : '4vmin'
        },
        'BOTTOM' : {
            'bottom' : 0
        },
        'LEFT' : {
            'left' : 0
        },
        'RIGHT' : {
            'right' : 0
        },
        'TOP' : {
            'top' : 0
        },
        'TEXT' : {
            'color' : 'white',
            'display' : 'block',
            'font-family' : 'sans-serif',
            'font-size' : '8vmin',
            'font-weight' : '800',
            'height' : '8vmin',
            'left' : '50%',
            'line-height' : '8vmin',
            'margin' : '0 0 0 -21.5vmin',
            'position' : 'relative',
            'text-align' : 'center',
            'top' : '42vh',
            'transform' : 'translate(0,0)',
            'transition-duration' : '0.3s',
            'transition-property' : 'transform',
            'transition-timing-function' : 'ease-in-out',
            'width' : '43vmin'
        }
    };

    function applyMovingParameters(params){
        translate.x += params.left;
        translate.y += params.top;
        if(params.top > 0){ // if we move down, the text should be first
            setTranslate(text, translate);
        }
        setTranslate(params.cube, { 'x' : params.left, 'y' : params.top });
        setTimeout(
            function(){
                if(params.top <= 0){
                    setTranslate(text, translate);
                }
                setTranslate(container, translate)
                setTranslate(params.cube, { 'x' : 0, 'y' : 0 });
            },
            durationTime
        );
    }
    function getSafeSpaceDistance(oneTimeOffset, restrictiveElement){
        var hLimit = parseFloat(getComputedStyle(restrictiveElement).width) / 2; // half of vertical side
        var vLimit = parseFloat(getComputedStyle(restrictiveElement).height) / 2; // half of horizontal side
        var hDiff = hLimit - (7 * oneTimeOffset);  // because the text wider than the container
        var vDiff = vLimit - (4 * oneTimeOffset);  // because the text is placed below the cube
        return {
            'x' : (hDiff < 0) ? 0 : hDiff,
            'y' : (vDiff < 0) ? 0 : vDiff
        };
    }
    function getCorrectiveOffset(safeDistance, position){
        var correction = {
            'left' : 0,
            'top' : 0
        };
        if(Math.abs(position.x) > safeDistance.x){
            correction.left = -1 * position.x;
        }
        if(Math.abs(position.y) > safeDistance.y){
            correction.top = -1 * position.y;
        }
        return (correction.left || correction.top) ? correction : false;
    }
    function getMovingParameters(direction){
        var cubeSetIndex = Math.floor(Math.random());
        var oneTimeOffset = parseFloat(getComputedStyle(topLeft).width);
        var safeSpace = getSafeSpaceDistance(oneTimeOffset, background);
        var correction = getCorrectiveOffset(safeSpace, translate);
        if(correction){ // protection against "out of sight escaping"
            var cube =  (correction.left < 0 && correction.top < 0) ? topLeft :
                        (correction.left < 0 && correction.top >= 0) ? bottomLeft :
                        (correction.left >= 0 && correction.top < 0) ? topRight :
                        bottomRight; // (correction.left >= 0 && correction.top >= 0)
            return {
                'cube' : cube,
                'left' : correction.left,
                'top' : correction.top
            };
        }
        var ways = ['bottom', 'left', 'right', 'top'];
        // the order of elements in "signedOffsets", "positions", "distances" depend on the order of elements in "ways"
        var signedOffsets = [oneTimeOffset, -1 * oneTimeOffset, oneTimeOffset, -1 * oneTimeOffset];
        var positions = [translate.y, translate.x, translate.x, translate.y];
        var distances = [safeSpace.y, safeSpace.x, safeSpace.x, safeSpace.y];
        var variants = ways.map(function(item, index){
            if(positions[index] + signedOffsets[index] < distances[index]){
                return {
                    'cube' : cubesSet[item][cubeSetIndex],
                    'left' : (item === 'left' || item === 'right') ? signedOffsets[index] : 0,
                    'top' : (item === 'bottom' || item === 'top') ? signedOffsets[index] : 0
                };
            }
            return false;
        });
        var available = variants.filter(function(item){ return item; });
        var availableIndex = Math.floor(Math.random() * available.length);
        var desirable = ways.indexOf(direction);
        if(available.length === 0 || variants[desirable] === false){
            console.log("The set of cubes cannot move. List of available directions: ", available);
            return {
                'cube' : topLeft,
                'left' : 0,
                'top' : 0
            };
        }
        return (desirable !== -1) ? variants[desirable] : available[availableIndex];
    }
    function initialize(){
        if(background !== undefined){
            target.removeChild(background);
        }
        translate = {
            'x' : 0,
            'y' : 0
        };
        background = document.createElement('div');
        container = document.createElement('div');
        bottomLeft = document.createElement('div');
        bottomRight = document.createElement('div');
        topLeft = document.createElement('div');
        topRight = document.createElement('div');
        text = document.createElement('div');
        text.innerHTML = 'Loading...';
        setStyles(background, STYLES.BG);
        setStyles(container, STYLES.CONTAINER);
        setStyles(bottomLeft, [STYLES.CUBES, STYLES.BOTTOM, STYLES.LEFT]);
        setStyles(bottomRight, [STYLES.CUBES, STYLES.BOTTOM, STYLES.RIGHT]);
        setStyles(topLeft, [STYLES.CUBES, STYLES.LEFT, STYLES.TOP]);
        setStyles(topRight, [STYLES.CUBES, STYLES.RIGHT, STYLES.TOP]);
        setStyles(text, STYLES.TEXT);
        container.appendChild(bottomLeft);
        container.appendChild(bottomRight);
        container.appendChild(topLeft);
        container.appendChild(topRight);
        background.appendChild(container);
        background.appendChild(text);
        // getComputedStyle(topLeft) not work because 'topLeft' was not added to document
        // if you want to use "getComputedStyle", move calculation of "durationTime" in "startMoving" function
        durationTime = parseFloat(topLeft.style.transitionDuration) * 1000;
        cubesSet = {
            'bottom' : [bottomLeft, bottomRight],
            'left' : [bottomLeft, topLeft],
            'right' : [bottomRight, topRight],
            'top' : [topLeft, topRight]
        };

        return {
            'htmlNode' : background,
            'move' : move,
            'start' : start,
            'stop' : stop
        };
    }
    function move(direction){
        var parameters = getMovingParameters(direction);
        applyMovingParameters(parameters);
    }
    function setStyles(element, styles){
        styles = (Array.isArray(styles)) ? styles : [styles];
        for(var a = 0; a < styles.length; a++){
            for(var key in styles[a]){
                if(styles[a].hasOwnProperty(key)){
                    element.style.setProperty(key, styles[a][key]);
                }
            }
        }
    }
    function setTranslate(element, offset){
        element.style.setProperty(
            'transform',
            'translate(' + offset.x + 'px, ' + offset.y + 'px)'
        );
    }
    function start(){
        if(intervalID){
            stop();
        }
        // document.body is used because sizes of elements and their offsets are defined in 'vmin' units
        document.body.appendChild(background);
        move();
        intervalID = setInterval(move, durationTime * 2 + 100);
    }
    function stop(){
        document.body.removeChild(background);
        clearInterval(intervalID);
        intervalID = null;
    }
    
    return initialize();
};