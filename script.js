var bezierPoints = new Array();
var balls = new Array();

var c;
var ctx;
var image;
var md;
var moved;
var pe;

function Point(_x, _y)
{
	this.x = _x;
	this.y = _y;
	
	this.distance = function(p)
	{
		dx = Math.abs(this.x - p.x);
		dy = Math.abs(this.y - p.y);
		return Math.sqrt(dx*dx + dy*dy);
	}
}

function Ball(t)
{
	this.t = t;
	this.colorR = Math.random()*255;
	this.colorG = Math.random()*255;
	this.colorB = Math.random()*255;
}

function init()
{
	c = $('canv');
	ctx = c.getContext('2d');
	image = ctx.createImageData(c.width, c.height);
	md = false;
	moved = -1;
	
	c.observe('mousedown', function(e){
			md = true;
			var mx = Event.pointerX(e)-this.offsetLeft;
			var my = Event.pointerY(e)-this.offsetTop;
			
			for(var i = 0; i < bezierPoints.length; i++)
				if(bezierPoints[i].distance(new Point(mx, my)) < 8)
				{
					moved = i;
					return;
				}
			
			bezierPoints.push(new Point(mx, my));
			repaint();
		});
	c.observe('mouseup', function(e){
			md = false;
			moved  =-1;
		});
	c.observe('mouseleave', function(e){
			md = false;
			moved  =-1;
		});
	c.observe('mousemove', function(e){
			if(!md || moved == -1)
				return;
			
			bezierPoints[moved].x =  Event.pointerX(e)-this.offsetLeft;
			bezierPoints[moved].y =  Event.pointerY(e)-this.offsetTop;
			
			repaint();
		});
	
	// Adding method to draw a circle
	ctx.drawCircle = function(x,y,r){
		this.beginPath();
		this.arc(x, y, r, 0, Math.PI*2, true);
		this.stroke();  
	}
	
	ctx.drawLine = function(x1, y1, x2, y2){
		ctx.beginPath();  
		ctx.moveTo(x1, y1);  
		ctx.lineTo(x2, y2); 
		this.stroke();  
	}
}

function repaint()
{
	ctx.clearRect(0,0,c.width, c.height);
	ctx.fillStyle = "rgb(200,0,0)"; 
	ctx.strokeStyle = "rgb(200,0,0)"; 
	
	for(var i = 0; i < bezierPoints.length; i++)
		ctx.drawCircle(bezierPoints[i].x, bezierPoints[i].y, 5);

	drawCurve();
	drawBalls();
}

function bno(n, k)
{
	var ret = 1;
	for(var l = 1; l <= k; l++)
		ret *= (n-l+1)/l;
	
	return ret;
}
function bezier(t)
{
	var n = bezierPoints.length, coef;
	var p = new Point(0, 0);
	
	for(var i = 0; i < n; i++)
	{
		coef = Math.pow(1-t, n-i-1)*Math.pow(t,i)*bno(n-1,i);
		p.x += bezierPoints[i].x*coef;
		p.y += bezierPoints[i].y*coef;
	}
	return p; 
}

function drawCurve()
{
	var pp = bezier(0), p;
	for(var t = 0.01; t <= 1; t+=0.01)
	{
		p = bezier(t);
		ctx.drawLine(pp.x, pp.y, p.x, p.y);
		pp = p;
	}
}

function drawBalls()
{
	for(var i = 0; i < balls.length; i++)
	{
		var p = bezier(balls[i].t);
		ctx.drawCircle(p.x, p.y, 10);
	}
}

window.onload = function(){
	init();
	bezierPoints.push(new Point(10,15));
	bezierPoints.push(new Point(10,255));
	bezierPoints.push(new Point(400,105));
	bezierPoints.push(new Point(300,335));
	repaint();
};

function start()
{
	if(pe)
		pe.stop();
	balls.push(new Ball(0));
	balls.push(new Ball(0.05));
	pe = new PeriodicalExecuter(function(pe) {
			for(var i = 0; i < balls.length; i++)
				balls[i].t += 0.005;
			repaint();
		}, 0.01);
}
