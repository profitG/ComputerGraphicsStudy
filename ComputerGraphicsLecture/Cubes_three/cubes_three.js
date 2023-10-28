

var canvas;
var gl;

var NumVertices  = 90;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var thetaLoc;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    console.log(colors);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation(program, "theta"); 
    
    //event listeners for buttons
    
    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
		render();
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
		render();
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
		render();
    };
        
    render();
}

function colorCube(){
    quad(1, 0, 3, 2);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);

    //bottom
    quad(8 + 1, 8 + 0, 8 + 3, 8 + 2);
    quad(8 + 2, 8 + 3, 8 + 7, 8 + 6);
    quad(8 + 3, 8 + 0, 8 + 4, 8 + 7);
    quad(8 + 4, 8 + 5, 8 + 6, 8 + 7);
    quad(8 + 5, 8 + 4, 8 + 0, 8 + 1);

    quad(16 + 1, 16 + 0, 16 + 3, 16 + 2);
    quad(16 + 2, 16 + 3, 16 + 7, 16 + 6);
    quad(16 + 3, 16 + 0, 16 + 4, 16 + 7);
    quad(16 + 6, 16 + 5, 16 + 1, 16 + 2);
    quad(16 + 4, 16 + 5, 16 + 6, 16 + 7);
}

function quad(a, b, c, d){
    var vertices = [
        vec4(-0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, 0.5, 0.5, 1.0),
        vec4(0.5, 0.5, 0.5, 1.0),
        vec4(0.5, -0.5, 0.5, 1.0),

        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5, 0.5, -0.5, 1.0),
        vec4(0.5, 0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0),

        // bottom
        vec4(-0.5, -0.5 - 1.0, 0.5, 1.0),
        vec4(-0.5, 0.5 - 1.0, 0.5, 1.0),
        vec4(0.5, 0.5 - 1.0, 0.5, 1.0),
        vec4(0.5, -0.5 - 1.0, 0.5, 1.0),

        vec4(-0.5, -0.5 - 1.0, -0.5, 1.0),
        vec4(-0.5, 0.5 - 1.0, -0.5, 1.0),
        vec4(0.5, 0.5 - 1.0, -0.5, 1.0),
        vec4(0.5, -0.5 - 1.0, -0.5, 1.0),

        //right
        vec4(-0.5 + 1.0, -0.5, 0.5, 1.0),
        vec4(-0.5 + 1.0, 0.5, 0.5, 1.0),
        vec4(0.5 + 1.0, 0.5, 0.5, 1.0),
        vec4(0.5 + 1.0, -0.5, 0.5, 1.0),

        vec4(-0.5 + 1.0, -0.5, -0.5, 1.0),
        vec4(-0.5 + 1.0, 0.5, -0.5, 1.0),
        vec4(0.5 + 1.0, 0.5, -0.5, 1.0),
        vec4(0.5 + 1.0, -0.5, -0.5, 1.0),
    ];


    var vertexColors = [
        [0.0, 0.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 1.0, 0.0, 1.0],
        [0.0, 1.0, 0.0, 1.0],
        [0.0, 0.0, 1.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],
        [0.0, 1.0, 1.0, 1.0],
        [1.0, 1.0, 1.0, 1.0],
        [0.0, 0.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 1.0, 0.0, 1.0],
        [0.0, 1.0, 0.0, 1.0],
        [0.0, 0.0, 1.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],
        [0.0, 1.0, 1.0, 1.0],
        [1.0, 1.0, 1.0, 1.0],
        [0.0, 0.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 1.0, 0.0, 1.0],
        [0.0, 1.0, 0.0, 1.0],
        [0.0, 0.0, 1.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],
        [0.0, 1.0, 1.0, 1.0],
        [1.0, 1.0, 1.0, 1.0],
    ];

    var indices = [ a, b, c, a, c, d ]; // 1 0 3, 1 3 2 // 4 5 6, 4 6 7 // ...

	console.log(indices);
    console.log(indices.length);
    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );
    
        // for solid colored faces use 
        colors.push(vertexColors[a]);
    }
    console.log("push되고 colors: " + colors);
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);

    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    //requestAnimFrame( render );
}
